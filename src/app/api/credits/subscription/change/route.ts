import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { SubscriptionService } from "@/lib/services/credits"
import { PLAN_CONFIG } from "@/lib/services/credits/types"
import { stripe } from "@/lib/stripe"
import { changeSubscriptionSchema } from "@/lib/validators/credit-schemas"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { plan } = changeSubscriptionSchema.parse(body)

    const subscription = await SubscriptionService.getSubscription(user.id)

    if (!subscription || subscription.status !== "ACTIVE") {
      return NextResponse.json({ error: "Aucun abonnement actif" }, { status: 400 })
    }

    if (subscription.plan === plan) {
      return NextResponse.json({ error: "Vous êtes déjà sur ce plan" }, { status: 400 })
    }

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: "Pour passer à un plan payant, utilisez le bouton Activer pour souscrire." },
        { status: 400 }
      )
    }

    // Mettre à jour sur Stripe
    const planConfig = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]
    if (!planConfig?.stripePriceId) {
      return NextResponse.json(
        { error: `Le plan ${plan} n'est pas configuré (Stripe). Vérifiez .env` },
        { status: 400 }
      )
    }
    if (subscription.stripeSubscriptionId) {
      const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        items: [{
          id: stripeSub.items.data[0].id,
          price: planConfig.stripePriceId,
        }],
        proration_behavior: "always_invoice",
      })
    }

    await SubscriptionService.changePlan(user.id, plan)

    return NextResponse.json({ success: true, newPlan: plan })
  } catch (error) {
    return handleApiError(error)
  }
}
