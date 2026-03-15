// API: Notifications
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"

export async function GET(request: Request) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    const where: any = {
      userId: user.id,
    }

    if (unreadOnly) {
      where.isRead = false
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.notification.count({
        where: {
          userId: user.id,
          isRead: false,
        }
      }),
    ])

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
