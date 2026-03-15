// API: User by ID avec statistiques
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    const { id: userId } = await params

    // Ne renvoyer l'email que si c'est l'utilisateur lui-même ou un admin
    const includeEmail = session.user.id === userId || session.user.role === "ADMIN"

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: includeEmail,
        role: true,
        createdAt: true,
        playerProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            displayName: true,
            profilePicture: true,
            coverPhoto: true,
            primaryPosition: true,
            nationality: true,
            bio: true,
            currentClub: true,
            currentLeague: true,
            isPublic: true,
          }
        },
        agentProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
            coverPhoto: true,
            agencyName: true,
            bio: true,
            specialties: true,
            isVerified: true,
          }
        },
        clubProfile: {
          select: {
            id: true,
            clubName: true,
            shortName: true,
            clubType: true,
            logo: true,
            coverPhoto: true,
            country: true,
            city: true,
            league: true,
            bio: true,
            foundedYear: true,
            isVerified: true,
          }
        },
        _count: {
          select: {
            followedBy: true,  // nombre de followers
            following: true,   // nombre de following
            posts: true,       // nombre de posts
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    return handleApiError(error)
  }
}
