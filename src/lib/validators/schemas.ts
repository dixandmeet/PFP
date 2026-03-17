// Zod schemas pour validation
import { z } from "zod"

// ==================== PASSWORD ====================

export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(128, "Le mot de passe ne doit pas dépasser 128 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
  .regex(/[^a-zA-Z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial (!@#$%...)")

// Validateur pour URL ou chemin relatif (pour les fichiers locaux)
// Accepte aussi les chaînes vides
const urlOrPath = z.string().refine(
  (val) => val === "" || val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
  { message: "Doit être une URL ou un chemin relatif" }
)

// Convertit "", null, NaN → undefined pour que .optional() fonctionne
const emptyToUndefined = (val: unknown) => {
  if (val === "" || val === null || val === undefined) return undefined
  if (typeof val === "number" && isNaN(val)) return undefined
  return val
}

// Player Profile
export const createPlayerProfileSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  displayName: z.string().optional(),
  dateOfBirth: z.string().or(z.date()),
  nationality: z.string().min(2, "Nationalité requise"),
  secondNationality: z.string().optional(),
  height: z.preprocess(emptyToUndefined, z.number().int().positive().optional()),
  weight: z.preprocess(emptyToUndefined, z.number().int().positive().optional()),
  strongFoot: z.preprocess(emptyToUndefined, z.enum(["LEFT", "RIGHT", "BOTH"]).optional()),
  primaryPosition: z.string().min(2, "Position primaire requise"),
  secondaryPositions: z.array(z.string()).default([]),
  currentClub: z.string().optional(),
  currentLeague: z.string().optional(),
  availableFrom: z.string().or(z.date()).optional(),
  contractEndDate: z.string().or(z.date()).optional(),
  bio: z.string().optional(),
  profilePicture: urlOrPath.optional(),
  coverPhoto: urlOrPath.optional(),
})

export const updatePlayerProfileSchema = createPlayerProfileSchema.partial()

// Agent Profile
export const createAgentProfileSchema = z.object({
  firstName: z.string().min(1, "Prénom requis"),
  lastName: z.string().min(1, "Nom requis"),
  agencyName: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseCountry: z.string().optional(),
  bio: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  phoneNumber: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  profilePicture: urlOrPath.optional(),
  coverPhoto: urlOrPath.optional(),
})

export const updateAgentProfileSchema = createAgentProfileSchema.partial()

// Club Profile
// Helper : normalise une URL saisie (ajoute https:// si manquant)
function normalizeUrl(val: string): string {
  if (!val || val === "") return val
  const trimmed = val.trim()
  if (trimmed === "") return ""
  // Si l'utilisateur a saisi un domaine sans protocole (ex: "club.fr")
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`
  }
  return trimmed
}

export const CLUB_TYPE_OPTIONS = [
  { value: "PRO", label: "Club professionnel" },
  { value: "AMATEUR", label: "Club amateur" },
  { value: "ACADEMY", label: "Centre de formation" },
] as const

export const clubTypeEnum = z.enum(["PRO", "AMATEUR", "ACADEMY"])

export const createClubProfileSchema = z.object({
  clubName: z.string().min(1, "Le nom du club est requis"),
  shortName: z.string().nullable().optional(),
  clubType: clubTypeEnum.nullable().optional(),
  country: z.string().min(2, "Le pays est requis (2 caractères minimum)"),
  city: z.string().nullable().optional(),
  league: z.string().nullable().optional(),
  division: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  website: z.preprocess(
    (val) => {
      if (val === null) return null
      if (typeof val !== "string") return val
      return normalizeUrl(val)
    },
    z.string().url("L'adresse du site web n'est pas valide").nullable().optional().or(z.literal(""))
  ),
  foundedYear: z.preprocess(
    (val) => {
      // Gérer les chaînes vides ou NaN venant d'un input number
      if (val === "" || val === undefined || val === null) return null
      if (typeof val === "string") {
        const parsed = parseInt(val, 10)
        return isNaN(parsed) ? null : parsed
      }
      return val
    },
    z
      .number({ invalid_type_error: "L'année doit être un nombre" })
      .int("L'année doit être un nombre entier")
      .min(1800, "L'année de fondation doit être supérieure ou égale à 1800")
      .max(new Date().getFullYear(), `L'année ne peut pas dépasser ${new Date().getFullYear()}`)
      .nullable()
      .optional()
  ),
  logo: urlOrPath.nullable().optional(),
  coverPhoto: urlOrPath.nullable().optional(),
})

export const updateClubProfileSchema = createClubProfileSchema.partial()

/** Type inféré pour le formulaire d'édition du profil club */
export type ClubProfileFormValues = z.infer<typeof createClubProfileSchema>

