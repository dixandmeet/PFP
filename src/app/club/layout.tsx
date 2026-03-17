import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getClubForUser } from "@/lib/services/club-members"
import { isClubRole } from "@/lib/utils/role-helpers"
import { LayoutShell } from "@/components/layout/LayoutShell"

export default async function ClubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (!isClubRole(session.user.role)) {
    redirect(session.user.role === "ADMIN" ? "/admin" : `/${session.user.role.toLowerCase()}/dashboard`)
  }

  // Routes spéciales : pas de sidebar
  const headersList = await headers()
  const pathname = headersList.get("x-next-pathname") || ""
  const isOnboardingRoute = pathname.startsWith("/club/onboarding")
  const isStaffOnboardingRoute = pathname.startsWith("/club/staff-onboarding")

  // Résoudre le club via ownership OU membership (membres invités)
  const clubInfo = await getClubForUser(session.user.id)
  const club = clubInfo
    ? await prisma.clubProfile.findUnique({
        where: { id: clubInfo.clubProfileId },
        select: { status: true },
      })
    : null

  // CLUB_STAFF : forcer l'onboarding staff si pas terminé
  if (session.user.role === "CLUB_STAFF" && !isStaffOnboardingRoute) {
    const member = await prisma.clubMember.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
      select: { staffOnboardingStep: true },
    })
    if (member && member.staffOnboardingStep && member.staffOnboardingStep !== "DONE") {
      redirect("/club/staff-onboarding")
    }
  }

  // Pas de club du tout → rediriger vers onboarding (CLUB) ou accueil (CLUB_STAFF)
  if (!club && !isOnboardingRoute && !isStaffOnboardingRoute) {
    if (session.user.role === "CLUB_STAFF") {
      redirect("/welcome")
    }
    redirect("/club/onboarding")
  }

  const clubActive = club?.status === "ACTIVE"

  const clubRole = session.user.role as "CLUB" | "CLUB_STAFF"

  return (
    <LayoutShell
      role={clubRole}
      clubActive={clubActive}
      mainClassName="flex-1 min-w-0 overflow-y-auto bg-gradient-to-br from-pitch-50 via-white to-pitch-50/30 pitch-pattern"
      searchBorderColor="border-pitch-100"
    >
      {children}
    </LayoutShell>
  )
}
