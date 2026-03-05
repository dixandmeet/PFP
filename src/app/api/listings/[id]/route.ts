// GET /api/listings/[id] - Détails annonce
// PATCH /api/listings/[id] - Mise à jour annonce
// DELETE /api/listings/[id] - Supprimer annonce
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/lib/utils/api-helpers"
import { updateListingSchema } from "@/lib/validators/schemas"
import { ListingBillingService } from "@/lib/services/credits"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
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
        _count: {
          select: {
            applications: true,
            submissions: true,
          },
        },
      },
    }) as any // Cast pour ajouter les champs dynamiques consulted/consultationCost

    if (!listing) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier si l'utilisateur connecté a payé la consultation
    let consulted = false
    let consultationCost = 0
    const session = await getServerSession(authOptions)

    if (session?.user) {
      const isOwner = listing.clubProfile.userId === session.user.id
      const isAdmin = session.user.role === "ADMIN"

      if (isOwner || isAdmin) {
        consulted = true
      } else {
        consulted = await ListingBillingService.hasConsulted(session.user.id, id)
        consultationCost = ListingBillingService.getCostByDivision(listing.clubProfile.division)
      }
    }

    // Si pas consulté, masquer les détails payants
    if (!consulted) {
      return NextResponse.json({
        id: listing.id,
        title: listing.title,
        position: listing.position,
        status: listing.status,
        publishedAt: listing.publishedAt,
        clubProfile: {
          id: listing.clubProfile.id,
          clubName: listing.clubProfile.clubName,
          country: listing.clubProfile.country,
          division: listing.clubProfile.division,
          logo: listing.clubProfile.logo,
        },
        _count: listing._count,
        // Indicateurs de consultation
        consulted: false,
        consultationCost,
        // Champs masqués
        description: null,
        salaryMin: null,
        salaryMax: null,
        requirements: null,
        contractType: null,
      })
    }

    return NextResponse.json({
      ...listing,
      consulted: true,
      consultationCost: 0,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Récupérer l'annonce
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        clubProfile: true,
      },
    })

    if (!listing) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier les permissions
    if (
      listing.clubProfile.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateListingSchema.parse(body)

    // Convertir les dates si nécessaire
    const updateData: Record<string, unknown> = { ...validatedData }
    if (validatedData.startDate) {
      updateData.startDate = new Date(validatedData.startDate)
    }

    // Gérer teamId si fourni
    if (typeof body.teamId === "string" && body.teamId) {
      // Vérifier que la team appartient au club
      const team = await prisma.team.findFirst({
        where: { id: body.teamId, clubProfileId: listing.clubProfileId },
      })
      if (team) {
        updateData.teamId = body.teamId
      }
    } else if (body.teamId === null) {
      updateData.teamId = null
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: updateData as Parameters<typeof prisma.listing.update>[0]["data"],
      include: {
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

    return NextResponse.json(updatedListing)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Récupérer l'annonce
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        clubProfile: true,
      },
    })

    if (!listing) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier les permissions
    if (
      listing.clubProfile.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      )
    }

    await prisma.listing.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
