import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const role = searchParams.get("role") || ""
    const search = searchParams.get("search") || ""
    const verified = searchParams.get("verified")

    // Build where clause
    const where: any = {}
    
    if (role) {
      const roles = role.split(",").filter(Boolean) as Role[]
      if (roles.length === 1) {
        where.role = roles[0]
      } else if (roles.length > 1) {
        where.role = { in: roles }
      }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    // Get total count
    const total = await prisma.user.count({ where })

    // Get users with profiles
    const users = await prisma.user.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        emailVerified: true,
        playerProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            currentClub: true,
            primaryPosition: true,
          },
        },
        agentProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            agencyName: true,
            isVerified: true,
          },
        },
        clubProfile: {
          select: {
            id: true,
            clubName: true,
            country: true,
            league: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            posts: true,
          },
        },
      },
    })

    return NextResponse.json({
      users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    )
  }
}
