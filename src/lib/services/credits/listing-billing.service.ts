import { prisma } from "@/lib/prisma"
import { WalletService } from "./wallet.service"
import {
  LISTING_COST_BY_DIVISION,
  LISTING_COST_DEFAULT,
  LISTING_CONSULT_REDISTRIBUTION_RATE,
  LISTING_SIGNATURE_MAX_REDISTRIBUTION_RATE,
  WITHDRAWAL_MIN_APPLICATIONS_FOR_COMPLEMENT,
} from "./types"

export class ListingBillingService {
  /**
   * Obtenir le coût de consultation selon la division du club
   */
  static getCostByDivision(division: string | null): number {
    if (!division) return LISTING_COST_DEFAULT
    return LISTING_COST_BY_DIVISION[division.toUpperCase()] || LISTING_COST_DEFAULT
  }

  /**
   * Vérifier si l'utilisateur a déjà consulté une annonce
   */
  static async hasConsulted(userId: string, listingId: string): Promise<boolean> {
    const existing = await prisma.listingConsultation.findUnique({
      where: { userId_listingId: { userId, listingId } },
    })
    return !!existing
  }

  /**
   * Traiter la consultation payante d'une annonce
   */
  static async consultListing(
    userId: string,
    listingId: string
  ): Promise<{
    success: boolean
    cost: number
    alreadyConsulted?: boolean
    insufficientBalance?: boolean
  }> {
    // Vérifier si déjà consulté
    const already = await this.hasConsulted(userId, listingId)
    if (already) {
      return { success: true, cost: 0, alreadyConsulted: true }
    }

    // Récupérer le listing avec le profil club
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        clubProfile: {
          select: { id: true, userId: true, division: true },
        },
      },
    })

    if (!listing) {
      throw new Error("Annonce non trouvée")
    }

    // Empêcher le club de payer pour voir sa propre annonce
    if (listing.clubProfile.userId === userId) {
      return { success: true, cost: 0, alreadyConsulted: true }
    }

    const cost = this.getCostByDivision(listing.clubProfile.division)

    // Vérifier le solde
    const canPay = await WalletService.canAfford(userId, cost)
    if (!canPay) {
      return { success: false, cost, insufficientBalance: true }
    }

    // Transaction atomique : débit user + crédit club + log
    await prisma.$transaction(async (tx) => {
      // Débiter l'utilisateur
      await WalletService.debitWithPriority(
        tx,
        userId,
        cost,
        "DEBIT_LISTING_CONSULT",
        {
          referenceId: listingId,
          referenceType: "LISTING",
          counterpartyId: listing.clubProfile.userId,
          description: `Consultation annonce ${listing.title}`,
          idempotencyKey: `listing_consult_${userId}_${listingId}`,
        }
      )

      // Créditer 25% au club
      const clubShare = Math.max(1, Math.round(cost * LISTING_CONSULT_REDISTRIBUTION_RATE))
      await WalletService.credit(
        tx,
        listing.clubProfile.userId,
        "EARNED",
        clubShare,
        "CREDIT_EARNED_LISTING",
        {
          referenceId: listingId,
          referenceType: "LISTING",
          counterpartyId: userId,
          description: `Revenu consultation annonce (25%)`,
        }
      )

      // Créer l'enregistrement de consultation
      await tx.listingConsultation.create({
        data: {
          userId,
          listingId,
          clubProfileId: listing.clubProfile.id,
          creditsCost: cost,
          creditsToClub: clubShare,
          divisionRate: listing.clubProfile.division || "OTHER",
        },
      })
    })

    return { success: true, cost }
  }

  /**
   * Traiter le complément de signature validée
   * Si signature approuvée + ≥20 candidatures → créditer complément pour atteindre 50%
   */
  static async processSignatureComplement(signatureValidationId: string) {
    const signature = await prisma.signatureValidation.findUnique({
      where: { id: signatureValidationId },
    })

    if (!signature || signature.proofStatus !== "APPROVED" || signature.complementPaid) {
      return
    }

    // Vérifier le nombre de candidatures
    const applicationCount = await prisma.application.count({
      where: { listingId: signature.listingId },
    })

    if (applicationCount < WITHDRAWAL_MIN_APPLICATIONS_FOR_COMPLEMENT) {
      return
    }

    // Calculer le total des consultations pour cette annonce
    const consultations = await prisma.listingConsultation.aggregate({
      where: { listingId: signature.listingId },
      _sum: { creditsCost: true },
    })

    const totalConsultCredits = consultations._sum.creditsCost || 0
    const alreadyPaid = Math.round(totalConsultCredits * LISTING_CONSULT_REDISTRIBUTION_RATE)
    const targetAmount = Math.round(totalConsultCredits * LISTING_SIGNATURE_MAX_REDISTRIBUTION_RATE)
    const complement = Math.max(0, targetAmount - alreadyPaid)

    if (complement <= 0) return

    // Récupérer le userId du club
    const clubProfile = await prisma.clubProfile.findUnique({
      where: { id: signature.clubProfileId },
      select: { userId: true },
    })

    if (!clubProfile) return

    await prisma.$transaction(async (tx) => {
      // Créditer le complément au club
      await WalletService.credit(
        tx,
        clubProfile.userId,
        "EARNED",
        complement,
        "CREDIT_EARNED_SIGNATURE",
        {
          referenceId: signatureValidationId,
          referenceType: "SIGNATURE_VALIDATION",
          description: `Complément signature validée (${LISTING_SIGNATURE_MAX_REDISTRIBUTION_RATE * 100}% total)`,
        }
      )

      // Marquer le complément comme payé
      await tx.signatureValidation.update({
        where: { id: signatureValidationId },
        data: {
          complementPaid: true,
          complementAmount: complement,
          totalApplications: applicationCount,
        },
      })
    })
  }
}
