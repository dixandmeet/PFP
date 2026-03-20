/** Catégories attendues pour un profil vidéo « scouting » (hors UNSPECIFIED). */
export const VIDEO_PROFILE_SKILL_TRACKERS = [
  "MATCH_HIGHLIGHTS",
  "TECHNICAL",
  "PHYSICAL_ATHLETIC",
  "SET_PIECES",
  "GOALKEEPING",
  "TACTICAL",
  "PORTRAIT",
] as const

export type VideoProfileSkillSlot = (typeof VIDEO_PROFILE_SKILL_TRACKERS)[number]

export function videoProfileCompletenessPct(
  videos: { skillCategory: string; status: string }[]
): number {
  const trackers = new Set<string>(VIDEO_PROFILE_SKILL_TRACKERS)
  const filled = new Set<string>()
  for (const v of videos) {
    if (v.status !== "REJECTED" && v.skillCategory !== "UNSPECIFIED" && trackers.has(v.skillCategory)) {
      filled.add(v.skillCategory)
    }
  }
  return Math.round((filled.size / VIDEO_PROFILE_SKILL_TRACKERS.length) * 100)
}
