import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { SignatureService } from "@/lib/services/credits"
import { reviewSignatureSchema } from "@/lib/validators/credit-schemas"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["ADMIN"])
    const { id } = await params
    const body = await request.json()
    const { action } = reviewSignatureSchema.parse(body)

    await SignatureService.reviewSignature(id, user.id, action)

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
