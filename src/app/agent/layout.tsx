import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Sidebar } from "@/components/nav/Sidebar"
import { GlobalSearch } from "@/components/nav/GlobalSearch"

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
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar role="AGENT" />
      <main className="flex-1 min-w-0 overflow-y-auto bg-gradient-to-br from-pitch-50 via-white to-pitch-50/30 pitch-pattern">
        {/* Spacer pour le bouton hamburger sur mobile */}
        <div className="h-16 lg:hidden" />
        {/* Header avec recherche globale */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-pitch-100 px-4 py-3 hidden lg:block">
          <div className="max-w-6xl mx-auto">
            <GlobalSearch />
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
