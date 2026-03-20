import {
  FootballVideoContext,
  FootballVideoSkillCategory,
  PlayerFootballVideoStatus,
  Prisma,
  Role,
} from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { WalletService } from "@/lib/services/credits/wallet.service"
import { SubscriptionService } from "@/lib/services/credits/subscription.service"
import { FraudService } from "@/lib/services/credits/fraud.service"
import { PLAN_CONFIG, PROGRESSION_CREDIT_BONUS_PCT } from "@/lib/services/credits/types"
import { mockScoreFootballVideo, computeUploadCreditReward } from "./video-quality-score"
import { progressionLevelFromXp, progressionUnlocks } from "./player-progression"
import {
  GAMIFICATION_SINK,
  type GamificationSpendAction,
} from "./sink-costs"
import {
  effectiveStorageQuotaBytes,
} from "./storage-quota"
import { videoProfileCompletenessPct } from "./video-profile-completeness"

type Tx = Prisma.TransactionClient

type RejectReason =
  | "DUPLICATE"
  | "NO_PLAYER"
  | "LOW_QUALITY"
  | "DAILY_LIMIT"

function contextFromSkillCategory(
  cat: FootballVideoSkillCategory
): FootballVideoContext {
  if (cat === "MATCH_HIGHLIGHTS") return "MATCH"
  if (cat === "UNSPECIFIED") return "UNKNOWN"
  return "TRAINING"
}

const TRASH_PREFIX = "TRASH::"

function encodeTrashMarker(
  status: PlayerFootballVideoStatus,
  rejectReason: string | null
): string {
  return `${TRASH_PREFIX}${status}::${Buffer.from(
    rejectReason ?? "",
    "utf8"
  ).toString("base64")}`
}

function decodeTrashMarker(marker: string): {
  previousStatus: PlayerFootballVideoStatus
  previousRejectReason: string | null
} {
  const payload = marker.startsWith(TRASH_PREFIX)
    ? marker.slice(TRASH_PREFIX.length)
    : ""
  const [statusRaw, encodedReason = ""] = payload.split("::")
  const previousStatus: PlayerFootballVideoStatus =
    statusRaw === "AWARDED" || statusRaw === "REJECTED" || statusRaw === "PENDING_REVIEW"
      ? statusRaw
      : "PENDING_REVIEW"
  const decoded = encodedReason
    ? Buffer.from(encodedReason, "base64").toString("utf8")
    : ""
  return {
    previousStatus,
    previousRejectReason: decoded.trim().length > 0 ? decoded : null,
  }
}

