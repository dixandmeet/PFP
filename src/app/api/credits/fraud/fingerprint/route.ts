import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { FraudService } from "@/lib/services/credits"
import { deviceFingerprintSchema } from "@/lib/validators/credit-schemas"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { fingerprint, metadata } = deviceFingerprintSchema.parse(body)

    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null
    const userAgent = request.headers.get("user-agent") || null

    await FraudService.recordFingerprint(
      user.id,
      fingerprint,
      ipAddress,
      userAgent,
      metadata
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
