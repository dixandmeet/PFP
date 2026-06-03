import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { isClubRole } from "@/lib/utils/role-helpers"
import { prisma } from "@/lib/prisma"
import { getClubForUser } from "@/lib/services/club-members"
import { getClubDashboardData } from "@/lib/services/club-dashboard"
import { ClubDashboardExperience } from "@/components/club/dashboard/ClubDashboardExperience"

export default async function ClubDashboard() {
  const session = await auth()

  if (!session || !isClubRole(session.user.role)) {
    redirect("/login")
  }

  const clubInfo = await getClubForUser(session.user.id)
  if (!clubInfo) {
    redirect("/club/onboarding")
  }

  const club = await prisma.clubProfile.findUnique({
    where: { id: clubInfo.clubProfileId },
    select: { status: true },
  })

  const clubStatus = club?.status ?? null
  const showOnboardingCard = clubStatus === "DRAFT"
  const clubActive = clubStatus === "ACTIVE"

  const dashboardData = await getClubDashboardData(clubInfo.clubProfileId)
  if (!dashboardData) {
    redirect("/club/onboarding")
  }

  return (
    <ClubDashboardExperience
      data={dashboardData}
      clubStatus={clubStatus}
      showOnboardingCard={showOnboardingCard}
      clubActive={clubActive}
    />
  )
}
