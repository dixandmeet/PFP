// POST /api/users/create-creator — Créer un utilisateur "créateur" pour l'onboarding club
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createCreatorSchema } from "@/lib/validators/club-onboarding-schemas"
import { sendEmail, emailTemplates } from "@/lib/email"
import crypto from "crypto"

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
    const parsed = createCreatorSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { firstName, lastName, email, phone } = parsed.data

    // Vérifier si l'email est déjà pris
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email", code: "EMAIL_TAKEN" },
        { status: 409 }
      )
    }

    // Créer l'utilisateur (sans password — il recevra un lien de vérification)
    const name = `${firstName} ${lastName}`

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: "PLAYER", // Rôle par défaut, sera changé si nécessaire
        emailVerified: null,
      },
    })

    // Générer un VerificationToken (modèle NextAuth standard)
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
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const verificationUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`

    const emailContent = emailTemplates.verificationEmail(firstName, verificationUrl)
    await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    

    return NextResponse.json(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        verificationSent: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[API] users/create-creator error:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
