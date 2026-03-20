import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError, parseBody } from "@/lib/utils/api-helpers"
import { finalizeFootballVideoSchema } from "@/lib/validators/gamification-schemas"
import { PlayerGamificationService } from "@/lib/gamification/player-gamification.service"

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await parseBody(request)
    const data = finalizeFootballVideoSchema.parse(body)

    const result = await PlayerGamificationService.finalizeFootballVideo({
      userId: user.id,
      role: user.role,
      fileAssetId: data.fileAssetId,
      durationSeconds: data.durationSeconds,
      width: data.width,
      height: data.height,
      context: data.context,
      skillCategory: data.skillCategory,
    })

    return NextResponse.json(result)
  } catch (e) {
    return handleApiError(e)
  }
}
