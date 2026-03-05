import {
  Camera,
  FileText,
  MapPin,
  Users,
  Building2,
  type LucideIcon,
} from "lucide-react"

export interface CompletionField {
  id: string
  label: string
  icon: LucideIcon
  completed: boolean
  action: string
}

export interface ClubCompletionData {
  clubName?: string | null
  shortName?: string | null
  clubType?: string | null
  logo?: string | null
  coverPhoto?: string | null
  country?: string | null
  city?: string | null
  bio?: string | null
  foundedYear?: number | null
}

/**
 * Calcule la complétion du profil club de manière unifiée.
 * Utilisé à la fois par la sidebar (ProfileHeaderCard) et la page profil (ProfileCompletionCard).
 *
 * Champs vérifiés (7) :
 *  1. Logo du club
 *  2. Photo de couverture
 *  3. Type de structure (pro/amateur/formation)
 *  4. Ville et pays
 *  5. Description du club (bio >= 50 caractères)
 *  6. Nom court
 *  7. Année de fondation
 */
export function calculateClubCompletion(profile: ClubCompletionData): {
  percentage: number
  completedCount: number
  totalCount: number
  fields: CompletionField[]
  missingLabels: string[]
} {
  const fields: CompletionField[] = [
    {
      id: "logo",
      label: "Logo du club",
      icon: Camera,
      completed: !!profile.logo,
      action: "/club/profile/edit",
    },
    {
      id: "coverPhoto",
      label: "Photo de couverture",
      icon: Camera,
      completed: !!profile.coverPhoto,
      action: "cover",
    },
    {
      id: "clubType",
      label: "Type de structure",
      icon: Building2,
      completed: !!profile.clubType,
      action: "/club/profile/edit",
    },
    {
      id: "location",
      label: "Ville et pays",
      icon: MapPin,
      completed: !!(profile.city && profile.country),
      action: "/club/profile/edit",
    },
    {
      id: "bio",
      label: "Description du club",
      icon: FileText,
      completed: !!(profile.bio && profile.bio.length >= 50),
      action: "/club/profile/edit",
    },
    {
      id: "shortName",
      label: "Nom court (ex: OGC)",
      icon: Users,
      completed: !!profile.shortName,
      action: "/club/profile/edit",
    },
    {
      id: "foundedYear",
      label: "Année de fondation",
      icon: FileText,
      completed: !!profile.foundedYear,
      action: "/club/profile/edit",
    },
  ]

  const completedCount = fields.filter((f) => f.completed).length
  const totalCount = fields.length
  const percentage = Math.round((completedCount / totalCount) * 100)
  const missingLabels = fields.filter((f) => !f.completed).map((f) => f.label)

  return { percentage, completedCount, totalCount, fields, missingLabels }
}
