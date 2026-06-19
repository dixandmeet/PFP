// GET /api/admin/listings — Liste toutes les annonces (admin)
// POST /api/admin/listings — Créer une annonce pour un club (admin)
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseBody } from "@/lib/utils/api-helpers"
import { createListingSchema } from "@/lib/validators/schemas"
import { z } from "zod"

const ALLOWED_STATUSES = ["DRAFT", "PUBLISHED", "CLOSED"] as const

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const rawStatus = searchParams.get("status")
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1)
    const pageSize = Math.min(
      Math.max(1, parseInt(searchParams.get("pageSize") || "20") || 20),
      100
    )

    const where: Record<string, unknown> = {}
    if (
      rawStatus &&
      rawStatus !== "all" &&
      ALLOWED_STATUSES.includes(rawStatus as (typeof ALLOWED_STATUSES)[number])
    ) {
      where.status = rawStatus
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          clubProfile: {
            select: {
              id: true,
              clubName: true,
              country: true,
              logo: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
              level: true,
            },
          },
          _count: {
            select: {
              applications: true,
              submissions: true,
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ updatedAt: "desc" }],
      }),
      prisma.listing.count({ where }),
    ])

    return NextResponse.json({
      listings,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

const adminCreateListingSchema = createListingSchema.extend({
  status: z.enum(ALLOWED_STATUSES).optional(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await parseBody<Record<string, unknown>>(request)
    const clubProfileId =
      typeof body.clubProfileId === "string" ? body.clubProfileId : null

    if (!clubProfileId) {
      return NextResponse.json({ error: "Club requis" }, { status: 400 })
    }

    const clubProfile = await prisma.clubProfile.findUnique({
      where: { id: clubProfileId },
      select: { id: true },
    })

    if (!clubProfile) {
      return NextResponse.json({ error: "Club introuvable" }, { status: 404 })
    }

    const validatedData = adminCreateListingSchema.parse(body)

    const teamId = typeof body.teamId === "string" ? body.teamId : null
    if (teamId) {
      const team = await prisma.team.findFirst({
        where: { id: teamId, clubProfileId },
      })
      if (!team) {
        return NextResponse.json(
          { error: "Équipe invalide ou n'appartient pas à ce club" },
          { status: 400 }
        )
      }
    }

    const status = validatedData.status ?? "DRAFT"
    const { status: _status, ...listingFields } = validatedData

    const createData: Record<string, unknown> = {
      ...listingFields,
      clubProfileId,
      teamId,
      status,
    }

    if (status === "PUBLISHED") {
      createData.publishedAt = new Date()
    }

    if (status === "CLOSED") {
      createData.closedAt = new Date()
    }

    if (createData.startDate && typeof createData.startDate === "string") {
      createData.startDate = new Date(createData.startDate as string)
    }

    const listing = await prisma.listing.create({
      data: createData as Parameters<typeof prisma.listing.create>[0]["data"],
      include: {
        clubProfile: {
          select: {
            id: true,
            clubName: true,
            country: true,
            logo: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        _count: {
          select: {
            applications: true,
            submissions: true,
          },
        },
      },
    })

    return NextResponse.json(listing, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
