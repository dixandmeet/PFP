import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DashboardFeed } from "@/components/dashboard/DashboardFeed"
import { SuggestionsColumn } from "@/components/dashboard/SuggestionsColumn"

export default async function ClubDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "CLUB") {
    redirect("/login")
  }

  const club = await prisma.clubProfile.findUnique({
    where: { userId: session.user.id },
    select: { status: true },
  })
  const clubStatus = club?.status || null
  const showOnboardingCard = clubStatus === "DRAFT"

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4 sm:p-6 max-w-6xl">
        {/* Layout 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Colonne principale - Feed */}
          <div className="lg:col-span-8">
            <DashboardFeed role="CLUB" showOnboardingCard={showOnboardingCard} clubStatus={clubStatus} />
          </div>

          {/* Colonne droite - Suggestions */}
          <div className="lg:col-span-4 hidden lg:block">
            <SuggestionsColumn role="CLUB" />
          </div>
        </div>
      </div>
    </div>
  )
}
