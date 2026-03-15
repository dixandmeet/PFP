import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { WalletService, SubscriptionService } from "@/lib/services/credits"

export async function GET() {
  try {
    const user = await requireAuth()
    const balances = await WalletService.getBalances(user.id)
    const total = Object.values(balances).reduce((sum, b) => sum + b, 0)
    const subscription = await SubscriptionService.getSubscription(user.id)

    return NextResponse.json({
      wallets: {
        subscription: balances.SUBSCRIPTION,
        purchased: balances.PURCHASED,
        earned: balances.EARNED,
        bonus: balances.BONUS,
      },
      totalBalance: total,
      plan: subscription?.plan || null,
      planStatus: subscription?.status || null,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
