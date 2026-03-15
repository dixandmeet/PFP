// POST /api/auth/resend-verification — Renvoyer l'email de vérification
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { resendVerificationSchema } from "@/lib/validators/club-onboarding-schemas"
import { sendEmail, emailTemplates } from "@/lib/email"
import crypto from "crypto"
import { getBaseUrl } from "@/lib/url"

const RATE_LIMIT_MAX = 3 // Max 3 renvois par email tant que des tokens sont valides

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    if (!["CLUB", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = resendVerificationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email } = parsed.data

    // Vérifier que le user existe et n'est pas encore vérifié
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, emailVerified: true },
    })

    if (!user) {
      // Réponse volontairement vague pour ne pas leaker l'existence d'un user
      return NextResponse.json(
        { error: "Impossible de renvoyer l'email de vérification" },
        { status: 400 }
      )
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Cet email est déjà vérifié" },
        { status: 400 }
      )
    }

    // Rate limiting : compter les tokens de vérification actifs pour cet email
    const activeTokens = await prisma.verificationToken.count({
      where: {
        identifier: email,
        expires: { gte: new Date() },
      },
    })

    if (activeTokens >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: "Trop de demandes de vérification. Vérifiez vos emails ou réessayez plus tard." },
        { status: 429 }
      )
    }

    // Générer un nouveau VerificationToken
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    // Envoyer l'email de vérification
    const baseUrl = getBaseUrl()
    const verificationUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`
    const userName = user.name || email.split("@")[0]

    const emailContent = emailTemplates.verificationEmail(userName, verificationUrl)
    await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    if (process.env.NODE_ENV === "development") {
      console.log(`[API] Verification email resent`)
    }

    return NextResponse.json({ sent: true })
  } catch (error) {
    console.error("[API] auth/resend-verification error:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
