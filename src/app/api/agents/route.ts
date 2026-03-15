// GET /api/agents - Liste/recherche agents
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"
import { generateUniqueSlug } from "@/lib/utils/slug.server"
import { createAgentProfileSchema } from "@/lib/validators/schemas"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Filtres
    const specialty = searchParams.get("specialty")
    const country = searchParams.get("licenseCountry")
    const verified = searchParams.get("verified") === "true"
    const query = searchParams.get("query") // Recherche par nom

    // Construction de la requête
    const where: any = {}

    if (specialty) {
      where.specialties = {
        has: specialty,
      }
    }

    if (country) {
      where.licenseCountry = country
    }

    if (verified) {
      where.isVerified = true
    }

    if (query) {
      where.OR = [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { agencyName: { contains: query, mode: "insensitive" } },
      ]
    }

    // Récupération des agents
    const [agents, total] = await Promise.all([
      prisma.agentProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
          mandates: {
            where: { status: "ACTIVE" },
            select: { id: true },
          },
        },
        orderBy: [
          { isVerified: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      prisma.agentProfile.count({ where }),
    ])

    // Formater la réponse
    const formattedAgents = agents.map((agent) => ({
      id: agent.id,
      userId: agent.userId,
      firstName: agent.firstName,
      lastName: agent.lastName,
      agencyName: agent.agencyName,
      licenseNumber: agent.licenseNumber,
      licenseCountry: agent.licenseCountry,
      bio: agent.bio,
      specialties: agent.specialties,
      phoneNumber: agent.phoneNumber,
      website: agent.website,
      profilePicture: agent.profilePicture,
      isVerified: agent.isVerified,
      activeMandatesCount: agent.mandates.length,
      createdAt: agent.createdAt,
    }))

    return NextResponse.json({
      agents: formattedAgents,
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

// POST /api/agents - Créer profil agent (appelé après register)
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
        { error: "Accès refusé" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = createAgentProfileSchema.parse(body)

    // Vérifier si le profil existe déjà
    const existingProfile = await prisma.agentProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (existingProfile) {
      return NextResponse.json(
        { error: "Profil agent déjà existant" },
        { status: 400 }
      )
    }

    // Générer un slug unique
    const fullName = `${validatedData.firstName} ${validatedData.lastName}`
    const slug = await generateUniqueSlug(fullName, "agent")

    // Créer le profil
    const agentProfile = await prisma.agentProfile.create({
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

    return NextResponse.json(agentProfile, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

