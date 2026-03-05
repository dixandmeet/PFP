import { WalletType, TransactionType, TransactionStatus, Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { IdempotencyError } from "./types"

type TxClient = Prisma.TransactionClient

export class TransactionService {
  /**
   * Logger une transaction de crédits (appelé dans une transaction Prisma)
   */
  static async log(
    tx: TxClient,
    params: {
      userId: string
      walletType: WalletType
      type: TransactionType
      amount: number
      balanceBefore: number
      balanceAfter: number
      status?: TransactionStatus
      referenceId?: string
      referenceType?: string
      counterpartyId?: string
      description?: string
      metadata?: Record<string, unknown>
      idempotencyKey?: string
    }
  ) {
    return tx.creditTransaction.create({
      data: {
        userId: params.userId,
        walletType: params.walletType,
        type: params.type,
        status: params.status || "COMPLETED",
        amount: params.amount,
        balanceBefore: params.balanceBefore,
        balanceAfter: params.balanceAfter,
        referenceId: params.referenceId,
        referenceType: params.referenceType,
        counterpartyId: params.counterpartyId,
        description: params.description,
        metadata: params.metadata as Prisma.JsonObject | undefined,
        idempotencyKey: params.idempotencyKey,
      },
    })
  }

  /**
   * Historique des transactions paginé avec filtres
   */
  static async getHistory(
    userId: string,
    opts: {
      page?: number
      limit?: number
      walletType?: WalletType
      type?: TransactionType
      from?: Date
      to?: Date
    } = {}
  ) {
    const page = opts.page || 1
    const limit = Math.min(opts.limit || 20, 100)
    const skip = (page - 1) * limit

    const where: Prisma.CreditTransactionWhereInput = {
      userId,
      ...(opts.walletType && { walletType: opts.walletType }),
      ...(opts.type && { type: opts.type }),
      ...(opts.from || opts.to ? {
        createdAt: {
          ...(opts.from && { gte: opts.from }),
          ...(opts.to && { lte: opts.to }),
        },
      } : {}),
    }

    const [transactions, total] = await Promise.all([
      prisma.creditTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.creditTransaction.count({ where }),
    ])

    return { transactions, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  /**
   * Vérifier l'idempotence d'une opération
   */
  static async checkIdempotency(idempotencyKey: string) {
    const existing = await prisma.creditTransaction.findUnique({
      where: { idempotencyKey },
    })
    if (existing) {
      throw new IdempotencyError(idempotencyKey)
    }
    return null
  }
}
