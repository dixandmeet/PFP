export function isClubRole(role: string): boolean {
  return role === "CLUB" || role === "CLUB_STAFF"
}

export function getDashboardPath(role: string): string {
  if (role === "ADMIN") return "/admin"
  if (isClubRole(role)) return "/club/dashboard"
  return `/${role.toLowerCase()}/dashboard`
}