export class PlayerGamificationService {
  static async getStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        playerProgressionLevel: true,
        gamificationXp: true,
        gamificationStorageBonusBytes: true,
        role: true,
      },
    })
    if (!user || user.role !== "PLAYER") {
      throw new Error("Réservé aux joueurs")
    }

    const subscription = await SubscriptionService.getSubscription(userId)
    const planConfig = PLAN_CONFIG[subscription.plan]
    const quota = effectiveStorageQuotaBytes(
      subscription.plan,
      user.gamificationStorageBonusBytes
    )

    const usage = await prisma.userStorageUsage.findUnique({
      where: { userId },
    })

    const start = new Date()
    start.setUTCHours(0, 0, 0, 0)
    const rewardedToday = await prisma.playerFootballVideo.count({
      where: {
        userId,
        status: "AWARDED",
        creditsAwarded: { gt: 0 },
        createdAt: { gte: start },
      },
    })

    const balances = await WalletService.getBalances(userId)

    const sinks = Object.fromEntries(
      Object.entries(GAMIFICATION_SINK).map(([k, v]) => [k, v.cost])
    ) as Record<GamificationSpendAction, number>

    return {
      progression: {
        level: user.playerProgressionLevel,
        xp: user.gamificationXp,
        creditBonusPct: PROGRESSION_CREDIT_BONUS_PCT[user.playerProgressionLevel],
        unlocks: progressionUnlocks(user.playerProgressionLevel),
      },
      subscription: {
        plan: subscription.plan,
        storageQuotaBytes: planConfig.storageQuotaBytes,
        storageBonusBytes: user.gamificationStorageBonusBytes.toString(),
        effectiveQuotaBytes: quota.toString(),
        bytesUsed: (usage?.bytesUsed ?? BigInt(0)).toString(),
        maxRewardedUploadsPerDay: planConfig.maxRewardedUploadsPerDay,
        rewardedUploadsToday: rewardedToday,
      },
      wallets: balances,
      sinkCosts: sinks,
    }
  }

  static async finalizeFootballVideo(input: {
    userId: string
    role: Role
    fileAssetId: string
    durationSeconds?: number
    width?: number
    height?: number
    context?: FootballVideoContext
    skillCategory?: FootballVideoSkillCategory
  }) {
    if (input.role !== "PLAYER") {
      throw new Error("Seuls les joueurs peuvent finaliser une vidéo foot")
    }

    const preExisting = await prisma.playerFootballVideo.findUnique({
      where: { fileAssetId: input.fileAssetId },
      include: { scoreDetail: true },
    })
    if (preExisting) {
      return {
        idempotent: true,
        videoId: preExisting.id,
        status: preExisting.status,
        creditsAwarded: preExisting.creditsAwarded,
        totalScore: preExisting.totalScore,
        rejectReason: preExisting.rejectReason,
      }
    }

    const rl = FraudService.checkCreditRateLimit(input.userId, "VIDEO_FINALIZE")
    if (!rl.allowed) {
      throw new Error(
        `Trop de requêtes. Réessayez dans ${rl.retryAfter ?? 60} s.`
      )
    }

    const userRow = await prisma.user.findUnique({
      where: { id: input.userId },
      select: {
        playerProgressionLevel: true,
        gamificationXp: true,
      },
    })
    if (!userRow) throw new Error("Utilisateur introuvable")

    const skillCategory = input.skillCategory ?? "UNSPECIFIED"
    const context: FootballVideoContext =
      input.context ?? contextFromSkillCategory(skillCategory)
    const durationSeconds = input.durationSeconds ?? 0

    return prisma.$transaction(async (tx) => {
      const inTx = await tx.playerFootballVideo.findUnique({
        where: { fileAssetId: input.fileAssetId },
      })
      if (inTx) {
        return {
          idempotent: true,
          videoId: inTx.id,
          status: inTx.status,
          creditsAwarded: inTx.creditsAwarded,
          totalScore: inTx.totalScore,
          rejectReason: inTx.rejectReason,
        }
      }

      const file = await tx.fileAsset.findFirst({
        where: {
          id: input.fileAssetId,
          ownerId: input.userId,
          type: "VIDEO",
        },
      })
      if (!file) {
        throw new Error("Vidéo introuvable ou non autorisée")
      }

      if (file.contentHash) {
        const dup = await tx.playerFootballVideo.findFirst({
          where: {
            userId: input.userId,
            contentHash: file.contentHash,
          },
        })
        if (dup) {
          const dupBreakdown = mockScoreFootballVideo({
            contentHash: file.contentHash,
            durationSeconds,
            width: input.width,
            height: input.height,
            context,
          })
          return this.createOutcome(tx, input.userId, file, {
            context,
            skillCategory,
            durationSeconds,
            width: input.width,
            height: input.height,
            status: "REJECTED",
            rejectReason: "DUPLICATE",
            credits: 0,
            breakdown: dupBreakdown,
            progressionBonusPct: 0,
            currentXp: userRow.gamificationXp,
          })
        }
      }

      const breakdown = mockScoreFootballVideo({
        contentHash: file.contentHash,
        durationSeconds,
        width: input.width,
        height: input.height,
        context,
      })

      if (!breakdown.flags.playerVisible) {
        return this.createOutcome(tx, input.userId, file, {
          context,
          skillCategory,
          durationSeconds,
          width: input.width,
          height: input.height,
          status: "REJECTED",
          rejectReason: "NO_PLAYER",
          credits: 0,
          breakdown,
          progressionBonusPct: 0,
          currentXp: userRow.gamificationXp,
        })
      }

      if (breakdown.total < 50) {
        return this.createOutcome(tx, input.userId, file, {
          context,
          skillCategory,
          durationSeconds,
          width: input.width,
          height: input.height,
          status: "REJECTED",
          rejectReason: "LOW_QUALITY",
          credits: 0,
          breakdown,
          progressionBonusPct: 0,
          currentXp: userRow.gamificationXp,
        })
      }

      const subscription = await tx.subscription.findUnique({
        where: { userId: input.userId },
      })
      const plan = subscription?.plan ?? "FREE"
      const maxDay = PLAN_CONFIG[plan].maxRewardedUploadsPerDay

      const start = new Date()
      start.setUTCHours(0, 0, 0, 0)
      const rewardedToday = await tx.playerFootballVideo.count({
        where: {
          userId: input.userId,
          status: "AWARDED",
          creditsAwarded: { gt: 0 },
          createdAt: { gte: start },
        },
      })

      if (rewardedToday >= maxDay) {
        return this.createOutcome(tx, input.userId, file, {
          context,
          skillCategory,
          durationSeconds,
          width: input.width,
          height: input.height,
          status: "REJECTED",
          rejectReason: "DAILY_LIMIT",
          credits: 0,
          breakdown,
          progressionBonusPct: 0,
          currentXp: userRow.gamificationXp,
        })
      }

      const bonusPct =
        PROGRESSION_CREDIT_BONUS_PCT[userRow.playerProgressionLevel]
      const { finalCredits } = computeUploadCreditReward(
        breakdown.total,
        bonusPct
      )

      await WalletService.initializeWallets(tx, input.userId)

      const result = await this.createOutcome(tx, input.userId, file, {
        context,
        skillCategory,
        durationSeconds,
        width: input.width,
        height: input.height,
        status: "AWARDED",
        rejectReason: null,
        credits: finalCredits,
        breakdown,
        progressionBonusPct: bonusPct,
        currentXp: userRow.gamificationXp,
      })

      return result
    })
  }

  private static async createOutcome(
    tx: Tx,
    userId: string,
    file: { id: string; contentHash: string | null; size: number },
    opts: {
      context: FootballVideoContext
      skillCategory: FootballVideoSkillCategory
      durationSeconds: number
      width?: number
      height?: number
      status: PlayerFootballVideoStatus
      rejectReason: RejectReason | null
      credits: number
      breakdown?: ReturnType<typeof mockScoreFootballVideo>
      progressionBonusPct: number
      currentXp: number
    }
  ) {
    const breakdown =
      opts.breakdown ??
      mockScoreFootballVideo({
        contentHash: file.contentHash,
        durationSeconds: opts.durationSeconds,
        width: opts.width,
        height: opts.height,
        context: opts.context,
      })

    const rejectLabel =
      opts.rejectReason === null
        ? null
        : {
            DUPLICATE: "Vidéo en doublon",
            NO_PLAYER: "Joueur non détecté",
            LOW_QUALITY: "Qualité insuffisante (score < 50)",
            DAILY_LIMIT: "Limite quotidienne de vidéos récompensées atteinte",
          }[opts.rejectReason]

    const video = await tx.playerFootballVideo.create({
      data: {
        userId,
        fileAssetId: file.id,
        contentHash: file.contentHash,
        durationSeconds: opts.durationSeconds || null,
        width: opts.width ?? null,
        height: opts.height ?? null,
        context: opts.context,
        skillCategory: opts.skillCategory,
        status: opts.status,
        rejectReason: rejectLabel,
        creditsAwarded: opts.credits,
        totalScore: breakdown.total,
      },
    })

    await tx.playerFootballVideoScore.create({
      data: {
        videoId: video.id,
        technicalPts: breakdown.technicalPts,
        detectionPts: breakdown.detectionPts,
        actionsPts: breakdown.actionsPts,
        contextPts: breakdown.contextPts,
        durationOk: breakdown.flags.durationOk,
        stabilityOk: breakdown.flags.stabilityOk,
        lightingOk: breakdown.flags.lightingOk,
        resolutionOk: breakdown.flags.resolutionOk,
        playerVisible: breakdown.flags.playerVisible,
        fullBodyOk: breakdown.flags.fullBodyOk,
        faceDetected: breakdown.flags.faceDetected,
        singleAction: breakdown.flags.singleAction,
        multipleActions: breakdown.flags.multipleActions,
        contextMatch: breakdown.flags.contextMatch,
        contextTraining: breakdown.flags.contextTraining,
        mockSeed: breakdown.mockSeed,
      },
    })

    if (opts.status === "AWARDED" && opts.credits > 0) {
      await WalletService.credit(
        tx,
        userId,
        "BONUS",
        opts.credits,
        "CREDIT_VIDEO_UPLOAD_REWARD",
        {
          referenceId: video.id,
          referenceType: "PLAYER_FOOTBALL_VIDEO",
          description: `Récompense vidéo (score ${breakdown.total})`,
          idempotencyKey: `video_upload_${file.id}`,
          metadata: {
            totalScore: breakdown.total,
            progressionBonusPct: opts.progressionBonusPct,
          },
        }
      )

      const xpGain = 10 + opts.credits
      const newXp = opts.currentXp + xpGain
      const newLevel = progressionLevelFromXp(newXp)
      await tx.user.update({
        where: { id: userId },
        data: {
          gamificationXp: newXp,
          playerProgressionLevel: newLevel,
        },
      })
    }

    return {
      idempotent: false,
      videoId: video.id,
      status: opts.status,
      creditsAwarded: opts.credits,
      totalScore: breakdown.total,
      rejectReason: opts.rejectReason,
      breakdown: {
        technicalPts: breakdown.technicalPts,
        detectionPts: breakdown.detectionPts,
        actionsPts: breakdown.actionsPts,
        contextPts: breakdown.contextPts,
        flags: breakdown.flags,
      },
    }
  }

  static async spend(
    userId: string,
    role: Role,
    action: GamificationSpendAction,
    opts: { referenceId?: string; idempotencyKey: string }
  ) {
    if (role !== "PLAYER") {
      throw new Error("Réservé aux joueurs")
    }

    const cfg = GAMIFICATION_SINK[action]
    if (!cfg) throw new Error("Action inconnue")

    const rl = FraudService.checkCreditRateLimit(userId, "GAMIFICATION_SPEND")
    if (!rl.allowed) {
      throw new Error(
        `Trop de requêtes. Réessayez dans ${rl.retryAfter ?? 60} s.`
      )
    }

    const idemKey = opts.idempotencyKey

    const prior = await prisma.creditTransaction.findFirst({
      where: {
        userId,
        referenceType: "GAMIFICATION_SPEND",
        referenceId: idemKey,
      },
    })
    if (prior) {
      return {
        idempotent: true as const,
        action,
        cost: cfg.cost,
        wallets: await WalletService.getBalances(userId),
      }
    }

    await prisma.$transaction(async (tx) => {
      await WalletService.initializeWallets(tx, userId)

      const meta = {
        action,
        businessReferenceId: opts.referenceId,
      }

      if (action === "STORAGE_GB_1") {
        await WalletService.debitWithPriority(tx, userId, cfg.cost, cfg.transactionType, {
          referenceId: idemKey,
          referenceType: "GAMIFICATION_SPEND",
          idempotencyKey: idemKey,
          metadata: { ...meta, bytesAdded: 1024 ** 3 },
        })

        await tx.user.update({
          where: { id: userId },
          data: {
            gamificationStorageBonusBytes: {
              increment: BigInt(1024 ** 3),
            },
          },
        })
      } else {
        await WalletService.debitWithPriority(tx, userId, cfg.cost, cfg.transactionType, {
          referenceId: idemKey,
          referenceType: "GAMIFICATION_SPEND",
          idempotencyKey: idemKey,
          metadata: meta,
        })
      }
    })

    return {
      idempotent: false as const,
      action,
      cost: cfg.cost,
      wallets: await WalletService.getBalances(userId),
    }
  }

  static async listFootballVideos(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })
    if (!user || user.role !== "PLAYER") {
      throw new Error("Réservé aux joueurs")
    }

    const videos = await prisma.playerFootballVideo.findMany({
      where: {
        userId,
        OR: [
          { rejectReason: null },
          { NOT: { rejectReason: { startsWith: TRASH_PREFIX } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        context: true,
        skillCategory: true,
        status: true,
        rejectReason: true,
        creditsAwarded: true,
        totalScore: true,
        durationSeconds: true,
        width: true,
        height: true,
        createdAt: true,
        fileAsset: {
          select: { id: true, url: true, filename: true, mimeType: true },
        },
        scoreDetail: {
          select: {
            technicalPts: true,
            detectionPts: true,
            actionsPts: true,
            contextPts: true,
          },
        },
      },
    })

    const trashedVideos = await prisma.playerFootballVideo.findMany({
      where: {
        userId,
        rejectReason: { startsWith: TRASH_PREFIX },
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        context: true,
        skillCategory: true,
        status: true,
        rejectReason: true,
        creditsAwarded: true,
        totalScore: true,
        durationSeconds: true,
        width: true,
        height: true,
        createdAt: true,
        fileAsset: {
          select: { id: true, url: true, filename: true, mimeType: true },
        },
        scoreDetail: {
          select: {
            technicalPts: true,
            detectionPts: true,
            actionsPts: true,
            contextPts: true,
          },
        },
      },
    })

    return {
      videos,
      trashedVideos,
      videoProfileCompletenessPct: videoProfileCompletenessPct(videos),
    }
  }

  static async deleteFootballVideo(userId: string, videoId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })
    if (!user || user.role !== "PLAYER") {
      throw new Error("Réservé aux joueurs")
    }

    const video = await prisma.playerFootballVideo.findFirst({
      where: {
        id: videoId,
        userId,
        OR: [
          { rejectReason: null },
          { NOT: { rejectReason: { startsWith: TRASH_PREFIX } } },
        ],
      },
      select: { id: true, status: true, rejectReason: true },
    })
    if (!video) throw new Error("Non trouvé")

    await prisma.playerFootballVideo.update({
      where: { id: video.id },
      data: {
        status: "REJECTED",
        rejectReason: encodeTrashMarker(video.status, video.rejectReason),
      },
    })

    return { ok: true as const }
  }

  static async restoreFootballVideo(userId: string, videoId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })
    if (!user || user.role !== "PLAYER") {
      throw new Error("Réservé aux joueurs")
    }

    const video = await prisma.playerFootballVideo.findFirst({
      where: {
        id: videoId,
        userId,
        rejectReason: { startsWith: TRASH_PREFIX },
      },
      select: { id: true, rejectReason: true },
    })
    if (!video) throw new Error("Non trouvé")
    const {
      previousStatus,
      previousRejectReason,
    } = decodeTrashMarker(video.rejectReason ?? "")

    await prisma.playerFootballVideo.update({
      where: { id: video.id },
      data: {
        status: previousStatus,
        rejectReason: previousRejectReason,
      },
    })

    return { ok: true as const }
  }
}
