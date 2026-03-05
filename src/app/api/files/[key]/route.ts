// API: File download (presigned URL)
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { generateDownloadUrl, deleteFile } from "@/lib/s3"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key: paramKey } = await params
    // Décoder la clé (peut contenir des slashes)
    const key = decodeURIComponent(paramKey)

    // Récupérer le FileAsset
    const fileAsset = await prisma.fileAsset.findUnique({
      where: { key }
    })

    if (!fileAsset) {
      return NextResponse.json(
        { error: "Fichier non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier les permissions d'accès
    const accessPolicy = fileAsset.accessPolicy as any

    if (!accessPolicy?.public) {
      // Fichier privé, vérifier authentification
      const user = await requireAuth()

      const allowedUsers = accessPolicy?.allowedUsers || []
      if (!allowedUsers.includes(user.id) && fileAsset.ownerId !== user.id) {
        return NextResponse.json(
          { error: "Accès interdit" },
          { status: 403 }
        )
      }
    }

    // Générer URL de téléchargement
    const downloadUrl = await generateDownloadUrl(key)

    return NextResponse.json({ downloadUrl })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const user = await requireAuth()
    const { key: paramKey } = await params
    const key = decodeURIComponent(paramKey)

    const fileAsset = await prisma.fileAsset.findUnique({
      where: { key }
    })

    if (!fileAsset) {
      return NextResponse.json(
        { error: "Fichier non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier ownership
    if (fileAsset.ownerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès interdit" },
        { status: 403 }
      )
    }

    // Supprimer du S3
    await deleteFile(key)

    // Supprimer de la DB
    await prisma.fileAsset.delete({
      where: { key }
    })

    return NextResponse.json({ message: "Fichier supprimé" })
  } catch (error) {
    return handleApiError(error)
  }
}
