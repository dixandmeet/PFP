// API: Posts (social feed)
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { prisma } from "@/lib/prisma"
import { handleApiError, parseBody } from "@/lib/utils/api-helpers"
import { createPostSchema } from "@/lib/validators/schemas"
import { extractMentions, extractHashtags } from "@/lib/utils/post-utils"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const following = searchParams.get("following") === "true"
    const userId = searchParams.get("userId")

    let where: any = {}

    // Filtrer par userId si fourni
    if (userId) {
      where.userId = userId
    } else if (following) {
      try {
        const user = await requireAuth()
        // Posts des personnes suivies
        const follows = await prisma.follow.findMany({
          where: { followerId: user.id },
          select: { followingId: true }
        })
        const followingIds = follows.map(f => f.followingId)
        where.userId = { in: [...followingIds, user.id] }
      } catch {
        // Non authentifié, afficher feed public
      }
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
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
                  displayName: true,
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
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.post.count({ where }),
    ])

    return NextResponse.json({
      posts,
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

export async function POST(request: Request) {
  try {
    const user = await requireAuth()

    const body = await parseBody(request)
    const validatedData = createPostSchema.parse(body)

    // Extraire mentions et hashtags
    const mentionUsernames = extractMentions(validatedData.content)
    const hashtagTags = extractHashtags(validatedData.content)

    // Créer le post
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        content: validatedData.content,
        mediaUrls: validatedData.mediaUrls,
      },
      include: {
        user: {
          select: {
            id: true,
            role: true,
            email: true,
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

    // Traiter les mentions
    if (mentionUsernames.length > 0) {
      // Trouver les utilisateurs mentionnés par email (simplification)
      // Dans une vraie app, on aurait un champ username unique
      const mentionedUsers = await prisma.user.findMany({
        where: {
          email: {
            in: mentionUsernames.map(u => `${u}@example.com`) // Placeholder
          }
        },
        select: { id: true }
      })

      // Créer les mentions
      if (mentionedUsers.length > 0) {
        await prisma.mention.createMany({
          data: mentionedUsers.map(mu => ({
            postId: post.id,
            userId: mu.id
          })),
          skipDuplicates: true
        })

        // Créer des notifications pour les utilisateurs mentionnés
        await prisma.notification.createMany({
          data: mentionedUsers.map(mu => ({
            userId: mu.id,
            type: "MENTION",
            title: "Vous avez été mentionné",
            message: `${user.email} vous a mentionné dans un post`,
            link: `/feed?postId=${post.id}`,
          }))
        })
      }
    }

    // Traiter les hashtags (batch pour éviter N+1)
    if (hashtagTags.length > 0) {
      // Upsert tous les hashtags en parallèle
      const hashtags = await Promise.all(
        hashtagTags.map(tag =>
          prisma.hashtag.upsert({
            where: { tag },
            create: { tag },
            update: {}
          })
        )
      )

      // Lier tous les hashtags au post en une seule opération
      await prisma.postHashtag.createMany({
        data: hashtags.map(hashtag => ({
          postId: post.id,
          hashtagId: hashtag.id
        })),
        skipDuplicates: true
      })
    }

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
