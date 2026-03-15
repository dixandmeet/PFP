// GET /api/submissions - Liste soumissions
// POST /api/submissions - Créer soumission agent → club
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/lib/utils/api-helpers"
import { isClubRole } from "@/lib/utils/role-helpers"
import { createSubmissionSchema } from "@/lib/validators/schemas"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    // Construire le filtre selon le rôle
    let where: any = {}

    if (session.user.role === "AGENT") {
      // Récupérer le profil agent
      const agentProfile = await prisma.agentProfile.findUnique({
        where: { userId: session.user.id },
      })

      if (!agentProfile) {
        return NextResponse.json({ submissions: [] })
      }

      where.agentProfileId = agentProfile.id
    } else if (isClubRole(session.user.role)) {
      // Récupérer le profil club
      const clubProfile = await prisma.clubProfile.findUnique({
        where: { userId: session.user.id },
      })

      if (!clubProfile) {
        return NextResponse.json({ submissions: [] })
      }

      where.clubProfileId = clubProfile.id
    } else {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      )
    }

    if (status) {
      where.status = status
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        agentProfile: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        clubProfile: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            position: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ submissions })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    if (session.user.role !== "AGENT") {
      return NextResponse.json(
        { error: "Seuls les agents peuvent créer des soumissions" },
        { status: 403 }
      )
    }

    // Récupérer le profil agent
    const agentProfile = await prisma.agentProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!agentProfile) {
      return NextResponse.json(
        { error: "Profil agent non trouvé" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = createSubmissionSchema.parse(body)

    // Vérifier qu'un mandat actif existe pour ce joueur
    const activeMandate = await prisma.mandate.findFirst({
      where: {
        agentProfileId: agentProfile.id,
        playerProfileId: validatedData.playerProfileId,
        status: "ACTIVE",
        endDate: {
          gte: new Date(),
        },
      },
    })

    if (!activeMandate) {
      return NextResponse.json(
        { error: "Aucun mandat actif avec ce joueur" },
        { status: 400 }
      )
    }

    // Récupérer les données du joueur pour le snapshot
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { id: validatedData.playerProfileId },
      include: {
        careerEntries: true,
      },
    })

    if (!playerProfile) {
      return NextResponse.json(
        { error: "Joueur non trouvé" },
        { status: 404 }
      )
    }

    // Créer la soumission
    const submission = await prisma.submission.create({
      data: {
        agentProfileId: agentProfile.id,
        playerProfileId: validatedData.playerProfileId,
        clubProfileId: validatedData.clubProfileId,
        listingId: validatedData.listingId || null,
        message: validatedData.message,
        playerData: {
          id: playerProfile.id,
          firstName: playerProfile.firstName,
          lastName: playerProfile.lastName,
          primaryPosition: playerProfile.primaryPosition,
          nationality: playerProfile.nationality,
          dateOfBirth: playerProfile.dateOfBirth.toISOString(),
          currentClub: playerProfile.currentClub,
          careerEntries: playerProfile.careerEntries.map((entry) => ({
            clubName: entry.clubName,
            season: entry.season,
            appearances: entry.appearances,
            goals: entry.goals,
            assists: entry.assists,
          })),
        },
        reportIds: validatedData.reportIds || [],
        attachments: validatedData.attachments || [],
      },
      include: {
        agentProfile: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        clubProfile: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        listing: true,
      },
    })

    // Créer une notification pour le club
    await prisma.notification.create({
      data: {
        userId: submission.clubProfile.userId,
        type: "SUBMISSION_RECEIVED",
        title: "Nouvelle soumission agent",
        message: `${agentProfile.firstName} ${agentProfile.lastName} vous propose ${playerProfile.firstName} ${playerProfile.lastName}`,
        link: `/club/submissions`,
      },
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
