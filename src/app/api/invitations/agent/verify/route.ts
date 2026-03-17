import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Token manquant" }, { status: 400 })
    }

    const invitation = await prisma.agentInvitation.findUnique({
      where: { token },
      include: {
        playerProfile: {
          select: {
            firstName: true,
            lastName: true,
            displayName: true,
            primaryPosition: true,
            currentClub: true,
            profilePicture: true,
          },
        },
      },
    })

    if (!invitation) {
      return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 })
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "Cette invitation a déjà été utilisée", status: invitation.status },
        { status: 410 }
      )
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.agentInvitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      })
      return NextResponse.json({ error: "Cette invitation a expiré" }, { status: 410 })
    }

    const playerName = invitation.playerProfile.displayName ||
      `${invitation.playerProfile.firstName} ${invitation.playerProfile.lastName}`

    return NextResponse.json({
      valid: true,
      invitation: {
        agentEmail: invitation.agentEmail,
        agentFirstName: invitation.agentFirstName,
        agentLastName: invitation.agentLastName,
        agentPhone: invitation.agentPhone,
        player: {
          name: playerName,
          position: invitation.playerProfile.primaryPosition,
          club: invitation.playerProfile.currentClub,
          profilePicture: invitation.playerProfile.profilePicture,
        },
      },
    })
  } catch (error) {
    console.error("Error verifying agent invitation:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
