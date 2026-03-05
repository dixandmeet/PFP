import { NextResponse } from "next/server"
import { requireRole } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await requireRole(["ADMIN"])

    const [
      totalUsers,
      activeSubscriptions,
      totalWalletBalance,
      pendingWithdrawals,
      completedWithdrawals,
      unresolvedFraudFlags,
      transactionsToday,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.wallet.aggregate({ _sum: { balance: true } }),
      prisma.withdrawal.count({ where: { status: { in: ["PENDING_REVIEW", "APPROVED"] } } }),
      prisma.withdrawal.aggregate({
        where: { status: "COMPLETED" },
        _sum: { netAmount: true },
        _count: true,
      }),
      prisma.fraudFlag.count({ where: { isResolved: false } }),
      prisma.creditTransaction.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ])

    // Répartition par plan
    const subscriptionsByPlan = await prisma.subscription.groupBy({
      by: ["plan"],
      where: { status: "ACTIVE" },
      _count: true,
    })

    return NextResponse.json({
      totalUsers,
      activeSubscriptions,
      totalCreditsInCirculation: totalWalletBalance._sum.balance || 0,
      pendingWithdrawals,
      completedWithdrawals: {
        count: completedWithdrawals._count,
        totalAmountCents: completedWithdrawals._sum.netAmount || 0,
      },
      unresolvedFraudFlags,
      transactionsToday,
      subscriptionsByPlan: subscriptionsByPlan.map((s) => ({
        plan: s.plan,
        count: s._count,
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
