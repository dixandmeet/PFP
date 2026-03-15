// Layout minimal pour l'onboarding staff (sans sidebar)
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { FootballIcon } from "@/components/auth/icons"

export default async function StaffOnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "CLUB_STAFF") {
    if (session.user.role === "ADMIN") redirect("/admin")
    if (session.user.role === "CLUB") redirect("/club/dashboard")
    redirect(`/${session.user.role.toLowerCase()}/dashboard`)
  }

  // Si l'onboarding est déjà terminé, rediriger vers le dashboard
  const member = await prisma.clubMember.findFirst({
    where: { userId: session.user.id, status: "ACTIVE" },
    select: { staffOnboardingStep: true, clubProfile: { select: { clubName: true } } },
  })

  if (member?.staffOnboardingStep === "DONE") {
    redirect("/club/dashboard")
  }

  const clubName = member?.clubProfile?.clubName || "Club"

  return (
    <div className="min-h-screen bg-gradient-to-br from-pitch-50 via-white to-pitch-50/30">
      {/* Header minimal */}
      <header className="border-b border-pitch-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <FootballIcon className="w-8 h-8 rounded-lg" />
          <span className="font-semibold text-pitch-900">Profoot Profile</span>
          <span className="text-sm text-pitch-500 ml-2">Inscription Staff — {clubName}</span>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
