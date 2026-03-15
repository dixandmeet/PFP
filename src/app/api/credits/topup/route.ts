import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { StripeService } from "@/lib/services/credits"
import { topUpSchema } from "@/lib/validators/credit-schemas"
import { getBaseUrl } from "@/lib/url"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { credits, returnUrl } = topUpSchema.parse(body)

    const baseUrl = returnUrl || `${getBaseUrl()}/credits`
    const result = await StripeService.createTopUpCheckout(user.id, credits, baseUrl)

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
