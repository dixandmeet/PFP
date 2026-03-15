// DELETE /api/clubs/[id]/teams/[teamId]/players/[playerId] - Retirer un joueur de l'équipe
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { handleApiError } from "@/lib/utils/api-helpers"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string; playerId: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { id, teamId, playerId } = await params

    const clubProfile = await prisma.clubProfile.findUnique({
      where: { id },
    })

    if (!clubProfile) {
      return NextResponse.json(
        { error: "Club non trouvé" },
        { status: 404 }
      )
    }

    if (clubProfile.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      )
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    })

    if (!team || team.clubProfileId !== id) {
      return NextResponse.json(
        { error: "Équipe non trouvée" },
        { status: 404 }
      )
    }

    const teamPlayer = await prisma.teamPlayer.findUnique({
      where: { id: playerId },
    })

    if (!teamPlayer || teamPlayer.teamId !== teamId) {
      return NextResponse.json(
        { error: "Joueur non trouvé dans cette équipe" },
        { status: 404 }
      )
    }

    await prisma.teamPlayer.delete({
      where: { id: playerId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
