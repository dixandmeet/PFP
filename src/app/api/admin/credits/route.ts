import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""
    const walletType = searchParams.get("walletType") || ""
    const transactionType = searchParams.get("transactionType") || ""
    const status = searchParams.get("status") || ""
    const dateFrom = searchParams.get("dateFrom") || ""
    const dateTo = searchParams.get("dateTo") || ""
    const ALLOWED_SORT_FIELDS = ["createdAt", "amount", "type", "status", "walletType"] as const
    const rawSortBy = searchParams.get("sortBy") || "createdAt"
    const sortBy = ALLOWED_SORT_FIELDS.includes(rawSortBy as any) ? rawSortBy : "createdAt"
    const rawSortOrder = searchParams.get("sortOrder") || "desc"
    const sortOrder = rawSortOrder === "asc" ? "asc" : "desc"

    const where: any = {}

    // Filter by wallet type
    if (walletType && walletType !== "all") {
      where.walletType = walletType
    }

    // Filter by transaction type
    if (transactionType && transactionType !== "all") {
      where.type = transactionType
    }

    // Filter by status
    if (status && status !== "all") {
      where.status = status
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) {
        const end = new Date(dateTo)
        end.setHours(23, 59, 59, 999)
        where.createdAt.lte = end
      }
    }

    // Search by user name/email or description
    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ]
    }

    const [transactions, total, stats] = await Promise.all([
      prisma.creditTransaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.creditTransaction.count({ where }),
      // Aggregate stats
      Promise.all([
        prisma.creditTransaction.aggregate({
          where: {
            ...where,
            type: { startsWith: "CREDIT" },
          },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.creditTransaction.aggregate({
          where: {
            ...where,
            type: { startsWith: "DEBIT" },
          },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.creditTransaction.aggregate({
          where: {
            ...where,
            type: "EXPIRATION",
          },
          _sum: { amount: true },
          _count: true,
        }),
        // Total wallet balances
        prisma.wallet.aggregate({
          _sum: { balance: true },
        }),
        prisma.wallet.groupBy({
          by: ["type"],
          _sum: { balance: true },
          _count: true,
        }),
      ]),
    ])

    const [creditAgg, debitAgg, expirationAgg, totalWallets, walletsByType] = stats

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalCredits: creditAgg._sum.amount || 0,
        totalCreditsCount: creditAgg._count,
        totalDebits: debitAgg._sum.amount || 0,
        totalDebitsCount: debitAgg._count,
        totalExpirations: expirationAgg._sum.amount || 0,
        totalExpirationsCount: expirationAgg._count,
        totalWalletBalance: totalWallets._sum.balance || 0,
        walletsByType: walletsByType.map((w) => ({
          type: w.type,
          totalBalance: w._sum.balance || 0,
          count: w._count,
        })),
      },
    })
  } catch (error) {
    console.error("Admin credits API error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
