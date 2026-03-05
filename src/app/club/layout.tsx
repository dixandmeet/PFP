import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getClubForUser } from "@/lib/services/club-members"
import { Sidebar } from "@/components/nav/Sidebar"
import { GlobalSearch } from "@/components/nav/GlobalSearch"

export default async function ClubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "CLUB") {
    redirect(session.user.role === "ADMIN" ? "/admin" : `/${session.user.role.toLowerCase()}/dashboard`)
  }

  // Route onboarding : pas de sidebar club classique
  const headersList = await headers()
  const pathname = headersList.get("x-next-pathname") || ""
  const isOnboardingRoute = pathname.startsWith("/club/onboarding")

  // Résoudre le club via ownership OU membership (membres invités)
  const clubInfo = await getClubForUser(session.user.id)
  const club = clubInfo
    ? await prisma.clubProfile.findUnique({
        where: { id: clubInfo.clubProfileId },
        select: { status: true },
      })
    : null

  // Pas de club du tout → rediriger vers onboarding
  if (!club && !isOnboardingRoute) {
    redirect("/club/onboarding")
  }

  const clubActive = club?.status === "ACTIVE"

  return (
    <div className="flex h-screen overflow-hidden w-full">
      <Sidebar role="CLUB" clubActive={clubActive} />
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
