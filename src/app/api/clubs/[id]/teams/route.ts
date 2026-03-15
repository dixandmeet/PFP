// API: /api/clubs/[id]/teams - GET (liste) + POST (création)
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { handleApiError } from "@/lib/utils/api-helpers"
import { createTeamSchemaForCountry } from "@/lib/validators/schemas"
import { TeamLevel } from "@prisma/client"

// GET /api/clubs/[id]/teams - Récupérer les équipes d'un club
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { id } = await params

    const teams = await prisma.team.findMany({
      where: { clubProfileId: id },
      include: {
        staffMembers: true,
        teamPlayers: {
          include: {
            playerProfile: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                primaryPosition: true,
                profilePicture: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ teams })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/clubs/[id]/teams - Créer une équipe
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Vérifier que le club appartient à l'utilisateur
    const clubProfile = await prisma.clubProfile.findUnique({
      where: { id },
      select: { id: true, userId: true, country: true },
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

    const body = await request.json()

    // Validation conditionnelle selon le pays du club
    const schema = createTeamSchemaForCountry(clubProfile.country)
    const validatedData = schema.parse(body)

    const isFrAcademy = clubProfile.country === "FR" && validatedData.level === "ACADEMY"

    const team = await prisma.team.create({
      data: {
        clubProfileId: id,
        name: validatedData.name,
        level: validatedData.level as TeamLevel,
        division: isFrAcademy ? null : (validatedData.division ?? null),
        category: isFrAcademy ? (validatedData.category ?? null) : null,
        competitionName: isFrAcademy ? (validatedData.competitionName ?? null) : null,
      },
      include: {
        staffMembers: true,
        teamPlayers: {
          include: {
            playerProfile: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                primaryPosition: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
