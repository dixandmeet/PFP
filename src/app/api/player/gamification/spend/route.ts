import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError, parseBody } from "@/lib/utils/api-helpers"
import { gamificationSpendSchema } from "@/lib/validators/gamification-schemas"
import { PlayerGamificationService } from "@/lib/gamification/player-gamification.service"
import { InsufficientBalanceError } from "@/lib/services/credits/types"

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await parseBody(request)
    const data = gamificationSpendSchema.parse(body)

    const result = await PlayerGamificationService.spend(
      user.id,
      user.role,
      data.action,
      {
        referenceId: data.referenceId,
        idempotencyKey: data.idempotencyKey,
      }
    )

    return NextResponse.json(result)
  } catch (e) {
    if (e instanceof InsufficientBalanceError) {
      return NextResponse.json(
        {
          error: e.message,
          insufficientCredits: true,
        },
        { status: 402 }
      )
    }
    return handleApiError(e)
  }
}
