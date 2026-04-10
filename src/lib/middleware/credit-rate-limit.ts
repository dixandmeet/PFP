/**
 * Rate limiter pour les opérations de crédit — basé sur la DB (via ApiRateLimitEvent).
 * Fonctionne correctement avec plusieurs instances (serverless, multi-process).
 */
import { checkAndRecordRateLimit } from "@/lib/rate-limit/api-rate-limit"

export async function checkCreditRateLimit(
  userId: string,
  operation: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): Promise<{ allowed: boolean; remaining: number; retryAfter?: number }> {
  const key = `${userId}:${operation}`
  const result = await checkAndRecordRateLimit("credit_op", key, maxRequests, windowMs)

  if (!result.allowed) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: result.retryAfterSec,
    }
  }

  return { allowed: true, remaining: Math.max(0, maxRequests - 1) }
}
