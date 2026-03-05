import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    await requireRole(["ADMIN"])

    const resolved = request.nextUrl.searchParams.get("resolved")
    const userId = request.nextUrl.searchParams.get("userId")

    const flags = await prisma.fraudFlag.findMany({
      where: {
        ...(resolved !== null ? { isResolved: resolved === "true" } : {}),
        ...(userId ? { userId } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    return NextResponse.json({ flags })
  } catch (error) {
    return handleApiError(error)
  }
}
