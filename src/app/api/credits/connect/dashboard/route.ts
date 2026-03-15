import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { StripeService } from "@/lib/services/credits"

export async function GET() {
  try {
    const user = await requireAuth()
    const result = await StripeService.createConnectDashboardLink(user.id)

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
