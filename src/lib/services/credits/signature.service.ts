import { prisma } from "@/lib/prisma"
import { ListingBillingService } from "./listing-billing.service"

export class SignatureService {
  /**
   * Soumettre une preuve de signature
   */
  static async submitSignature(params: {
    listingId: string
    clubProfileId: string
    playerUserId: string
    proofDocument?: string
  }) {
    return prisma.signatureValidation.create({
      data: {
        listingId: params.listingId,
        clubProfileId: params.clubProfileId,
        playerUserId: params.playerUserId,
        proofDocument: params.proofDocument,
        proofStatus: "PENDING",
      },
    })
  }

  /**
   * Admin : vérifier une signature
   */
  static async reviewSignature(
    signatureId: string,
    adminUserId: string,
    action: "APPROVE" | "REJECT"
  ) {
    const signature = await prisma.signatureValidation.findUnique({
      where: { id: signatureId },
    })

    if (!signature || signature.proofStatus !== "PENDING") {
      throw new Error("Signature non trouvée ou déjà traitée")
    }

    await prisma.signatureValidation.update({
      where: { id: signatureId },
      data: {
        proofStatus: action === "APPROVE" ? "APPROVED" : "REJECTED",
        approvedBy: adminUserId,
        approvedAt: new Date(),
      },
    })

    // Si approuvé, déclencher le calcul du complément
    if (action === "APPROVE") {
      await ListingBillingService.processSignatureComplement(signatureId)
    }
  }

  /**
   * Lister les signatures en attente (admin)
   */
  static async getPendingSignatures() {
    return prisma.signatureValidation.findMany({
      where: { proofStatus: "PENDING" },
      orderBy: { createdAt: "desc" },
    })
  }
}
