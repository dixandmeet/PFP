import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import {
  PLAYER_ATTRIBUTES,
  SKILL_CATEGORY_WEIGHTS,
  POSITION_OVR_WEIGHTS,
  DEFAULT_OVR_WEIGHTS,
  confidenceLevelFromCount,
  type PlayerAttribute,
} from "./types"

type Tx = Prisma.TransactionClient

export class PlayerRatingService {
  /**
   * Recalcule tous les attributs et l'OVR d'un joueur.
   * Appelé dans une transaction après chaque évaluation de compétences.
   */
  static async recalculate(tx: Tx, userId: string) {
    // 1. Récupérer toutes les vidéos AWARDED avec une évaluation de compétences
    const videos = await tx.playerFootballVideo.findMany({
      where: {
        userId,
        status: "AWARDED",
        skillEvaluation: { isNot: null },
      },
      include: { skillEvaluation: true },
    })

    const evaluatedVideos = videos.filter((v) => v.skillEvaluation !== null)
    const count = evaluatedVideos.length

    if (count === 0) {
      // Supprimer le rating existant si plus aucune évaluation
      await tx.playerRating.deleteMany({ where: { userId } })
      return null
    }

    // 2. Calculer la moyenne pondérée de chaque attribut
    const attributes: Record<PlayerAttribute, number> = {
      PAC: 0, FIN: 0, TEC: 0, VIS: 0, PHY: 0, DEF: 0, GK: 0,
    }

    for (const attr of PLAYER_ATTRIBUTES) {
      let weightedSum = 0
      let totalWeight = 0

      for (const video of evaluatedVideos) {
        const categoryWeights = SKILL_CATEGORY_WEIGHTS[video.skillCategory]
        const weight = categoryWeights[attr] ?? 0
        if (weight === 0) continue

        const eval_ = video.skillEvaluation!
        const score = getAttributeScore(eval_, attr)

        weightedSum += score * weight
        totalWeight += weight
      }

      attributes[attr] = totalWeight > 0
        ? Math.min(99, Math.round(weightedSum / totalWeight))
        : 0
    }

    // 3. Récupérer la position du joueur
    const profile = await tx.playerProfile.findFirst({
      where: { userId },
      select: { primaryPosition: true },
    })
    const position = profile?.primaryPosition ?? null

    // 4. Calculer l'OVR avec les poids de position
    const ovrWeights = (position && POSITION_OVR_WEIGHTS[position])
      ? POSITION_OVR_WEIGHTS[position]
      : DEFAULT_OVR_WEIGHTS

    let ovr = 0
    for (const attr of PLAYER_ATTRIBUTES) {
      ovr += attributes[attr] * (ovrWeights[attr] ?? 0)
    }
    ovr = Math.min(99, Math.round(ovr))

    // 5. Upsert le PlayerRating
    const rating = await tx.playerRating.upsert({
      where: { userId },
      create: {
        userId,
        pac: attributes.PAC,
        fin: attributes.FIN,
        tec: attributes.TEC,
        vis: attributes.VIS,
        phy: attributes.PHY,
        def: attributes.DEF,
        gk: attributes.GK,
        ovr,
        ratingPosition: position,
        evaluatedVideoCount: count,
        confidenceLevel: confidenceLevelFromCount(count),
      },
      update: {
        pac: attributes.PAC,
        fin: attributes.FIN,
        tec: attributes.TEC,
        vis: attributes.VIS,
        phy: attributes.PHY,
        def: attributes.DEF,
        gk: attributes.GK,
        ovr,
        ratingPosition: position,
        evaluatedVideoCount: count,
        confidenceLevel: confidenceLevelFromCount(count),
      },
    })

    return rating
  }

  /**
   * Récupère le rating d'un joueur (ou null si pas encore évalué).
   */
  static async getRating(userId: string) {
    return prisma.playerRating.findUnique({
      where: { userId },
    })
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getAttributeScore(
  eval_: { pacScore: number; finScore: number; tecScore: number; visScore: number; phyScore: number; defScore: number; gkScore: number },
  attr: PlayerAttribute
): number {
  switch (attr) {
    case "PAC": return eval_.pacScore
    case "FIN": return eval_.finScore
    case "TEC": return eval_.tecScore
    case "VIS": return eval_.visScore
    case "PHY": return eval_.phyScore
    case "DEF": return eval_.defScore
    case "GK": return eval_.gkScore
    default: return 0
  }
}
