import { prisma } from "@/lib/prisma"
import { Role, SubscriptionPlan } from "@prisma/client"
import { WalletService } from "./wallet.service"
import { PROFILE_VIEW_COST, REVEAL_PLANS } from "./types"

export class ProfileViewBillingService {
  /**
   * Vérifier si le visiteur a déjà consulté ce profil dans les dernières 24h
   */
  static async hasRecentView(viewerId: string, viewedId: string): Promise<boolean> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const existing = await prisma.profileView.findFirst({
      where: {
        viewerId,
        viewedId,
        createdAt: { gte: twentyFourHoursAgo },
      },
    })
    return !!existing
  }

  /**
   * Vérifier si l'utilisateur a un abonnement GROWTH+ (pour révéler l'identité)
   */
  static async canRevealIdentity(userId: string): Promise<boolean> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: { plan: true, status: true },
    })
    if (!subscription || subscription.status !== "ACTIVE") return false
    return REVEAL_PLANS.includes(subscription.plan)
  }

  /**
   * Traiter la consultation payante d'un profil
   */
  static async viewProfile(
    viewerId: string,
    viewedId: string,
    viewerRole: Role
  ): Promise<{
    success: boolean
    cost: number
    alreadyViewed?: boolean
    insufficientBalance?: boolean
    profileViewId?: string
  }> {
    // Anti-spam : vérifier si déjà consulté dans les 24h
    const alreadyViewed = await this.hasRecentView(viewerId, viewedId)
    if (alreadyViewed) {
      return { success: true, cost: 0, alreadyViewed: true }
    }

    const cost = PROFILE_VIEW_COST

    // Vérifier le solde
    const canPay = await WalletService.canAfford(viewerId, cost)
    if (!canPay) {
      return { success: false, cost, insufficientBalance: true }
    }

    // Transaction atomique : débit visiteur + enregistrement consultation
    const profileView = await prisma.$transaction(async (tx) => {
      // Débiter le visiteur
      await WalletService.debitWithPriority(
        tx,
        viewerId,
        cost,
        "DEBIT_PROFILE_VIEW",
        {
          referenceId: viewedId,
          referenceType: "PROFILE_VIEW",
          counterpartyId: viewedId,
          description: "Consultation profil",
          idempotencyKey: `profile_view_${viewerId}_${viewedId}_${new Date().toISOString().slice(0, 10)}`,
        }
      )

      // Créer l'enregistrement de consultation
      return tx.profileView.create({
        data: {
          viewerId,
          viewedId,
          viewerRole,
          creditsCost: cost,
        },
      })
    })

    return { success: true, cost, profileViewId: profileView.id }
  }
}
