import type { PlayerProgressionLevel } from "@prisma/client"

export function progressionLevelFromXp(xp: number): PlayerProgressionLevel {
  if (xp >= 5000) return "PRO"
  if (xp >= 2000) return "ELITE"
  if (xp >= 500) return "COMPETITOR"
  if (xp >= 100) return "AMATEUR"
  return "ROOKIE"
}

const ORDER: PlayerProgressionLevel[] = [
  "ROOKIE",
  "AMATEUR",
  "COMPETITOR",
  "ELITE",
  "PRO",
]

export function levelAtLeast(
  current: PlayerProgressionLevel,
  required: PlayerProgressionLevel
): boolean {
  return ORDER.indexOf(current) >= ORDER.indexOf(required)
}

/** Déblocages indicatifs (à relier aux features produit / UI). */
export function progressionUnlocks(level: PlayerProgressionLevel) {
  return {
    basicUploadRewards: levelAtLeast(level, "ROOKIE"),
    streakBonusesSoon: levelAtLeast(level, "AMATEUR"),
    performanceAnalyticsPack: levelAtLeast(level, "COMPETITOR"),
    visibilityBoostBundles: levelAtLeast(level, "ELITE"),
    fullMarketplace: levelAtLeast(level, "PRO"),
  }
}
