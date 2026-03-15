// DELETE /api/clubs/[id]/teams/[teamId]/staff/[staffId] - Supprimer un membre du staff
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { handleApiError } from "@/lib/utils/api-helpers"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string; staffId: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { id, teamId, staffId } = await params

    // Vérifier que le club appartient à l'utilisateur
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

    // Vérifier que l'équipe appartient au club
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    })

    if (!team || team.clubProfileId !== id) {
      return NextResponse.json(
        { error: "Équipe non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier que le staff appartient à l'équipe
    const staffMember = await prisma.staffMember.findUnique({
      where: { id: staffId },
    })

    if (!staffMember || staffMember.teamId !== teamId) {
      return NextResponse.json(
        { error: "Membre du staff non trouvé" },
        { status: 404 }
      )
    }

    await prisma.staffMember.delete({
      where: { id: staffId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
