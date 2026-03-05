// POST /api/onboarding/otp/verify — Vérifier un code OTP
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { verifyOtpSchema } from "@/lib/validators/club-onboarding-schemas"
import { verifyOtp } from "@/lib/services/otp-service"
import { getOrCreateOnboardingSession, markCreatorVerified } from "@/lib/services/club-onboarding-service"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    if (!["CLUB", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = verifyOtpSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email, code } = parsed.data

    // Vérifier l'OTP
    const result = await verifyOtp(email, code, "CLUB_CREATOR_VERIFY")

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error, valid: false },
        { status: 400 }
      )
    }

    // OTP valide — mettre à jour la session d'onboarding
    const onboardingSession = await getOrCreateOnboardingSession(session.user.id)
    await markCreatorVerified(onboardingSession.id, email)

    return NextResponse.json({
      valid: true,
      message: "Vérification réussie",
      sessionId: onboardingSession.id,
      nextStep: "CLUB_INFO",
    })
  } catch (error) {
    console.error("[API] onboarding/otp/verify error:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
