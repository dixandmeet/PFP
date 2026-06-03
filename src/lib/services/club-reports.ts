import { prisma } from "@/lib/prisma"
import { getClubForUser } from "@/lib/services/club-members"
import { isClubRole } from "@/lib/utils/role-helpers"
import type { Role } from "@prisma/client"

export function generateReportShareSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
  const suffix = Math.random().toString(36).slice(2, 8)
  return `${slug}-${suffix}`
}

export type ClubContext = {
  clubProfileId: string
  userId: string
  role: Role
}

export async function resolveClubContext(
  userId: string,
  userRole: string
): Promise<ClubContext | null> {
  if (!isClubRole(userRole)) return null
  const clubInfo = await getClubForUser(userId)
  if (!clubInfo) return null

  const club = await prisma.clubProfile.findUnique({
    where: { id: clubInfo.clubProfileId },
    select: { status: true },
  })
  if (!club || club.status !== "ACTIVE") return null

  return {
    clubProfileId: clubInfo.clubProfileId,
    userId,
    role: userRole as Role,
  }
}

export async function canClubReadReport(
  reportId: string,
  clubProfileId: string
): Promise<boolean> {
  const report = await prisma.playerReport.findUnique({
    where: { id: reportId },
    select: { clubProfileId: true },
  })
  if (!report) return false
  if (report.clubProfileId === clubProfileId) return true

  const access = await prisma.reportClubAccess.findUnique({
    where: {
      reportId_clubProfileId: { reportId, clubProfileId },
    },
  })
  return !!access
}

export async function canClubEditReport(
  reportId: string,
  clubProfileId: string
): Promise<boolean> {
  const report = await prisma.playerReport.findUnique({
    where: { id: reportId },
    select: { clubProfileId: true },
  })
  return report?.clubProfileId === clubProfileId
}

export const clubReportInclude = {
  subject: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      primaryPosition: true,
      profilePicture: true,
    },
  },
  author: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  },
  createdByUser: {
    select: {
      id: true,
      name: true,
      clubStaffProfile: {
        select: { firstName: true, lastName: true, jobTitle: true },
      },
    },
  },
  footballMatch: {
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
    },
  },
  sections: { orderBy: { order: "asc" as const } },
  clubAccess: {
    select: {
      submissionId: true,
      grantedAt: true,
      clubProfileId: true,
    },
  },
} as const

export async function grantReportClubAccess(
  reportIds: string[],
  clubProfileId: string,
  submissionId?: string
) {
  if (reportIds.length === 0) return
  await Promise.all(
    reportIds.map((reportId) =>
      prisma.reportClubAccess.upsert({
        where: {
          reportId_clubProfileId: { reportId, clubProfileId },
        },
        create: { reportId, clubProfileId, submissionId },
        update: { submissionId: submissionId ?? undefined },
      })
    )
  )
}

export async function fetchReportsForClub(
  clubProfileId: string,
  options: {
    source?: "owned" | "received"
    kind?: "PLAYER" | "MATCH"
  } = {}
) {
  const { source = "owned", kind } = options

  if (source === "received") {
    const accesses = await prisma.reportClubAccess.findMany({
      where: {
        clubProfileId,
        report: { clubProfileId: { not: clubProfileId } },
      },
      include: {
        report: { include: clubReportInclude },
      },
      orderBy: { grantedAt: "desc" },
    })
    let reports = accesses.map((a) => ({
      ...a.report,
      receivedViaSubmissionId: a.submissionId,
      receivedAt: a.grantedAt,
    }))
    if (kind) {
      reports = reports.filter((r) => r.reportKind === kind)
    }
    return reports
  }

  const where: {
    clubProfileId: string
    reportKind?: "PLAYER" | "MATCH"
  } = { clubProfileId }
  if (kind) where.reportKind = kind

  return prisma.playerReport.findMany({
    where,
    include: clubReportInclude,
    orderBy: { createdAt: "desc" },
  })
}
