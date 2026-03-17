import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { SearchShell } from "@/components/layout/SearchShell"

type ValidRole = "PLAYER" | "AGENT" | "CLUB" | "CLUB_STAFF"

export default async function FootballLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const validRoles: ValidRole[] = ["PLAYER", "AGENT", "CLUB", "CLUB_STAFF"]
  const role: ValidRole = validRoles.includes(session.user.role as ValidRole)
    ? (session.user.role as ValidRole)
    : "PLAYER"

  return (
    <div className="min-h-screen bg-gradient-to-br from-pitch-50 via-white to-pitch-50/30">
      <SearchShell role={role}>{children}</SearchShell>
    </div>
  )
}
