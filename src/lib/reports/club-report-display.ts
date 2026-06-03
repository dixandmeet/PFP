export type ClubReportListItem = {
  id: string
  title: string
  version: number
  status: string
  authorType: string
  reportKind: string
  shareSlug?: string | null
  createdAt: string
  updatedAt: string
  source?: string | null
  externalPlayer?: {
    firstName?: string
    lastName?: string
    primaryPosition?: string
  } | null
  matchManual?: {
    opponent?: string
    competition?: string
    date?: string
    homeTeam?: string
    awayTeam?: string
  } | null
  footballMatch?: {
    competition: string
    matchDate: string
    homeTeam?: { name: string }
    awayTeam?: { name: string }
  } | null
  subject?: {
    firstName: string
    lastName: string
  } | null
  author?: {
    firstName: string
    lastName: string
  } | null
  createdByUser?: {
    name?: string | null
    clubStaffProfile?: {
      firstName?: string | null
      lastName?: string | null
    } | null
  } | null
  receivedViaSubmissionId?: string | null
}

export function getReportSubjectLabel(report: ClubReportListItem): string {
  if (report.reportKind === "MATCH") {
    const manual = report.matchManual
    if (manual?.opponent) {
      return `${manual.competition || "Match"} — ${manual.opponent}`
    }
    if (report.footballMatch) {
      const home = report.footballMatch.homeTeam?.name ?? "Domicile"
      const away = report.footballMatch.awayTeam?.name ?? "Extérieur"
      return `${report.footballMatch.competition} — ${home} vs ${away}`
    }
    return "Rapport match"
  }
  if (report.subject) {
    return `${report.subject.firstName} ${report.subject.lastName}`
  }
  const ext = report.externalPlayer
  if (ext?.firstName && ext?.lastName) {
    return `${ext.firstName} ${ext.lastName}`
  }
  return "Joueur"
}

export function getReportAuthorLabel(report: ClubReportListItem): string {
  if (report.createdByUser?.clubStaffProfile) {
    const s = report.createdByUser.clubStaffProfile
    const name = [s.firstName, s.lastName].filter(Boolean).join(" ")
    if (name) return name
  }
  if (report.createdByUser?.name) return report.createdByUser.name
  if (report.author) {
    return `${report.author.firstName} ${report.author.lastName}`
  }
  if (report.source === "AGENT" || report.receivedViaSubmissionId) {
    return "Agent"
  }
  return "Club"
}

export const CLUB_REPORTS_BASE = "/club/reports"
