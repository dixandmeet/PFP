// API: /api/clubs/[id]/teams/[teamId] - DELETE (suppression d'une équipe)
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/lib/utils/api-helpers"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { id, teamId } = await params

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

    // Supprimer les staffMembers associés puis l'équipe
    await prisma.$transaction([
      prisma.staffMember.deleteMany({ where: { teamId } }),
      prisma.team.delete({ where: { id: teamId } }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
