// GET /api/admin/clubs/[id] — Détail d'un club (admin)
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const { id } = await context.params

    const club = await prisma.clubProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            createdAt: true,
          },
        },
        kycDocuments: true,
        onboardingSession: {
          select: {
            id: true,
            currentStep: true,
            creatorOtpVerifiedAt: true,
            verifiedCreatorEmail: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    })

    if (!club) {
      return NextResponse.json({ error: "Club introuvable" }, { status: 404 })
    }

    return NextResponse.json({ club })
  } catch (error) {
    console.error("[API] admin/clubs/[id] GET error:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
