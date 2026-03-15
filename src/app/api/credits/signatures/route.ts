import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { SignatureService } from "@/lib/services/credits"
import { validateSignatureSchema } from "@/lib/validators/credit-schemas"

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const data = validateSignatureSchema.parse(body)

    const signature = await SignatureService.submitSignature(data)

    return NextResponse.json({ signature }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
