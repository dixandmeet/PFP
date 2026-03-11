import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { StripeService, SubscriptionService } from "@/lib/services/credits"
import { createSubscriptionSchema } from "@/lib/validators/credit-schemas"
import { getBaseUrl } from "@/lib/url"

// GET — obtenir l'abonnement actuel
export async function GET() {
  try {
    const user = await requireAuth()
    const subscription = await SubscriptionService.getSubscription(user.id)

    return NextResponse.json({ subscription })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST — créer un checkout pour un nouvel abonnement
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { plan, returnUrl } = createSubscriptionSchema.parse(body)

    // Vérifier qu'il n'y a pas déjà un abonnement payant actif
    const existing = await SubscriptionService.getSubscription(user.id)
    if (existing && existing.status === "ACTIVE" && existing.plan !== "FREE") {
      return NextResponse.json(
        { error: "Vous avez déjà un abonnement actif. Changez de plan plutôt." },
        { status: 400 }
      )
    }

    const baseUrl = returnUrl || `${getBaseUrl()}/credits`
    const result = await StripeService.createSubscriptionCheckout(user.id, plan, baseUrl)

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
