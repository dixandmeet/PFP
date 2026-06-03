"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, ChevronRight, Building2, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { isClubRole } from "@/lib/utils/role-helpers"
import {
  calculateClubCompletion,
  type ClubCompletionData,
} from "@/lib/utils/club-completion"

interface ProfileData {
  role: string
  email: string
  name?: string | null
  playerProfile?: {
    firstName?: string | null
    lastName?: string | null
    dateOfBirth?: string | null
    nationality?: string | null
    primaryPosition?: string | null
    profilePicture?: string | null
    bio?: string | null
    careerEntries?: unknown[]
    currentClub?: string | null
  }
  agentProfile?: {
    firstName?: string | null
    lastName?: string | null
    licenseNumber?: string | null
    agencyName?: string | null
    profilePicture?: string | null
    bio?: string | null
  }
  clubProfile?: {
    clubName?: string | null
    shortName?: string | null
    clubType?: string | null
    logo?: string | null
    coverPhoto?: string | null
    foundedYear?: number | null
    bio?: string | null
    city?: string | null
    country?: string | null
  }
  clubStaffProfile?: {
    firstName?: string | null
    lastName?: string | null
    jobTitle?: string | null
    profilePicture?: string | null
    bio?: string | null
    phone?: string | null
    experience?: unknown[] | null
    skills?: string[] | null
  }
}

interface ProfileHeaderCardProps {
  role: "PLAYER" | "AGENT" | "CLUB" | "CLUB_STAFF"
}

type StatusType = "available" | "under_contract" | "searching"

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  available: {
    label: "Disponible",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  under_contract: {
    label: "Sous contrat",
    className: "bg-stadium-50 text-stadium-600 border-stadium-200",
  },
  searching: {
    label: "En recherche",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
}

function AvatarOrPlaceholder({
  src,
  alt,
  icon: Icon = User,
  size = "md",
  variant = "default",
}: {
  src?: string | null
  alt: string
  icon?: React.ComponentType<{ className?: string }>
  size?: "sm" | "md"
  variant?: "default" | "club" | "staff"
}) {
  const sizeClasses = size === "sm" ? "w-7 h-7" : "w-10 h-10"
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4"

  const variantClasses = {
    default: "border-stadium-200 bg-white",
    club: "border-pitch-200/80 bg-white ring-2 ring-pitch-50",
    staff: "border-stadium-200/80 bg-gradient-to-br from-pitch-50 to-white",
  }

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden border flex-shrink-0",
        sizeClasses,
        variantClasses[variant]
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Icon className={cn(iconSize, variant === "club" ? "text-pitch-500" : "text-pitch-400")} />
        </div>
      )}
    </div>
  )
}

