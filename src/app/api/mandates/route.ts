// API: Mandates (mandats agent-joueur)
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseBody } from "@/lib/utils/api-helpers"
import { createMandateSchema } from "@/lib/validators/schemas"
import { sendEmail, emailTemplates } from "@/lib/email"
import { getBaseUrl } from "@/lib/url"

export async function GET(request: Request) {
  try {
    const user = await requireAuth()

    let where: any = {}

    if (user.role === "AGENT") {
      where.agentProfile = { userId: user.id }
    } else if (user.role === "PLAYER") {
      where.playerProfile = { userId: user.id }
    } else {
      return NextResponse.json(
        { error: "Rôle non autorisé" },
        { status: 403 }
      )
    }

    const mandates = await prisma.mandate.findMany({
      where,
      include: {
        agentProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            agencyName: true,
          }
        },
        playerProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            primaryPosition: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ mandates })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()

    if (user.role !== "AGENT") {
      return NextResponse.json(
        { error: "Seuls les agents peuvent créer des mandats" },
        { status: 403 }
      )
    }

    const agentProfile = await prisma.agentProfile.findUnique({
      where: { userId: user.id }
    })

    if (!agentProfile) {
      return NextResponse.json(
        { error: "Profil agent requis" },
        { status: 400 }
      )
    }

    const body = await parseBody(request)
    const validatedData = createMandateSchema.parse(body)

    // Vérifier que le joueur existe
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { id: validatedData.playerProfileId },
      include: { user: true }
    })

    if (!playerProfile) {
      return NextResponse.json(
        { error: "Joueur non trouvé" },
        { status: 404 }
      )
    }

    // Convertir dates
    const startDate = typeof validatedData.startDate === "string" 
      ? new Date(validatedData.startDate) 
      : validatedData.startDate
    const endDate = typeof validatedData.endDate === "string" 
      ? new Date(validatedData.endDate) 
      : validatedData.endDate

    // Vérifier qu'il n'existe pas déjà un mandat actif
    const existingMandate = await prisma.mandate.findFirst({
      where: {
        agentProfileId: agentProfile.id,
        playerProfileId: validatedData.playerProfileId,
        status: { in: ["PENDING", "ACTIVE"] },
      }
    })

    if (existingMandate) {
      return NextResponse.json(
        { error: "Un mandat existe déjà pour ce joueur" },
        { status: 400 }
      )
    }

    const mandate = await prisma.mandate.create({
      data: {
        agentProfileId: agentProfile.id,
        playerProfileId: validatedData.playerProfileId,
        startDate,
        endDate,
        terms: validatedData.terms,
        status: "PENDING",
      },
      include: {
        playerProfile: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    })

    // Créer notification pour le joueur
    await prisma.notification.create({
      data: {
        userId: playerProfile.userId,
        type: "MANDATE_REQUEST",
        title: "Nouvelle demande de mandat",
        message: `${agentProfile.firstName} ${agentProfile.lastName} vous propose un mandat`,
        link: `/player/agents`,
      }
    })

    // Envoyer email au joueur
    if (playerProfile.user?.email) {
      const baseUrl = getBaseUrl()
      const { subject, html } = emailTemplates.notificationEmail(
        playerProfile.firstName,
        "Nouvelle demande de mandat",
        `L'agent ${agentProfile.firstName} ${agentProfile.lastName} souhaite vous représenter. Consultez les détails et répondez à cette proposition.`,
        `${baseUrl}/player/agents`,
        "Voir la demande"
      )
      sendEmail({ to: playerProfile.user.email, subject, html }).catch(console.error)
    }

    return NextResponse.json(mandate, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
