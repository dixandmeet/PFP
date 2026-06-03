// Layout minimal pour l'onboarding staff (sans sidebar)
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getStaffOnboardingState } from "@/lib/services/staff-onboarding-service"
import { FootballIcon } from "@/components/auth/icons"
import { getDashboardPath } from "@/lib/utils/role-helpers"
import { StaffOnboardingLogoutButton } from "@/components/club/staff-onboarding/StaffOnboardingLogoutButton"

export default async function StaffOnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "CLUB_STAFF") {
    redirect(getDashboardPath(session.user.role))
  }

  const staffState = await getStaffOnboardingState(session.user.id)
  const clubName = staffState.clubName ?? "Inscription Staff"

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pitch-50 via-white to-pitch-50/30">
      <header className="border-b border-pitch-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
            <FootballIcon className="w-8 h-8 rounded-lg" />
            <span className="font-semibold text-pitch-900">Profoot Profile</span>
          </Link>
          <span className="text-sm text-pitch-500 ml-2">
            {staffState.clubName ? `Inscription Staff — ${clubName}` : "Inscription Staff"}
          </span>
        </div>
      </header>
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">{children}</main>
      <footer className="border-t border-pitch-100 bg-white/60 py-4">
        <div className="max-w-4xl mx-auto px-4 flex justify-center">
          <StaffOnboardingLogoutButton />
        </div>
      </footer>
    </div>
  )
}
