// API: Résoudre un profil par slug ou ID
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"
import { resolveProfileSlug } from "@/lib/utils/slug.server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Résoudre le slug en userId
    const resolved = await resolveProfileSlug(slug)

    if (!resolved) {
      return NextResponse.json(
        { error: "Profil non trouvé" },
        { status: 404 }
      )
    }

    const { userId } = resolved

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        playerProfile: {
          select: {
            id: true,
            slug: true,
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
            dateOfBirth: true,
            height: true,
            weight: true,
            strongFoot: true,
          }
        },
        agentProfile: {
          select: {
            id: true,
            slug: true,
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
            slug: true,
            clubName: true,
            shortName: true,
            logo: true,
            coverPhoto: true,
            country: true,
            city: true,
            league: true,
            bio: true,
            isVerified: true,
          }
        },
        _count: {
          select: {
            followedBy: true,
            following: true,
            posts: true,
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
