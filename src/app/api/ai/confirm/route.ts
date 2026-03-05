// API: AI Confirm action (two-step)
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError, parseBody } from "@/lib/utils/api-helpers"
import { executeAIAction } from "@/lib/ai/executor"
import { z } from "zod"

const confirmRequestSchema = z.object({
  pendingActionId: z.string(),
})

export async function POST(request: Request) {
  try {
    const user = await requireAuth()

    const body = await parseBody(request)
    const { pendingActionId } = confirmRequestSchema.parse(body)

    // Exécuter l'action
    const result = await executeAIAction(pendingActionId, user.id)

    return NextResponse.json({
      success: true,
      result,
      message: result.message || "Action exécutée avec succès",
    })

  } catch (error) {
    return handleApiError(error)
  }
}
