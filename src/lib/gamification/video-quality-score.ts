import type { FootballVideoContext } from "@prisma/client"

export type VideoQualityBreakdown = {
  technicalPts: number
  detectionPts: number
  actionsPts: number
  contextPts: number
  total: number
  flags: {
    durationOk: boolean
    stabilityOk: boolean
    lightingOk: boolean
    resolutionOk: boolean
    playerVisible: boolean
    fullBodyOk: boolean
    faceDetected: boolean
    singleAction: boolean
    multipleActions: boolean
    contextMatch: boolean
    contextTraining: boolean
  }
  mockSeed: string
}

function hashSeed(hex: string | null): number {
  if (!hex || hex.length < 8) return 0x9e3779b9
  const buf = Buffer.from(hex.slice(0, 16), "hex")
  if (buf.length >= 4) return buf.readUInt32BE(0)
  return 0x9e3779b9
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Analyse qualité mock (remplacer par pipeline IA). Déterministe pour un même contentHash.
 */
export function mockScoreFootballVideo(input: {
  contentHash: string | null
  durationSeconds: number
  width?: number
  height?: number
  context: FootballVideoContext
}): VideoQualityBreakdown {
  const rnd = mulberry32(hashSeed(input.contentHash))

  const durationOk = input.durationSeconds > 20
  const minSide =
    input.width != null && input.height != null
      ? Math.min(input.width, input.height)
      : 0
  const resolutionOk =
    minSide >= 720 || (input.width == null && rnd() > 0.25)

  const stabilityOk = rnd() > 0.12
  const lightingOk = rnd() > 0.18
  const playerVisible = rnd() > 0.07
  const fullBodyOk = playerVisible && rnd() > 0.22
  const faceDetected = playerVisible && rnd() > 0.28
  const singleAction = rnd() > 0.38
  const multipleActions = singleAction && rnd() > 0.48

  let technical = 0
  if (durationOk) technical += 10
  if (stabilityOk) technical += 10
  if (lightingOk) technical += 10
  if (resolutionOk) technical += 10

  let detection = 0
  if (playerVisible) detection += 10
  if (fullBodyOk) detection += 10
  if (faceDetected) detection += 10

  let actions = 0
  if (singleAction || multipleActions) actions += 10
  if (multipleActions) actions += 10

  let contextPts = 0
  let contextMatch = false
  let contextTraining = false
  if (input.context === "MATCH") {
    contextPts = 10
    contextMatch = true
  } else if (input.context === "TRAINING") {
    contextPts = 5
    contextTraining = true
  }

  const technicalPts = Math.min(40, technical)
  const detectionPts = Math.min(30, detection)
  const actionsPts = Math.min(20, actions)
  const contextPtsCapped = Math.min(10, contextPts)

  return {
    technicalPts,
    detectionPts,
    actionsPts,
    contextPts: contextPtsCapped,
    total: technicalPts + detectionPts + actionsPts + contextPtsCapped,
    flags: {
      durationOk,
      stabilityOk,
      lightingOk,
      resolutionOk,
      playerVisible,
      fullBodyOk,
      faceDetected,
      singleAction,
      multipleActions,
      contextMatch,
      contextTraining,
    },
    mockSeed: input.contentHash ?? "no-hash",
  }
}

/** Bonus lié au palier de score (en crédits), sans la base +2 */
export function qualityTierBonus(totalScore: number): number {
  if (totalScore < 50) return 0
  if (totalScore < 70) return 2
  if (totalScore < 85) return 4
  return 6
}

/**
 * Récompense upload : base 2 + palier, bonus progression %, plafond 8.
 * Score &lt; 50 ⇒ 0 (rejet amont).
 */
export function computeUploadCreditReward(
  totalScore: number,
  progressionBonusPct: number
): { finalCredits: number } {
  if (totalScore < 50) return { finalCredits: 0 }
  const raw = (2 + qualityTierBonus(totalScore)) * (1 + progressionBonusPct)
  const finalCredits = Math.min(8, Math.max(0, Math.round(raw)))
  return { finalCredits }
}
