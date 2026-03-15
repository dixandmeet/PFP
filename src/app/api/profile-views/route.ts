// API: Consultations de profil
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"
import { ProfileViewBillingService } from "@/lib/services/credits/profile-view-billing.service"
import { sendTrackedEmail, emailTemplates } from "@/lib/email"
import { getBaseUrl } from "@/lib/url"

const ROLE_LABELS: Record<string, string> = {
  PLAYER: "Un joueur",
  AGENT: "Un agent",
  CLUB: "Un club",
  CLUB_STAFF: "Un membre de club",
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const { profileId } = await request.json()

    if (!profileId) {
      return NextResponse.json({ error: "profileId requis" }, { status: 400 })
    }

    // Ne pas tracker les auto-consultations
    if (user.id === profileId) {
      return NextResponse.json({ success: true, cost: 0, selfView: true })
    }

    // Ne pas tracker les visites ADMIN
    if (user.role === "ADMIN") {
      return NextResponse.json({ success: true, cost: 0, adminView: true })
    }

    // Vérifier que le profil existe
    const viewedUser = await prisma.user.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    if (!viewedUser) {
      return NextResponse.json({ error: "Profil non trouvé" }, { status: 404 })
    }

    // Facturation
    const result = await ProfileViewBillingService.viewProfile(
      user.id,
      profileId,
      user.role
    )

    if (!result.success) {
      if (result.insufficientBalance) {
        return NextResponse.json(
          { error: "Solde insuffisant", cost: result.cost },
          { status: 402 }
        )
      }
      return NextResponse.json({ error: "Erreur lors de la consultation" }, { status: 500 })
    }

    // Si déjà consulté dans les 24h, pas de nouvelle notification
    if (result.alreadyViewed) {
      return NextResponse.json({ success: true, cost: 0, alreadyViewed: true })
    }

    // Message semi-anonyme
    const roleLabel = ROLE_LABELS[user.role] || "Un utilisateur"

    // Lien vers l'historique selon le rôle du propriétaire du profil
    const historyLink = viewedUser.role === "AGENT"
      ? "/agent/profile-views"
      : "/player/profile-views"

    // Créer notification in-app
    await prisma.notification.create({
      data: {
        userId: profileId,
        type: "PROFILE_VIEWED",
        title: "Consultation de votre profil",
        message: `${roleLabel} a consulté votre profil`,
        link: historyLink,
      },
    })

    // Envoyer email (fire-and-forget)
    if (viewedUser.email) {
      const baseUrl = getBaseUrl()
      const userName = viewedUser.name || viewedUser.email.split("@")[0]
      const { subject, html } = emailTemplates.notificationEmail(
        userName,
        "Consultation de votre profil",
        `${roleLabel} a consulté votre profil. Consultez votre historique pour en savoir plus.`,
        `${baseUrl}${historyLink}`,
        "Voir les consultations"
      )
      sendTrackedEmail({
        to: viewedUser.email,
        subject,
        html,
        userId: profileId,
        template: "profile_viewed",
      }).catch(console.error)
    }

    return NextResponse.json({ success: true, cost: result.cost })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Vérifier si l'utilisateur peut voir l'identité des visiteurs
    const canReveal = await ProfileViewBillingService.canRevealIdentity(user.id)

    const [views, total] = await Promise.all([
      prisma.profileView.findMany({
        where: { viewedId: user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        ...(canReveal
          ? {
              include: {
                viewer: {
                  select: {
                    id: true,
                    name: true,
                    role: true,
                    image: true,
                    playerProfile: {
                      select: { firstName: true, lastName: true, profilePicture: true },
                    },
                    agentProfile: {
                      select: { firstName: true, lastName: true, profilePicture: true },
                    },
                    clubProfile: {
                      select: { clubName: true, logo: true },
                    },
                  },
                },
              },
            }
          : {}),
      }),
      prisma.profileView.count({ where: { viewedId: user.id } }),
    ])

    // Si pas de reveal, ne retourner que le rôle et la date
    const sanitizedViews = canReveal
      ? views
      : views.map((v) => ({
          id: v.id,
          viewerRole: v.viewerRole,
          createdAt: v.createdAt,
        }))

    return NextResponse.json({
      views: sanitizedViews,
      total,
      page,
      limit,
      canReveal,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
