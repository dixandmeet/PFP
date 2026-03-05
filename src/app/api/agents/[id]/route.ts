// GET /api/agents/[id] - Détails agent
// PATCH /api/agents/[id] - Mise à jour profil agent
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/lib/utils/api-helpers"
import { updateAgentProfileSchema } from "@/lib/validators/schemas"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const agentProfile = await prisma.agentProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        mandates: {
          where: { status: "ACTIVE" },
          include: {
            playerProfile: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                primaryPosition: true,
                profilePicture: true,
              },
            },
          },
        },
        submissions: {
          select: { id: true },
        },
      },
    })

    if (!agentProfile) {
      return NextResponse.json(
        { error: "Agent non trouvé" },
        { status: 404 }
      )
    }

    // Formater la réponse
    const response = {
      ...agentProfile,
      activeMandatesCount: agentProfile.mandates.length,
      submissionsCount: agentProfile.submissions.length,
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
    const agentProfile = await prisma.agentProfile.findUnique({
      where: { id },
    })

    if (!agentProfile) {
      return NextResponse.json(
        { error: "Agent non trouvé" },
        { status: 404 }
      )
    }

    if (agentProfile.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      )
    }

    // Valider et mettre à jour
    const body = await request.json()
    const validatedData = updateAgentProfileSchema.parse(body)

    const updatedProfile = await prisma.agentProfile.update({
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
