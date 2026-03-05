// POST /api/onboarding/club — Créer un club en DRAFT
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { clubInfoSchema } from "@/lib/validators/club-onboarding-schemas"
import { linkClubToSession } from "@/lib/services/club-onboarding-service"
import { createOwnerMembership } from "@/lib/services/club-members"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    if (session.user.role !== "CLUB") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Vérifier que l'utilisateur a une session d'onboarding avec OTP vérifié
    const onboardingSession = await prisma.clubOnboardingSession.findFirst({
      where: {
        userId: session.user.id,
        creatorOtpVerifiedAt: { not: null },
        currentStep: "CLUB_INFO",
      },
      orderBy: { createdAt: "desc" },
    })

    if (!onboardingSession) {
      return NextResponse.json(
        { error: "Vous devez d'abord vérifier votre identité (étape 1)" },
        { status: 403 }
      )
    }

    // Vérifier qu'il n'y a pas déjà un club lié
    if (onboardingSession.clubId) {
      return NextResponse.json(
        { error: "Un club est déjà associé à cette session. Utilisez PATCH pour le modifier." },
        { status: 409 }
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

    // Créer le club en DRAFT dans une transaction
    const club = await prisma.$transaction(async (tx) => {
      // Vérifier si l'utilisateur a déjà un ClubProfile
      const existingProfile = await tx.clubProfile.findUnique({
        where: { userId: session.user.id },
      })

      if (existingProfile) {
        // Mettre à jour le profil existant
        const updated = await tx.clubProfile.update({
          where: { id: existingProfile.id },
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
            createdByUserId: session.user.id,
            status: "DRAFT",
          },
        })
        return updated
      }

      // Créer un nouveau ClubProfile
      return tx.clubProfile.create({
        data: {
          userId: session.user.id,
          createdByUserId: session.user.id,
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
          status: "DRAFT",
        },
      })
    })

    // Auto-create OWNER membership
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    })
    if (user?.email) {
      await createOwnerMembership(club.id, session.user.id, user.email)
    }

    // Lier le club à la session d'onboarding
    await linkClubToSession(onboardingSession.id, club.id)

    return NextResponse.json({
      success: true,
      club: {
        id: club.id,
        clubName: club.clubName,
        status: club.status,
      },
      nextStep: "KYC",
    })
  } catch (error) {
    console.error("[API] onboarding/club POST error:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
