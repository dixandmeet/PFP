// PATCH /api/listings/[id]/status - Changer le statut d'une annonce
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/lib/utils/api-helpers"
import { z } from "zod"

const updateStatusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]),
})

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

    const body = await request.json()
    const { status } = updateStatusSchema.parse(body)

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

    // Mettre à jour le statut
    const updateData: any = { status }

    if (status === "PUBLISHED" && !listing.publishedAt) {
      updateData.publishedAt = new Date()
    }

    if (status === "CLOSED") {
      updateData.closedAt = new Date()
    }

    const updatedListing = await prisma.listing.update({
      where: { id },
      data: updateData,
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
      },
    })

    return NextResponse.json(updatedListing)
  } catch (error) {
    return handleApiError(error)
  }
}
