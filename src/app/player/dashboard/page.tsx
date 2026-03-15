import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardFeed } from "@/components/dashboard/DashboardFeed"
import { SuggestionsColumn } from "@/components/dashboard/SuggestionsColumn"
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar"

export default async function PlayerDashboard() {
  const session = await auth()

  if (!session || session.user.role !== "PLAYER") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl">
        <DashboardTopBar
          title="Dashboard"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-8">
            <DashboardFeed role="PLAYER" />
          </div>

          <div className="lg:col-span-4 hidden lg:block">
            <SuggestionsColumn role="PLAYER" />
          </div>
        </div>
      </div>
    </div>
  )
}
