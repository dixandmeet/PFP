import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { ListingBillingService } from "@/lib/services/credits"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: listingId } = await params

    const consulted = await ListingBillingService.hasConsulted(user.id, listingId)
    const cost = ListingBillingService.getCostByDivision(null) // Le coût exact sera calculé côté client

    return NextResponse.json({ consulted, cost })
  } catch (error) {
    return handleApiError(error)
  }
}
