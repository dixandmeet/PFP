import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PlayerDashboardExperience } from "@/components/dashboard/player/PlayerDashboardExperience"

export default async function PlayerDashboard() {
  const session = await auth()

  if (!session || session.user.role !== "PLAYER") {
    redirect("/login")
  }

  return <PlayerDashboardExperience />
}
