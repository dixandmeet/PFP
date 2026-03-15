// API: Player detail & update
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseBody } from "@/lib/utils/api-helpers"
import { updatePlayerProfileSchema } from "@/lib/validators/schemas"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const player = await prisma.playerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          }
        },
        careerEntries: {
          orderBy: { startDate: "desc" }
        },
        _count: {
          select: {
            applications: true,
            mandates: true,
          }
        }
      }
    })

    if (!player) {
      return NextResponse.json(
        { error: "Joueur non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier si le profil est public ou si c'est le propriétaire
    if (!player.isPublic) {
      try {
        const user = await requireAuth()
        if (user.id !== player.userId && user.role !== "ADMIN") {
          return NextResponse.json(
            { error: "Profil privé" },
            { status: 403 }
          )
        }
      } catch {
        return NextResponse.json(
          { error: "Profil privé" },
          { status: 403 }
        )
      }
    }

    return NextResponse.json(player)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()

    const { id } = await params

    // Vérifier ownership
    const existingProfile = await prisma.playerProfile.findUnique({
      where: { id }
    })

    if (!existingProfile) {
      return NextResponse.json(
        { error: "Joueur non trouvé" },
        { status: 404 }
      )
    }

    if (existingProfile.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès interdit" },
        { status: 403 }
      )
    }

    const body = await parseBody(request)
    const validatedData = updatePlayerProfileSchema.parse(body)

    // Convertir dateOfBirth si string
    const updateData: any = { ...validatedData }
    if (updateData.dateOfBirth && typeof updateData.dateOfBirth === "string") {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth)
    }

    console.log("[PFP] Player PATCH - profilePicture:", updateData.profilePicture, "coverPhoto:", updateData.coverPhoto)

    const updatedProfile = await prisma.playerProfile.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    return handleApiError(error)
  }
}
