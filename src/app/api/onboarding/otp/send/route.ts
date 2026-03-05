// POST /api/onboarding/otp/send — Envoyer un OTP pour vérification créateur club
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendOtpSchema } from "@/lib/validators/club-onboarding-schemas"
import { checkOtpRateLimit, createOtp } from "@/lib/services/otp-service"
import { sendEmail, emailTemplates } from "@/lib/email"

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
    const parsed = sendOtpSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email } = parsed.data

    // Vérifier que l'utilisateur cible existe
    const targetUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, emailVerified: true },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: "Aucun utilisateur trouvé avec cet email" },
        { status: 404 }
      )
    }

    // Vérifier que l'email est vérifié
    if (!targetUser.emailVerified) {
      return NextResponse.json(
        {
          error: "L'email de cet utilisateur n'est pas vérifié. Il doit d'abord vérifier son email.",
          emailVerified: false,
        },
        { status: 400 }
      )
    }

    // Vérifier le rate limit
    const rateLimit = await checkOtpRateLimit(email, "CLUB_CREATOR_VERIFY")
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Trop de demandes de code. Veuillez réessayer dans 1 heure.",
          retryAfter: 3600,
        },
        { status: 429 }
      )
    }

    // Créer et stocker l'OTP
    const { code, expiresAt } = await createOtp(
      targetUser.id,
      email,
      "CLUB_CREATOR_VERIFY"
    )

    // Envoyer l'email OTP
    const userName = targetUser.name || email.split("@")[0]
    const emailContent = emailTemplates.clubOtpEmail(userName, code)
    await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    return NextResponse.json({
      success: true,
      message: "Code de vérification envoyé par email",
      expiresAt: expiresAt.toISOString(),
      remainingAttempts: rateLimit.remainingAttempts - 1,
    })
  } catch (error) {
    console.error("[API] onboarding/otp/send error:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
