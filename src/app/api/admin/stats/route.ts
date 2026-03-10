import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé. Rôle requis: ADMIN" },
        { status: 403 }
      )
    }

    // Date calculations
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Parallel queries for better performance
    const [
      // User counts by role
      totalUsers,
      playerCount,
      agentCount,
      clubCount,
      adminCount,
      
      // New users in last 7 days
      newUsersLast7Days,
      newUsersLast30Days,
      
      // Content stats
      totalPosts,
      postsLast7Days,
      totalComments,
      
      // Listings stats
      totalListings,
      activeListings,
      
      // Applications stats
      totalApplications,
      pendingApplications,
      
      // Submissions stats
      totalSubmissions,
      
      // AI audit stats
      totalAuditLogs,
      auditLogsLast7Days,
      
      // Daily signups for chart (last 7 days)
      dailySignups,
    ] = await Promise.all([
      // Users
      prisma.user.count(),
      prisma.user.count({ where: { role: "PLAYER" } }),
      prisma.user.count({ where: { role: "AGENT" } }),
      prisma.user.count({ where: { role: "CLUB" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      
      // New users
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      
      // Content
      prisma.post.count(),
      prisma.post.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.comment.count(),
      
      // Listings
      prisma.listing.count(),
      prisma.listing.count({ where: { status: "PUBLISHED" } }),
      
      // Applications
      prisma.application.count(),
      prisma.application.count({ where: { status: "SUBMITTED" } }),
      
      // Submissions
      prisma.submission.count(),
      
      // Audit
      prisma.auditLog.count(),
      prisma.auditLog.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      
      // Daily signups
      prisma.$queryRaw<Array<{ date: Date; count: bigint }>>(
        Prisma.sql`
          SELECT 
            DATE("createdAt") as date,
            COUNT(*) as count
          FROM "User"
          WHERE "createdAt" >= ${sevenDaysAgo}
          GROUP BY DATE("createdAt")
          ORDER BY date ASC
        `
      ),
    ])

    // Calculate growth percentages
    const previousWeekUsers = newUsersLast30Days - newUsersLast7Days
    const userGrowth = previousWeekUsers > 0 
      ? Math.round(((newUsersLast7Days - previousWeekUsers) / previousWeekUsers) * 100)
      : 100

    // Format daily signups for chart
    const signupChart = dailySignups.map((day) => ({
      date: day.date,
      count: Number(day.count),
    }))

    // Recent activity - latest users
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        image: true,
      },
    })

    // Recent posts
    const recentPosts = await prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    // Recent AI actions
    const recentAIActions = await prisma.auditLog.findMany({
      take: 5,
      where: {
        action: {
          startsWith: "AI_",
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    const responseData = {
      users: {
        total: totalUsers,
        byRole: {
          players: playerCount,
          agents: agentCount,
          clubs: clubCount,
          admins: adminCount,
        },
        newLast7Days: newUsersLast7Days,
        growth: userGrowth,
        signupChart,
        recent: recentUsers,
      },
      content: {
        totalPosts,
        postsLast7Days,
        totalComments,
        recentPosts,
      },
      listings: {
        total: totalListings,
        active: activeListings,
        closed: totalListings - activeListings,
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
      },
      submissions: {
        total: totalSubmissions,
      },
      audit: {
        total: totalAuditLogs,
        last7Days: auditLogsLast7Days,
        recentAI: recentAIActions,
      },
    }

    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des statistiques",
      },
      { status: 500 }
    )
  }
}
