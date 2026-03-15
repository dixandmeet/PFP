// PATCH /api/mandates/[id]/status - Changer le statut d'un mandat
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/lib/utils/api-helpers"
import { z } from "zod"

const updateStatusSchema = z.object({
  status: z.enum(["PENDING", "ACTIVE", "EXPIRED", "TERMINATED", "REJECTED"]),
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

    // Récupérer le mandat
    const mandate = await prisma.mandate.findUnique({
      where: { id },
      include: {
        agentProfile: {
          include: { user: { select: { id: true, email: true, name: true, role: true, image: true } } },
        },
        playerProfile: {
          include: { user: { select: { id: true, email: true, name: true, role: true, image: true } } },
        },
      },
    })

    if (!mandate) {
      return NextResponse.json(
        { error: "Mandat non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier les permissions
    const isAgent = mandate.agentProfile.userId === session.user.id
    const isPlayer = mandate.playerProfile.userId === session.user.id
    const isAdmin = session.user.role === "ADMIN"

    if (!isAgent && !isPlayer && !isAdmin) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      )
    }

    // Vérifier les transitions de statut autorisées
    if (isPlayer) {
      // Le joueur peut seulement accepter (PENDING → ACTIVE) ou refuser (PENDING → REJECTED)
      // ou résilier (ACTIVE → TERMINATED)
      if (mandate.status === "PENDING" && (status === "ACTIVE" || status === "REJECTED")) {
        // OK
      } else if (mandate.status === "ACTIVE" && status === "TERMINATED") {
        // OK
      } else {
        return NextResponse.json(
          { error: "Transition de statut non autorisée" },
          { status: 400 }
        )
      }
    }

    if (isAgent) {
      // L'agent peut résilier un mandat actif ou annuler un mandat en attente
      if (mandate.status === "ACTIVE" && status === "TERMINATED") {
        // OK
      } else if (mandate.status === "PENDING" && status === "REJECTED") {
        // OK
      } else {
        return NextResponse.json(
          { error: "Transition de statut non autorisée" },
          { status: 400 }
        )
      }
    }

    // Mettre à jour le mandat
    const updatedMandate = await prisma.mandate.update({
      where: { id },
      data: {
        status,
        acceptedAt: status === "ACTIVE" ? new Date() : undefined,
        terminatedAt: status === "TERMINATED" ? new Date() : undefined,
      },
      include: {
        agentProfile: {
          include: { user: { select: { id: true, email: true, name: true, role: true, image: true } } },
        },
        playerProfile: {
          include: { user: { select: { id: true, email: true, name: true, role: true, image: true } } },
        },
      },
    })

    // Créer une notification
    const notificationTitle =
      status === "ACTIVE" ? "Mandat accepté" :
      status === "REJECTED" ? "Mandat refusé" :
      status === "TERMINATED" ? "Mandat résilié" :
      "Mandat mis à jour"

    const notificationMessage =
      isPlayer
        ? `Le mandat avec ${mandate.agentProfile.firstName} ${mandate.agentProfile.lastName} a été ${status === "ACTIVE" ? "accepté" : status === "REJECTED" ? "refusé" : "résilié"}`
        : `Le mandat avec ${mandate.playerProfile.firstName} ${mandate.playerProfile.lastName} a été ${status === "ACTIVE" ? "accepté" : status === "REJECTED" ? "refusé" : "résilié"}`

    const recipientUserId = isPlayer
      ? mandate.agentProfile.userId
      : mandate.playerProfile.userId

    await prisma.notification.create({
      data: {
        userId: recipientUserId,
        type: "MANDATE_ACCEPTED",
        title: notificationTitle,
        message: notificationMessage,
        link: isPlayer ? `/agent/players` : `/player/agents`,
      },
    })

    return NextResponse.json(updatedMandate)
  } catch (error) {
    return handleApiError(error)
  }
}
