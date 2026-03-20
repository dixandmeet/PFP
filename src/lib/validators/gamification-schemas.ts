import { z } from "zod"

const FOOTBALL_VIDEO_SKILL_CATEGORIES = [
  "UNSPECIFIED",
  "MATCH_HIGHLIGHTS",
  "TECHNICAL",
  "PHYSICAL_ATHLETIC",
  "SET_PIECES",
  "GOALKEEPING",
  "TACTICAL",
  "PORTRAIT",
] as const

export const finalizeFootballVideoSchema = z.object({
  fileAssetId: z.string().min(1),
  durationSeconds: z.number().int().min(0).max(7200).optional(),
  width: z.number().int().min(16).max(8192).optional(),
  height: z.number().int().min(16).max(8192).optional(),
  context: z.enum(["UNKNOWN", "MATCH", "TRAINING"]).optional(),
  skillCategory: z.enum(FOOTBALL_VIDEO_SKILL_CATEGORIES).optional(),
})

const SPEND_ACTIONS = [
  "VIDEO_BOOST",
  "PROFILE_HIGHLIGHT",
  "RECRUITER_VIDEO_SEND",
  "ADVANCED_ANALYSIS",
  "FULL_PLAYER_REPORT",
  "CLUB_APPLICATION",
  "PLAYER_RECOMMENDATION",
  "DIRECT_RECRUITER_ACCESS",
  "STORAGE_GB_1",
] as const

export const gamificationSpendSchema = z.object({
  action: z.enum(SPEND_ACTIONS),
  referenceId: z.string().min(1).optional(),
  idempotencyKey: z.string().min(8).max(200),
})
