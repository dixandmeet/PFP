// API: Player career entries
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseBody } from "@/lib/utils/api-helpers"
import { createCareerEntrySchema } from "@/lib/validators/schemas"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id } = await params

    const entries = await prisma.careerEntry.findMany({
      where: { playerProfileId: id },
      orderBy: { startDate: "desc" },
    })

    return NextResponse.json({ entries })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()

    const { id } = await params

    // Vérifier ownership
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { id }
    })

    if (!playerProfile) {
      return NextResponse.json(
        { error: "Joueur non trouvé" },
        { status: 404 }
      )
    }

    if (playerProfile.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès interdit" },
        { status: 403 }
      )
    }

    const body = await parseBody(request)
    const validatedData = createCareerEntrySchema.parse(body)

    // Convertir dates si strings
    const createData: any = { ...validatedData, playerProfileId: id }
    if (typeof createData.startDate === "string") {
      createData.startDate = new Date(createData.startDate)
    }
    if (createData.endDate && typeof createData.endDate === "string") {
      createData.endDate = new Date(createData.endDate)
    }

    const careerEntry = await prisma.careerEntry.create({
      data: createData,
    })

    return NextResponse.json(careerEntry, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get("entryId")

    if (!entryId) {
      return NextResponse.json(
        { error: "ID de l'entrée requis" },
        { status: 400 }
      )
    }

    const entry = await prisma.careerEntry.findUnique({
      where: { id: entryId },
      include: { playerProfile: { select: { userId: true } } }
    })

    if (!entry) {
      return NextResponse.json(
        { error: "Entrée non trouvée" },
        { status: 404 }
      )
    }

    if (entry.playerProfile.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès interdit" },
        { status: 403 }
      )
    }

    await prisma.careerEntry.delete({
      where: { id: entryId }
    })

    return NextResponse.json({ message: "Entrée supprimée" })
  } catch (error) {
    return handleApiError(error)
  }
}
