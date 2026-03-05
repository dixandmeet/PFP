// API: Partager un post
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseBody } from "@/lib/utils/api-helpers"
import { sharePostSchema } from "@/lib/validators/schemas"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: postId } = await params

    const body = await parseBody(request)
    const validatedData = sharePostSchema.parse(body)

    // Vérifier que le post existe
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true }
    })

    if (!post) {
      return NextResponse.json(
        { error: "Post non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier si déjà partagé
    const existingShare = await prisma.share.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: user.id
        }
      }
    })

    if (existingShare) {
      return NextResponse.json(
        { error: "Vous avez déjà partagé ce post" },
        { status: 400 }
      )
    }

    // Créer le partage
    const share = await prisma.share.create({
      data: {
        postId,
        userId: user.id,
        comment: validatedData.comment,
      }
    })

    // Créer une notification pour l'auteur du post (si ce n'est pas lui-même)
    if (post.userId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: "POST_SHARE",
          title: "Post partagé",
          message: `${user.email} a partagé votre post`,
          link: `/feed?postId=${postId}`,
        }
      })
    }

    return NextResponse.json(share, { status: 201 })
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

    // Supprimer le partage
    const share = await prisma.share.deleteMany({
      where: {
        postId,
        userId: user.id
      }
    })

    if (share.count === 0) {
      return NextResponse.json(
        { error: "Partage non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
