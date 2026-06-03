import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { isClubRole, getDashboardPath } from "@/lib/utils/role-helpers"

export default async function ClubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (!isClubRole(session.user.role)) {
    redirect(getDashboardPath(session.user.role))
  }

  return <>{children}</>
}
