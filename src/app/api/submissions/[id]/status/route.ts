// PATCH /api/submissions/[id]/status - Changer le statut d'une soumission
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

    // Récupérer la soumission
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        agentProfile: {
          include: {
            user: true,
          },
        },
        clubProfile: true,
      },
    })

    if (!submission) {
      return NextResponse.json(
        { error: "Soumission non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier les permissions (seul le club peut modifier le statut)
    const isClub = submission.clubProfile.userId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isClub && !isAdmin) {
      return NextResponse.json(
        { error: "Seul le club peut modifier le statut" },
        { status: 403 }
      )
    }

    // Mettre à jour le statut
    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: { status },
      include: {
        agentProfile: {
          include: {
            user: true,
          },
        },
        clubProfile: {
          include: {
            user: true,
          },
        },
      },
    })

    // Créer une notification pour l'agent
    const notificationMessages: Record<string, string> = {
      UNDER_REVIEW: "Votre soumission est en cours d'examen",
      SHORTLISTED: "Le joueur a été shortlisté !",
      TRIAL: "Le joueur est convoqué pour un essai",
      REJECTED: "La soumission a été refusée",
      ACCEPTED: "La soumission a été acceptée",
      SIGNED: "Le joueur a signé !",
    }

    if (notificationMessages[status]) {
      await prisma.notification.create({
        data: {
          userId: submission.agentProfile.userId,
          type: "SUBMISSION_RECEIVED",
          title: `Soumission : ${submission.clubProfile.clubName}`,
          message: notificationMessages[status],
          link: `/agent/submissions`,
        },
      })
    }

    return NextResponse.json(updatedSubmission)
  } catch (error) {
    return handleApiError(error)
  }
}
