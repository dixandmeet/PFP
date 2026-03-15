import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { WithdrawalService } from "@/lib/services/credits"

// DELETE — annuler un retrait
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    await WithdrawalService.cancelWithdrawal(id, user.id)

    return NextResponse.json({ success: true, message: "Retrait annulé" })
  } catch (error) {
    return handleApiError(error)
  }
}
