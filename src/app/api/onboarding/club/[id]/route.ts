// GET & PATCH /api/onboarding/club/[id] — Lire ou mettre à jour un club DRAFT
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { clubInfoSchema } from "@/lib/validators/club-onboarding-schemas"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { id } = await context.params

    const club = await prisma.clubProfile.findUnique({
      where: { id },
      include: {
        kycDocuments: true,
        onboardingSession: true,
      },
    })

    if (!club) {
      return NextResponse.json({ error: "Club introuvable" }, { status: 404 })
    }

    // Vérifier ownership
    if (club.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    return NextResponse.json({ club })
  } catch (error) {
    console.error("[API] onboarding/club/[id] GET error:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { id } = await context.params

    // Vérifier que le club existe et appartient à l'utilisateur
    const club = await prisma.clubProfile.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    })

    if (!club) {
      return NextResponse.json({ error: "Club introuvable" }, { status: 404 })
    }

    if (club.userId !== session.user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Seuls les clubs DRAFT ou REJECTED peuvent être modifiés
    if (!["DRAFT", "REJECTED"].includes(club.status)) {
      return NextResponse.json(
        { error: "Le club ne peut pas être modifié dans son état actuel" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const parsed = clubInfoSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data

    const updated = await prisma.clubProfile.update({
      where: { id },
      data: {
        clubName: data.clubName,
        country: data.country,
        city: data.city,
        foundedYear: data.yearFounded,
        clubType: data.clubType,
        legalForm: data.legalForm,
        registrationNumber: data.registrationNumber,
        federation: data.federation,
        federationNumber: data.federationNumber,
        officialEmail: data.officialEmail,
        officialPhone: data.officialPhone,
        address: data.address,
        // Si le club était REJECTED, repasser en DRAFT
        status: club.status === "REJECTED" ? "DRAFT" : club.status,
        rejectReason: club.status === "REJECTED" ? null : undefined,
      },
    })

    return NextResponse.json({
      success: true,
      club: {
        id: updated.id,
        clubName: updated.clubName,
        status: updated.status,
      },
    })
  } catch (error) {
    console.error("[API] onboarding/club/[id] PATCH error:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
