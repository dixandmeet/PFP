// POST /api/posts/[id]/like - Liker un post
// DELETE /api/posts/[id]/like - Unliker un post
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/lib/utils/api-helpers"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Vérifier si le post existe
    const post = await prisma.post.findUnique({
      where: { id },
    })

    if (!post) {
      return NextResponse.json(
        { error: "Post non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier si déjà liké
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId: id,
          userId: session.user.id,
        },
      },
    })

    if (existingLike) {
      return NextResponse.json(
        { error: "Post déjà liké" },
        { status: 400 }
      )
    }

    // Créer le like
    const like = await prisma.like.create({
      data: {
        postId: id,
        userId: session.user.id,
      },
    })

    // Créer une notification pour l'auteur du post (si ce n'est pas lui-même)
    if (post.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: "POST_LIKE",
          title: "Nouveau like",
          message: "Quelqu'un a aimé votre post",
          link: `/player/feed`,
        },
      })
    }

    return NextResponse.json(like, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Supprimer le like
    await prisma.like.delete({
      where: {
        postId_userId: {
          postId: id,
          userId: session.user.id,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
