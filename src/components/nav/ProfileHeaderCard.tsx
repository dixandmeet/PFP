"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  User,
  ChevronRight,
  Loader2,
  AlertCircle,
  Target,
  MessageCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { isClubRole } from "@/lib/utils/role-helpers"
import { calculateClubCompletion } from "@/lib/utils/club-completion"

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
  messageCount?: number
  opportunityCount?: number
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

function calculateCompletion(role: string, profile: ProfileData | null, staffContext = false): { percentage: number; missing: { label: string; href: string }[] } {
  if (!profile) return { percentage: 0, missing: [{ label: "Creer votre profil", href: `/${role.toLowerCase()}/profile` }] }

  if (isClubRole(role) && staffContext && profile.clubStaffProfile) {
    const p = profile.clubStaffProfile
    const experienceArr = Array.isArray(p.experience) ? p.experience : []
    const skillsArr = Array.isArray(p.skills) ? p.skills : []
    const fields = [
      { value: p.firstName, label: "Prenom", href: "/club/staff/profile" },
      { value: p.lastName, label: "Nom", href: "/club/staff/profile" },
      { value: p.jobTitle, label: "Fonction", href: "/club/staff/profile" },
      { value: p.profilePicture, label: "Photo", href: "/club/staff/profile" },
      { value: p.bio, label: "Bio", href: "/club/staff/profile" },
      { value: experienceArr.length > 0, label: "Experience", href: "/club/staff/profile" },
      { value: skillsArr.length > 0, label: "Competences", href: "/club/staff/profile" },
    ]
    const completed = fields.filter(f => f.value).length
    const missing = fields.filter(f => !f.value).map(f => ({ label: f.label, href: f.href }))
    return { percentage: Math.round((completed / fields.length) * 100), missing }
  }

  if (role === "PLAYER" && profile.playerProfile) {
    const p = profile.playerProfile
    const href = "/player/profile"
    const fields = [
      { value: p.firstName, label: "Prenom" },
      { value: p.lastName, label: "Nom" },
      { value: p.dateOfBirth, label: "Date de naissance" },
      { value: p.nationality, label: "Nationalite" },
      { value: p.primaryPosition, label: "Poste" },
      { value: p.profilePicture, label: "Photo" },
      { value: p.bio, label: "Bio" },
      { value: p.careerEntries && p.careerEntries.length > 0, label: "Carriere" },
    ]
    const completed = fields.filter(f => f.value).length
    const missing = fields.filter(f => !f.value).map(f => ({ label: f.label, href }))
    return { percentage: Math.round((completed / fields.length) * 100), missing }
  }

  if (role === "AGENT" && profile.agentProfile) {
    const p = profile.agentProfile
    const href = "/agent/profile"
    const fields = [
      { value: p.firstName, label: "Prenom" },
      { value: p.lastName, label: "Nom" },
      { value: p.licenseNumber, label: "Licence" },
      { value: p.agencyName, label: "Agence" },
      { value: p.profilePicture, label: "Photo" },
      { value: p.bio, label: "Bio" },
    ]
    const completed = fields.filter(f => f.value).length
    const missing = fields.filter(f => !f.value).map(f => ({ label: f.label, href }))
    return { percentage: Math.round((completed / fields.length) * 100), missing }
  }

  if (isClubRole(role) && profile.clubProfile) {
    const result = calculateClubCompletion(profile.clubProfile)
    return { percentage: result.percentage, missing: result.missingLabels.map(label => ({ label, href: "/club/profile" })) }
  }

  return { percentage: 0, missing: [{ label: "Creer votre profil", href: `/${role.toLowerCase()}/profile` }] }
}

export function ProfileHeaderCard({ role, messageCount = 0, opportunityCount = 0, staffContext = false }: ProfileHeaderCardProps) {
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

  const { percentage, missing } = calculateCompletion(role, profile, staffContext)
  const isComplete = percentage === 100
  const statusInfo = statusConfig[status]

  const kpiText = opportunityCount > 0
    ? `${opportunityCount} opportunite${opportunityCount > 1 ? "s" : ""} active${opportunityCount > 1 ? "s" : ""}`
    : messageCount > 0
      ? `${messageCount} nouveau${messageCount > 1 ? "x" : ""} message${messageCount > 1 ? "s" : ""}`
      : null

  return (
    <div className="mx-3 mt-3">
      <Link
        href={profileLink}
        className="group block p-3.5 rounded-xl bg-stadium-50/70 hover:bg-stadium-100/70 transition-all duration-150 active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-[52px] h-[52px] rounded-full overflow-hidden border-2 border-stadium-200 bg-white">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-pitch-50">
                  <User className="h-6 w-6 text-pitch-400" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-stadium-900 text-[15px] truncate leading-tight">
                {displayName}
              </h3>
              <ChevronRight className="h-4 w-4 text-stadium-300 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="text-xs text-stadium-500 truncate mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full border",
              statusInfo.className
            )}
          >
            {statusInfo.label}
          </span>
          {kpiText && (
            <span className="text-[11px] text-stadium-400 truncate">
              {kpiText}
            </span>
          )}
        </div>

        {!isComplete && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-stadium-500">Profil</span>
              <span className="text-[11px] font-bold text-stadium-600">{percentage}%</span>
            </div>
            <div className="h-1.5 bg-stadium-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  percentage >= 80 ? "bg-pitch-500" : percentage >= 50 ? "bg-amber-400" : "bg-orange-400"
                )}
              />
            </div>
            {missing.length > 0 && (
              <div className="mt-1.5">
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-orange-500 flex-shrink-0" />
                  <span className="text-[11px] text-orange-600 font-medium">
                    {missing.length} element{missing.length > 1 ? "s" : ""} manquant{missing.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {missing.map((item) => (
                    <span
                      key={item.label}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 font-medium"
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Link>
    </div>
  )
}
