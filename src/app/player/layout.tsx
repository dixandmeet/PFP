import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { LayoutShell } from "@/components/layout/LayoutShell"

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
    redirect(session.user.role === "ADMIN" ? "/admin" : `/${session.user.role.toLowerCase()}/dashboard`)
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
