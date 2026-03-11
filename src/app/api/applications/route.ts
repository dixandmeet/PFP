// API: Applications (candidatures joueurs)
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseBody } from "@/lib/utils/api-helpers"
import { createApplicationSchema } from "@/lib/validators/schemas"
import { sendEmail, emailTemplates } from "@/lib/email"
import { getBaseUrl } from "@/lib/url"

export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let where: any = {}

    if (user.role === "PLAYER") {
      // Joueur voit ses propres candidatures
      const playerProfile = await prisma.playerProfile.findUnique({
        where: { userId: user.id }
      })
      if (!playerProfile) {
        return NextResponse.json({ applications: [] })
      }
      where.playerProfileId = playerProfile.id
    } else if (user.role === "CLUB") {
      // Club voit les candidatures reçues
      const clubProfile = await prisma.clubProfile.findUnique({
        where: { userId: user.id }
      })
      if (!clubProfile) {
        return NextResponse.json({ applications: [] })
      }
      where.clubProfileId = clubProfile.id
    } else {
      return NextResponse.json(
        { error: "Rôle non autorisé" },
        { status: 403 }
      )
    }

    if (status) {
      where.status = status
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            description: true,
            position: true,
            publishedAt: true,
            clubProfile: {
              select: {
                clubName: true,
                country: true,
                city: true,
                logo: true,
              }
            }
          }
        },
        playerProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            profilePicture: true,
            primaryPosition: true,
            nationality: true,
            dateOfBirth: true,
            currentClub: true,
          }
        },
        clubProfile: {
          select: {
            id: true,
            clubName: true,
            logo: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ applications })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()

    if (user.role !== "PLAYER") {
      return NextResponse.json(
        { error: "Seuls les joueurs peuvent postuler" },
        { status: 403 }
      )
    }

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: user.id }
    })

    if (!playerProfile) {
      return NextResponse.json(
        { error: "Profil joueur requis" },
        { status: 400 }
      )
    }

    const body = await parseBody(request)
    const validatedData = createApplicationSchema.parse(body)

    // Vérifier que l'annonce existe et est publiée
    const listing = await prisma.listing.findUnique({
      where: { id: validatedData.listingId },
      include: { clubProfile: { select: { userId: true, clubName: true, user: { select: { email: true } } } } }
    })

    if (!listing) {
      return NextResponse.json(
        { error: "Annonce non trouvée" },
        { status: 404 }
      )
    }

    if (listing.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Cette annonce n'est plus disponible" },
        { status: 400 }
      )
    }

    // Vérifier si déjà postulé
    const existingApplication = await prisma.application.findUnique({
      where: {
        playerProfileId_listingId: {
          playerProfileId: playerProfile.id,
          listingId: validatedData.listingId,
        }
      }
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: "Vous avez déjà postulé à cette annonce" },
        { status: 400 }
      )
    }

    const application = await prisma.application.create({
      data: {
        playerProfileId: playerProfile.id,
        listingId: validatedData.listingId,
        clubProfileId: listing.clubProfileId,
        coverLetter: validatedData.coverLetter,
        attachments: validatedData.attachments,
      },
      include: {
        listing: true,
        clubProfile: {
          select: {
            clubName: true,
          }
        }
      }
    })

    // Créer notification pour le club
    await prisma.notification.create({
      data: {
        userId: listing.clubProfile.userId,
        type: "APPLICATION_RECEIVED",
        title: "Nouvelle candidature",
        message: `${playerProfile.firstName} ${playerProfile.lastName} a postulé à "${listing.title}"`,
        link: `/club/applications/${application.id}`,
      }
    })

    // Envoyer email au club
    if (listing.clubProfile.user?.email) {
      const baseUrl = getBaseUrl()
      const { subject, html } = emailTemplates.notificationEmail(
        listing.clubProfile.clubName,
        "Nouvelle candidature reçue",
        `${playerProfile.firstName} ${playerProfile.lastName} a postulé à votre annonce "${listing.title}". Consultez sa candidature pour en savoir plus.`,
        `${baseUrl}/club/applications`,
        "Voir la candidature"
      )
      sendEmail({ to: listing.clubProfile.user.email, subject, html }).catch(console.error)
    }

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
