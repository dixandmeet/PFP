// GET /api/submissions - Liste soumissions
// POST /api/submissions - Créer soumission agent → club
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { handleApiError } from "@/lib/utils/api-helpers"
import { isClubRole } from "@/lib/utils/role-helpers"
import { createSubmissionSchema } from "@/lib/validators/schemas"
import { getClubForUser } from "@/lib/services/club-members"
import { grantReportClubAccess } from "@/lib/services/club-reports"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

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
      const clubInfo = await getClubForUser(session.user.id)
      if (!clubInfo) {
        return NextResponse.json({ submissions: [] })
      }
      where.clubProfileId = clubInfo.clubProfileId
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

    const allReportIds = [
      ...new Set(submissions.flatMap((s) => s.reportIds)),
    ]
    const reportsById = new Map<string, object>()
    if (allReportIds.length > 0) {
      const reports = await prisma.playerReport.findMany({
        where: { id: { in: allReportIds } },
        include: {
          subject: {
            select: { id: true, firstName: true, lastName: true },
          },
          author: {
            select: { id: true, firstName: true, lastName: true },
          },
          sections: { orderBy: { order: "asc" } },
        },
      })
      for (const r of reports) {
        reportsById.set(r.id, r)
      }
    }

    const enriched = submissions.map((s) => ({
      ...s,
      reports: s.reportIds
        .map((id) => reportsById.get(id))
        .filter(Boolean),
    }))

    return NextResponse.json({ submissions: enriched })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

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

    const reportIds = validatedData.reportIds || []
    if (reportIds.length > 0) {
      const reports = await prisma.playerReport.findMany({
        where: { id: { in: reportIds } },
        select: { id: true, subjectId: true },
      })
      if (reports.length !== reportIds.length) {
        return NextResponse.json(
          { error: "Un ou plusieurs rapports sont invalides" },
          { status: 400 }
        )
      }
      const invalid = reports.some(
        (r) => r.subjectId !== validatedData.playerProfileId
      )
      if (invalid) {
        return NextResponse.json(
          { error: "Les rapports doivent concerner le joueur proposé" },
          { status: 403 }
        )
      }
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
        reportIds,
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

    if (reportIds.length > 0) {
      await grantReportClubAccess(
        reportIds,
        validatedData.clubProfileId,
        submission.id
      )
    }

    const notifyUserId = submission.clubProfile.userId
    if (notifyUserId) {
      await prisma.notification.create({
        data: {
          userId: notifyUserId,
          type: "SUBMISSION_RECEIVED",
          title: "Nouvelle soumission agent",
          message: `${agentProfile.firstName} ${agentProfile.lastName} vous propose ${playerProfile.firstName} ${playerProfile.lastName}`,
          link: `/club/submissions`,
        },
      })
    }

    const attachedReports =
      reportIds.length > 0
        ? await prisma.playerReport.findMany({
            where: { id: { in: reportIds } },
            include: {
              subject: {
                select: { id: true, firstName: true, lastName: true },
              },
              sections: { orderBy: { order: "asc" } },
            },
          })
        : []

    return NextResponse.json(
      { ...submission, reports: attachedReports },
      { status: 201 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
