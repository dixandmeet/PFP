// GET /api/reports - Liste rapports
// POST /api/reports - Créer rapport
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { handleApiError } from "@/lib/utils/api-helpers"
import { createReportSchema } from "@/lib/validators/schemas"

function generateShareSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
  const suffix = Math.random().toString(36).slice(2, 8)
  return `${slug}-${suffix}`
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const userRole = session.user.role

    let whereClause: any = {}

    if (userRole === "AGENT") {
      const agentProfile = await prisma.agentProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          mandates: {
            where: { status: "ACTIVE" },
            select: { playerProfileId: true },
          },
        },
      })

      if (!agentProfile) {
        return NextResponse.json({ reports: [] })
      }

      const playerIds = agentProfile.mandates.map(m => m.playerProfileId)

      whereClause = {
        subjectId: { in: playerIds },
      }
    } else {
      const playerProfile = await prisma.playerProfile.findUnique({
        where: { userId: session.user.id },
      })

      if (!playerProfile) {
        return NextResponse.json({ reports: [] })
      }

      whereClause = {
        OR: [
          { authorId: playerProfile.id },
          { subjectId: playerProfile.id },
        ],
      }
    }

    const reports = await prisma.playerReport.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        subject: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        sections: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const reportsToBackfill = reports.filter(r => !r.shareSlug)
    if (reportsToBackfill.length > 0) {
      await Promise.all(
        reportsToBackfill.map(r =>
          prisma.playerReport.update({
            where: { id: r.id },
            data: { shareSlug: generateShareSlug(r.title) },
          })
        )
      )
      for (const r of reportsToBackfill) {
        const match = reports.find(rr => rr.id === r.id)
        if (match) match.shareSlug = generateShareSlug(r.title)
      }
    }

    return NextResponse.json({ reports })
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

    const body = await request.json()
    const validatedData = createReportSchema.parse(body)

    const userRole = session.user.role
    let subjectId: string
    let authorId: string

    if (userRole === "AGENT") {
      const agentProfile = await prisma.agentProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          mandates: {
            where: { status: "ACTIVE" },
            select: { playerProfileId: true },
          },
        },
      })

      if (!agentProfile) {
        return NextResponse.json(
          { error: "Profil agent non trouvé" },
          { status: 404 }
        )
      }

      if (validatedData.subjectId) {
        const isManaged = agentProfile.mandates.some(
          m => m.playerProfileId === validatedData.subjectId
        )
        if (!isManaged) {
          return NextResponse.json(
            { error: "Ce joueur n'est pas dans vos mandats actifs" },
            { status: 403 }
          )
        }
        subjectId = validatedData.subjectId
      } else {
        if (agentProfile.mandates.length === 0) {
          return NextResponse.json(
            { error: "Aucun joueur sous mandat actif" },
            { status: 400 }
          )
        }
        subjectId = agentProfile.mandates[0].playerProfileId
      }

      authorId = subjectId
    } else {
      const playerProfile = await prisma.playerProfile.findUnique({
        where: { userId: session.user.id },
      })

      if (!playerProfile) {
        return NextResponse.json(
          { error: "Profil joueur non trouvé" },
          { status: 404 }
        )
      }

      subjectId = playerProfile.id
      authorId = playerProfile.id
    }

    const report = await prisma.playerReport.create({
      data: {
        subjectId,
        authorId,
        authorType: validatedData.authorType,
        title: validatedData.title,
        shareSlug: generateShareSlug(validatedData.title),
        status: "DRAFT",
        attachments: validatedData.attachments || [],
        accessPolicy: validatedData.accessPolicy || null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        subject: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        sections: true,
      },
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
