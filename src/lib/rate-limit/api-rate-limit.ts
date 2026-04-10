import { prisma } from "@/lib/prisma"

export type RateLimitScope =
  | "register_ip"
  | "register_email"
  | "resend_verification_ip"
  | "login_ip"
  | "login_email"
  | "forgot_password_ip"
  | "forgot_password_email"
  | "mobile_google_ip"
  | "verify_email_get_ip"
  | "credit_op"
  | "search_ip"

const PRUNE_OLDER_THAN_MS = 48 * 60 * 60 * 1000

async function pruneOldEvents(scope: RateLimitScope, key: string) {
  const cutoff = new Date(Date.now() - PRUNE_OLDER_THAN_MS)
  await prisma.apiRateLimitEvent.deleteMany({
    where: {
      scope,
      key,
      createdAt: { lt: cutoff },
    },
  })
}

async function rateLimitStatus(
  scope: RateLimitScope,
  key: string,
  max: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfterSec?: number; normalizedKey: string }> {
  const normalizedKey = key.slice(0, 512)
  const since = new Date(Date.now() - windowMs)

  const count = await prisma.apiRateLimitEvent.count({
    where: {
      scope,
      key: normalizedKey,
      createdAt: { gte: since },
    },
  })

  if (count >= max) {
    const oldest = await prisma.apiRateLimitEvent.findFirst({
      where: { scope, key: normalizedKey, createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    })
    const retryAfterMs = oldest
      ? Math.max(0, windowMs - (Date.now() - oldest.createdAt.getTime()))
      : windowMs
    return {
      allowed: false,
      retryAfterSec: Math.ceil(retryAfterMs / 1000),
      normalizedKey,
    }
  }

  return { allowed: true, normalizedKey }
}

export async function recordRateLimitEvent(scope: RateLimitScope, key: string) {
  const normalizedKey = key.slice(0, 512)
  await prisma.apiRateLimitEvent.create({
    data: { scope, key: normalizedKey },
  })
  void pruneOldEvents(scope, normalizedKey)
}

/**
 * Compte les événements dans la fenêtre glissante ; enregistre un nouvel événement si autorisé.
 */
export async function checkAndRecordRateLimit(
  scope: RateLimitScope,
  key: string,
  max: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfterSec?: number }> {
  const status = await rateLimitStatus(scope, key, max, windowMs)
  if (!status.allowed) {
    return { allowed: false, retryAfterSec: status.retryAfterSec }
  }
  await recordRateLimitEvent(scope, status.normalizedKey)
  return { allowed: true }
}

/** Vérifie sans enregistrer (pour enchaîner plusieurs checks avant record). */
export async function peekRateLimit(
  scope: RateLimitScope,
  key: string,
  max: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfterSec?: number }> {
  const status = await rateLimitStatus(scope, key, max, windowMs)
  if (!status.allowed) {
    return { allowed: false, retryAfterSec: status.retryAfterSec }
  }
  return { allowed: true }
}
