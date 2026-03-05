import { NextResponse } from "next/server"
import { requireRole } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { ExpirationService } from "@/lib/services/credits"

export async function POST() {
  try {
    await requireRole(["ADMIN"])

    const result = await ExpirationService.runAnnualExpiration()

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
