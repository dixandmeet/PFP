import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { SKILL_CATEGORY_WEIGHTS, type PlayerAttribute } from "./types"
import { PlayerRatingService } from "./player-rating.service"
import type { EvaluateVideoSkillInput } from "@/lib/validators/rating-schemas"

type Tx = Prisma.TransactionClient

export class VideoSkillEvaluationService {
  /**
   * Évalue les compétences football d'un joueur dans une vidéo.
   * Crée ou met à jour le VideoSkillEvaluation, puis recalcule le PlayerRating.
   */
  static async evaluate(input: {
    videoId: string
    evaluatorId: string
    scores: EvaluateVideoSkillInput
  }) {
    return prisma.$transaction(async (tx: Tx) => {
      // 1. Vérifier que la vidéo existe et est éligible
      const video = await tx.playerFootballVideo.findUnique({
        where: { id: input.videoId },
        select: {
          id: true,
          userId: true,
          status: true,
          skillCategory: true,
        },
      })

      if (!video) {
        throw new Error("Vidéo non trouvée — n'existe pas")
      }

      if (video.status !== "AWARDED") {
        throw new Error("Seules les vidéos validées (AWARDED) peuvent être évaluées")
      }

      if (video.skillCategory === "PORTRAIT" || video.skillCategory === "UNSPECIFIED") {
        throw new Error("Cette catégorie de vidéo ne peut pas être évaluée")
      }

      // 2. Calculer le score composite pondéré par catégorie
      const categoryWeights = SKILL_CATEGORY_WEIGHTS[video.skillCategory]
      const scores = input.scores
      let compositeScore = 0

      const attrMap: Record<PlayerAttribute, number> = {
        PAC: scores.pac,
        FIN: scores.fin,
        TEC: scores.tec,
        VIS: scores.vis,
        PHY: scores.phy,
        DEF: scores.def,
        GK: scores.gk ?? 0,
      }

      for (const [attr, weight] of Object.entries(categoryWeights)) {
        compositeScore += (attrMap[attr as PlayerAttribute] ?? 0) * (weight as number)
      }
      compositeScore = Math.round(compositeScore)

      // 3. Upsert l'évaluation
      const evaluation = await tx.videoSkillEvaluation.upsert({
        where: { videoId: input.videoId },
        create: {
          videoId: input.videoId,
          evaluatorId: input.evaluatorId,
          pacScore: scores.pac,
          finScore: scores.fin,
          tecScore: scores.tec,
          visScore: scores.vis,
          phyScore: scores.phy,
          defScore: scores.def,
          gkScore: scores.gk ?? 0,
          subCriteria: scores.subCriteria ?? Prisma.JsonNull,
          compositeScore,
        },
        update: {
          evaluatorId: input.evaluatorId,
          pacScore: scores.pac,
          finScore: scores.fin,
          tecScore: scores.tec,
          visScore: scores.vis,
          phyScore: scores.phy,
          defScore: scores.def,
          gkScore: scores.gk ?? 0,
          subCriteria: scores.subCriteria ?? Prisma.JsonNull,
          compositeScore,
        },
      })

      // 4. Recalculer le rating du joueur
      const rating = await PlayerRatingService.recalculate(tx, video.userId)

      return { evaluation, rating }
    })
  }

  /**
   * Récupère l'évaluation de compétences d'une vidéo.
   */
  static async getByVideoId(videoId: string) {
    return prisma.videoSkillEvaluation.findUnique({
      where: { videoId },
    })
  }
}
