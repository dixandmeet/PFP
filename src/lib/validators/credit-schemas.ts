import { z } from "zod"

export const createSubscriptionSchema = z.object({
  plan: z.enum(["STARTER", "GROWTH", "PRO", "ELITE"]),
  returnUrl: z.string().url().optional(),
})

export const topUpSchema = z.object({
  credits: z.number().int().min(1, "Minimum 1 crédit").max(10000, "Maximum 10 000 crédits"),
  returnUrl: z.string().url().optional(),
})

export const changeSubscriptionSchema = z.object({
  plan: z.enum(["STARTER", "GROWTH", "PRO", "ELITE"]),
})

export const requestWithdrawalSchema = z.object({
  amount: z.number().int().min(100, "Minimum 100 crédits"),
})

export const reviewWithdrawalSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  note: z.string().optional(),
})

export const validateSignatureSchema = z.object({
  listingId: z.string().min(1, "ID d'annonce requis"),
  clubProfileId: z.string().min(1, "ID du profil club requis"),
  playerUserId: z.string().min(1, "ID du joueur requis"),
  proofDocument: z.string().optional(),
})

export const reviewSignatureSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
})

export const deviceFingerprintSchema = z.object({
  fingerprint: z.string().min(1, "Empreinte requise"),
  metadata: z.record(z.unknown()).optional(),
})

export const transactionHistorySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  walletType: z.enum(["SUBSCRIPTION", "PURCHASED", "EARNED", "BONUS"]).optional(),
  type: z.enum([
    "CREDIT_SUBSCRIPTION", "CREDIT_PURCHASE", "CREDIT_BONUS",
    "CREDIT_EARNED_FOLLOW", "CREDIT_EARNED_LISTING", "CREDIT_EARNED_SIGNATURE",
    "DEBIT_FOLLOW", "DEBIT_LISTING_CONSULT", "DEBIT_PROFILE_VIEW",
    "CREDIT_EARNED_PROFILE_VIEW", "DEBIT_WITHDRAWAL",
    "EXPIRATION", "REFUND",
    "CREDIT_VIDEO_UPLOAD_REWARD",
    "DEBIT_VIDEO_BOOST", "DEBIT_PROFILE_HIGHLIGHT", "DEBIT_RECRUITER_VIDEO_SEND",
    "DEBIT_ADVANCED_ANALYSIS", "DEBIT_FULL_PLAYER_REPORT", "DEBIT_CLUB_APPLICATION",
    "DEBIT_PLAYER_RECOMMENDATION", "DEBIT_DIRECT_RECRUITER_ACCESS", "DEBIT_STORAGE_GB_PURCHASE",
  ]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
})
