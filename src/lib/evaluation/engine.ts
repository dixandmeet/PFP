// ── Moteur de calcul — Évaluation manuelle joueur ─────────────────────────────
// Fonctions pures, zéro dépendance extérieure (sauf types locaux).

import {
  type CriterionScores,
  type PositionGroup,
  type EvaluationResult,
  type CriterionDetail,
  EVALUATION_CATEGORIES,
  ALL_CRITERIA,
  TOTAL_WEIGHT,
  POSITION_ADJUSTMENTS,
  getPlayerLevel,
  resolvePositionGroup,
} from "./types"

// ── Scores par défaut (tous à 3) ─────────────────────────────────────────────

export function getDefaultScores(): CriterionScores {
  const scores: CriterionScores = {}
  for (const c of ALL_CRITERIA) {
    scores[c.key] = 3
  }
  return scores
}

// ── Poids ajusté d'un critère selon la position ──────────────────────────────

function adjustedWeight(criterionKey: string, baseWeight: number, positionGroup: PositionGroup): number {
  const multiplier = POSITION_ADJUSTMENTS[positionGroup]?.[criterionKey] ?? 1
  return baseWeight * multiplier
}

// ── Score total pondéré (0-100) ──────────────────────────────────────────────

export function calculateWeightedScore(
  scores: CriterionScores,
  positionGroup: PositionGroup = "DEFAULT",
): number {
  let totalAdjustedWeight = 0
  let weightedSum = 0

  for (const criterion of ALL_CRITERIA) {
    const raw = scores[criterion.key] ?? 3
    const w = adjustedWeight(criterion.key, criterion.weight, positionGroup)
    totalAdjustedWeight += w
    weightedSum += (raw / 5) * w
  }

  if (totalAdjustedWeight === 0) return 0
  return Math.round((weightedSum / totalAdjustedWeight) * 100)
}

// ── Scores par catégorie (0-100 chacune) ─────────────────────────────────────

export function getCategoryScores(
  scores: CriterionScores,
  positionGroup: PositionGroup = "DEFAULT",
): Record<string, number> {
  const result: Record<string, number> = {}

  for (const cat of EVALUATION_CATEGORIES) {
    let catAdjustedWeight = 0
    let catWeightedSum = 0

    for (const criterion of cat.criteria) {
      const raw = scores[criterion.key] ?? 3
      const w = adjustedWeight(criterion.key, criterion.weight, positionGroup)
      catAdjustedWeight += w
      catWeightedSum += (raw / 5) * w
    }

    result[cat.key] = catAdjustedWeight > 0
      ? Math.round((catWeightedSum / catAdjustedWeight) * 100)
      : 0
  }

  return result
}

// ── Détails par critère ──────────────────────────────────────────────────────

function getCriterionDetails(
  scores: CriterionScores,
  positionGroup: PositionGroup = "DEFAULT",
): CriterionDetail[] {
  const details: CriterionDetail[] = []

  for (const cat of EVALUATION_CATEGORIES) {
    for (const criterion of cat.criteria) {
      const raw = scores[criterion.key] ?? 3
      const w = adjustedWeight(criterion.key, criterion.weight, positionGroup)
      details.push({
        key: criterion.key,
        label: criterion.label,
        rawScore: raw,
        weightedScore: (raw / 5) * w,
        categoryKey: cat.key,
      })
    }
  }

  return details
}

// ── Forces (top N) ───────────────────────────────────────────────────────────

export function getStrengths(
  scores: CriterionScores,
  count = 3,
): { key: string; label: string; score: number }[] {
  return ALL_CRITERIA
    .map((c) => ({ key: c.key, label: c.label, score: scores[c.key] ?? 3 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
}

// ── Faiblesses (bottom N) ────────────────────────────────────────────────────

export function getWeaknesses(
  scores: CriterionScores,
  count = 3,
): { key: string; label: string; score: number }[] {
  return ALL_CRITERIA
    .map((c) => ({ key: c.key, label: c.label, score: scores[c.key] ?? 3 }))
    .sort((a, b) => a.score - b.score)
    .slice(0, count)
}

// ── Résultat complet ─────────────────────────────────────────────────────────

export function computeFullResult(
  scores: CriterionScores,
  positionGroup: PositionGroup = "DEFAULT",
): EvaluationResult {
  const totalScore = calculateWeightedScore(scores, positionGroup)
  return {
    totalScore,
    level: getPlayerLevel(totalScore),
    categoryScores: getCategoryScores(scores, positionGroup),
    criterionDetails: getCriterionDetails(scores, positionGroup),
    strengths: getStrengths(scores),
    weaknesses: getWeaknesses(scores),
  }
}

// Re-export pour usage direct
export { resolvePositionGroup, getPlayerLevel }
