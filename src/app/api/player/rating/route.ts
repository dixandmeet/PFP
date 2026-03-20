import { requireAuth } from "@/lib/permissions/rbac"
import { successResponse, handleApiError } from "@/lib/utils/api-helpers"
import { PlayerRatingService } from "@/lib/rating/player-rating.service"

export async function GET() {
  try {
    const user = await requireAuth()
    const rating = await PlayerRatingService.getRating(user.id)

    if (!rating) {
      return successResponse({ rating: null, message: "Aucune évaluation disponible" })
    }

    return successResponse({ rating })
  } catch (error) {
    return handleApiError(error)
  }
}
