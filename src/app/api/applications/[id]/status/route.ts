// PATCH /api/applications/[id]/status - Changer le statut d'une candidature
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/lib/utils/api-helpers"
import { z } from "zod"

const updateStatusSchema = z.object({
  status: z.enum([
    "DRAFT",
    "SUBMITTED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "TRIAL",
    "REJECTED",
    "ACCEPTED",
    "SIGNED",
  ]),
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

    // Récupérer la candidature
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        clubProfile: true,
        playerProfile: {
          include: {
            user: true,
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

    // Vérifier les permissions
    const isClub = application.clubProfile.userId === session.user.id
    const isPlayer = application.playerProfile.userId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isClub && !isPlayer && !isAdmin) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      )
    }

    // Le joueur peut seulement retirer sa candidature (SUBMITTED → DRAFT ou supprimer)
    // Le club peut changer le statut pour gérer le pipeline
    if (isPlayer && !isAdmin) {
      return NextResponse.json(
        { error: "Seul le club peut modifier le statut" },
        { status: 403 }
      )
    }

    // Mettre à jour le statut
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        clubProfile: {
          include: {
            user: true,
          },
        },
        playerProfile: {
          include: {
            user: true,
          },
        },
        listing: true,
      },
    })

    // Créer une notification pour le joueur
    const notificationMessages: Record<string, string> = {
      UNDER_REVIEW: "Votre candidature est en cours d'examen",
      SHORTLISTED: "Vous avez été shortlisté !",
      TRIAL: "Vous êtes convoqué pour un essai",
      REJECTED: "Votre candidature a été refusée",
      ACCEPTED: "Votre candidature a été acceptée",
      SIGNED: "Félicitations, vous avez signé !",
    }

    if (notificationMessages[status]) {
      await prisma.notification.create({
        data: {
          userId: application.playerProfile.userId,
          type: "APPLICATION_RECEIVED",
          title: `Candidature : ${application.clubProfile.clubName}`,
          message: notificationMessages[status],
          link: `/player/applications`,
        },
      })
    }

    return NextResponse.json(updatedApplication)
  } catch (error) {
    return handleApiError(error)
  }
}