export function ProfileHeaderCard({ role }: ProfileHeaderCardProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(`/api/users/me?t=${Date.now()}`)
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
        }
      } catch (error) {
        console.error("Erreur chargement profil:", error)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [pathname])

  if (loading) {
    return (
      <div className="mx-2.5 mt-2 shrink-0 overflow-hidden rounded-2xl border border-stadium-200/70 bg-white shadow-sm animate-pulse">
        <div className="flex items-center gap-3 p-3">
          <div className="w-10 h-10 rounded-full bg-stadium-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-28 bg-stadium-100 rounded-md" />
            <div className="h-2.5 w-20 bg-stadium-50 rounded-md" />
          </div>
        </div>
        <div className="border-t border-stadium-100 mx-3" />
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-7 h-7 rounded-full bg-stadium-100" />
          <div className="h-2.5 w-24 bg-stadium-50 rounded-md" />
        </div>
      </div>
    )
  }

  const status: StatusType = "available"
  const statusInfo = statusConfig[status]

  if (isClubRole(role)) {
    const cp = profile?.clubProfile
    const sp = profile?.clubStaffProfile

    const clubName = cp?.clubName || profile?.email?.split("@")[0] || "Club"
    const clubLocation =
      cp?.city && cp?.country ? `${cp.city}, ${cp.country}` : "Club"

    const staffName =
      sp?.firstName || sp?.lastName
        ? [sp.firstName, sp.lastName].filter(Boolean).join(" ")
        : profile?.name || profile?.email?.split("@")[0] || "Staff"
    const staffTitle = sp?.jobTitle || "Staff du club"

    const clubCompletion = cp
      ? calculateClubCompletion(cp as ClubCompletionData)
      : null

    const progressColor =
      clubCompletion && clubCompletion.percentage >= 80
        ? "bg-pitch-500"
        : clubCompletion && clubCompletion.percentage >= 50
          ? "bg-amber-500"
          : "bg-orange-500"

    const showStaffSection = role === "CLUB_STAFF" || !!sp

    return (
      <div className="mx-2.5 mt-2 shrink-0 overflow-hidden rounded-2xl border border-stadium-200/70 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <Link
          href="/club/profile"
          className="group flex items-start gap-3 p-3 hover:bg-stadium-50/80 transition-colors"
        >
          <AvatarOrPlaceholder
            src={cp?.logo}
            alt={clubName}
            icon={Building2}
            variant="club"
          />
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-bold text-stadium-900 text-[13px] truncate leading-tight">
                {clubName}
              </h3>
              <ChevronRight className="h-3.5 w-3.5 text-stadium-300 flex-shrink-0 group-hover:text-pitch-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            {cp?.city && cp?.country && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-stadium-500 truncate">
                <MapPin className="h-3 w-3 shrink-0 text-stadium-400" />
                {clubLocation}
              </p>
            )}
            <span
              className={cn(
                "inline-flex mt-2 items-center px-1.5 py-0.5 text-[10px] font-semibold rounded-full border leading-none",
                statusInfo.className
              )}
            >
              {statusInfo.label}
            </span>
          </div>
        </Link>

        {showStaffSection && (
          <>
            <div className="mx-3 h-px bg-gradient-to-r from-transparent via-stadium-200/80 to-transparent" />
            <Link
              href="/club/staff/profile"
              className="group flex items-center gap-2.5 px-3 py-2.5 bg-gradient-to-r from-pitch-50/60 via-pitch-50/20 to-transparent hover:from-pitch-50 transition-colors"
            >
              <AvatarOrPlaceholder
                src={sp?.profilePicture}
                alt={staffName}
                size="sm"
                variant="staff"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-pitch-600/80 leading-none mb-1">
                  Mon profil
                </p>
                <div className="flex items-center justify-between gap-1">
                  <p className="font-semibold text-stadium-800 text-[12px] truncate leading-tight">
                    {staffName}
                  </p>
                  <ChevronRight className="h-3 w-3 text-stadium-300 flex-shrink-0 group-hover:text-pitch-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-[11px] text-stadium-500 truncate mt-0.5">{staffTitle}</p>
              </div>
            </Link>
          </>
        )}

        {clubCompletion && clubCompletion.percentage < 100 && (
          <div className="px-3 pb-3 pt-0 border-t border-stadium-100/80 bg-stadium-50/30">
            <div className="flex items-center justify-between gap-2 mb-1.5 pt-2">
              <span className="text-[10px] font-medium text-stadium-600">Complétion du profil</span>
              <span className="text-[10px] font-bold text-stadium-700">
                {clubCompletion.percentage}%
              </span>
            </div>
            <div className="h-1.5 bg-stadium-100 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", progressColor)}
                style={{ width: `${clubCompletion.percentage}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] font-medium text-orange-600 truncate">
              {clubCompletion.missingLabels.length} élément
              {clubCompletion.missingLabels.length > 1 ? "s" : ""} manquant
              {clubCompletion.missingLabels.length > 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    )
  }

  let displayName = ""
  let subtitle = ""
  let profilePicture: string | null | undefined = null
  let profileLink = ""

  if (role === "PLAYER" && profile?.playerProfile) {
    const p = profile.playerProfile
    displayName = p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : profile.email?.split("@")[0] || ""
    subtitle = [p.primaryPosition, p.currentClub].filter(Boolean).join(" - ") || "Joueur"
    profilePicture = p.profilePicture
    profileLink = "/player/profile"
  } else if (role === "AGENT" && profile?.agentProfile) {
    const p = profile.agentProfile
    displayName = p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : profile.email?.split("@")[0] || ""
    subtitle = p.agencyName || "Agent"
    profilePicture = p.profilePicture
    profileLink = "/agent/profile"
  } else {
    displayName = profile?.email?.split("@")[0] || "Utilisateur"
    subtitle = role === "PLAYER" ? "Joueur" : role === "AGENT" ? "Agent" : role
    profileLink = `/${role.toLowerCase()}/profile`
  }

  return (
    <div className="mx-2.5 mt-2 shrink-0">
      <Link
        href={profileLink}
        className="group block overflow-hidden rounded-2xl border border-stadium-200/70 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:border-stadium-200 transition-all duration-150 active:scale-[0.99]"
      >
        <div className="flex items-center gap-3 p-3">
          <AvatarOrPlaceholder src={profilePicture} alt={displayName} variant="staff" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-bold text-stadium-900 text-[13px] truncate leading-tight">
                {displayName}
              </h3>
              <ChevronRight className="h-3.5 w-3.5 text-stadium-300 flex-shrink-0 group-hover:text-pitch-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 min-w-0">
              <span
                className={cn(
                  "inline-flex shrink-0 items-center px-1.5 py-0.5 text-[10px] font-semibold rounded-full border leading-none",
                  statusInfo.className
                )}
              >
                {statusInfo.label}
              </span>
              <p className="text-[11px] text-stadium-500 truncate">{subtitle}</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
