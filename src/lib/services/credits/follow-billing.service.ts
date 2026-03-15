import { prisma } from "@/lib/prisma"
import { WalletService } from "./wallet.service"
import { SubscriptionService } from "./subscription.service"
import { FraudService } from "./fraud.service"

export class FollowBillingService {
  /**
   * Appelé quand un utilisateur suit un autre — créer CreditFollow
   */
  static async onFollow(
    followerId: string,
    followingId: string,
    entityFollowId: string
  ) {
    // Calculer la prochaine date de facturation (1er du mois prochain)
    const now = new Date()
    const nextCharge = new Date(now.getFullYear(), now.getMonth() + 1, 1, 3, 0, 0)

    await prisma.creditFollow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      update: {
        isActive: true,
        entityFollowId,
        nextChargeAt: nextCharge,
      },
      create: {
        followerId,
        followingId,
        entityFollowId,
        isActive: true,
        nextChargeAt: nextCharge,
      },
    })
  }

  /**
   * Appelé quand un utilisateur unfollow — désactiver CreditFollow
   */
  static async onUnfollow(followerId: string, followingId: string) {
    await prisma.creditFollow.updateMany({
      where: { followerId, followingId },
      data: { isActive: false },
    })
  }

  /**
   * Valider un follow avant création
   */
  static async validateFollow(
    followerId: string,
    followingId: string
  ): Promise<{ valid: boolean; reason?: string }> {
    // Empêcher self-follow
    if (followerId === followingId) {
      return { valid: false, reason: "Vous ne pouvez pas vous suivre vous-même" }
    }

    // Vérifier le rate limit
    const rateCheck = FraudService.checkCreditRateLimit(followerId, "FOLLOW")
    if (!rateCheck.allowed) {
      return { valid: false, reason: "Trop de follows. Réessayez plus tard." }
    }

    // Vérifier si l'utilisateur est bloqué pour fraude
    const blocked = await FraudService.isBlocked(followerId)
    if (blocked) {
      return { valid: false, reason: "Votre compte est temporairement restreint" }
    }

    // Détecter les boucles artificielles
    const loopCheck = await FraudService.checkFollowLoop(followerId, followingId)
    if (loopCheck.isLoop) {
      await FraudService.createFlag(
        followerId,
        "ARTIFICIAL_LOOP",
        "MEDIUM",
        `Boucle de follow détectée`,
        { chain: loopCheck.chain }
      )
      return { valid: false, reason: "Cette action crée une boucle artificielle de follows" }
    }

    return { valid: true }
  }

  /**
   * Job mensuel : facturer tous les follows actifs par batch
   */
  static async processMonthlyCharges(): Promise<{
    processed: number
    unfollowed: number
    errors: number
  }> {
    let processed = 0
    let unfollowed = 0
    let errors = 0
    let cursor: string | undefined

    const batchSize = 100

    while (true) {
      const creditFollows = await prisma.creditFollow.findMany({
        where: {
          isActive: true,
          nextChargeAt: { lte: new Date() },
        },
        include: {
          follower: { select: { id: true, name: true } },
          following: { select: { id: true, name: true } },
        },
        take: batchSize,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: "asc" },
      })

      if (creditFollows.length === 0) break

      for (const cf of creditFollows) {
        try {
          const result = await this.chargeSingleFollow(cf)
          if (result === "charged") processed++
          else if (result === "unfollowed") unfollowed++
        } catch {
          errors++
        }
      }

      cursor = creditFollows[creditFollows.length - 1].id
    }

    return { processed, unfollowed, errors }
  }

  /**
   * Facturer un seul follow
   */
  static async chargeSingleFollow(
    creditFollow: {
      id: string
      followerId: string
      followingId: string
      entityFollowId: string
    }
  ): Promise<"charged" | "unfollowed" | "error"> {
    const { followerId, followingId, entityFollowId } = creditFollow

    // Vérifier si le follower peut payer
    const canPay = await WalletService.canAfford(followerId, 1)

    if (!canPay) {
      // Auto-unfollow : désactiver CreditFollow + supprimer EntityFollow
      await prisma.$transaction(async (tx) => {
        await tx.creditFollow.update({
          where: { id: creditFollow.id },
          data: { isActive: false },
        })

        // Supprimer le EntityFollow correspondant
        await tx.entityFollow.delete({
          where: { id: entityFollowId },
        }).catch(() => {
          // EntityFollow peut déjà avoir été supprimé
        })
      })
      return "unfollowed"
    }

    // Facturer le follow + redistribution
    await prisma.$transaction(async (tx) => {
      // 1. Débiter 1 crédit du follower
      const breakdown = await WalletService.debitWithPriority(
        tx,
        followerId,
        1,
        "DEBIT_FOLLOW",
        {
          referenceId: creditFollow.id,
          referenceType: "CREDIT_FOLLOW",
          counterpartyId: followingId,
          description: "Coût mensuel follow",
          idempotencyKey: `follow_charge_${creditFollow.id}_${new Date().toISOString().slice(0, 7)}`,
        }
      )

      // 2. Vérifier si le débit provient uniquement du wallet bonus
      const allFromBonus = breakdown.every((b) => b.walletType === "BONUS")

      // 3. Redistribution (sauf si tout provient du bonus)
      if (!allFromBonus) {
        const rate = await SubscriptionService.getRedistributionRate(followingId)
        if (rate > 0) {
          const redistributionAmount = Math.max(1, Math.round(1 * rate))
          await WalletService.credit(
            tx,
            followingId,
            "EARNED",
            redistributionAmount,
            "CREDIT_EARNED_FOLLOW",
            {
              referenceId: creditFollow.id,
              referenceType: "CREDIT_FOLLOW",
              counterpartyId: followerId,
              description: `Redistribution follow (${Math.round(rate * 100)}%)`,
            }
          )
        }
      }

      // 4. Mettre à jour les dates de facturation
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      nextMonth.setDate(1)
      nextMonth.setHours(3, 0, 0, 0)

      await tx.creditFollow.update({
        where: { id: creditFollow.id },
        data: {
          lastChargedAt: new Date(),
          nextChargeAt: nextMonth,
        },
      })
    })

    return "charged"
  }
}
