// POST /api/admin/listings — Créer une annonce pour un club (admin)
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseBody } from "@/lib/utils/api-helpers"
import { createListingSchema } from "@/lib/validators/schemas"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await parseBody<Record<string, unknown>>(request)
    const clubProfileId =
      typeof body.clubProfileId === "string" ? body.clubProfileId : null

    if (!clubProfileId) {
      return NextResponse.json({ error: "Club requis" }, { status: 400 })
    }

    const clubProfile = await prisma.clubProfile.findUnique({
      where: { id: clubProfileId },
      select: { id: true },
    })

    if (!clubProfile) {
      return NextResponse.json({ error: "Club introuvable" }, { status: 404 })
    }

    const validatedData = createListingSchema.parse(body)

    const teamId = typeof body.teamId === "string" ? body.teamId : null
    if (teamId) {
      const team = await prisma.team.findFirst({
        where: { id: teamId, clubProfileId },
      })
      if (!team) {
        return NextResponse.json(
          { error: "Équipe invalide ou n'appartient pas à ce club" },
          { status: 400 }
        )
      }
    }

    const createData: Record<string, unknown> = {
      ...validatedData,
      clubProfileId,
      teamId,
    }

    if (createData.startDate && typeof createData.startDate === "string") {
      createData.startDate = new Date(createData.startDate as string)
    }

    const listing = await prisma.listing.create({
      data: createData as Parameters<typeof prisma.listing.create>[0]["data"],
      include: {
        clubProfile: {
          select: {
            id: true,
            clubName: true,
            country: true,
            logo: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        _count: {
          select: {
            applications: true,
            submissions: true,
          },
        },
      },
    })

    return NextResponse.json(listing, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
