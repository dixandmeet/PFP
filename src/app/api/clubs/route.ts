// GET /api/clubs - Liste/recherche clubs
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"
import { generateUniqueSlug } from "@/lib/utils/slug.server"
import { createClubProfileSchema } from "@/lib/validators/schemas"
import { createOwnerMembership } from "@/lib/services/club-members"
import { isClubRole } from "@/lib/utils/role-helpers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Filtres
    const country = searchParams.get("country")
    const league = searchParams.get("league")
    const verified = searchParams.get("verified") === "true"
    const query = searchParams.get("query") // Recherche par nom

    // Construction de la requête
    const where: any = {}

    if (country) {
      where.country = country
    }

    if (league) {
      where.league = { contains: league, mode: "insensitive" }
    }

    if (verified) {
      where.isVerified = true
    }

    if (query) {
      where.OR = [
        { clubName: { contains: query, mode: "insensitive" } },
        { shortName: { contains: query, mode: "insensitive" } },
        { city: { contains: query, mode: "insensitive" } },
      ]
    }

    // Récupération des clubs
    const [clubs, total] = await Promise.all([
      prisma.clubProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
            },
          },
          _count: {
            select: {
              teams: true,
              listings: { where: { status: "PUBLISHED" } },
            },
          },
        },
        orderBy: [
          { isVerified: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.clubProfile.count({ where }),
    ])

    // Formater la réponse
    const formattedClubs = clubs.map((club) => ({
      id: club.id,
      userId: club.userId,
      clubName: club.clubName,
      shortName: club.shortName,
      country: club.country,
      city: club.city,
      league: club.league,
      division: club.division,
      logo: club.logo,
      website: club.website,
      bio: club.bio,
      foundedYear: club.foundedYear,
      isVerified: club.isVerified,
      teamsCount: club._count.teams,
      activeListingsCount: club._count.listings,
      createdAt: club.createdAt,
    }))

    return NextResponse.json({
      clubs: formattedClubs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/clubs - Créer profil club (appelé après register)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    if (!isClubRole(session.user.role)) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createClubProfileSchema.parse(body)

    // Vérifier si le profil existe déjà
    const existingProfile = await prisma.clubProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (existingProfile) {
      return NextResponse.json(
        { error: "Profil club déjà existant" },
        { status: 400 }
      )
    }

    // Générer un slug unique
    const slug = await generateUniqueSlug(validatedData.clubName, "club")

    // Créer le profil
    const clubProfile = await prisma.clubProfile.create({
      data: {
        userId: session.user.id,
        ...validatedData,
        slug,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    })

    // Auto-create OWNER membership
    await createOwnerMembership(
      clubProfile.id,
      session.user.id,
      clubProfile.user.email
    )

    return NextResponse.json(clubProfile, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

