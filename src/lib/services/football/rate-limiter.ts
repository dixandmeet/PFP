// ============================================
// Football API Rate Limiter
// Gestion des quotas pour respecter les limites des APIs
// ============================================

import { ApiSource, API_RATE_LIMITS, RateLimitConfig } from "./types"

interface RateLimitCounter {
  count: number
  windowStart: number
}

export class RateLimitError extends Error {
  public source: string
  public remaining: number
  public resetAt: Date

  constructor(source: string, remaining: number, resetAt: Date) {
    super(`Rate limit exceeded for ${source}. Resets at ${resetAt.toISOString()}`)
    this.name = "RateLimitError"
    this.source = source
    this.remaining = remaining
    this.resetAt = resetAt
  }
}

export class FootballRateLimiter {
  private counters: Map<string, RateLimitCounter> = new Map()
  private limits: Record<ApiSource, RateLimitConfig>

  constructor(customLimits?: Partial<Record<ApiSource, RateLimitConfig>>) {
    this.limits = {
      ...API_RATE_LIMITS,
      ...customLimits
    }
  }

  /**
   * Vérifie si une requête peut être effectuée pour une source donnée
   */
  canMakeRequest(source: ApiSource): boolean {
    const limit = this.limits[source]
    if (!limit) return true

    const counter = this.getCounter(source)
    const now = Date.now()

    // Si la fenêtre est expirée, réinitialiser
    if (now - counter.windowStart >= limit.windowMs) {
      return true
    }

    return counter.count < limit.requests
  }

  /**
   * Vérifie et incrémente le compteur, lance une erreur si limite atteinte
   */
  async checkAndIncrement(source: ApiSource): Promise<void> {
    if (!this.canMakeRequest(source)) {
      const { remaining, resetAt } = this.getStatus(source)
      throw new RateLimitError(source, remaining, resetAt)
    }

    this.increment(source)
  }

  /**
   * Incrémente le compteur pour une source donnée
   */
  increment(source: ApiSource): void {
    const limit = this.limits[source]
    if (!limit) return

    const counter = this.getCounter(source)
    const now = Date.now()

    // Si la fenêtre est expirée, réinitialiser
    if (now - counter.windowStart >= limit.windowMs) {
      this.counters.set(source, {
        count: 1,
        windowStart: now
      })
    } else {
      counter.count++
      this.counters.set(source, counter)
    }
  }

  /**
   * Obtient le compteur actuel pour une source, ou en crée un nouveau
   */
  private getCounter(source: ApiSource): RateLimitCounter {
    const existing = this.counters.get(source)
    if (existing) return existing

    const newCounter: RateLimitCounter = {
      count: 0,
      windowStart: Date.now()
    }
    this.counters.set(source, newCounter)
    return newCounter
  }

  /**
   * Obtient le nombre de requêtes restantes pour une source
   */
  getRemainingQuota(source: ApiSource): number {
    const limit = this.limits[source]
    if (!limit) return Infinity

    const counter = this.getCounter(source)
    const now = Date.now()

    // Si la fenêtre est expirée, quota complet disponible
    if (now - counter.windowStart >= limit.windowMs) {
      return limit.requests
    }

    return Math.max(0, limit.requests - counter.count)
  }

  /**
   * Obtient le statut complet du rate limit pour une source
   */
  getStatus(source: ApiSource): {
    limit: number
    remaining: number
    used: number
    resetAt: Date
    windowMs: number
  } {
    const limit = this.limits[source]
    if (!limit) {
      return {
        limit: Infinity,
        remaining: Infinity,
        used: 0,
        resetAt: new Date(),
        windowMs: 0
      }
    }

    const counter = this.getCounter(source)
    const now = Date.now()

    // Si la fenêtre est expirée
    if (now - counter.windowStart >= limit.windowMs) {
      return {
        limit: limit.requests,
        remaining: limit.requests,
        used: 0,
        resetAt: new Date(now + limit.windowMs),
        windowMs: limit.windowMs
      }
    }

    const remaining = Math.max(0, limit.requests - counter.count)
    const resetAt = new Date(counter.windowStart + limit.windowMs)

    return {
      limit: limit.requests,
      remaining,
      used: counter.count,
      resetAt,
      windowMs: limit.windowMs
    }
  }

  /**
   * Obtient le statut de toutes les sources
   */
  getAllStatus(): Record<ApiSource, ReturnType<typeof this.getStatus>> {
    const sources: ApiSource[] = ["api-football", "football-data", "thesportsdb"]
    const result = {} as Record<ApiSource, ReturnType<typeof this.getStatus>>

    for (const source of sources) {
      result[source] = this.getStatus(source)
    }

    return result
  }

  /**
   * Réinitialise le compteur pour une source
   */
  reset(source: ApiSource): void {
    this.counters.delete(source)
  }

  /**
   * Réinitialise tous les compteurs
   */
  resetAll(): void {
    this.counters.clear()
  }

  /**
   * Calcule le temps d'attente recommandé avant la prochaine requête (en ms)
   * Retourne 0 si une requête peut être faite immédiatement
   */
  getWaitTime(source: ApiSource): number {
    if (this.canMakeRequest(source)) return 0

    const { resetAt } = this.getStatus(source)
    return Math.max(0, resetAt.getTime() - Date.now())
  }

  /**
   * Attend que le rate limit soit réinitialisé (utile pour les retry)
   */
  async waitForReset(source: ApiSource): Promise<void> {
    const waitTime = this.getWaitTime(source)
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  /**
   * Obtient la source avec le plus de quota restant
   * Utile pour décider quelle API utiliser en fallback
   */
  getSourceWithMostQuota(sources: ApiSource[]): ApiSource | null {
    let bestSource: ApiSource | null = null
    let maxQuota = -1

    for (const source of sources) {
      const remaining = this.getRemainingQuota(source)
      if (remaining > maxQuota) {
        maxQuota = remaining
        bestSource = source
      }
    }

    return bestSource
  }

  /**
   * Vérifie si au moins une des sources a du quota disponible
   */
  hasAnyQuota(sources: ApiSource[]): boolean {
    return sources.some(source => this.canMakeRequest(source))
  }

  /**
   * Décorateur pour automatiquement vérifier le rate limit
   */
  withRateLimit<T>(source: ApiSource, fn: () => Promise<T>): Promise<T> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.checkAndIncrement(source)
        const result = await fn()
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })
  }
}

// Instance singleton pour l'application
export const rateLimiter = new FootballRateLimiter()

/**
 * Décorateur pour les méthodes de classe qui nécessitent un rate limit
 * Usage: @rateLimit("football-data")
 */
export function rateLimit(source: ApiSource) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      await rateLimiter.checkAndIncrement(source)
      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}
