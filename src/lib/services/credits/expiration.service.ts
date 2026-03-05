import { prisma } from "@/lib/prisma"
import { WalletService } from "./wallet.service"
import { WalletType, Prisma } from "@prisma/client"

type TxClient = Prisma.TransactionClient

export class ExpirationService {
  /**
   * Job annuel (1er janvier) : expirer wallet_subscription et wallet_bonus
   */
  static async runAnnualExpiration(): Promise<{
    usersProcessed: number
    subscriptionCreditsExpired: number
    bonusCreditsExpired: number
  }> {
    const year = new Date().getFullYear()
    let usersProcessed = 0
    let subscriptionCreditsExpired = 0
    let bonusCreditsExpired = 0
    let cursor: string | undefined

    const batchSize = 100

    while (true) {
      // Récupérer les utilisateurs qui ont des wallets avec solde > 0
      const wallets = await prisma.wallet.findMany({
        where: {
          type: { in: ["SUBSCRIPTION", "BONUS"] },
          balance: { gt: 0 },
        },
        select: { userId: true },
        distinct: ["userId"],
        take: batchSize,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: "asc" },
      })

      if (wallets.length === 0) break

      for (const { userId } of wallets) {
        try {
          const result = await this.expireUserWallets(userId, year)
          subscriptionCreditsExpired += result.subscription
          bonusCreditsExpired += result.bonus
          usersProcessed++
        } catch (error) {
          console.error(`Erreur expiration user ${userId}:`, error)
        }
      }

      // Pour la pagination, on a besoin de l'id du wallet
      const lastWallet = await prisma.wallet.findFirst({
        where: { userId: wallets[wallets.length - 1].userId },
        select: { id: true },
        orderBy: { id: "asc" },
      })
      cursor = lastWallet?.id
    }

    return { usersProcessed, subscriptionCreditsExpired, bonusCreditsExpired }
  }

  /**
   * Expirer les wallets d'un utilisateur
   */
  static async expireUserWallets(
    userId: string,
    year: number
  ): Promise<{ subscription: number; bonus: number }> {
    return prisma.$transaction(async (tx) => {
      const subscription = await WalletService.resetWallet(tx, userId, "SUBSCRIPTION")
      const bonus = await WalletService.resetWallet(tx, userId, "BONUS")

      // Logger les expirations
      if (subscription > 0) {
        await tx.creditExpiration.create({
          data: { userId, walletType: "SUBSCRIPTION", amount: subscription, year },
        })
      }

      if (bonus > 0) {
        await tx.creditExpiration.create({
          data: { userId, walletType: "BONUS", amount: bonus, year },
        })
      }

      return { subscription, bonus }
    })
  }
}
