import { z } from "zod"

export const playerProfileSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  position: z.string().min(1, "Le poste est requis"),
  secondaryPosition: z.string().optional(),
  preferredFoot: z.enum(["LEFT", "RIGHT", "BOTH"]).optional(),
  height: z.number().min(100).max(230).optional(),
  weight: z.number().min(40).max(150).optional(),
  currentClub: z.string().optional(),
  bio: z.string().max(1000, "La bio ne doit pas dépasser 1000 caractères").optional(),
})

export const agentProfileSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  agency: z.string().optional(),
  licenseNumber: z.string().optional(),
  specialities: z.array(z.string()).optional(),
  bio: z.string().max(1000, "La bio ne doit pas dépasser 1000 caractères").optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
})

export type PlayerProfileInput = z.infer<typeof playerProfileSchema>
export type AgentProfileInput = z.infer<typeof agentProfileSchema>
