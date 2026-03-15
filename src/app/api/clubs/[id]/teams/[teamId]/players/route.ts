// API: /api/clubs/[id]/teams/[teamId]/players - POST (ajouter joueur) + GET (lister)
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { handleApiError } from "@/lib/utils/api-helpers"
import { z } from "zod"

const addPlayerSchema = z.object({
  playerProfileId: z.string().min(1),
  jerseyNumber: z.number().int().min(1).max(99).optional(),
  position: z.string().optional(),
})

const playerInclude = {
  playerProfile: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      primaryPosition: true,
      profilePicture: true,
    },
  },
} as const

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { id, teamId } = await params

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

    const body = await request.json()
    const validatedData = addPlayerSchema.parse(body)

    // Vérifier que le profil joueur existe
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { id: validatedData.playerProfileId },
    })

    if (!playerProfile) {
      return NextResponse.json(
        { error: "Profil joueur non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier que le joueur n'est pas déjà dans l'équipe
    const existing = await prisma.teamPlayer.findUnique({
      where: {
        teamId_playerProfileId: {
          teamId,
          playerProfileId: validatedData.playerProfileId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Ce joueur est déjà dans cette équipe" },
        { status: 409 }
      )
    }

    const teamPlayer = await prisma.teamPlayer.create({
      data: {
        teamId,
        playerProfileId: validatedData.playerProfileId,
        jerseyNumber: validatedData.jerseyNumber ?? null,
        position: validatedData.position ?? null,
      },
      include: playerInclude,
    })

    return NextResponse.json(teamPlayer, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { id, teamId } = await params

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    })

    if (!team || team.clubProfileId !== id) {
      return NextResponse.json(
        { error: "Équipe non trouvée" },
        { status: 404 }
      )
    }

    const players = await prisma.teamPlayer.findMany({
      where: { teamId },
      include: playerInclude,
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ players })
  } catch (error) {
    return handleApiError(error)
  }
}
