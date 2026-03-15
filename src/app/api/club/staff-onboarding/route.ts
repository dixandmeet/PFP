// GET /api/club/staff-onboarding — État actuel de l'onboarding staff
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    if (session.user.role !== "CLUB_STAFF") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Trouver le membership actif
    const member = await prisma.clubMember.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
      select: {
        id: true,
        staffOnboardingStep: true,
        role: true,
        clubProfile: {
          select: { id: true, clubName: true },
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Aucun membership actif" }, { status: 404 })
    }

    // Charger le profil staff
    const staffProfile = await prisma.clubStaffProfile.findUnique({
      where: { userId: session.user.id },
    })

    // Charger les documents KYC
    const kycDocuments = await prisma.kycDocument.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      step: member.staffOnboardingStep,
      clubName: member.clubProfile.clubName,
      clubRole: member.role,
      staffProfile: staffProfile || null,
      kycDocuments,
    })
  } catch (error) {
    console.error("[API] staff-onboarding GET error:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
