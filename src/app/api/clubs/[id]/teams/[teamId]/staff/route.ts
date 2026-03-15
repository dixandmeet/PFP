// POST /api/clubs/[id]/teams/[teamId]/staff - Ajouter un membre du staff
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { handleApiError } from "@/lib/utils/api-helpers"
import { z } from "zod"

const createStaffSchema = z.object({
  name: z.string().min(2),
  role: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; teamId: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { id, teamId } = await params

    // Vérifier que le club appartient à l'utilisateur
    const clubProfile = await prisma.clubProfile.findUnique({
      where: { id },
    })

    if (!clubProfile) {
      return NextResponse.json(
        { error: "Club non trouvé" },
        { status: 404 }
      )
    }

    if (clubProfile.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      )
    }

    // Vérifier que l'équipe appartient au club
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    })

    if (!team || team.clubProfileId !== id) {
      return NextResponse.json(
        { error: "Équipe non trouvée" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = createStaffSchema.parse(body)

    const staffMember = await prisma.staffMember.create({
      data: {
        teamId,
        ...validatedData,
        email: validatedData.email || null,
      },
    })

    return NextResponse.json(staffMember, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
