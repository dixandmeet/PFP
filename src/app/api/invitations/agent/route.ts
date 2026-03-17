import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendTrackedEmail, emailTemplates } from "@/lib/email"
import { z } from "zod"

const inviteSchema = z.object({
  agentEmail: z.string().email("Email invalide"),
  agentFirstName: z.string().min(1, "Prénom requis").max(50),
  agentLastName: z.string().min(1, "Nom requis").max(50),
  agentPhone: z.string().optional(),
  message: z.string().max(500).optional(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    if (session.user.role !== "PLAYER") {
      return NextResponse.json({ error: "Réservé aux joueurs" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = inviteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { agentEmail, agentFirstName, agentLastName, agentPhone, message } = parsed.data

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!playerProfile) {
      return NextResponse.json({ error: "Profil joueur introuvable" }, { status: 404 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: agentEmail.toLowerCase() },
      select: { id: true, role: true },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Cette adresse email est déjà associée à un compte sur la plateforme" },
        { status: 409 }
      )
    }

    const recentInvite = await prisma.agentInvitation.findFirst({
      where: {
        playerProfileId: playerProfile.id,
        agentEmail: agentEmail.toLowerCase(),
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
    })

    if (recentInvite) {
      return NextResponse.json(
        { error: "Une invitation est déjà en attente pour cet email" },
        { status: 409 }
      )
    }

    const invitation = await prisma.agentInvitation.create({
      data: {
        agentEmail: agentEmail.toLowerCase(),
        agentFirstName,
        agentLastName,
        agentPhone: agentPhone || null,
        message: message || null,
        playerProfileId: playerProfile.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const inviteUrl = `${appUrl}/invite/agent/${invitation.token}`

    const playerName = playerProfile.displayName || `${playerProfile.firstName} ${playerProfile.lastName}`

    const template = emailTemplates.agentInvitationEmail(
      playerName,
      agentFirstName,
      message || undefined,
      inviteUrl
    )

    await sendTrackedEmail({
      to: agentEmail.toLowerCase(),
      subject: template.subject,
      html: template.html,
      userId: session.user.id,
      template: "agent_invitation",
      metadata: { invitationId: invitation.id, agentEmail: agentEmail.toLowerCase() },
    })

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        agentEmail: invitation.agentEmail,
        agentFirstName: invitation.agentFirstName,
        agentLastName: invitation.agentLastName,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        createdAt: invitation.createdAt,
      },
    })
  } catch (error: any) {
    console.error("Error creating agent invitation:", error)
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'invitation" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!playerProfile) {
      return NextResponse.json({ invitations: [] })
    }

    const invitations = await prisma.agentInvitation.findMany({
      where: { playerProfileId: playerProfile.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        agentEmail: true,
        agentFirstName: true,
        agentLastName: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        acceptedAt: true,
      },
    })

    return NextResponse.json({ invitations })
  } catch (error) {
    console.error("Error fetching agent invitations:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
