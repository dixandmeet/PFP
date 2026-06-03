export type RecruitmentSource = "application" | "submission"

export type RecruitmentStatusFilter =
  | "ALL"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "TRIAL"
  | "ACCEPTED"
  | "SIGNED"
  | "REJECTED"

export type RecruitmentSourceFilter = "ALL" | "application" | "submission"

export const PIPELINE_STATUSES = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "TRIAL",
  "ACCEPTED",
  "SIGNED",
] as const

export const POSITION_LABELS: Record<string, string> = {
  GK: "Gardien",
  DF: "Défenseur",
  MF: "Milieu",
  FW: "Attaquant",
}

export const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; accent: string }
> = {
  SUBMITTED: {
    label: "Nouvelle",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    accent: "border-blue-400",
  },
  UNDER_REVIEW: {
    label: "En cours",
    color: "bg-sky-100 text-sky-700 border-sky-200",
    accent: "border-sky-400",
  },
  SHORTLISTED: {
    label: "Shortlisté",
    color: "bg-violet-100 text-violet-700 border-violet-200",
    accent: "border-violet-400",
  },
  TRIAL: {
    label: "Essai",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    accent: "border-amber-400",
  },
  ACCEPTED: {
    label: "Accepté",
    color: "bg-green-100 text-green-700 border-green-200",
    accent: "border-green-500",
  },
  SIGNED: {
    label: "Signé",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    accent: "border-emerald-600",
  },
  REJECTED: {
    label: "Refusé",
    color: "bg-red-100 text-red-700 border-red-200",
    accent: "border-red-400",
  },
}

export const SOURCE_LABELS: Record<RecruitmentSource, string> = {
  application: "Joueur",
  submission: "Agent",
}

export interface RecruitmentPlayer {
  id: string
  firstName: string
  lastName: string
  primaryPosition: string
  nationality: string
  currentClub?: string
  dateOfBirth?: string
}

export interface RecruitmentListing {
  id: string
  title: string
  position: string
}

export interface RecruitmentAgent {
  id: string
  firstName: string
  lastName: string
  agencyName?: string
  licenseNumber?: string
}

export interface CareerEntry {
  clubName: string
  season: string
  appearances?: number
  goals?: number
  assists?: number
}

export interface ApiApplication {
  id: string
  status: string
  coverLetter?: string
  createdAt: string
  updatedAt?: string
  playerProfile: {
    id: string
    firstName: string
    lastName: string
    primaryPosition: string
    nationality: string
    currentClub?: string
    dateOfBirth: string
  }
  listing: {
    id: string
    title: string
    position: string
  }
}

export interface SubmissionReportSummary {
  id: string
  title: string
  status: string
  authorType: string
}

export interface ApiSubmission {
  id: string
  status: string
  message?: string
  createdAt: string
  reportIds?: string[]
  reports?: SubmissionReportSummary[]
  playerData: {
    id: string
    firstName: string
    lastName: string
    primaryPosition: string
    nationality: string
    currentClub?: string
    careerEntries?: CareerEntry[]
  }
  agentProfile: {
    id: string
    firstName: string
    lastName: string
    agencyName?: string
    licenseNumber?: string
  }
  listing?: {
    id: string
    title: string
    position: string
  }
}

export interface ClubRecruitmentItem {
  id: string
  source: RecruitmentSource
  status: string
  createdAt: string
  updatedAt?: string
  player: RecruitmentPlayer
  listing?: RecruitmentListing
  agent?: RecruitmentAgent
  coverLetter?: string
  message?: string
  careerEntries?: CareerEntry[]
  application?: ApiApplication
  submission?: ApiSubmission
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0) || ""}${lastName.charAt(0) || ""}`.toUpperCase()
}

export function formatPosition(position: string) {
  return POSITION_LABELS[position] || position
}

export function normalizeApplication(app: ApiApplication): ClubRecruitmentItem {
  return {
    id: app.id,
    source: "application",
    status: app.status,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
    player: {
      id: app.playerProfile.id,
      firstName: app.playerProfile.firstName,
      lastName: app.playerProfile.lastName,
      primaryPosition: app.playerProfile.primaryPosition,
      nationality: app.playerProfile.nationality,
      currentClub: app.playerProfile.currentClub,
      dateOfBirth: app.playerProfile.dateOfBirth,
    },
    listing: app.listing,
    coverLetter: app.coverLetter,
    application: app,
  }
}

export function normalizeSubmission(sub: ApiSubmission): ClubRecruitmentItem {
  return {
    id: sub.id,
    source: "submission",
    status: sub.status,
    createdAt: sub.createdAt,
    player: {
      id: sub.playerData.id,
      firstName: sub.playerData.firstName,
      lastName: sub.playerData.lastName,
      primaryPosition: sub.playerData.primaryPosition,
      nationality: sub.playerData.nationality,
      currentClub: sub.playerData.currentClub,
    },
    listing: sub.listing,
    agent: sub.agentProfile,
    message: sub.message,
    careerEntries: sub.playerData.careerEntries,
    submission: sub,
  }
}

export function normalizeRecruitmentItems(
  applications: ApiApplication[],
  submissions: ApiSubmission[]
): ClubRecruitmentItem[] {
  return [
    ...applications.map(normalizeApplication),
    ...submissions.map(normalizeSubmission),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function groupByStatus(
  items: ClubRecruitmentItem[]
): Record<string, ClubRecruitmentItem[]> {
  return items.reduce(
    (acc, item) => {
      if (!acc[item.status]) acc[item.status] = []
      acc[item.status].push(item)
      return acc
    },
    {} as Record<string, ClubRecruitmentItem[]>
  )
}

export function countActive(items: ClubRecruitmentItem[]) {
  return items.filter((i) => !["REJECTED", "SIGNED"].includes(i.status)).length
}

export function getStatusPatchUrl(item: ClubRecruitmentItem) {
  return item.source === "application"
    ? `/api/applications/${item.id}/status`
    : `/api/submissions/${item.id}/status`
}

export function filterRecruitmentItems(
  items: ClubRecruitmentItem[],
  sourceFilter: RecruitmentSourceFilter,
  statusFilter: RecruitmentStatusFilter
): ClubRecruitmentItem[] {
  let result = items

  if (sourceFilter !== "ALL") {
    result = result.filter((i) => i.source === sourceFilter)
  }

  if (statusFilter !== "ALL") {
    result = result.filter((i) => i.status === statusFilter)
  }

  return result
}

export function getVisiblePipelineStatuses(
  statusFilter: RecruitmentStatusFilter
): (typeof PIPELINE_STATUSES)[number][] {
  if (statusFilter === "ALL") return [...PIPELINE_STATUSES]
  if (statusFilter === "REJECTED") return []
  if (PIPELINE_STATUSES.includes(statusFilter as (typeof PIPELINE_STATUSES)[number])) {
    return [statusFilter as (typeof PIPELINE_STATUSES)[number]]
  }
  return []
}

export function toDialogApplication(item: ClubRecruitmentItem | null) {
  if (!item?.application) return null
  return item.application
}
