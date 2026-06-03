import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { LayoutShell } from "@/components/layout/LayoutShell"
import { getDashboardPath } from "@/lib/utils/role-helpers"

export default async function PlayerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "PLAYER") {
    redirect(getDashboardPath(session.user.role))
  }

  return (
    <LayoutShell
      role="PLAYER"
      mainClassName="flex-1 min-w-0 overflow-y-auto bg-[#F6F7F9]"
      searchBorderColor="border-slate-200"
    >
      {children}
    </LayoutShell>
  )
}
