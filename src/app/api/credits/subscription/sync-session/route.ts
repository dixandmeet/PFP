import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { StripeService } from "@/lib/services/credits"
import { z } from "zod"

const bodySchema = z.object({ sessionId: z.string().min(1, "session_id requis") })

/**
 * Synchronise l'abonnement depuis une session Checkout Stripe.
 * Utile quand l'utilisateur revient sur la page succès mais que le webhook
 * n'a pas encore été reçu (ex. en dev sans Stripe CLI).
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { sessionId } = bodySchema.parse(body)

    const result = await StripeService.syncSubscriptionFromCheckoutSession(
      sessionId,
      user.id
    )

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
