// POST /api/admin/clubs/[id]/reject — Rejeter un club
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rejectClub } from "@/lib/services/club-onboarding-service"
import { adminRejectSchema } from "@/lib/validators/club-onboarding-schemas"
import { sendTrackedEmail, emailTemplates } from "@/lib/email"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const { id: clubId } = await context.params

    const body = await request.json()
    const parsed = adminRejectSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { reason } = parsed.data

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
        { error: `Le club ne peut pas être rejeté (statut actuel: ${club.status})` },
        { status: 400 }
      )
    }

    // Rejeter
    const updatedClub = await rejectClub(clubId, reason)

    // Envoyer email de refus
    const userName = club.user.name || club.user.email?.split("@")[0] || "Utilisateur"

    if (club.user.email) {
      const emailContent = emailTemplates.clubRejectedEmail(
        club.clubName,
        userName,
        reason
      )
      await sendTrackedEmail({
        to: club.user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        userId: club.userId,
        template: "club_rejected",
      })
    }

    return NextResponse.json({
      success: true,
      club: {
        id: updatedClub.id,
        clubName: updatedClub.clubName,
        status: updatedClub.status,
        rejectReason: updatedClub.rejectReason,
      },
      message: `Le club "${club.clubName}" a été rejeté.`,
    })
  } catch (error) {
    console.error("[API] admin/clubs/[id]/reject error:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
