// API: Commentaires sur un post
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseBody } from "@/lib/utils/api-helpers"
import { createCommentSchema } from "@/lib/validators/schemas"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

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

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId },
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
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "asc" }, // Plus anciens d'abord
      }),
      prisma.comment.count({ where: { postId } }),
    ])

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
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
    const { id: postId } = await params

    const body = await parseBody(request)
    const validatedData = createCommentSchema.parse(body)

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

    // Créer le commentaire
    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: user.id,
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
        }
      }
    })

    // Créer une notification pour l'auteur du post (si ce n'est pas lui-même)
    if (post.userId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: "POST_COMMENT",
          title: "Nouveau commentaire",
          message: `${user.email} a commenté votre post`,
          link: `/feed?postId=${postId}`,
        }
      })
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
