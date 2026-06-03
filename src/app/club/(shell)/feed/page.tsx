import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { isClubRole } from "@/lib/utils/role-helpers"
import { prisma } from "@/lib/prisma"
import { getClubForUser } from "@/lib/services/club-members"
import { DashboardFeed } from "@/components/dashboard/DashboardFeed"
import { SuggestionsColumn } from "@/components/dashboard/SuggestionsColumn"

export default async function ClubFeedPage() {
  const session = await auth()

  if (!session || !isClubRole(session.user.role)) {
    redirect("/login")
  }

  const clubInfo = await getClubForUser(session.user.id)
  const club = clubInfo
    ? await prisma.clubProfile.findUnique({
        where: { id: clubInfo.clubProfileId },
        select: { status: true },
      })
    : null
  const clubStatus = club?.status ?? null
  const showOnboardingCard = clubStatus === "DRAFT"

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4 sm:p-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stadium-900 sm:text-3xl">
            Fil d&apos;actualité
          </h1>
          <p className="mt-1 text-sm text-stadium-500">
            Partagez et suivez l&apos;activité de la communauté
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <DashboardFeed
              role="CLUB"
              showOnboardingCard={showOnboardingCard}
              clubStatus={clubStatus}
            />
          </div>

          <div className="lg:col-span-4 hidden lg:block">
            <SuggestionsColumn role="CLUB" />
          </div>
        </div>
      </div>
    </div>
  )
}
