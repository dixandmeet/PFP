// Layout minimal pour l'onboarding club (sans sidebar)
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { FootballIcon } from "@/components/auth/icons"
import { getDashboardPath } from "@/lib/utils/role-helpers"

export default async function ClubOnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  // Les CLUB_STAFF doivent aller sur l'onboarding staff
  if (session.user.role === "CLUB_STAFF") {
    redirect("/club/staff-onboarding")
  }

  if (session.user.role !== "CLUB") {
    redirect(getDashboardPath(session.user.role))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pitch-50 via-white to-pitch-50/30">
      {/* Header minimal */}
      <header className="border-b border-pitch-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
            <FootballIcon className="w-8 h-8 rounded-lg" />
            <span className="font-semibold text-pitch-900">Profoot Profile</span>
          </Link>
          <span className="text-sm text-pitch-500 ml-2">Enregistrement Club</span>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
