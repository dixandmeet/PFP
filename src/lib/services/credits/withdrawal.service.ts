import { prisma } from "@/lib/prisma"
import { WalletService } from "./wallet.service"
import { FraudService } from "./fraud.service"
import { StripeService } from "./stripe.service"
import { stripe } from "@/lib/stripe"
import {
  WITHDRAWAL_MIN_CREDITS,
  WITHDRAWAL_COMMISSION_RATE,
  WITHDRAWAL_SECURITY_DELAY_DAYS,
} from "./types"

export class WithdrawalService {
  /**
   * Demander un retrait (réservé formule Growth+ et compte Stripe Connect configuré)
   */
  static async requestWithdrawal(
    userId: string,
    amount: number
  ): Promise<{
    success: boolean
    withdrawal?: { id: string; amount: number; commission: number; netAmount: number; availableAt: Date }
    error?: string
  }> {
    // Vérifications
    if (amount < WITHDRAWAL_MIN_CREDITS) {
      return { success: false, error: `Minimum ${WITHDRAWAL_MIN_CREDITS} crédits requis` }
    }

    const eligible = await StripeService.isEligibleForConnect(userId)
    if (!eligible) {
      return {
        success: false,
        error: "Les retraits sont réservés aux abonnés formule Growth ou supérieure.",
      }
    }

    // Vérifier fraude
    const blocked = await FraudService.isBlocked(userId)
    if (blocked) {
      return { success: false, error: "Votre compte est temporairement restreint" }
    }

    // Vérifier KYC
    const connectAccount = await prisma.stripeConnectAccount.findUnique({
      where: { userId },
    })

    if (!connectAccount || connectAccount.kycStatus !== "VERIFIED") {
      return { success: false, error: "Vérification d'identité (KYC) requise avant retrait" }
    }

    if (!connectAccount.payoutsEnabled) {
      return { success: false, error: "Les paiements ne sont pas encore activés sur votre compte" }
    }

    // Vérifier le solde du wallet EARNED uniquement
    const balances = await WalletService.getBalances(userId)
    if (balances.EARNED < amount) {
      return { success: false, error: `Solde insuffisant. Disponible : ${balances.EARNED} crédits` }
    }

    // Vérifier qu'il n'y a pas de retrait en cours
    const pendingWithdrawal = await prisma.withdrawal.findFirst({
      where: {
        userId,
        status: { in: ["PENDING_REVIEW", "APPROVED", "PROCESSING"] },
      },
    })

    if (pendingWithdrawal) {
      return { success: false, error: "Un retrait est déjà en cours de traitement" }
    }

    // Calculer commission et montant net
    const commission = Math.round(amount * WITHDRAWAL_COMMISSION_RATE)
    const netAmount = (amount - commission) * 100 // En centimes EUR

    const availableAt = new Date()
    availableAt.setDate(availableAt.getDate() + WITHDRAWAL_SECURITY_DELAY_DAYS)

    // Transaction : débiter wallet EARNED + créer le withdrawal
    const withdrawal = await prisma.$transaction(async (tx) => {
      // Débiter uniquement le wallet EARNED
      await WalletService.debitWithPriority(
        tx,
        userId,
        amount,
        "DEBIT_WITHDRAWAL",
        {
          excludeBonus: true,
          referenceType: "WITHDRAWAL",
          description: `Demande de retrait de ${amount} crédits`,
          idempotencyKey: `withdrawal_${userId}_${Date.now()}`,
        }
      )

      return tx.withdrawal.create({
        data: {
          userId,
          amount,
          commission,
          netAmount,
          status: "PENDING_REVIEW",
          stripeConnectAccountId: connectAccount.stripeAccountId,
          availableAt,
        },
      })
    })

    return {
      success: true,
      withdrawal: {
        id: withdrawal.id,
        amount: withdrawal.amount,
        commission: withdrawal.commission,
        netAmount: withdrawal.netAmount,
        availableAt: withdrawal.availableAt,
      },
    }
  }

  /**
   * Admin : approuver ou rejeter un retrait
   */
  static async reviewWithdrawal(
    withdrawalId: string,
    adminUserId: string,
    action: "APPROVE" | "REJECT",
    note?: string
  ) {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    })

    if (!withdrawal || withdrawal.status !== "PENDING_REVIEW") {
      throw new Error("Retrait non trouvé ou déjà traité")
    }

    if (action === "REJECT") {
      // Rembourser le wallet EARNED
      await prisma.$transaction(async (tx) => {
        await WalletService.credit(
          tx,
          withdrawal.userId,
          "EARNED",
          withdrawal.amount,
          "REFUND",
          {
            referenceId: withdrawalId,
            referenceType: "WITHDRAWAL",
            description: "Remboursement retrait rejeté",
          }
        )

        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: "REJECTED",
            reviewedBy: adminUserId,
            reviewNote: note,
          },
        })
      })
      return
    }

    // Approuver
    await prisma.withdrawal.update({
      where: { id: withdrawalId },
      data: {
        status: "APPROVED",
        reviewedBy: adminUserId,
        reviewNote: note,
      },
    })
  }

  /**
   * Annuler un retrait (par l'utilisateur)
   */
  static async cancelWithdrawal(withdrawalId: string, userId: string) {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    })

    if (!withdrawal || withdrawal.userId !== userId) {
      throw new Error("Retrait non trouvé")
    }

    if (withdrawal.status !== "PENDING_REVIEW") {
      throw new Error("Ce retrait ne peut plus être annulé")
    }

    // Rembourser
    await prisma.$transaction(async (tx) => {
      await WalletService.credit(
        tx,
        userId,
        "EARNED",
        withdrawal.amount,
        "REFUND",
        {
          referenceId: withdrawalId,
          referenceType: "WITHDRAWAL",
          description: "Remboursement retrait annulé",
        }
      )

      await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: { status: "CANCELLED" },
      })
    })
  }

  /**
   * Job quotidien : traiter les retraits approuvés dont le délai est passé
   */
  static async processApprovedWithdrawals(): Promise<{
    processed: number
    errors: number
  }> {
    let processed = 0
    let errors = 0

    const readyWithdrawals = await prisma.withdrawal.findMany({
      where: {
        status: "APPROVED",
        availableAt: { lte: new Date() },
      },
    })

    for (const withdrawal of readyWithdrawals) {
      try {
        // Marquer comme en cours
        await prisma.withdrawal.update({
          where: { id: withdrawal.id },
          data: { status: "PROCESSING", processedAt: new Date() },
        })

        // Créer le transfert Stripe
        const transfer = await stripe.transfers.create({
          amount: withdrawal.netAmount,
          currency: "eur",
          destination: withdrawal.stripeConnectAccountId!,
          metadata: {
            withdrawalId: withdrawal.id,
            userId: withdrawal.userId,
          },
        })

        // Marquer comme complété
        await prisma.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            status: "COMPLETED",
            stripePayoutId: transfer.id,
            completedAt: new Date(),
          },
        })

        processed++
      } catch (error) {
        // Remettre en APPROVED en cas d'erreur pour retry
        await prisma.withdrawal.update({
          where: { id: withdrawal.id },
          data: { status: "APPROVED", processedAt: null },
        })
        errors++
        console.error(`Erreur retrait ${withdrawal.id}:`, error)
      }
    }

    return { processed, errors }
  }
}
