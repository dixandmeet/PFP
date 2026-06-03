import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getClubForUser } from "@/lib/services/club-members"
import { getStaffOnboardingState } from "@/lib/services/staff-onboarding-service"
import { LayoutShell } from "@/components/layout/LayoutShell"

export default async function ClubShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) {
    redirect("/login")
  }

  const clubInfo = await getClubForUser(session.user.id)
  const club = clubInfo
    ? await prisma.clubProfile.findUnique({
        where: { id: clubInfo.clubProfileId },
        select: { status: true },
      })
    : null

  if (session.user.role === "CLUB_STAFF") {
    const staffState = await getStaffOnboardingState(session.user.id)
    if (staffState.step !== "DONE") {
      redirect("/club/staff-onboarding")
    }
    if (!clubInfo) {
      redirect("/club/staff-onboarding")
    }
  }

  if (!club) {
    if (session.user.role === "CLUB") {
      redirect("/club/onboarding")
    }
  }

  const clubActive = club?.status === "ACTIVE"
  const clubRole = session.user.role as "CLUB" | "CLUB_STAFF"

  return (
    <LayoutShell
      role={clubRole}
      clubActive={clubActive}
      clubMemberRole={clubInfo?.role}
      mainClassName="flex-1 min-w-0 overflow-y-auto bg-gradient-to-br from-pitch-50 via-white to-pitch-50/30 pitch-pattern"
      searchBorderColor="border-pitch-100"
    >
      {children}
    </LayoutShell>
  )
}
