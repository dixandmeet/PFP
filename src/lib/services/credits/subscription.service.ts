import { SubscriptionPlan, Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { WalletService } from "./wallet.service"
import { PLAN_CONFIG } from "./types"

type TxClient = Prisma.TransactionClient

export class SubscriptionService {
  /**
   * Activer un abonnement après paiement Stripe
   */
  static async activateSubscription(
    userId: string,
    plan: SubscriptionPlan,
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    periodStart: Date,
    periodEnd: Date
  ) {
    const config = PLAN_CONFIG[plan]

    return prisma.$transaction(async (tx) => {
      // Initialiser les wallets si pas encore fait
      await WalletService.initializeWallets(tx, userId)

      // Créer ou mettre à jour l'abonnement
      const subscription = await tx.subscription.upsert({
        where: { userId },
        update: {
          plan,
          status: "ACTIVE",
          stripeCustomerId,
          stripeSubscriptionId,
          stripePriceId: config.stripePriceId,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          creditsAllocated: config.monthlyCredits,
          cancelledAt: null,
        },
        create: {
          userId,
          plan,
          status: "ACTIVE",
          stripeCustomerId,
          stripeSubscriptionId,
          stripePriceId: config.stripePriceId,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          creditsAllocated: config.monthlyCredits,
        },
      })

      // Allouer les crédits mensuels
      await WalletService.credit(
        tx,
        userId,
        "SUBSCRIPTION",
        config.monthlyCredits,
        "CREDIT_SUBSCRIPTION",
        {
          description: `Allocation mensuelle plan ${plan}`,
          referenceId: subscription.id,
          referenceType: "SUBSCRIPTION",
        }
      )

      return subscription
    })
  }

  /**
   * Allouer les crédits mensuels (appelé lors du renouvellement)
   */
  static async allocateMonthlyCredits(
    userId: string,
    plan: SubscriptionPlan,
    periodStart: Date,
    periodEnd: Date
  ) {
    const config = PLAN_CONFIG[plan]

    return prisma.$transaction(async (tx) => {
      // Mettre à jour la période
      await tx.subscription.update({
        where: { userId },
        data: {
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          creditsAllocated: config.monthlyCredits,
        },
      })

      // Créditer le wallet subscription
      await WalletService.credit(
        tx,
        userId,
        "SUBSCRIPTION",
        config.monthlyCredits,
        "CREDIT_SUBSCRIPTION",
        {
          description: `Renouvellement mensuel plan ${plan}`,
          idempotencyKey: `sub_renew_${userId}_${periodStart.toISOString()}`,
        }
      )
    })
  }

  /**
   * Changer de plan
   */
  static async changePlan(userId: string, newPlan: SubscriptionPlan) {
    return prisma.subscription.update({
      where: { userId },
      data: { plan: newPlan },
    })
  }

  /**
   * Annuler un abonnement
   */
  static async cancelSubscription(userId: string) {
    return prisma.subscription.update({
      where: { userId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    })
  }

  /**
   * Marquer comme impayé
   */
  static async markPastDue(userId: string) {
    return prisma.subscription.update({
      where: { userId },
      data: { status: "PAST_DUE" },
    })
  }

  /**
   * Obtenir le taux de redistribution d'un utilisateur
   */
  static async getRedistributionRate(userId: string): Promise<number> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: { plan: true, status: true },
    })

    if (!subscription || subscription.status !== "ACTIVE") {
      return 0
    }

    const config = PLAN_CONFIG[subscription.plan as keyof typeof PLAN_CONFIG]
    return config?.redistributionRate ?? 0
  }

  /**
   * Obtenir l'abonnement d'un utilisateur.
   * Si l'utilisateur n'a pas encore de formule, crée un abonnement FREE par défaut.
   */
  static async getSubscription(userId: string) {
    let subscription = await prisma.subscription.findUnique({
      where: { userId },
    })
    if (!subscription) {
      subscription = await this.ensureDefaultSubscription(userId)
    }
    return subscription
  }

  /**
   * Créer l'abonnement gratuit par défaut pour un utilisateur sans formule.
   */
  static async ensureDefaultSubscription(userId: string) {
    const plan = SubscriptionPlan.FREE
    const config = PLAN_CONFIG[plan]
    const now = new Date()
    const periodEnd = new Date(now)
    periodEnd.setFullYear(periodEnd.getFullYear() + 1)

    return prisma.$transaction(async (tx) => {
      await WalletService.initializeWallets(tx, userId)
      const sub = await tx.subscription.create({
        data: {
          userId,
          plan,
          status: "ACTIVE",
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          stripePriceId: config.stripePriceId || null,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          creditsAllocated: config.monthlyCredits,
        },
      })
      return sub
    })
  }
}
