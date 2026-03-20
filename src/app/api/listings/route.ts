// API: Listings (annonces clubs)
import { NextResponse } from "next/server"
import { requireAuth, requireRole } from "@/lib/permissions/rbac"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseBody } from "@/lib/utils/api-helpers"
import { createListingSchema } from "@/lib/validators/schemas"
import { auth } from "@/lib/auth"
import { ListingBillingService } from "@/lib/services/credits"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get("position")
    const ALLOWED_STATUSES = ["DRAFT", "PUBLISHED", "CLOSED"] as const
    const rawStatus = searchParams.get("status") || "PUBLISHED"
    const status = ALLOWED_STATUSES.includes(rawStatus as any) ? rawStatus : "PUBLISHED"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1)
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "20") || 20), 100)

    const where: any = {
      status,
    }

    if (position) {
      where.position = { contains: position, mode: "insensitive" }
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          clubProfile: {
            select: {
              id: true,
              clubName: true,
              logo: true,
              country: true,
              city: true,
              league: true,
              division: true,
              userId: true,
            }
          },
          team: {
            select: {
              id: true,
              name: true,
              level: true,
            }
          },
          _count: {
            select: {
              applications: true,
              submissions: true,
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { publishedAt: "desc" },
      }),
      prisma.listing.count({ where }),
    ])

    const session = await auth()
    const userId = session?.user?.id
    const userRole = session?.user?.role

    let consultedListingIds = new Set<string>()
    if (userId) {
      const consultations = await prisma.listingConsultation.findMany({
        where: {
          userId,
          listingId: { in: listings.map((l: any) => l.id) },
        },
        select: { listingId: true },
      })
      consultedListingIds = new Set(consultations.map((c: any) => c.listingId))
    }

    const maskedListings = listings.map((listing: any) => {
      const isOwner = userId && listing.clubProfile.userId === userId
      const isAdmin = userRole === "ADMIN"
      const hasConsulted = consultedListingIds.has(listing.id)

      if (isOwner || isAdmin || hasConsulted) {
        const { clubProfile, ...rest } = listing
        const { userId: _uid, division: _div, ...safeClubProfile } = clubProfile
        return { ...rest, clubProfile: safeClubProfile, consulted: true, consultationCost: 0 }
      }

      const cost = ListingBillingService.getCostByDivision(listing.clubProfile.division)
      return {
        id: listing.id,
        title: null,
        position: listing.position,
        status: listing.status,
        publishedAt: null,
        clubProfile: {
          id: listing.clubProfile.id,
          clubName: null,
          country: null,
          city: null,
          logo: null,
          league: listing.clubProfile.league,
        },
        _count: null,
        description: null,
        salaryMin: null,
        salaryMax: null,
        currency: null,
        contractType: null,
        startDate: null,
        minAge: null,
        maxAge: null,
        nationality: [],
        consulted: false,
        consultationCost: cost,
      }
    })

    return NextResponse.json({
      listings: maskedListings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole(["CLUB", "ADMIN"])

    // Récupérer le club profile
    const clubProfile = await prisma.clubProfile.findUnique({
      where: { userId: user.id }
    })

    if (!clubProfile) {
      return NextResponse.json(
        { error: "Profil club requis" },
        { status: 400 }
      )
    }

    // Vérifier que le club a au moins 1 équipe
    const teamCount = await prisma.team.count({
      where: { clubProfileId: clubProfile.id },
    })

    if (teamCount === 0) {
      return NextResponse.json(
        { error: "Vous devez créer au moins une équipe avant de déposer une annonce" },
        { status: 400 }
      )
    }

    const body = await parseBody<Record<string, unknown>>(request)
    const validatedData = createListingSchema.parse(body)

    // Valider teamId si fourni
    const teamId = typeof body.teamId === "string" ? body.teamId : null
    if (teamId) {
      const team = await prisma.team.findFirst({
        where: { id: teamId, clubProfileId: clubProfile.id },
      })
      if (!team) {
        return NextResponse.json(
          { error: "Équipe invalide ou n'appartient pas à ce club" },
          { status: 400 }
        )
      }
    }

    // Convertir startDate si string
    const createData: Record<string, unknown> = { 
      ...validatedData, 
      clubProfileId: clubProfile.id,
      teamId: teamId,
    }
    if (createData.startDate && typeof createData.startDate === "string") {
      createData.startDate = new Date(createData.startDate as string)
    }

    const listing = await prisma.listing.create({
      data: createData as Parameters<typeof prisma.listing.create>[0]["data"],
      include: {
        clubProfile: {
          select: {
            clubName: true,
            logo: true,
          }
        },
        team: {
          select: {
            id: true,
            name: true,
            level: true,
          }
        }
      }
    })

    return NextResponse.json(listing, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