// Career Entry
export const createCareerEntrySchema = z.object({
  clubName: z.string().min(1, "Nom du club requis"),
  league: z.string().optional(),
  country: z.string().optional(),
  season: z.string().regex(/^\d{4}\/(\d{2}|\d{4})$/, "Format saison: YYYY/YY ou YYYY/YYYY"),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional(),
  position: z.string().optional(),
  appearances: z.number().int().min(0).optional(),
  minutesPlayed: z.number().int().min(0).optional(),
  goals: z.number().int().min(0).optional(),
  assists: z.number().int().min(0).optional(),
})

// Listing (minAge dès 14 pour les équipes academy / jeunes)
export const createListingSchema = z.object({
  title: z.string().min(1, "Titre requis"),
  description: z.string().min(1, "Description requise"),
  position: z.string().min(1, "Position requise"),
  minAge: z.number().int().min(14).max(45).nullish(),
  maxAge: z.number().int().min(14).max(45).nullish(),
  nationality: z.array(z.string()).default([]),
  salaryMin: z.number().int().positive().nullish(),
  salaryMax: z.number().int().positive().nullish(),
  currency: z.string().default("EUR"),
  contractType: z.enum(["Permanent", "Loan", "Trial"]).optional(),
  startDate: z.string().or(z.date()).nullish(),
  requirements: z.string().optional(),
})

export const updateListingSchema = createListingSchema.partial()

// Application
export const createApplicationSchema = z.object({
  listingId: z.string().cuid("ID d'annonce invalide"),
  coverLetter: z.string().optional(),
  attachments: z.array(z.string()).default([]),
})

// Submission
export const createSubmissionSchema = z.object({
  playerProfileId: z.string().cuid("ID joueur invalide"),
  clubProfileId: z.string().cuid("ID club invalide"),
  listingId: z.string().cuid("ID annonce invalide").optional(),
  message: z.string().optional(),
  reportIds: z.array(z.string()).default([]),
  attachments: z.array(z.string()).default([]),
})

// Mandate
export const createMandateSchema = z.object({
  playerProfileId: z.string().cuid("ID joueur invalide"),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  terms: z.string().optional(),
})

// Report
export const createReportSchema = z.object({
  subjectId: z.string().cuid("ID sujet invalide").optional(),
  authorType: z.enum(["PLAYER", "AGENT", "SCOUT", "COACH"]),
  title: z.string().min(1, "Titre requis"),
  sections: z.array(z.object({
    order: z.number().int().min(0),
    title: z.string().min(1),
    content: z.string().min(1),
  })).default([]),
  attachments: z.array(z.string()).default([]),
  accessPolicy: z.any().optional(),
})

// Post
// content est optionnel quand des médias sont présents (vidéo sans texte)
export const createPostSchema = z.object({
  content: z.string().max(5000).default(""),
  mediaUrls: z.array(urlOrPath).default([]),
}).refine(
  (data) => data.content.trim().length > 0 || data.mediaUrls.length > 0,
  { message: "Ajoutez du texte ou au moins un média" }
)

// Comment
export const createCommentSchema = z.object({
  content: z.string().min(1, "Contenu requis").max(2000),
})

// Share
export const sharePostSchema = z.object({
  comment: z.string().max(500).optional(),
})

// Update Post
export const updatePostSchema = z.object({
  content: z.string().min(1, "Contenu requis").max(5000),
})

// Team
// Le schema de base pour la création d'équipe.
// La validation conditionnelle (division vs category/competitionName) est gérée via superRefine
// car elle dépend du country du club (passé au runtime).
export const createTeamBaseSchema = z.object({
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  level: z.enum(["PRO", "AMATEUR", "ACADEMY"], {
    required_error: "Le niveau est requis",
  }),
  division: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  competitionName: z.string().nullable().optional(),
})

/**
 * Crée un schema Zod pour la création d'équipe avec validation conditionnelle
 * basée sur le pays du club.
 */
export function createTeamSchemaForCountry(country: string) {
  return createTeamBaseSchema.superRefine((data, ctx) => {
    const isFrAcademy = country === "FR" && data.level === "ACADEMY"

    if (isFrAcademy) {
      // FR + ACADEMY : category et competitionName requis, division doit être vide
      if (!data.category) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La catégorie est requise",
          path: ["category"],
        })
      }
      if (!data.competitionName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La compétition est requise",
          path: ["competitionName"],
        })
      }
    } else {
      // Hors FR+ACADEMY : division obligatoire
      if (!data.division) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La division est requise",
          path: ["division"],
        })
      }
    }
  })
}

// Search
export const searchPlayersSchema = z.object({
  position: z.string().optional(),
  minAge: z.number().int().min(16).optional(),
  maxAge: z.number().int().max(45).optional(),
  nationality: z.string().optional(),
  availableFrom: z.string().or(z.date()).optional(),
  query: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})
