// API: Supprimer un commentaire
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const user = await requireAuth()
    const { commentId } = await params

    // Récupérer le commentaire
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        userId: true,
        postId: true,
        post: {
          select: {
            userId: true
          }
        }
      }
    })

    if (!comment) {
      return NextResponse.json(
        { error: "Commentaire non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier les permissions: auteur du commentaire, auteur du post, ou admin
    const isAuthor = comment.userId === user.id
    const isPostAuthor = comment.post.userId === user.id
    const isAdmin = user.role === "ADMIN"

    if (!isAuthor && !isPostAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission de supprimer ce commentaire" },
        { status: 403 }
      )
    }

    // Supprimer le commentaire
    await prisma.comment.delete({
      where: { id: commentId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
