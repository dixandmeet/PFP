// API: Modifier et supprimer un post
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseBody } from "@/lib/utils/api-helpers"
import { updatePostSchema } from "@/lib/validators/schemas"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            playerProfile: {
              select: {
                firstName: true,
                lastName: true,
                primaryPosition: true,
                profilePicture: true,
              }
            },
            agentProfile: {
              select: {
                firstName: true,
                lastName: true,
                agencyName: true,
                profilePicture: true,
              }
            },
            clubProfile: {
              select: {
                clubName: true,
                logo: true,
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          }
        }
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: "Post non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
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
    const { id: postId } = await params

    const body = await parseBody(request)
    const validatedData = updatePostSchema.parse(body)

    // Récupérer le post
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

    // Vérifier les permissions: auteur ou admin
    if (post.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission de modifier ce post" },
        { status: 403 }
      )
    }

    // Mettre à jour le post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        content: validatedData.content,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            playerProfile: {
              select: {
                firstName: true,
                lastName: true,
                profilePicture: true,
              }
            },
            agentProfile: {
              select: {
                firstName: true,
                lastName: true,
                profilePicture: true,
              }
            },
            clubProfile: {
              select: {
                clubName: true,
                logo: true,
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          }
        }
      }
    })

    return NextResponse.json(updatedPost)
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

    // Récupérer le post
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

    // Vérifier les permissions: auteur ou admin
    if (post.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Vous n'avez pas la permission de supprimer ce post" },
        { status: 403 }
      )
    }

    // Supprimer le post (cascade va supprimer commentaires, likes, etc.)
    await prisma.post.delete({
      where: { id: postId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
