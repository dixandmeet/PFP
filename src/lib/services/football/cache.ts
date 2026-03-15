// ============================================
// Football Cache Service
// Cache en base de données avec durées variables
// ============================================

import { prisma } from "@/lib/prisma"
import { CacheType, DEFAULT_CACHE_DURATIONS, CacheDurations } from "./types"

export class FootballCacheService {
  private durations: CacheDurations

  constructor(customDurations?: Partial<CacheDurations>) {
    this.durations = {
      ...DEFAULT_CACHE_DURATIONS,
      ...customDurations
    }
  }

  /**
   * Génère une clé de cache unique
   */
  generateKey(source: string, dataType: CacheType, identifier: string): string {
    return `${source}:${dataType}:${identifier}`
  }

  /**
   * Récupère une entrée du cache si elle existe et n'est pas expirée
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await prisma.apiCache.findUnique({
        where: { cacheKey: key }
      })

      if (!cached) {
        return null
      }

      // Vérifier si le cache est expiré
      if (new Date() > cached.expiresAt) {
        // Supprimer l'entrée expirée en arrière-plan
        this.delete(key).catch(console.error)
        return null
      }

      return cached.data as T
    } catch (error) {
      console.error(`[FootballCache] Erreur lors de la lecture du cache: ${key}`, error)
      return null
    }
  }

  /**
   * Stocke une entrée dans le cache
   */
  async set(
    key: string,
    data: unknown,
    source: string,
    dataType: CacheType
  ): Promise<void> {
    try {
      const duration = this.durations[dataType]
      const expiresAt = new Date(Date.now() + duration)

      await prisma.apiCache.upsert({
        where: { cacheKey: key },
        create: {
          cacheKey: key,
          source,
          dataType,
          data: data as object,
          expiresAt
        },
        update: {
          data: data as object,
          expiresAt,
          source,
          dataType
        }
      })
    } catch (error) {
      console.error(`[FootballCache] Erreur lors de l'écriture du cache: ${key}`, error)
    }
  }

  /**
   * Supprime une entrée du cache
   */
  async delete(key: string): Promise<void> {
    try {
      await prisma.apiCache.delete({
        where: { cacheKey: key }
      }).catch(() => {
        // Ignorer si l'entrée n'existe pas
      })
    } catch (error) {
      console.error(`[FootballCache] Erreur lors de la suppression du cache: ${key}`, error)
    }
  }

  /**
   * Invalide toutes les entrées correspondant à un pattern
   */
  async invalidatePattern(pattern: string): Promise<number> {
    try {
      const result = await prisma.apiCache.deleteMany({
        where: {
          cacheKey: {
            contains: pattern
          }
        }
      })
      return result.count
    } catch (error) {
      console.error(`[FootballCache] Erreur lors de l'invalidation du pattern: ${pattern}`, error)
      return 0
    }
  }

  /**
   * Invalide toutes les entrées d'un type donné
   */
  async invalidateByType(dataType: CacheType): Promise<number> {
    try {
      const result = await prisma.apiCache.deleteMany({
        where: { dataType }
      })
      return result.count
    } catch (error) {
      console.error(`[FootballCache] Erreur lors de l'invalidation du type: ${dataType}`, error)
      return 0
    }
  }

  /**
   * Invalide toutes les entrées d'une source donnée
   */
  async invalidateBySource(source: string): Promise<number> {
    try {
      const result = await prisma.apiCache.deleteMany({
        where: { source }
      })
      return result.count
    } catch (error) {
      console.error(`[FootballCache] Erreur lors de l'invalidation de la source: ${source}`, error)
      return 0
    }
  }

  /**
   * Nettoie toutes les entrées expirées
   */
  async cleanup(): Promise<number> {
    try {
      const result = await prisma.apiCache.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      })
      console.log(`[FootballCache] ${result.count} entrées expirées supprimées`)
      return result.count
    } catch (error) {
      console.error("[FootballCache] Erreur lors du nettoyage du cache", error)
      return 0
    }
  }

  /**
   * Obtient des statistiques sur le cache
   */
  async getStats(): Promise<{
    total: number
    bySource: Record<string, number>
    byType: Record<string, number>
    expired: number
  }> {
    try {
      const [total, bySource, byType, expired] = await Promise.all([
        prisma.apiCache.count(),
        prisma.apiCache.groupBy({
          by: ["source"],
          _count: true
        }),
        prisma.apiCache.groupBy({
          by: ["dataType"],
          _count: true
        }),
        prisma.apiCache.count({
          where: {
            expiresAt: {
              lt: new Date()
            }
          }
        })
      ])

      return {
        total,
        bySource: bySource.reduce((acc, item) => {
          acc[item.source] = item._count
          return acc
        }, {} as Record<string, number>),
        byType: byType.reduce((acc, item) => {
          acc[item.dataType] = item._count
          return acc
        }, {} as Record<string, number>),
        expired
      }
    } catch (error) {
      console.error("[FootballCache] Erreur lors de la récupération des stats", error)
      return { total: 0, bySource: {}, byType: {}, expired: 0 }
    }
  }

  /**
   * Vérifie si une entrée existe et est valide
   */
  async has(key: string): Promise<boolean> {
    try {
      const cached = await prisma.apiCache.findUnique({
        where: { cacheKey: key },
        select: { expiresAt: true }
      })

      if (!cached) return false
      return new Date() <= cached.expiresAt
    } catch (error) {
      return false
    }
  }

  /**
   * Obtient le temps restant avant expiration (en ms)
   */
  async getTTL(key: string): Promise<number | null> {
    try {
      const cached = await prisma.apiCache.findUnique({
        where: { cacheKey: key },
        select: { expiresAt: true }
      })

      if (!cached) return null

      const ttl = cached.expiresAt.getTime() - Date.now()
      return ttl > 0 ? ttl : 0
    } catch (error) {
      return null
    }
  }

  /**
   * Récupère ou calcule une valeur (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    source: string,
    dataType: CacheType,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    // Essayer de récupérer depuis le cache
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Sinon, récupérer les données fraîches
    const data = await fetchFn()

    // Stocker en cache
    await this.set(key, data, source, dataType)

    return data
  }
}

// Instance singleton pour l'application
export const footballCache = new FootballCacheService()
