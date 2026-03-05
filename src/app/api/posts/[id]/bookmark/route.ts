// API: Sauvegarder/Bookmark un post
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: postId } = await params

    // Vérifier que le post existe
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json(
        { error: "Post non trouvé" },
        { status: 404 }
      )
    }

    // Créer ou récupérer le bookmark
    const bookmark = await prisma.bookmark.upsert({
      where: {
        postId_userId: {
          postId,
          userId: user.id
        }
      },
      create: {
        postId,
        userId: user.id
      },
      update: {}
    })

    return NextResponse.json(bookmark, { status: 201 })
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
    const { id: postId } = await params

    // Supprimer le bookmark
    const bookmark = await prisma.bookmark.deleteMany({
      where: {
        postId,
        userId: user.id
      }
    })

    if (bookmark.count === 0) {
      return NextResponse.json(
        { error: "Bookmark non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
