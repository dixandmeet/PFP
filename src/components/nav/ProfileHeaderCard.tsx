"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { isClubRole } from "@/lib/utils/role-helpers"

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
  staffContext?: boolean
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

export function ProfileHeaderCard({ role, staffContext = false }: ProfileHeaderCardProps) {
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
      <div className="mx-3 mt-3 p-4 rounded-xl bg-stadium-50 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-[52px] h-[52px] rounded-full bg-stadium-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-stadium-200 rounded" />
            <div className="h-3 w-16 bg-stadium-100 rounded" />
          </div>
        </div>
      </div>
    )
  }

  let displayName = ""
  let subtitle = ""
  let profilePicture: string | null | undefined = null
  let profileLink = ""
  // TODO: status should come from profile data when available
  let status: StatusType = "available"

  if (isClubRole(role) && staffContext) {
    // Contexte Staff : afficher le profil personnel
    const sp = profile?.clubStaffProfile
    if (sp?.firstName || sp?.lastName) {
      displayName = [sp.firstName, sp.lastName].filter(Boolean).join(" ")
    } else {
      displayName = profile?.name || profile?.email?.split("@")[0] || "Staff"
    }
    subtitle = sp?.jobTitle || "Staff du club"
    profilePicture = sp?.profilePicture || null
    profileLink = "/club/staff/profile"
  } else if (role === "PLAYER" && profile?.playerProfile) {
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
  } else if (isClubRole(role) && profile?.clubProfile) {
    const p = profile.clubProfile
    displayName = p.clubName || profile.email?.split("@")[0] || ""
    subtitle = p.city && p.country ? `${p.city}, ${p.country}` : "Club"
    profilePicture = p.logo
    profileLink = "/club/profile"
  } else {
    displayName = profile?.email?.split("@")[0] || "Utilisateur"
    subtitle = role === "PLAYER" ? "Joueur" : role === "AGENT" ? "Agent" : isClubRole(role) ? "Club" : role
    profileLink = `/${role.toLowerCase()}/profile`
  }

  const statusInfo = statusConfig[status]

  return (
    <div className="mx-3 mt-3">
      <Link
        href={profileLink}
        className="group flex items-center gap-3 p-2.5 rounded-xl bg-stadium-50/70 hover:bg-stadium-100/70 transition-all duration-150 active:scale-[0.98]"
      >
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-stadium-200 bg-white">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-pitch-50">
                <User className="h-5 w-5 text-pitch-400" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h3 className="font-bold text-stadium-900 text-[14px] truncate leading-tight">
              {displayName}
            </h3>
            <ChevronRight className="h-3.5 w-3.5 text-stadium-300 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={cn(
                "inline-flex items-center px-1.5 py-0 text-[10px] font-semibold rounded-full border leading-tight",
                statusInfo.className
              )}
            >
              {statusInfo.label}
            </span>
            <p className="text-[11px] text-stadium-500 truncate">
              {subtitle}
            </p>
          </div>
        </div>
      </Link>
    </div>
  )
}
