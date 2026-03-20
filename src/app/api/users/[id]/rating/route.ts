import { NextRequest } from "next/server"
import { successResponse, handleApiError } from "@/lib/utils/api-helpers"
import { PlayerRatingService } from "@/lib/rating/player-rating.service"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const rating = await PlayerRatingService.getRating(userId)

    if (!rating) {
      return successResponse({ rating: null })
    }

    // Réponse publique (pas de données sensibles dans PlayerRating)
    return successResponse({
      rating: {
        pac: rating.pac,
        fin: rating.fin,
        tec: rating.tec,
        vis: rating.vis,
        phy: rating.phy,
        def: rating.def,
        gk: rating.gk,
        ovr: rating.ovr,
        ratingPosition: rating.ratingPosition,
        evaluatedVideoCount: rating.evaluatedVideoCount,
        confidenceLevel: rating.confidenceLevel,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
