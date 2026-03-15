import { WalletType, TransactionType, Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { TransactionService } from "./transaction.service"
import {
  DEBIT_PRIORITY,
  InsufficientBalanceError,
  ConcurrentModificationError,
} from "./types"

type TxClient = Prisma.TransactionClient

const ALL_WALLET_TYPES: WalletType[] = ["SUBSCRIPTION", "PURCHASED", "EARNED", "BONUS"]

export type DebitBreakdown = {
  walletType: WalletType
  amount: number
  balanceBefore: number
  balanceAfter: number
}

export class WalletService {
  /**
   * Initialiser les 4 wallets pour un utilisateur
   */
  static async initializeWallets(tx: TxClient, userId: string) {
    const existing = await tx.wallet.findMany({
      where: { userId },
      select: { type: true },
    })
    const existingTypes = new Set(existing.map((w) => w.type))

    const toCreate = ALL_WALLET_TYPES.filter((t) => !existingTypes.has(t))
    if (toCreate.length > 0) {
      await tx.wallet.createMany({
        data: toCreate.map((type) => ({ userId, type, balance: 0, version: 0 })),
        skipDuplicates: true,
      })
    }
  }

  /**
   * Récupérer les soldes de tous les wallets
   */
  static async getBalances(userId: string): Promise<Record<WalletType, number>> {
    const wallets = await prisma.wallet.findMany({
      where: { userId },
      select: { type: true, balance: true },
    })

    const result: Record<string, number> = {}
    for (const type of ALL_WALLET_TYPES) {
      result[type] = 0
    }
    for (const w of wallets) {
      result[w.type] = w.balance
    }
    return result as Record<WalletType, number>
  }

  /**
   * Solde total disponible
   */
  static async getTotalBalance(userId: string): Promise<number> {
    const balances = await this.getBalances(userId)
    return Object.values(balances).reduce((sum, b) => sum + b, 0)
  }

  /**
   * Vérifier si l'utilisateur peut payer un montant
   */
  static async canAfford(userId: string, amount: number): Promise<boolean> {
    const total = await this.getTotalBalance(userId)
    return total >= amount
  }

  /**
   * Créditer un wallet spécifique (avec optimistic locking)
   */
  static async credit(
    tx: TxClient,
    userId: string,
    walletType: WalletType,
    amount: number,
    transactionType: TransactionType,
    opts: {
      referenceId?: string
      referenceType?: string
      counterpartyId?: string
      description?: string
      metadata?: Record<string, unknown>
      idempotencyKey?: string
    } = {}
  ): Promise<{ balanceBefore: number; balanceAfter: number }> {
    if (amount <= 0) throw new Error("Le montant doit être positif")

    // Obtenir le wallet actuel
    const wallet = await tx.wallet.findUnique({
      where: { userId_type: { userId, type: walletType } },
    })

    if (!wallet) {
      // Créer le wallet s'il n'existe pas encore
      await tx.wallet.create({
        data: { userId, type: walletType, balance: amount, version: 1 },
      })
      await TransactionService.log(tx, {
        userId,
        walletType,
        type: transactionType,
        amount,
        balanceBefore: 0,
        balanceAfter: amount,
        ...opts,
      })
      return { balanceBefore: 0, balanceAfter: amount }
    }

    const balanceBefore = wallet.balance
    const balanceAfter = balanceBefore + amount

    // Optimistic locking via version
    const updated = await tx.wallet.updateMany({
      where: { id: wallet.id, version: wallet.version },
      data: {
        balance: balanceAfter,
        version: { increment: 1 },
      },
    })

    if (updated.count === 0) {
      throw new ConcurrentModificationError()
    }

    await TransactionService.log(tx, {
      userId,
      walletType,
      type: transactionType,
      amount,
      balanceBefore,
      balanceAfter,
      ...opts,
    })

    return { balanceBefore, balanceAfter }
  }

  /**
   * Débiter en suivant l'ordre de priorité des wallets
   * BONUS → SUBSCRIPTION → PURCHASED → EARNED
   * Transaction atomique avec optimistic locking
   */
  static async debitWithPriority(
    tx: TxClient,
    userId: string,
    totalAmount: number,
    transactionType: TransactionType,
    opts: {
      excludeBonus?: boolean
      referenceId?: string
      referenceType?: string
      counterpartyId?: string
      description?: string
      metadata?: Record<string, unknown>
      idempotencyKey?: string
    } = {}
  ): Promise<DebitBreakdown[]> {
    if (totalAmount <= 0) throw new Error("Le montant doit être positif")

    // Récupérer tous les wallets de l'utilisateur
    const wallets = await tx.wallet.findMany({
      where: { userId },
      orderBy: { type: "asc" },
    })

    const walletMap = new Map(wallets.map((w) => [w.type, w]))

    // Calculer le solde total disponible
    const priority = opts.excludeBonus
      ? DEBIT_PRIORITY.filter((t) => t !== "BONUS")
      : DEBIT_PRIORITY

    let available = 0
    for (const type of priority) {
      available += walletMap.get(type)?.balance || 0
    }

    if (available < totalAmount) {
      throw new InsufficientBalanceError(totalAmount, available)
    }

    // Débiter dans l'ordre de priorité
    let remaining = totalAmount
    const breakdown: DebitBreakdown[] = []

    for (const type of priority) {
      if (remaining <= 0) break

      const wallet = walletMap.get(type)
      if (!wallet || wallet.balance <= 0) continue

      const debitAmount = Math.min(wallet.balance, remaining)
      const balanceBefore = wallet.balance
      const balanceAfter = balanceBefore - debitAmount

      // Optimistic locking
      const updated = await tx.wallet.updateMany({
        where: { id: wallet.id, version: wallet.version },
        data: {
          balance: balanceAfter,
          version: { increment: 1 },
        },
      })

      if (updated.count === 0) {
        throw new ConcurrentModificationError()
      }

      // Logger la transaction
      await TransactionService.log(tx, {
        userId,
        walletType: type,
        type: transactionType,
        amount: debitAmount,
        balanceBefore,
        balanceAfter,
        referenceId: opts.referenceId,
        referenceType: opts.referenceType,
        counterpartyId: opts.counterpartyId,
        description: opts.description,
        metadata: opts.metadata,
        idempotencyKey: opts.idempotencyKey
          ? `${opts.idempotencyKey}_${type}`
          : undefined,
      })

      breakdown.push({ walletType: type, amount: debitAmount, balanceBefore, balanceAfter })
      remaining -= debitAmount
    }

    return breakdown
  }

  /**
   * Reset un wallet à 0 (pour expiration annuelle)
   */
  static async resetWallet(
    tx: TxClient,
    userId: string,
    walletType: WalletType
  ): Promise<number> {
    const wallet = await tx.wallet.findUnique({
      where: { userId_type: { userId, type: walletType } },
    })

    if (!wallet || wallet.balance === 0) return 0

    const expiredAmount = wallet.balance

    const updated = await tx.wallet.updateMany({
      where: { id: wallet.id, version: wallet.version },
      data: { balance: 0, version: { increment: 1 } },
    })

    if (updated.count === 0) {
      throw new ConcurrentModificationError()
    }

    await TransactionService.log(tx, {
      userId,
      walletType,
      type: "EXPIRATION",
      amount: expiredAmount,
      balanceBefore: expiredAmount,
      balanceAfter: 0,
      description: `Expiration annuelle wallet ${walletType}`,
    })

    return expiredAmount
  }
}
