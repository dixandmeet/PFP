// Service pour la gestion de l'onboarding Club
import { prisma } from "@/lib/prisma"
import { OnboardingStep, ClubStatus, ClubKycStatus } from "@prisma/client"
import { REQUIRED_KYC_DOCS } from "@/lib/validators/club-onboarding-schemas"

/**
 * Crée ou reprend une session d'onboarding pour un utilisateur
 */
export async function getOrCreateOnboardingSession(userId: string) {
  // Chercher une session existante non terminée
  const existing = await prisma.clubOnboardingSession.findFirst({
    where: {
      userId,
      currentStep: { not: "DONE" },
    },
    include: {
      club: {
        include: {
          kycDocuments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  if (existing) {
    return existing
  }

  // Créer une nouvelle session
  return prisma.clubOnboardingSession.create({
    data: {
      userId,
      currentStep: "CREATOR",
    },
    include: {
      club: {
        include: {
          kycDocuments: true,
        },
      },
    },
  })
}

/**
 * Met à jour l'étape courante de la session d'onboarding
 */
export async function updateOnboardingStep(
  sessionId: string,
  step: OnboardingStep
) {
  return prisma.clubOnboardingSession.update({
    where: { id: sessionId },
    data: { currentStep: step },
  })
}

/**
 * Marque la vérification OTP du créateur dans la session
 */
export async function markCreatorVerified(
  sessionId: string,
  email: string
) {
  return prisma.clubOnboardingSession.update({
    where: { id: sessionId },
    data: {
      creatorOtpVerifiedAt: new Date(),
      verifiedCreatorEmail: email.toLowerCase(),
      currentStep: "CLUB_INFO",
    },
  })
}

/**
 * Lie un club à la session d'onboarding
 */
export async function linkClubToSession(
  sessionId: string,
  clubId: string
) {
  return prisma.clubOnboardingSession.update({
    where: { id: sessionId },
    data: {
      clubId,
      currentStep: "KYC",
    },
  })
}

/**
 * Vérifie que toutes les conditions sont remplies pour soumettre le club
 */
export async function validateClubCompleteness(clubId: string): Promise<{
  valid: boolean
  errors: string[]
}> {
  const errors: string[] = []

  const club = await prisma.clubProfile.findUnique({
    where: { id: clubId },
    include: {
      kycDocuments: true,
      onboardingSession: true,
    },
  })

  if (!club) {
    return { valid: false, errors: ["Club introuvable"] }
  }

  // Vérifier que le créateur est vérifié (OTP)
  if (!club.onboardingSession?.creatorOtpVerifiedAt) {
    errors.push("Le créateur n'a pas été vérifié par OTP")
  }

  // Vérifier les infos obligatoires du club
  if (!club.clubName) errors.push("Le nom du club est requis")
  if (!club.country) errors.push("Le pays est requis")
  if (!club.city) errors.push("La ville est requise")
  if (!club.clubType) errors.push("Le type de club est requis")
  if (!club.legalForm) errors.push("La forme juridique est requise")
  if (!club.officialEmail) errors.push("L'email officiel est requis")
  if (!club.officialPhone) errors.push("Le téléphone officiel est requis")
  if (!club.address) errors.push("L'adresse est requise")

  // Vérifier registrationNumber si France
  if (
    (club.country?.toUpperCase() === "FR" ||
      club.country?.toLowerCase() === "france") &&
    !club.registrationNumber
  ) {
    errors.push("Le numéro SIRET/RNA est requis pour les clubs français")
  }

  // Vérifier les documents KYC requis
  const uploadedDocTypes = club.kycDocuments.map((d) => d.type)
  for (const requiredDoc of REQUIRED_KYC_DOCS) {
    if (!uploadedDocTypes.includes(requiredDoc)) {
      const labels: Record<string, string> = {
        PROOF_LEGAL: "Justificatif légal (KBIS/Récépissé)",
        REPRESENTATIVE_ID: "Pièce d'identité du représentant",
        POWER_PROOF: "Statuts ou Procès-verbal",
      }
      errors.push(`Document manquant : ${labels[requiredDoc] || requiredDoc}`)
    }
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Soumet le club pour validation admin
 */
export async function submitClubForReview(clubId: string, sessionId: string) {
  return prisma.$transaction(async (tx) => {
    // Mettre à jour le statut du club
    const club = await tx.clubProfile.update({
      where: { id: clubId },
      data: {
        status: ClubStatus.PENDING_REVIEW,
        kycStatus: ClubKycStatus.SUBMITTED,
      },
    })

    // Mettre à jour la session
    await tx.clubOnboardingSession.update({
      where: { id: sessionId },
      data: { currentStep: "DONE" },
    })

    return club
  })
}

/**
 * Approuve un club (admin)
 */
export async function approveClub(clubId: string) {
  return prisma.$transaction(async (tx) => {
    const club = await tx.clubProfile.update({
      where: { id: clubId },
      data: {
        status: ClubStatus.ACTIVE,
        kycStatus: ClubKycStatus.VERIFIED,
        isVerified: true,
        rejectReason: null,
      },
    })

    // Mettre à jour tous les documents KYC comme vérifiés
    await tx.clubKycDocument.updateMany({
      where: { clubId },
      data: { verifiedAt: new Date() },
    })

    return club
  })
}

/**
 * Rejette un club (admin)
 */
export async function rejectClub(clubId: string, reason: string) {
  return prisma.clubProfile.update({
    where: { id: clubId },
    data: {
      status: ClubStatus.REJECTED,
      kycStatus: ClubKycStatus.REJECTED_KYC,
      rejectReason: reason,
    },
  })
}
