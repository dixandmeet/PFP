// GET /api/clubs/[id] - Détails club
// PATCH /api/clubs/[id] - Mise à jour profil club
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/lib/utils/api-helpers"
import { updateClubProfileSchema } from "@/lib/validators/schemas"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const clubProfile = await prisma.clubProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        teams: {
          include: {
            staffMembers: true,
          },
        },
        listings: {
          where: { status: "PUBLISHED" },
          select: {
            id: true,
            title: true,
            position: true,
            publishedAt: true,
          },
        },
        applications: {
          select: { id: true, status: true },
        },
        submissions: {
          select: { id: true, status: true },
        },
      },
    })

    if (!clubProfile) {
      return NextResponse.json(
        { error: "Club non trouvé" },
        { status: 404 }
      )
    }

    // Formater la réponse
    const response = {
      ...clubProfile,
      activeListingsCount: clubProfile.listings.length,
      applicationsCount: clubProfile.applications.length,
      submissionsCount: clubProfile.submissions.length,
    }

    return NextResponse.json(response)
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

    // Vérifier que le profil appartient à l'utilisateur
    const clubProfile = await prisma.clubProfile.findUnique({
      where: { id },
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

    // Valider et mettre à jour
    const body = await request.json()
    const validatedData = updateClubProfileSchema.parse(body)

    const updatedProfile = await prisma.clubProfile.update({
      where: { id },
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    return handleApiError(error)
  }
}
