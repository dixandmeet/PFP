import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    const body = await request.json()
    const { entityType, entityName, entityId, message, requesterName, requesterEmail } = body

    if (!entityType || !entityName || !message) {
      return NextResponse.json(
        { error: "Type d'entité, nom et message requis" },
        { status: 400 }
      )
    }

    if (!["PLAYER", "AGENT", "CLUB"].includes(entityType)) {
      return NextResponse.json(
        { error: "Type d'entité invalide" },
        { status: 400 }
      )
    }

    const finalName = requesterName || session?.user?.name || "Anonyme"
    const finalEmail = requesterEmail || session?.user?.email
    if (!finalEmail) {
      return NextResponse.json(
        { error: "Email requis" },
        { status: 400 }
      )
    }

    const recoveryRequest = await prisma.profileRecoveryRequest.create({
      data: {
        requesterEmail: finalEmail,
        requesterName: finalName,
        requesterUserId: session?.user?.id || null,
        entityType,
        entityName,
        entityId: entityId || null,
        message,
        proofDocuments: [],
      },
    })

    return NextResponse.json(
      { request: recoveryRequest, message: "Demande envoyée avec succès" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating recovery request:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de la demande" },
      { status: 500 }
    )
  }
}
