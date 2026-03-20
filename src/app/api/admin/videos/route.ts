// GET /api/admin/videos — Lister les vidéos joueur éligibles à l'évaluation
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { FootballVideoSkillCategory, Prisma } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1)
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "20") || 20), 100)
    const skip = (page - 1) * limit

    const category = searchParams.get("category") as FootballVideoSkillCategory | null
    const evaluated = searchParams.get("evaluated") // "true" | "false" | null

    // Uniquement les vidéos AWARDED, hors PORTRAIT et UNSPECIFIED
    const where: Prisma.PlayerFootballVideoWhereInput = {
      status: "AWARDED",
      skillCategory: category
        ? { equals: category }
        : { notIn: ["PORTRAIT", "UNSPECIFIED"] },
    }

    // Filtre évaluation
    if (evaluated === "true") {
      where.skillEvaluation = { isNot: null }
    } else if (evaluated === "false") {
      where.skillEvaluation = { is: null }
    }

    const [videos, total] = await Promise.all([
      prisma.playerFootballVideo.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              playerProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                  primaryPosition: true,
                },
              },
            },
          },
          fileAsset: {
            select: { id: true, url: true, filename: true, mimeType: true },
          },
          skillEvaluation: {
            select: {
              id: true,
              pacScore: true,
              finScore: true,
              tecScore: true,
              visScore: true,
              phyScore: true,
              defScore: true,
              gkScore: true,
              compositeScore: true,
              subCriteria: true,
              evaluatorId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.playerFootballVideo.count({ where }),
    ])

    return NextResponse.json({
      videos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("[API] admin/videos GET error:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
