// API: Reels - Posts contenant des vidéos uniquement
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"

const VIDEO_EXTENSIONS = [
  '.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.3gp', '.m4v', '.ogv'
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const startFromPostId = searchParams.get("startFrom") // Pour ouvrir les reels depuis un post spécifique

    // Récupérer tous les posts avec médias
    const allPosts = await prisma.post.findMany({
      where: {
        mediaUrls: { isEmpty: false }
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
      orderBy: { createdAt: "desc" },
    })

    // Filtrer les posts qui contiennent au moins une vidéo
    // et transformer pour n'avoir qu'une vidéo par "reel"
    const reels: any[] = []
    
    for (const post of allPosts) {
      const videoUrls = (post.mediaUrls as string[]).filter(url => {
        const lowerUrl = url.toLowerCase()
        return VIDEO_EXTENSIONS.some(ext => lowerUrl.includes(ext)) || lowerUrl.includes('video')
      })

      // Chaque vidéo du post devient un reel individuel
      for (const videoUrl of videoUrls) {
        reels.push({
          ...post,
          videoUrl,
          mediaUrls: [videoUrl], // On ne garde que la vidéo pour le reel
        })
      }
    }

    // Si startFrom est spécifié, réorganiser pour commencer à ce post
    let orderedReels = reels
    if (startFromPostId) {
      const startIndex = reels.findIndex(r => r.id === startFromPostId)
      if (startIndex > 0) {
        orderedReels = [...reels.slice(startIndex), ...reels.slice(0, startIndex)]
      }
    }

    // Pagination
    const total = orderedReels.length
    const paginatedReels = orderedReels.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      reels: paginatedReels,
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
