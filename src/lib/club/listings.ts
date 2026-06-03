import {
  Target,
  ClipboardList,
  Eye,
  Handshake,
} from "lucide-react"

export const LISTING_POSITIONS = [
  { value: "GK", label: "Gardien" },
  { value: "DF", label: "Défenseur" },
  { value: "MF", label: "Milieu" },
  { value: "FW", label: "Attaquant" },
  { value: "COACH", label: "Entraîneur / Staff" },
  { value: "PHYSIO", label: "Préparateur physique" },
] as const

export const CONTRACT_TYPES = [
  { value: "Permanent", label: "Permanent" },
  { value: "Loan", label: "Prêt" },
  { value: "Trial", label: "Essai" },
] as const

export const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; accent: string }
> = {
  DRAFT: {
    label: "Brouillon",
    color: "bg-stadium-100 text-stadium-700 border-stadium-200",
    accent: "border-stadium-300",
  },
  PUBLISHED: {
    label: "Publiée",
    color: "bg-pitch-50 text-pitch-700 border-pitch-200",
    accent: "border-pitch-400",
  },
  CLOSED: {
    label: "Fermée",
    color: "bg-stadium-100 text-stadium-600 border-stadium-200",
    accent: "border-stadium-400",
  },
}

export type RecruitmentStepId =
  | "profile"
  | "clubInfo"
  | "team"
  | "listing"
  | "application"

export interface RecruitmentStep {
  id: RecruitmentStepId
  label: string
  done: boolean
}

/** Champs nécessaires pour l'étape « Informations club » (aligné sur clubInfoSchema). */
export type ClubProfileSetupSnapshot = {
  status?: string | null
  clubName?: string | null
  country?: string | null
  city?: string | null
  clubType?: string | null
  foundedYear?: number | null
  officialEmail?: string | null
  officialPhone?: string | null
  address?: string | null
}

export function isClubProfileActive(status?: string | null): boolean {
  return status === "ACTIVE"
}

export function isClubInfoComplete(club: ClubProfileSetupSnapshot): boolean {
  const city = club.city?.trim()
  const address = club.address?.trim()
  const officialEmail = club.officialEmail?.trim()
  const officialPhone = club.officialPhone?.trim()

  return Boolean(
    club.clubName?.trim() &&
      club.clubName.trim().length >= 2 &&
      club.country &&
      club.country.length >= 2 &&
      city &&
      city.length >= 1 &&
      club.clubType &&
      club.foundedYear != null &&
      club.foundedYear >= 1800 &&
      officialEmail &&
      officialEmail.includes("@") &&
      officialPhone &&
      officialPhone.length >= 6 &&
      address &&
      address.length >= 5
  )
}

export function buildRecruitmentSteps(input: {
  club: ClubProfileSetupSnapshot
  hasTeams: boolean
  hasPublishedListing: boolean
  hasRecruitmentActivity: boolean
}): RecruitmentStep[] {
  return [
    {
      id: "profile",
      label: "Profil club complété",
      done: isClubProfileActive(input.club.status),
    },
    {
      id: "clubInfo",
      label: "Informations club",
      done: isClubInfoComplete(input.club),
    },
    {
      id: "team",
      label: "Créer une équipe",
      done: input.hasTeams,
    },
    {
      id: "listing",
      label: "Publier une annonce",
      done: input.hasPublishedListing,
    },
    {
      id: "application",
      label: "Recevoir une candidature",
      done: input.hasRecruitmentActivity,
    },
  ]
}

export function recruitmentProgressPercent(steps: RecruitmentStep[]): number {
  if (steps.length === 0) return 0
  const done = steps.filter((s) => s.done).length
  return Math.round((done / steps.length) * 100)
}

export interface ClubListing {
  id: string
  title: string
  description: string
  position: string
  teamId?: string | null
  minAge?: number
  maxAge?: number
  nationality: string[]
  salaryMin?: number
  salaryMax?: number
  currency: string
  contractType?: string
  startDate?: string
  status: string
  publishedAt?: string
  closedAt?: string
  createdAt?: string
  team?: {
    id: string
    name: string
    level: string
  } | null
  _count?: {
    applications: number
    submissions: number
  }
}

export function computeListingKpis(
  listings: ClubListing[],
  viewsCount = 0
): {
  listings: number
  applications: number
  views: number
  contacts: number
} {
  let applications = 0
  let contacts = 0

  for (const listing of listings) {
    applications += listing._count?.applications ?? 0
    contacts += listing._count?.submissions ?? 0
  }

  return {
    listings: listings.length,
    applications,
    views: viewsCount,
    contacts,
  }
}

export const LISTING_KPI_CONFIG = [
  {
    key: "listings" as const,
    label: "Annonces",
    icon: Target,
    iconClassName: "bg-pitch-50 text-pitch-600",
  },
  {
    key: "applications" as const,
    label: "Candidatures",
    icon: ClipboardList,
    iconClassName: "bg-blue-50 text-blue-600",
  },
  {
    key: "views" as const,
    label: "Vues",
    icon: Eye,
    iconClassName: "bg-violet-50 text-violet-600",
  },
  {
    key: "contacts" as const,
    label: "Contacts",
    icon: Handshake,
    iconClassName: "bg-amber-50 text-amber-600",
  },
]
