// GET /api/admin/clubs — Lister les clubs (filtrable par status)
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ClubStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const status = request.nextUrl.searchParams.get("status") as ClubStatus | null
    const page = parseInt(request.nextUrl.searchParams.get("page") || "1")
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const where = status ? { status } : {}

    const [clubs, total] = await Promise.all([
      prisma.clubProfile.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          kycDocuments: {
            select: { id: true, type: true, filename: true, uploadedAt: true },
          },
          _count: {
            select: { kycDocuments: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.clubProfile.count({ where }),
    ])

    return NextResponse.json({
      clubs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[API] admin/clubs GET error:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
