import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { StripeService } from "@/lib/services/credits"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json().catch(() => ({}))
    const returnUrl = body.returnUrl || `${process.env.NEXTAUTH_URL}/credits/connect`

    const result = await StripeService.createConnectOnboarding(user.id, returnUrl)

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
