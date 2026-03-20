import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { PlayerGamificationService } from "@/lib/gamification/player-gamification.service"

export async function GET() {
  try {
    const user = await requireAuth()
    const payload = await PlayerGamificationService.listFootballVideos(user.id)
    return NextResponse.json(payload)
  } catch (e) {
    return handleApiError(e)
  }
}
