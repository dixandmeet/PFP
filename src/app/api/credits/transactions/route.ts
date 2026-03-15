import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { TransactionService } from "@/lib/services/credits"
import { transactionHistorySchema } from "@/lib/validators/credit-schemas"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const params = transactionHistorySchema.parse(searchParams)

    const result = await TransactionService.getHistory(user.id, {
      page: params.page,
      limit: params.limit,
      walletType: params.walletType as any,
      type: params.type as any,
      from: params.from,
      to: params.to,
    })

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
