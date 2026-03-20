import type { TransactionType } from "@prisma/client"

export const GAMIFICATION_SPEND_ACTIONS = [
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

export type GamificationSpendAction = (typeof GAMIFICATION_SPEND_ACTIONS)[number]

export const GAMIFICATION_SINK: Record<
  GamificationSpendAction,
  { cost: number; transactionType: TransactionType }
> = {
  VIDEO_BOOST: { cost: 5, transactionType: "DEBIT_VIDEO_BOOST" },
  PROFILE_HIGHLIGHT: { cost: 15, transactionType: "DEBIT_PROFILE_HIGHLIGHT" },
  RECRUITER_VIDEO_SEND: { cost: 20, transactionType: "DEBIT_RECRUITER_VIDEO_SEND" },
  ADVANCED_ANALYSIS: { cost: 5, transactionType: "DEBIT_ADVANCED_ANALYSIS" },
  FULL_PLAYER_REPORT: { cost: 10, transactionType: "DEBIT_FULL_PLAYER_REPORT" },
  CLUB_APPLICATION: { cost: 5, transactionType: "DEBIT_CLUB_APPLICATION" },
  PLAYER_RECOMMENDATION: { cost: 15, transactionType: "DEBIT_PLAYER_RECOMMENDATION" },
  DIRECT_RECRUITER_ACCESS: { cost: 25, transactionType: "DEBIT_DIRECT_RECRUITER_ACCESS" },
  STORAGE_GB_1: { cost: 10, transactionType: "DEBIT_STORAGE_GB_PURCHASE" },
}
