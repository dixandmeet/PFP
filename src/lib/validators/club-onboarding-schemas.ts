// Zod schemas pour l'onboarding Club
import { z } from "zod"
import { passwordSchema } from "./schemas"

// ─── Step 1 : Creator Verification ─────────────────────────────────────────

export const searchUserSchema = z.object({
  email: z.string().email("Email invalide").transform((v) => v.trim().toLowerCase()),
})

export const createUserSchema = z.object({
  firstName: z.string().min(1, "Prénom requis").max(100),
  lastName: z.string().min(1, "Nom requis").max(100),
  email: z.string().email("Email invalide").transform((v) => v.trim().toLowerCase()),
  phone: z.string().optional(),
  password: passwordSchema,
})

export const sendOtpSchema = z.object({
  email: z.string().email("Email invalide").transform((v) => v.trim().toLowerCase()),
})

export const verifyOtpSchema = z.object({
  email: z.string().email("Email invalide").transform((v) => v.trim().toLowerCase()),
  code: z
    .string()
    .length(6, "Le code doit contenir 6 chiffres")
    .regex(/^\d{6}$/, "Le code doit contenir uniquement des chiffres"),
})

// ─── Step 2 : Club Info ────────────────────────────────────────────────────

export const clubInfoSchema = z
  .object({
    clubName: z
      .string()
      .min(2, "Le nom du club doit contenir au moins 2 caractères")
      .max(200)
      .transform((v) => v.trim()),
    country: z.string().min(2, "Le pays est requis"),
    city: z.string().min(1, "La ville est requise").transform((v) => v.trim()),
    yearFounded: z
      .number({ invalid_type_error: "L'année de fondation doit être un nombre" })
      .int()
      .min(1800, "Année invalide")
      .max(new Date().getFullYear(), "L'année ne peut pas être dans le futur"),
    clubType: z.enum(["PRO", "AMATEUR", "ACADEMY"], {
      errorMap: () => ({ message: "Type de club requis" }),
    }),
    legalForm: z
      .string()
      .min(1, "La forme juridique est requise")
      .max(200)
      .transform((v) => v.trim()),
    registrationNumber: z
      .string()
      .max(100)
      .optional()
      .transform((v) => v?.trim() || undefined),
    federation: z
      .string()
      .max(200)
      .optional()
      .transform((v) => v?.trim() || undefined),
    federationNumber: z
      .string()
      .max(100)
      .optional()
      .transform((v) => v?.trim() || undefined),
    officialEmail: z
      .string()
      .email("Email officiel invalide")
      .transform((v) => v.trim().toLowerCase()),
    officialPhone: z
      .string()
      .min(6, "Le numéro de téléphone est requis")
      .max(30)
      .transform((v) => v.trim()),
    address: z
      .string()
      .min(5, "L'adresse est requise")
      .max(500)
      .transform((v) => v.trim()),
  })
  .superRefine((data, ctx) => {
    // registrationNumber requis si pays = France
    if (
      data.country.toUpperCase() === "FR" ||
      data.country.toLowerCase() === "france"
    ) {
      if (!data.registrationNumber || data.registrationNumber.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le numéro SIRET/RNA est requis pour les clubs français",
          path: ["registrationNumber"],
        })
      }
    }
  })

export type ClubInfoFormData = z.infer<typeof clubInfoSchema>

// ─── Step 3 : KYC Documents ───────────────────────────────────────────────

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
] as const

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export const kycPresignSchema = z.object({
  docType: z.enum(["PROOF_LEGAL", "REPRESENTATIVE_ID", "POWER_PROOF", "BANK_RIB"], {
    errorMap: () => ({ message: "Type de document invalide" }),
  }),
  filename: z.string().min(1, "Nom de fichier requis").max(255),
  mime: z.string().refine(
    (v) => (ALLOWED_MIME_TYPES as readonly string[]).includes(v),
    { message: "Type de fichier non autorisé. Formats acceptés : PDF, JPG, PNG" }
  ),
  size: z
    .number()
    .int()
    .positive("La taille du fichier doit être positive")
    .max(MAX_FILE_SIZE, "Le fichier ne doit pas dépasser 10 Mo"),
})

export const kycConfirmSchema = z.object({
  docType: z.enum(["PROOF_LEGAL", "REPRESENTATIVE_ID", "POWER_PROOF", "BANK_RIB"], {
    errorMap: () => ({ message: "Type de document invalide" }),
  }),
  url: z.string().url("URL invalide"),
  filename: z.string().min(1, "Nom de fichier requis").max(255),
  mime: z.string().refine(
    (v) => (ALLOWED_MIME_TYPES as readonly string[]).includes(v),
    { message: "Type de fichier non autorisé" }
  ),
  size: z
    .number()
    .int()
    .positive()
    .max(MAX_FILE_SIZE, "Le fichier ne doit pas dépasser 10 Mo"),
})

// ─── Step 4 : Submit ──────────────────────────────────────────────────────

export const clubSubmitSchema = z.object({
  clubId: z.string().min(1, "ID du club requis"),
})

// ─── Admin ────────────────────────────────────────────────────────────────

export const adminRejectSchema = z.object({
  reason: z
    .string()
    .min(10, "La raison du refus doit contenir au moins 10 caractères")
    .max(2000)
    .transform((v) => v.trim()),
})

// ─── Step 1 : Creator creation / invitation ──────────────────────────────

export const createCreatorSchema = z.object({
  firstName: z.string().min(1, "Prénom requis").max(100).transform((v) => v.trim()),
  lastName: z.string().min(1, "Nom requis").max(100).transform((v) => v.trim()),
  email: z.string().email("Email invalide").transform((v) => v.trim().toLowerCase()),
  phone: z
    .string()
    .max(30)
    .optional()
    .transform((v) => v?.trim() || undefined),
})

export const inviteCreatorSchema = z.object({
  email: z.string().email("Email invalide").transform((v) => v.trim().toLowerCase()),
})

export const resendVerificationSchema = z.object({
  email: z.string().email("Email invalide").transform((v) => v.trim().toLowerCase()),
})

// ─── Types exports ────────────────────────────────────────────────────────

export type SearchUserInput = z.infer<typeof searchUserSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type CreateCreatorInput = z.infer<typeof createCreatorSchema>
export type InviteCreatorInput = z.infer<typeof inviteCreatorSchema>
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>
export type SendOtpInput = z.infer<typeof sendOtpSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type KycPresignInput = z.infer<typeof kycPresignSchema>
export type KycConfirmInput = z.infer<typeof kycConfirmSchema>
export type AdminRejectInput = z.infer<typeof adminRejectSchema>

// ─── Constants ────────────────────────────────────────────────────────────

export const REQUIRED_KYC_DOCS = [
  "PROOF_LEGAL",
  "REPRESENTATIVE_ID",
  "POWER_PROOF",
] as const

export const KYC_DOC_LABELS: Record<string, string> = {
  PROOF_LEGAL: "Justificatif légal (KBIS / Récépissé association)",
  REPRESENTATIVE_ID: "Pièce d'identité du représentant",
  POWER_PROOF: "Statuts ou Procès-verbal",
  BANK_RIB: "RIB bancaire (optionnel)",
}
