import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "50")
    const action = searchParams.get("action") || ""
    const userId = searchParams.get("userId") || ""
    const aiOnly = searchParams.get("aiOnly") === "true"

    // Build where clause
    const where: any = {}
    
    if (action) {
      where.action = { contains: action, mode: "insensitive" }
    }
    
    if (userId) {
      where.userId = userId
    }
    
    if (aiOnly) {
      where.action = {
        startsWith: "AI_",
      }
    }

    // Get total count
    const total = await prisma.auditLog.count({ where })

    // Get audit logs
    const logs = await prisma.auditLog.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            image: true,
          },
        },
      },
    })

    // Get unique actions for filtering
    const actionTypes = await prisma.auditLog.groupBy({
      by: ["action"],
      _count: {
        action: true,
      },
      orderBy: {
        _count: {
          action: "desc",
        },
      },
      take: 20,
    })

    return NextResponse.json({
      logs,
      actionTypes: actionTypes.map((a) => ({
        action: a.action,
        count: a._count.action,
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des logs d'audit" },
      { status: 500 }
    )
  }
}
