// API: Players listing & search
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"
import { searchPlayersSchema, createPlayerProfileSchema } from "@/lib/validators/schemas"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { generateUniqueSlug } from "@/lib/utils/slug"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params = {
      position: searchParams.get("position") || undefined,
      minAge: searchParams.get("minAge") ? parseInt(searchParams.get("minAge")!) : undefined,
      maxAge: searchParams.get("maxAge") ? parseInt(searchParams.get("maxAge")!) : undefined,
      nationality: searchParams.get("nationality") || undefined,
      query: searchParams.get("query") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    }

    const validated = searchPlayersSchema.parse(params)

    // Construire les filtres
    const where: any = {
      isSearchable: true,
    }

    if (validated.position) {
      where.OR = [
        { primaryPosition: { contains: validated.position, mode: "insensitive" } },
        { secondaryPositions: { has: validated.position } },
      ]
    }

    if (validated.nationality) {
      where.nationality = validated.nationality
    }

    if (validated.minAge || validated.maxAge) {
      const now = new Date()
      if (validated.maxAge) {
        const minBirthDate = new Date(now.getFullYear() - validated.maxAge, now.getMonth(), now.getDate())
        where.dateOfBirth = { gte: minBirthDate }
      }
      if (validated.minAge) {
        const maxBirthDate = new Date(now.getFullYear() - validated.minAge, now.getMonth(), now.getDate())
        where.dateOfBirth = { ...where.dateOfBirth, lte: maxBirthDate }
      }
    }

    if (validated.query) {
      where.OR = [
        { firstName: { contains: validated.query, mode: "insensitive" } },
        { lastName: { contains: validated.query, mode: "insensitive" } },
        { displayName: { contains: validated.query, mode: "insensitive" } },
      ]
    }

    const [players, total] = await Promise.all([
      prisma.playerProfile.findMany({
        where,
        select: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          displayName: true,
          dateOfBirth: true,
          nationality: true,
          primaryPosition: true,
          secondaryPositions: true,
          profilePicture: true,
          currentClub: true,
          currentLeague: true,
          availableFrom: true,
        },
        skip: (validated.page - 1) * validated.limit,
        take: validated.limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.playerProfile.count({ where }),
    ])

    return NextResponse.json({
      players,
      pagination: {
        page: validated.page,
        limit: validated.limit,
        total,
        totalPages: Math.ceil(total / validated.limit),
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/players - Créer profil joueur (appelé après register)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    if (session.user.role !== "PLAYER") {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createPlayerProfileSchema.parse(body)

    // Vérifier si le profil existe déjà
    const existingProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (existingProfile) {
      return NextResponse.json(
        { error: "Profil joueur déjà existant" },
        { status: 400 }
      )
    }

    // Générer un slug unique
    const fullName = validatedData.displayName || `${validatedData.firstName} ${validatedData.lastName}`
    const slug = await generateUniqueSlug(fullName, "player")

    // Créer le profil
    const playerProfile = await prisma.playerProfile.create({
      data: {
        userId: session.user.id,
        ...validatedData,
        slug,
        dateOfBirth: new Date(validatedData.dateOfBirth),
        availableFrom: validatedData.availableFrom ? new Date(validatedData.availableFrom) : null,
        contractEndDate: validatedData.contractEndDate ? new Date(validatedData.contractEndDate) : null,
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

    return NextResponse.json(playerProfile, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
