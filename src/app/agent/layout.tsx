import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { LayoutShell } from "@/components/layout/LayoutShell"

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "AGENT") {
    redirect(session.user.role === "ADMIN" ? "/admin" : `/${session.user.role.toLowerCase()}/dashboard`)
  }

  return (
    <LayoutShell
      role="AGENT"
      mainClassName="flex-1 min-w-0 overflow-y-auto bg-gradient-to-br from-pitch-50 via-white to-pitch-50/30 pitch-pattern"
      searchBorderColor="border-pitch-100"
    >
      {children}
    </LayoutShell>
  )
}
