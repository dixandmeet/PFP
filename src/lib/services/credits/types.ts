import { SubscriptionPlan, WalletType, PlayerProgressionLevel } from "@prisma/client"

// Configuration des plans d'abonnement
export const PLAN_CONFIG: Record<SubscriptionPlan, {
  priceEur: number
  monthlyCredits: number
  redistributionRate: number
  stripePriceId: string
  /** Quota stockage fichiers joueur (octets) */
  storageQuotaBytes: number
  /** Vidéos max pouvant être récompensées (crédits) par jour — anti-spam */
  maxRewardedUploadsPerDay: number
}> = {
  FREE: {
    priceEur: 0,
    monthlyCredits: 0,
    redistributionRate: 0,
    stripePriceId: "",
    storageQuotaBytes: 500 * 1024 * 1024,
    maxRewardedUploadsPerDay: 2,
  },
  STARTER: {
    priceEur: 10,
    monthlyCredits: 10,
    redistributionRate: 0.25,
    stripePriceId: process.env.STRIPE_PRICE_STARTER || "",
    storageQuotaBytes: 5 * 1024 * 1024 * 1024,
    maxRewardedUploadsPerDay: 5,
  },
  GROWTH: {
    priceEur: 50,
    monthlyCredits: 50,
    redistributionRate: 0.30,
    stripePriceId: process.env.STRIPE_PRICE_GROWTH || "",
    storageQuotaBytes: 15 * 1024 * 1024 * 1024,
    maxRewardedUploadsPerDay: 8,
  },
  PRO: {
    priceEur: 200,
    monthlyCredits: 200,
    redistributionRate: 0.40,
    stripePriceId: process.env.STRIPE_PRICE_PRO || "",
    storageQuotaBytes: 40 * 1024 * 1024 * 1024,
    maxRewardedUploadsPerDay: 15,
  },
  ELITE: {
    priceEur: 500,
    monthlyCredits: 500,
    redistributionRate: 0.50,
    stripePriceId: process.env.STRIPE_PRICE_ELITE || "",
    storageQuotaBytes: 100 * 1024 * 1024 * 1024,
    maxRewardedUploadsPerDay: 20,
  },
}

/** Bonus % sur les crédits gagnés par upload vidéo (après score, plafond 8 appliqué séparément) */
export const PROGRESSION_CREDIT_BONUS_PCT: Record<PlayerProgressionLevel, number> = {
  ROOKIE: 0,
  AMATEUR: 0.05,
  COMPETITOR: 0.1,
  ELITE: 0.15,
  PRO: 0.2,
}

// Coût de consultation par division
export const LISTING_COST_BY_DIVISION: Record<string, number> = {
  D1: 20,
  D2: 10,
  D3: 5,
}
export const LISTING_COST_DEFAULT = 2

// Coût consultation profil
export const PROFILE_VIEW_COST = 1

// Plans avec révélation d'identité du visiteur (GROWTH et au-dessus)
export const REVEAL_PLANS: SubscriptionPlan[] = ["GROWTH", "PRO", "ELITE"]

// Taux de redistribution consultation annonce
export const LISTING_CONSULT_REDISTRIBUTION_RATE = 0.25
export const LISTING_SIGNATURE_MAX_REDISTRIBUTION_RATE = 0.50

// Ordre de priorité de débit
export const DEBIT_PRIORITY: WalletType[] = [
  "BONUS",
  "SUBSCRIPTION",
  "PURCHASED",
  "EARNED",
]

// Configuration retraits
export const WITHDRAWAL_MIN_CREDITS = 100
export const WITHDRAWAL_COMMISSION_RATE = 0.20
export const WITHDRAWAL_SECURITY_DELAY_DAYS = 7
export const WITHDRAWAL_MIN_APPLICATIONS_FOR_COMPLEMENT = 20

// Configuration anti-fraude
export const MAX_FOLLOWS_PER_HOUR = 50
export const MAX_CREDIT_OPS_PER_MINUTE = 10
export const SUSPICIOUS_IP_THRESHOLD = 3 // Max d'utilisateurs par IP
export const MAX_FOLLOW_LOOP_DEPTH = 5

// Erreurs crédit
export class InsufficientBalanceError extends Error {
  constructor(required: number, available: number) {
    super(`Solde insuffisant : ${available} crédits disponibles, ${required} requis`)
    this.name = "InsufficientBalanceError"
  }
}

export class ConcurrentModificationError extends Error {
  constructor() {
    super("Modification concurrente détectée. Veuillez réessayer.")
    this.name = "ConcurrentModificationError"
  }
}

export class FraudBlockedError extends Error {
  constructor() {
    super("Opération bloquée pour raison de sécurité")
    this.name = "FraudBlockedError"
  }
}

export class IdempotencyError extends Error {
  constructor(key: string) {
    super(`Transaction déjà traitée : ${key}`)
    this.name = "IdempotencyError"
  }
}
