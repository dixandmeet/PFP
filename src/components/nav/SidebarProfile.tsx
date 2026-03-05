"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { 
  User, 
  CheckCircle2, 
  AlertCircle,
  Trophy,
  TrendingUp,
  ChevronRight,
  Loader2
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface ProfileData {
  role: string
  email: string
  playerProfile?: {
    firstName?: string | null
    lastName?: string | null
    dateOfBirth?: string | null
    nationality?: string | null
    primaryPosition?: string | null
    profilePicture?: string | null
    bio?: string | null
    careerEntries?: unknown[]
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
    logo?: string | null
    foundedYear?: number | null
    stadiumName?: string | null
    description?: string | null
    city?: string | null
    country?: string | null
  }
}

interface SidebarProfileProps {
  role: "PLAYER" | "AGENT" | "CLUB"
}

// Calcul du pourcentage pour chaque type
function calculateCompletion(role: string, profile: ProfileData | null): { percentage: number; missing: string[] } {
  if (!profile) return { percentage: 0, missing: ["Créer votre profil"] }

  if (role === "PLAYER" && profile.playerProfile) {
    const p = profile.playerProfile
    const fields = [
      { value: p.firstName, label: "Prénom" },
      { value: p.lastName, label: "Nom" },
      { value: p.dateOfBirth, label: "Date de naissance" },
      { value: p.nationality, label: "Nationalité" },
      { value: p.primaryPosition, label: "Poste" },
      { value: p.profilePicture, label: "Photo" },
      { value: p.bio, label: "Bio" },
      { value: p.careerEntries && p.careerEntries.length > 0, label: "Carrière" },
    ]
    const completed = fields.filter(f => f.value).length
    const missing = fields.filter(f => !f.value).map(f => f.label)
    return { percentage: Math.round((completed / fields.length) * 100), missing }
  }

  if (role === "AGENT" && profile.agentProfile) {
    const p = profile.agentProfile
    const fields = [
      { value: p.firstName, label: "Prénom" },
      { value: p.lastName, label: "Nom" },
      { value: p.licenseNumber, label: "Licence" },
      { value: p.agencyName, label: "Agence" },
      { value: p.profilePicture, label: "Photo" },
      { value: p.bio, label: "Bio" },
    ]
    const completed = fields.filter(f => f.value).length
    const missing = fields.filter(f => !f.value).map(f => f.label)
    return { percentage: Math.round((completed / fields.length) * 100), missing }
  }

  if (role === "CLUB" && profile.clubProfile) {
    const p = profile.clubProfile
    const fields = [
      { value: p.clubName, label: "Nom" },
      { value: p.logo, label: "Logo" },
      { value: p.foundedYear, label: "Fondation" },
      { value: p.stadiumName, label: "Stade" },
      { value: p.description, label: "Description" },
      { value: p.city, label: "Ville" },
      { value: p.country, label: "Pays" },
    ]
    const completed = fields.filter(f => f.value).length
    const missing = fields.filter(f => !f.value).map(f => f.label)
    return { percentage: Math.round((completed / fields.length) * 100), missing }
  }

  return { percentage: 0, missing: ["Créer votre profil"] }
}

export function SidebarProfile({ role }: SidebarProfileProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    async function loadProfile() {
      try {
        // Ajouter un timestamp pour éviter le cache
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
  }, [pathname]) // Recharger quand on change de page

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-pitch-500" />
      </div>
    )
  }

  // Déterminer les infos d'affichage selon le rôle
  let displayName = ""
  let subtitle = ""
  let profilePicture: string | null | undefined = null
  let profileLink = ""

  if (role === "PLAYER" && profile?.playerProfile) {
    const p = profile.playerProfile
    displayName = p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : profile.email?.split("@")[0] || ""
    subtitle = p.primaryPosition || "Joueur"
    profilePicture = p.profilePicture
    profileLink = "/player/profile"
  } else if (role === "AGENT" && profile?.agentProfile) {
    const p = profile.agentProfile
    displayName = p.firstName && p.lastName ? `${p.firstName} ${p.lastName}` : profile.email?.split("@")[0] || ""
    subtitle = p.agencyName || "Agent"
    profilePicture = p.profilePicture
    profileLink = "/agent/profile"
  } else if (role === "CLUB" && profile?.clubProfile) {
    const p = profile.clubProfile
    displayName = p.clubName || profile.email?.split("@")[0] || ""
    subtitle = p.city && p.country ? `${p.city}, ${p.country}` : "Club"
    profilePicture = p.logo
    profileLink = "/club/profile"
  } else {
    displayName = profile?.email?.split("@")[0] || "Utilisateur"
    subtitle = role === "PLAYER" ? "Joueur" : role === "AGENT" ? "Agent" : "Club"
    profileLink = `/${role.toLowerCase()}/profile`
  }

  const { percentage, missing } = calculateCompletion(role, profile)
  const isComplete = percentage === 100

  const progressColor = percentage >= 80 
    ? "from-green-500 to-green-600" 
    : percentage >= 50 
      ? "from-gold-400 to-gold-600"
      : "from-orange-400 to-orange-600"

  return (
    <div className="p-3 border-b-2 border-pitch-100">
      {/* Phrase de bienvenue */}
      <p className="text-xs text-stadium-500 mb-2 px-2">
        Bienvenue sur votre espace
      </p>
      
      {/* Avatar et nom */}
      <Link href={profileLink} className="flex items-center gap-3 p-2 rounded-xl hover:bg-pitch-50 transition-colors group">
        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pitch-200 bg-gradient-to-br from-pitch-100 to-pitch-50">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="h-6 w-6 text-pitch-400" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-stadium-900 truncate text-sm">
            {displayName}
          </h3>
          <p className="text-xs text-stadium-600 truncate">
            {subtitle}
          </p>
        </div>
        
        <ChevronRight className="h-4 w-4 text-stadium-400 group-hover:translate-x-1 transition-transform" />
      </Link>

      {/* Barre de progression - uniquement si profil incomplet */}
      {!isComplete && (
        <div className="mt-3 px-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-stadium-600">
              Profil
            </span>
            <span className="text-xs font-bold text-stadium-700">
              {percentage}%
            </span>
          </div>
          
          <div className="h-2 bg-pitch-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r ${progressColor} rounded-full`}
            />
          </div>

          {missing.length > 0 && (
            <Link 
              href={profileLink}
              className="flex items-center gap-1.5 mt-2 text-orange-600 hover:text-orange-700 transition-colors"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">
                {missing.length} élément{missing.length > 1 ? "s" : ""} manquant{missing.length > 1 ? "s" : ""}
              </span>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
