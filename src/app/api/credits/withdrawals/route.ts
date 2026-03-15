import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { WithdrawalService } from "@/lib/services/credits"
import { requestWithdrawalSchema } from "@/lib/validators/credit-schemas"
import { prisma } from "@/lib/prisma"
import { notifyAdmins } from "@/lib/notifications/notify-admins"

// GET — lister les retraits de l'utilisateur
export async function GET() {
  try {
    const user = await requireAuth()

    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ withdrawals })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST — demander un retrait
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { amount } = requestWithdrawalSchema.parse(body)

    const result = await WithdrawalService.requestWithdrawal(user.id, amount)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Notifier les admins
    notifyAdmins({
      type: "ADMIN_WITHDRAWAL_REQUEST",
      title: "Retrait à valider",
      message: `Demande de retrait de ${amount} crédits`,
      link: `/admin/withdrawals`,
    }).catch(console.error)

    return NextResponse.json({ withdrawal: result.withdrawal }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
