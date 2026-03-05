import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Sidebar } from "@/components/nav/Sidebar"
import { GlobalSearch } from "@/components/nav/GlobalSearch"

export default async function PlayerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "PLAYER") {
    redirect(session.user.role === "ADMIN" ? "/admin" : `/${session.user.role.toLowerCase()}/dashboard`)
  }

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar role="PLAYER" />
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#F6F7F9]">
        <div className="h-16 lg:hidden" />
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-slate-200 px-4 py-3 hidden lg:block">
          <div className="max-w-6xl mx-auto">
            <GlobalSearch />
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
