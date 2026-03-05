// DELETE /api/applications/[id] - Annuler (supprimer) une candidature
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/lib/utils/api-helpers"

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

    // Récupérer la candidature
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        playerProfile: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
          },
        },
        clubProfile: {
          select: {
            userId: true,
            clubName: true,
          },
        },
        listing: {
          select: {
            title: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: "Candidature non trouvée" },
        { status: 404 }
      )
    }

    // Seul le joueur propriétaire ou un admin peut annuler
    const isPlayer = application.playerProfile.userId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isPlayer && !isAdmin) {
      return NextResponse.json(
        { error: "Seul le joueur peut annuler sa candidature" },
        { status: 403 }
      )
    }

    // On ne peut annuler que si le statut le permet (pas déjà signé)
    if (application.status === "SIGNED") {
      return NextResponse.json(
        { error: "Impossible d'annuler une candidature déjà signée" },
        { status: 400 }
      )
    }

    // Supprimer la candidature
    await prisma.application.delete({
      where: { id },
    })

    // Notifier le club de l'annulation
    await prisma.notification.create({
      data: {
        userId: application.clubProfile.userId,
        type: "APPLICATION_RECEIVED",
        title: "Candidature annulée",
        message: `${application.playerProfile.firstName} ${application.playerProfile.lastName} a annulé sa candidature pour "${application.listing.title}"`,
        link: `/club/applications`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
