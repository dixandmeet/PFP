import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CreditsPageClient } from "@/components/credits/CreditsPageClient"

const VALID_TABS = ["overview", "topup", "subscription", "withdrawals", "transactions"]

export default async function ClubCreditsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "CLUB") {
    redirect("/login")
  }

  const { tab } = await searchParams
  const defaultTab = tab && VALID_TABS.includes(tab) ? tab : "overview"

  return <CreditsPageClient defaultTab={defaultTab} />
}
