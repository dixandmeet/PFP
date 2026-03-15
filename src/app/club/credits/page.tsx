import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { isClubRole } from "@/lib/utils/role-helpers"
import { CreditsPageClient } from "@/components/credits/CreditsPageClient"

const VALID_TABS = ["overview", "topup", "subscription", "withdrawals", "transactions"]

export default async function ClubCreditsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await auth()
  if (!session || !isClubRole(session.user.role)) {
    redirect("/login")
  }

  const { tab } = await searchParams
  const defaultTab = tab && VALID_TABS.includes(tab) ? tab : "overview"

  return <CreditsPageClient defaultTab={defaultTab} />
}
