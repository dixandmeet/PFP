export const Role = {
  PLAYER: "PLAYER",
  AGENT: "AGENT",
  CLUB: "CLUB",
  CLUB_STAFF: "CLUB_STAFF",
  ADMIN: "ADMIN",
} as const

export type Role = (typeof Role)[keyof typeof Role]

export const MOBILE_ALLOWED_ROLES: Role[] = [Role.PLAYER, Role.AGENT]

export const ClubRole = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  STAFF: "STAFF",
  VIEWER: "VIEWER",
} as const

export type ClubRole = (typeof ClubRole)[keyof typeof ClubRole]

export function isClubRole(role: string): boolean {
  return role === Role.CLUB || role === Role.CLUB_STAFF
}

export function isMobileRole(role: string): boolean {
  return role === Role.PLAYER || role === Role.AGENT
}
