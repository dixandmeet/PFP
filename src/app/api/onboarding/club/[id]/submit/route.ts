// POST /api/onboarding/club/[id]/submit — Soumettre le club pour validation admin
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validateClubCompleteness, submitClubForReview } from "@/lib/services/club-onboarding-service"
import { sendTrackedEmail, emailTemplates } from "@/lib/email"
import { notifyAdmins } from "@/lib/notifications/notify-admins"

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
      include: {
        user: { select: { name: true, email: true } },
        onboardingSession: true,
      },
    })

    if (!club) {
      return NextResponse.json({ error: "Club introuvable" }, { status: 404 })
    }

    if (club.userId !== session.user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Seuls les clubs DRAFT ou REJECTED peuvent être soumis
    if (!["DRAFT", "REJECTED"].includes(club.status)) {
      return NextResponse.json(
        { error: "Le club ne peut pas être soumis dans son état actuel" },
        { status: 400 }
      )
    }

    if (!club.onboardingSession) {
      return NextResponse.json(
        { error: "Session d'onboarding introuvable" },
        { status: 400 }
      )
    }

    // Valider la complétude
    const validation = await validateClubCompleteness(clubId)
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Le dossier est incomplet",
          missingItems: validation.errors,
        },
        { status: 400 }
      )
    }

    // Soumettre
    const updatedClub = await submitClubForReview(clubId, club.onboardingSession.id)

    // Envoyer email de confirmation
    const userName = club.user.name || club.user.email?.split("@")[0] || "Utilisateur"
    const emailContent = emailTemplates.clubSubmittedEmail(club.clubName, userName)
    if (club.user.email) {
      await sendTrackedEmail({
        to: club.user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        userId: club.userId,
        template: "club_submitted",
      })
    }

    // Notifier les admins
    notifyAdmins({
      type: "ADMIN_CLUB_SUBMITTED",
      title: "Club à valider",
      message: `Le club "${club.clubName}" a été soumis pour vérification`,
      link: `/admin/clubs/${clubId}`,
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      club: {
        id: updatedClub.id,
        clubName: updatedClub.clubName,
        status: updatedClub.status,
        kycStatus: updatedClub.kycStatus,
      },
      message: "Votre club a été soumis pour vérification. Vous recevrez un email dès que la vérification sera terminée.",
    })
  } catch (error) {
    console.error("[API] onboarding/club/[id]/submit error:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
