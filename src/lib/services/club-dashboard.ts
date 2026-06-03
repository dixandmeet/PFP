import { prisma } from "@/lib/prisma"
import {
  normalizeRecruitmentItems,
  type ApiApplication,
  type ApiSubmission,
  type ClubRecruitmentItem,
} from "@/lib/club/recruitment"

const PIPELINE_TERMINAL_STATUSES = ["REJECTED", "SIGNED"] as const

export type ClubDashboardKpis = {
  activeListings: number
  newRecruitment: number
  activePipeline: number
  teamsCount: number
  reportsCount: number
  activeMembersCount: number
}

export type ClubDashboardData = {
  clubName: string
  logo: string | null
  kpis: ClubDashboardKpis
  recentItems: ClubRecruitmentItem[]
}

export async function getClubDashboardData(
  clubProfileId: string
): Promise<ClubDashboardData | null> {
  const club = await prisma.clubProfile.findUnique({
    where: { id: clubProfileId },
    select: { clubName: true, logo: true },
  })

  if (!club) return null

  const clubWhere = { clubProfileId }
  const activePipelineWhere = {
    ...clubWhere,
    status: { notIn: [...PIPELINE_TERMINAL_STATUSES] },
  }

  const [
    activeListings,
    newApplications,
    newSubmissions,
    activeApplications,
    activeSubmissions,
    teamsCount,
    reportsCount,
    activeMembersCount,
    recentApplications,
    recentSubmissions,
  ] = await Promise.all([
    prisma.listing.count({
      where: { ...clubWhere, status: "PUBLISHED" },
    }),
    prisma.application.count({
      where: { ...clubWhere, status: "SUBMITTED" },
    }),
    prisma.submission.count({
      where: { ...clubWhere, status: "SUBMITTED" },
    }),
    prisma.application.count({ where: activePipelineWhere }),
    prisma.submission.count({ where: activePipelineWhere }),
    prisma.team.count({ where: clubWhere }),
    prisma.playerReport.count({ where: clubWhere }),
    prisma.clubMember.count({
      where: { ...clubWhere, status: "ACTIVE" },
    }),
    prisma.application.findMany({
      where: clubWhere,
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          select: { id: true, title: true, position: true },
        },
        playerProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            primaryPosition: true,
            nationality: true,
            currentClub: true,
            dateOfBirth: true,
          },
        },
      },
    }),
    prisma.submission.findMany({
      where: clubWhere,
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          select: { id: true, title: true, position: true },
        },
        agentProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            agencyName: true,
            licenseNumber: true,
          },
        },
      },
    }),
  ])

  const applications = recentApplications as unknown as ApiApplication[]
  const submissions = recentSubmissions.map((sub) => ({
    ...sub,
    playerData: sub.playerData as unknown as ApiSubmission["playerData"],
  })) as unknown as ApiSubmission[]

  const recentItems = normalizeRecruitmentItems(applications, submissions).slice(
    0,
    5
  )

  return {
    clubName: club.clubName,
    logo: club.logo,
    kpis: {
      activeListings,
      newRecruitment: newApplications + newSubmissions,
      activePipeline: activeApplications + activeSubmissions,
      teamsCount,
      reportsCount,
      activeMembersCount,
    },
    recentItems,
  }
}
