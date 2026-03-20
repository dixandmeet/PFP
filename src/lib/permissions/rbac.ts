// RBAC - Role-Based Access Control helpers
import { Role } from "@prisma/client"
import { auth } from "../auth"

export type Permission = 
  | "create:profile"
  | "edit:own_profile"
  | "view:profiles"
  | "create:listing"
  | "edit:own_listing"
  | "apply:listing"
  | "submit:player"
  | "create:mandate"
  | "accept:mandate"
  | "create:report"
  | "approve:report"
  | "create:post"
  | "edit:own_post"
  | "delete:own_post"
  | "use:ai_assistant"
  | "manage:credits"
  | "view:credit_history"
  | "request:withdrawal"
  | "consult:listing"
  | "admin:review_withdrawal"
  | "admin:manage_fraud"
  | "admin:trigger_expiration"
  | "admin:review_signature"
  | "admin:evaluate_video_skill"

// Permissions par rôle
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  PLAYER: [
    "create:profile",
    "edit:own_profile",
    "view:profiles",
    "apply:listing",
    "accept:mandate",
    "create:report",
    "approve:report",
    "create:post",
    "edit:own_post",
    "delete:own_post",
    "use:ai_assistant",
    "manage:credits",
    "view:credit_history",
    "request:withdrawal",
    "consult:listing",
  ],
  AGENT: [
    "create:profile",
    "edit:own_profile",
    "view:profiles",
    "submit:player",
    "create:mandate",
    "create:report",
    "create:post",
    "edit:own_post",
    "delete:own_post",
    "use:ai_assistant",
    "manage:credits",
    "view:credit_history",
    "request:withdrawal",
    "consult:listing",
  ],
  CLUB: [
    "create:profile",
    "edit:own_profile",
    "view:profiles",
    "create:listing",
    "edit:own_listing",
    "create:post",
    "edit:own_post",
    "delete:own_post",
    "use:ai_assistant",
    "manage:credits",
    "view:credit_history",
    "request:withdrawal",
  ],
  CLUB_STAFF: [
    "create:profile",
    "edit:own_profile",
    "view:profiles",
    "create:post",
    "edit:own_post",
    "delete:own_post",
    "use:ai_assistant",
    "manage:credits",
    "view:credit_history",
    "consult:listing",
  ],
  ADMIN: [
    "create:profile",
    "edit:own_profile",
    "view:profiles",
    "create:listing",
    "edit:own_listing",
    "apply:listing",
    "submit:player",
    "create:mandate",
    "accept:mandate",
    "create:report",
    "approve:report",
    "create:post",
    "edit:own_post",
    "delete:own_post",
    "use:ai_assistant",
    "manage:credits",
    "view:credit_history",
    "request:withdrawal",
    "consult:listing",
    "admin:review_withdrawal",
    "admin:manage_fraud",
    "admin:trigger_expiration",
    "admin:review_signature",
    "admin:evaluate_video_skill",
  ],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p))
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p))
}

// Helper pour vérifier la session et les permissions
export async function requireAuth() {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error("Non authentifié")
  }
  
  return session.user
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth()
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Accès interdit - rôle insuffisant")
  }
  
  return user
}

export async function requirePermission(permission: Permission) {
  const user = await requireAuth()
  
  if (!hasPermission(user.role, permission)) {
    throw new Error(`Accès interdit - permission manquante: ${permission}`)
  }
  
  return user
}
