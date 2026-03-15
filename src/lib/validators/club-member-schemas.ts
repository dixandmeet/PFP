import { z } from "zod"

export const inviteClubMemberSchema = z.object({
  email: z.string().email("Email invalide").max(255).transform((v) => v.trim().toLowerCase()),
  role: z.enum(["ADMIN", "STAFF", "VIEWER"], {
    errorMap: () => ({ message: "Rôle invalide" }),
  }),
})

export const changeRoleSchema = z.object({
  memberId: z.string().min(1),
  role: z.enum(["ADMIN", "STAFF", "VIEWER"], {
    errorMap: () => ({ message: "Rôle invalide" }),
  }),
})

export const removeMemberSchema = z.object({
  memberId: z.string().min(1),
})

export const transferOwnershipSchema = z.object({
  toMemberId: z.string().min(1),
})

export const acceptInviteSchema = z.object({
  token: z.string().min(1),
})

export type InviteClubMemberData = z.infer<typeof inviteClubMemberSchema>
export type ChangeRoleData = z.infer<typeof changeRoleSchema>
export type RemoveMemberData = z.infer<typeof removeMemberSchema>
export type TransferOwnershipData = z.infer<typeof transferOwnershipSchema>
export type AcceptInviteData = z.infer<typeof acceptInviteSchema>
