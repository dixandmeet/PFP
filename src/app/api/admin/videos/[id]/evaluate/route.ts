import { NextRequest } from "next/server"
import { requireRole } from "@/lib/permissions/rbac"
import { successResponse, handleApiError, parseBody } from "@/lib/utils/api-helpers"
import { evaluateVideoSkillSchema } from "@/lib/validators/rating-schemas"
import { VideoSkillEvaluationService } from "@/lib/rating/video-skill-evaluation.service"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["ADMIN"])
    const { id: videoId } = await params
    const body = await parseBody(request)
    const scores = evaluateVideoSkillSchema.parse(body)

    const result = await VideoSkillEvaluationService.evaluate({
      videoId,
      evaluatorId: user.id,
      scores,
    })

    return successResponse(result, 200)
  } catch (error) {
    return handleApiError(error)
  }
}
