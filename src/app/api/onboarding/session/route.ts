// GET /api/onboarding/session — Charger la session d'onboarding du club
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getOrCreateOnboardingSession } from "@/lib/services/club-onboarding-service"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    if (session.user.role !== "CLUB") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const onboardingSession = await getOrCreateOnboardingSession(session.user.id)

    return NextResponse.json({ session: onboardingSession })
  } catch (error) {
    console.error("[API] onboarding/session GET error:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
