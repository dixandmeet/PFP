import { Role } from "./roles"

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
  ],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p))
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p))
}
