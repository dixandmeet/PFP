import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { PlayerGamificationService } from "@/lib/gamification/player-gamification.service"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const user = await requireAuth()
    const { videoId } = await params
    const result = await PlayerGamificationService.deleteFootballVideo(
      user.id,
      videoId
    )
    return NextResponse.json(result)
  } catch (e) {
    return handleApiError(e)
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const user = await requireAuth()
    const { videoId } = await params
    const result = await PlayerGamificationService.restoreFootballVideo(
      user.id,
      videoId
    )
    return NextResponse.json(result)
  } catch (e) {
    return handleApiError(e)
  }
}
