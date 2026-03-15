// POST /api/onboarding/club/[id]/kyc/confirm — Confirmer un upload KYC et enregistrer en DB
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { kycConfirmSchema } from "@/lib/validators/club-onboarding-schemas"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { id: clubId } = await context.params

    // Vérifier ownership
    const club = await prisma.clubProfile.findUnique({
      where: { id: clubId },
      select: { id: true, userId: true, status: true },
    })

    if (!club) {
      return NextResponse.json({ error: "Club introuvable" }, { status: 404 })
    }

    if (club.userId !== session.user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    if (!["DRAFT", "REJECTED"].includes(club.status)) {
      return NextResponse.json(
        { error: "Les documents ne peuvent pas être modifiés dans l'état actuel du club" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const parsed = kycConfirmSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { docType, url, filename, mime, size } = parsed.data

    // Upsert : remplacer le document existant du même type ou en créer un nouveau
    const doc = await prisma.clubKycDocument.upsert({
      where: {
        clubId_type: {
          clubId,
          type: docType,
        },
      },
      update: {
        url,
        filename,
        mime,
        size,
        uploadedAt: new Date(),
        verifiedAt: null,
        verifiedByUserId: null,
      },
      create: {
        clubId,
        type: docType,
        url,
        filename,
        mime,
        size,
      },
    })

    return NextResponse.json({
      success: true,
      document: {
        id: doc.id,
        type: doc.type,
        filename: doc.filename,
        size: doc.size,
        uploadedAt: doc.uploadedAt,
      },
    })
  } catch (error) {
    console.error("[API] onboarding/club/[id]/kyc/confirm error:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
