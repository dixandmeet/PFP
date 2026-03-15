import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { SubscriptionService } from "@/lib/services/credits"
import { stripe } from "@/lib/stripe"

export async function POST() {
  try {
    const user = await requireAuth()
    const subscription = await SubscriptionService.getSubscription(user.id)

    if (!subscription || subscription.status !== "ACTIVE") {
      return NextResponse.json({ error: "Aucun abonnement actif" }, { status: 400 })
    }

    if (subscription.plan === "FREE") {
      return NextResponse.json(
        { error: "La formule gratuite n'est pas un abonnement à annuler." },
        { status: 400 }
      )
    }

    // Annuler sur Stripe (fin de période)
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      })
    }

    await SubscriptionService.cancelSubscription(user.id)

    return NextResponse.json({ success: true, message: "Abonnement annulé" })
  } catch (error) {
    return handleApiError(error)
  }
}
