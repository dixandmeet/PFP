// POST /api/admin/clubs/[id]/approve — Approuver un club
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { approveClub } from "@/lib/services/club-onboarding-service"
import { sendTrackedEmail, emailTemplates } from "@/lib/email"
import { getBaseUrl } from "@/lib/url"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const { id: clubId } = await context.params

    // Vérifier que le club existe et est en PENDING_REVIEW
    const club = await prisma.clubProfile.findUnique({
      where: { id: clubId },
      include: {
        user: { select: { name: true, email: true } },
      },
    })

    if (!club) {
      return NextResponse.json({ error: "Club introuvable" }, { status: 404 })
    }

    if (club.status !== "PENDING_REVIEW") {
      return NextResponse.json(
        { error: `Le club ne peut pas être approuvé (statut actuel: ${club.status})` },
        { status: 400 }
      )
    }

    // Approuver
    const updatedClub = await approveClub(clubId)

    // Envoyer email de confirmation
    const userName = club.user.name || club.user.email?.split("@")[0] || "Utilisateur"
    const baseUrl = getBaseUrl()
    const dashboardUrl = `${baseUrl}/club/dashboard`

    if (club.user.email) {
      const emailContent = emailTemplates.clubApprovedEmail(
        club.clubName,
        userName,
        dashboardUrl
      )
      await sendTrackedEmail({
        to: club.user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        userId: club.userId,
        template: "club_approved",
      })
    }

    return NextResponse.json({
      success: true,
      club: {
        id: updatedClub.id,
        clubName: updatedClub.clubName,
        status: updatedClub.status,
        kycStatus: updatedClub.kycStatus,
      },
      message: `Le club "${club.clubName}" a été approuvé et activé.`,
    })
  } catch (error) {
    console.error("[API] admin/clubs/[id]/approve error:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
