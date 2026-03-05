import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"

export async function GET() {
  try {
    const user = await requireAuth()

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: user.id },
    })

    const reports = await prisma.playerReport.findMany({
      where: {
        OR: [
          ...(playerProfile
            ? [
                { authorId: playerProfile.id },
                { subjectId: playerProfile.id },
              ]
            : []),
        ],
        status: { in: ["APPROVED", "DRAFT"] },
      },
      select: {
        id: true,
        title: true,
        status: true,
        authorType: true,
        version: true,
        createdAt: true,
        subject: {
          select: { firstName: true, lastName: true },
        },
        author: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ reports })
  } catch (error) {
    return handleApiError(error)
  }
}
