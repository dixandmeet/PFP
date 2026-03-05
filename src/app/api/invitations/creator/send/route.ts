// POST /api/invitations/creator/send — Envoyer une invitation email pour créer un compte
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { inviteCreatorSchema } from "@/lib/validators/club-onboarding-schemas"
import { sendEmail, emailTemplates } from "@/lib/email"

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 heure
const MAX_INVITATIONS_PER_HOUR = 3

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
    const parsed = inviteCreatorSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email } = parsed.data

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email. Utilisez la recherche pour le retrouver.", code: "USER_EXISTS" },
        { status: 409 }
      )
    }

    // Rate limiting basique : compter les tokens d'invitation récents pour cet email
    // On utilise expires > now() car les invitations expirent dans 7j, donc celles encore valides sont récentes
    const recentInvitations = await prisma.verificationToken.count({
      where: {
        identifier: `invite:${email}`,
        expires: { gte: new Date() },
      },
    })

    if (recentInvitations >= MAX_INVITATIONS_PER_HOUR) {
      return NextResponse.json(
        { error: "Trop d'invitations envoyées pour cet email. Réessayez dans une heure." },
        { status: 429 }
      )
    }

    // Enregistrer l'invitation (pour le rate limiting)
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
    await prisma.verificationToken.create({
      data: {
        identifier: `invite:${email}`,
        token: `invite-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        expires,
      },
    })

    // Envoyer l'email d'invitation
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const signupUrl = `${baseUrl}/register?email=${encodeURIComponent(email)}&ref=club-invite`
    const inviterName = session.user.name || session.user.email

    const emailContent = emailTemplates.creatorInvitationEmail(inviterName, email, signupUrl)
    await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    

    return NextResponse.json({ sent: true })
  } catch (error) {
    console.error("[API] invitations/creator/send error:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
