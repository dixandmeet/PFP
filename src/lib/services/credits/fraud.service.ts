import { FraudFlagType, FraudFlagSeverity, Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import {
  SUSPICIOUS_IP_THRESHOLD,
  MAX_CREDIT_OPS_PER_MINUTE,
  MAX_FOLLOWS_PER_HOUR,
  MAX_FOLLOW_LOOP_DEPTH,
  FraudBlockedError,
} from "./types"

// Rate limiter in-memory (par process)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export class FraudService {
  /**
   * Enregistrer une empreinte device
   */
  static async recordFingerprint(
    userId: string,
    fingerprint: string,
    ipAddress: string | null,
    userAgent: string | null,
    metadata?: Record<string, unknown>
  ) {
    await prisma.deviceFingerprint.upsert({
      where: { userId_fingerprint: { userId, fingerprint } },
      update: {
        lastSeenAt: new Date(),
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined,
        metadata: metadata as Prisma.JsonObject | undefined,
      },
      create: {
        userId,
        fingerprint,
        ipAddress,
        userAgent,
        metadata: metadata as Prisma.JsonObject | undefined,
      },
    })

    // Vérifier multi-compte en arrière-plan
    if (ipAddress || fingerprint) {
      await this.checkMultiAccount(userId, ipAddress, fingerprint)
    }
  }

  /**
   * Détecter les indicateurs multi-compte
   */
  static async checkMultiAccount(
    userId: string,
    ipAddress: string | null,
    fingerprint: string
  ): Promise<{ suspicious: boolean; flags: string[] }> {
    const flags: string[] = []

    // Vérifier si le même fingerprint est utilisé par d'autres comptes
    const sameFingerprint = await prisma.deviceFingerprint.findMany({
      where: {
        fingerprint,
        userId: { not: userId },
      },
      select: { userId: true },
      distinct: ["userId"],
    })

    if (sameFingerprint.length > 0) {
      flags.push(`Même empreinte device détectée sur ${sameFingerprint.length} autre(s) compte(s)`)
      await this.createFlag(
        userId,
        "MULTI_ACCOUNT",
        sameFingerprint.length >= 3 ? "HIGH" : "MEDIUM",
        `Empreinte device partagée avec ${sameFingerprint.length} compte(s)`,
        { fingerprint, otherUserIds: sameFingerprint.map((d) => d.userId) }
      )
    }

    // Vérifier si la même IP est utilisée par trop de comptes
    if (ipAddress) {
      const sameIp = await prisma.deviceFingerprint.findMany({
        where: {
          ipAddress,
          userId: { not: userId },
          lastSeenAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // dernières 24h
        },
        select: { userId: true },
        distinct: ["userId"],
      })

      if (sameIp.length >= SUSPICIOUS_IP_THRESHOLD) {
        flags.push(`IP ${ipAddress} partagée par ${sameIp.length + 1} comptes`)
        await this.createFlag(
          userId,
          "IP_ANOMALY",
          sameIp.length >= 5 ? "HIGH" : "MEDIUM",
          `IP partagée par ${sameIp.length + 1} comptes en 24h`,
          { ipAddress, otherUserIds: sameIp.map((d) => d.userId) }
        )
      }
    }

    return { suspicious: flags.length > 0, flags }
  }

  /**
   * Détecter les boucles artificielles de follows (A→B→C→A)
   */
  static async checkFollowLoop(
    followerId: string,
    followingId: string
  ): Promise<{ isLoop: boolean; chain?: string[] }> {
    // Vérifier si followingId suit déjà followerId (boucle directe)
    const directLoop = await prisma.creditFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: followingId,
          followingId: followerId,
        },
      },
    })

    if (directLoop) {
      return { isLoop: true, chain: [followerId, followingId, followerId] }
    }

    // Recherche BFS pour boucles indirectes (profondeur max)
    const visited = new Set<string>([followerId])
    let current = [followingId]

    for (let depth = 0; depth < MAX_FOLLOW_LOOP_DEPTH; depth++) {
      if (current.length === 0) break

      const follows = await prisma.creditFollow.findMany({
        where: {
          followerId: { in: current },
          isActive: true,
        },
        select: { followingId: true },
      })

      const next: string[] = []
      for (const f of follows) {
        if (f.followingId === followerId) {
          return { isLoop: true, chain: [...visited, ...current, followerId] }
        }
        if (!visited.has(f.followingId)) {
          visited.add(f.followingId)
          next.push(f.followingId)
        }
      }
      current = next
    }

    return { isLoop: false }
  }

  /**
   * Rate limiter pour opérations de crédit
   */
  static checkCreditRateLimit(
    userId: string,
    operation: string
  ): { allowed: boolean; retryAfter?: number } {
    const key = `credit:${userId}:${operation}`
    const now = Date.now()

    const maxOps = operation === "FOLLOW" ? MAX_FOLLOWS_PER_HOUR : MAX_CREDIT_OPS_PER_MINUTE
    const windowMs = operation === "FOLLOW" ? 60 * 60 * 1000 : 60 * 1000

    const entry = rateLimitMap.get(key)

    if (!entry || now > entry.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
      return { allowed: true }
    }

    if (entry.count >= maxOps) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      return { allowed: false, retryAfter }
    }

    entry.count++
    return { allowed: true }
  }

  /**
   * Créer un flag de fraude
   */
  static async createFlag(
    userId: string,
    type: FraudFlagType,
    severity: FraudFlagSeverity,
    description: string,
    evidence?: Record<string, unknown>
  ) {
    // Éviter les doublons du même type non résolu
    const existing = await prisma.fraudFlag.findFirst({
      where: { userId, type, isResolved: false },
    })

    if (existing) {
      return await prisma.fraudFlag.update({
        where: { id: existing.id },
        data: {
          severity: this.maxSeverity(existing.severity, severity),
          description,
          evidence: evidence as Prisma.JsonObject | undefined,
        },
      })
    }

    return await prisma.fraudFlag.create({
      data: {
        userId,
        type,
        severity,
        description,
        evidence: evidence as Prisma.JsonObject | undefined,
      },
    })
  }

  /**
   * Vérifier si un utilisateur est bloqué
   */
  static async isBlocked(userId: string): Promise<boolean> {
    const criticalFlags = await prisma.fraudFlag.count({
      where: {
        userId,
        isResolved: false,
        severity: { in: ["HIGH", "CRITICAL"] },
      },
    })
    return criticalFlags > 0
  }

  /**
   * Récupérer les flags de fraude d'un utilisateur
   */
  static async getUserFlags(userId: string) {
    return prisma.fraudFlag.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })
  }

  /**
   * Résoudre un flag de fraude (admin)
   */
  static async resolveFlag(
    flagId: string,
    adminUserId: string,
    resolution: string
  ) {
    return prisma.fraudFlag.update({
      where: { id: flagId },
      data: {
        isResolved: true,
        resolvedBy: adminUserId,
        resolvedAt: new Date(),
        resolution,
      },
    })
  }

  private static maxSeverity(
    a: FraudFlagSeverity,
    b: FraudFlagSeverity
  ): FraudFlagSeverity {
    const order: FraudFlagSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    return order.indexOf(a) > order.indexOf(b) ? a : b
  }
}
