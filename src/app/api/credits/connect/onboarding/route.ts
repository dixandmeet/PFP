import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { StripeService } from "@/lib/services/credits"
import { getBaseUrl } from "@/lib/url"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json().catch(() => ({}))
    const baseUrl = getBaseUrl()
    // Validate returnUrl is a relative path to prevent open redirect
    const safePath = typeof body.returnUrl === 'string' && /^\/[a-zA-Z0-9]/.test(body.returnUrl)
      ? body.returnUrl
      : '/credits/connect'
    const returnUrl = `${baseUrl}${safePath}`

    const result = await StripeService.createConnectOnboarding(user.id, returnUrl)

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
