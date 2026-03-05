// Service OTP pour la vérification du créateur de club
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { OtpPurpose } from "@prisma/client"

const OTP_LENGTH = 6
const OTP_EXPIRY_MINUTES = 10
const OTP_MAX_ATTEMPTS = 5
const OTP_RATE_LIMIT_PER_HOUR = 3
const BCRYPT_ROUNDS = 10

/**
 * Génère un code OTP aléatoire de 6 chiffres
 */
export function generateOtpCode(): string {
  // Utiliser crypto pour une meilleure entropie
  const buffer = crypto.randomBytes(4)
  const num = buffer.readUInt32BE(0) % 1000000
  return num.toString().padStart(OTP_LENGTH, "0")
}

/**
 * Hash un code OTP avec bcrypt
 */
export async function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, BCRYPT_ROUNDS)
}

/**
 * Vérifie un code OTP contre son hash
 */
export async function verifyOtpHash(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash)
}

/**
 * Vérifie le rate limit : max 3 OTP par heure par email
 */
export async function checkOtpRateLimit(
  email: string,
  purpose: OtpPurpose
): Promise<{ allowed: boolean; remainingAttempts: number }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

  const recentOtps = await prisma.otpToken.count({
    where: {
      email: email.toLowerCase(),
      purpose,
      createdAt: { gte: oneHourAgo },
    },
  })

  return {
    allowed: recentOtps < OTP_RATE_LIMIT_PER_HOUR,
    remainingAttempts: Math.max(0, OTP_RATE_LIMIT_PER_HOUR - recentOtps),
  }
}

/**
 * Crée et stocke un OTP pour un utilisateur
 * Retourne le code en clair (à envoyer par email)
 */
export async function createOtp(
  userId: string,
  email: string,
  purpose: OtpPurpose
): Promise<{ code: string; expiresAt: Date }> {
  const code = generateOtpCode()
  const otpHash = await hashOtp(code)
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

  // Invalider les OTP précédents non utilisés pour cet email/purpose
  await prisma.otpToken.updateMany({
    where: {
      email: email.toLowerCase(),
      purpose,
      used: false,
      expiresAt: { gt: new Date() },
    },
    data: { used: true },
  })

  // Créer le nouveau OTP
  await prisma.otpToken.create({
    data: {
      userId,
      email: email.toLowerCase(),
      otpHash,
      purpose,
      expiresAt,
      attempts: 0,
      maxAttempts: OTP_MAX_ATTEMPTS,
    },
  })

  return { code, expiresAt }
}

/**
 * Vérifie un code OTP soumis par l'utilisateur
 */
export async function verifyOtp(
  email: string,
  code: string,
  purpose: OtpPurpose
): Promise<{
  valid: boolean
  error?: string
  userId?: string
}> {
  // Trouver le dernier OTP valide pour cet email/purpose
  const otpToken = await prisma.otpToken.findFirst({
    where: {
      email: email.toLowerCase(),
      purpose,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  })

  if (!otpToken) {
    return { valid: false, error: "Code expiré ou invalide. Veuillez en demander un nouveau." }
  }

  // Vérifier le nombre de tentatives
  if (otpToken.attempts >= otpToken.maxAttempts) {
    // Marquer comme utilisé pour bloquer
    await prisma.otpToken.update({
      where: { id: otpToken.id },
      data: { used: true },
    })
    return {
      valid: false,
      error: "Nombre maximum de tentatives atteint. Veuillez demander un nouveau code.",
    }
  }

  // Incrémenter les tentatives
  await prisma.otpToken.update({
    where: { id: otpToken.id },
    data: { attempts: { increment: 1 } },
  })

  // Vérifier le code
  const isValid = await verifyOtpHash(code, otpToken.otpHash)

  if (!isValid) {
    const remaining = otpToken.maxAttempts - otpToken.attempts - 1
    return {
      valid: false,
      error: `Code incorrect. ${remaining} tentative${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}.`,
    }
  }

  // Marquer comme utilisé
  await prisma.otpToken.update({
    where: { id: otpToken.id },
    data: { used: true },
  })

  return { valid: true, userId: otpToken.userId }
}

/**
 * Nettoie les OTP expirés (à appeler périodiquement)
 */
export async function cleanupExpiredOtps(): Promise<number> {
  const result = await prisma.otpToken.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  })
  return result.count
}
