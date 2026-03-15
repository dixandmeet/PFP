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
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const status = searchParams.get("status") || ""
    const entityType = searchParams.get("entityType") || ""
    const search = searchParams.get("search") || ""

    const where: Record<string, unknown> = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (entityType && entityType !== "all") {
      where.entityType = entityType
    }

    if (search) {
      where.OR = [
        { requesterName: { contains: search, mode: "insensitive" } },
        { requesterEmail: { contains: search, mode: "insensitive" } },
        { entityName: { contains: search, mode: "insensitive" } },
      ]
    }

    const [requests, total] = await Promise.all([
      prisma.profileRecoveryRequest.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.profileRecoveryRequest.count({ where }),
    ])

    return NextResponse.json({
      requests,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error("Error fetching recovery requests:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des demandes" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const body = await request.json()
    const { id, status, adminNote } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID et statut requis" },
        { status: 400 }
      )
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide" },
        { status: 400 }
      )
    }

    const updated = await prisma.profileRecoveryRequest.update({
      where: { id },
      data: {
        status,
        adminNote: adminNote || null,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
    })

    return NextResponse.json({
      request: updated,
      message: `Demande ${status === "APPROVED" ? "approuvée" : "rejetée"}`,
    })
  } catch (error) {
    console.error("Error updating recovery request:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la demande" },
      { status: 500 }
    )
  }
}
