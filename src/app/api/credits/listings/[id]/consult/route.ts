import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { ListingBillingService, FraudService } from "@/lib/services/credits"
import { checkCreditRateLimit } from "@/lib/middleware/credit-rate-limit"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: listingId } = await params

    // Rate limit
    const rateCheck = checkCreditRateLimit(user.id, "LISTING_CONSULT")
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Trop de requêtes. Réessayez plus tard.", retryAfter: rateCheck.retryAfter },
        { status: 429 }
      )
    }

    // Anti-fraude
    const blocked = await FraudService.isBlocked(user.id)
    if (blocked) {
      return NextResponse.json({ error: "Compte temporairement restreint" }, { status: 403 })
    }

    const result = await ListingBillingService.consultListing(user.id, listingId)

    if (result.alreadyConsulted) {
      return NextResponse.json({ alreadyConsulted: true, cost: 0 })
    }

    if (result.insufficientBalance) {
      return NextResponse.json(
        { error: "Solde insuffisant", cost: result.cost },
        { status: 402 }
      )
    }

    return NextResponse.json({ success: true, cost: result.cost })
  } catch (error) {
    return handleApiError(error)
  }
}
