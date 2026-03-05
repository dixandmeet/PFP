import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { StripeService } from "@/lib/services/credits"

/**
 * En local, Stripe ne peut pas appeler localhost : lancer
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe
 * et utiliser le secret affiché comme STRIPE_WEBHOOK_SECRET.
 * Sinon, au retour avec ?success=true&session_id=..., l'app synchronise l'abonnement via /api/credits/subscription/sync-session.
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Erreur vérification signature webhook:", err)
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 })
  }

  try {
    await StripeService.handleWebhookEvent(event)
  } catch (error) {
    console.error("Erreur traitement webhook:", error)
    // Retourner 200 pour éviter les retries Stripe sur erreur applicative
    return NextResponse.json({ error: "Erreur traitement" }, { status: 200 })
  }

  return NextResponse.json({ received: true })
}
