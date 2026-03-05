// POST /api/onboarding/club/[id]/kyc/presign — Générer une URL presigned pour upload S3
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { kycPresignSchema } from "@/lib/validators/club-onboarding-schemas"
import { generateUploadUrl, generateFileKey } from "@/lib/s3"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { id: clubId } = await context.params

    // Vérifier ownership
    const club = await prisma.clubProfile.findUnique({
      where: { id: clubId },
      select: { id: true, userId: true, status: true },
    })

    if (!club) {
      return NextResponse.json({ error: "Club introuvable" }, { status: 404 })
    }

    if (club.userId !== session.user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Seuls les clubs DRAFT ou REJECTED peuvent uploader des docs
    if (!["DRAFT", "REJECTED"].includes(club.status)) {
      return NextResponse.json(
        { error: "Les documents ne peuvent pas être modifiés dans l'état actuel du club" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const parsed = kycPresignSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { docType, filename, mime, size } = parsed.data

    // Générer la clé S3
    const key = generateFileKey(
      `clubs/${clubId}/kyc`,
      `${docType}-${filename}`
    )

    // Générer l'URL presigned
    const uploadUrl = await generateUploadUrl(key, mime)

    return NextResponse.json({
      success: true,
      uploadUrl,
      key,
      docType,
      filename,
      mime,
      size,
    })
  } catch (error) {
    console.error("[API] onboarding/club/[id]/kyc/presign error:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
