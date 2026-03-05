import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardFeed } from "@/components/dashboard/DashboardFeed"
import { SuggestionsColumn } from "@/components/dashboard/SuggestionsColumn"

export default async function AgentDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "AGENT") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4 sm:p-6 max-w-6xl">
        {/* Layout 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Colonne principale - Feed */}
          <div className="lg:col-span-8">
            <DashboardFeed role="AGENT" />
          </div>

          {/* Colonne droite - Suggestions */}
          <div className="lg:col-span-4 hidden lg:block">
            <SuggestionsColumn role="AGENT" />
          </div>
        </div>
      </div>
    </div>
  )
}
