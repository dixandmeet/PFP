// Layout minimal pour l'onboarding club (sans sidebar)
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function ClubOnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "CLUB") {
    redirect(
      session.user.role === "ADMIN"
        ? "/admin"
        : `/${session.user.role.toLowerCase()}/dashboard`
    )
  }

  // Si le club est déjà soumis ou actif, rediriger vers le dashboard
  const club = await prisma.clubProfile.findUnique({
    where: { userId: session.user.id },
    select: { status: true },
  })

  if (club && (club.status === "ACTIVE" || club.status === "PENDING_REVIEW")) {
    redirect("/club/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pitch-50 via-white to-pitch-50/30">
      {/* Header minimal */}
      <header className="border-b border-pitch-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pitch-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">PF</span>
          </div>
          <span className="font-semibold text-pitch-900">Profoot Profile</span>
          <span className="text-sm text-pitch-500 ml-2">Enregistrement Club</span>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
