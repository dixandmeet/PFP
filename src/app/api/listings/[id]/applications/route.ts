// GET /api/listings/[id]/applications — Candidatures pour une annonce (club / admin)
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"
import { isClubRole } from "@/lib/utils/role-helpers"

async function canAccessListingApplications(
  userId: string,
  role: string,
  listing: { clubProfileId: string; clubProfile: { userId: string } }
): Promise<boolean> {
  if (role === "ADMIN") return true
  if (userId === listing.clubProfile.userId) return true
  if (isClubRole(role)) {
    const ownClub = await prisma.clubProfile.findUnique({
      where: { userId },
      select: { id: true },
    })
    if (ownClub?.id === listing.clubProfileId) return true
    const membership = await prisma.clubMember.findFirst({
      where: {
        clubProfileId: listing.clubProfileId,
        userId,
        status: "ACTIVE",
      },
    })
    return !!membership
  }
  return false
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { id: listingId } = await params

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        clubProfileId: true,
        clubProfile: { select: { userId: true } },
      },
    })

    if (!listing) {
      return NextResponse.json({ error: "Annonce non trouvée" }, { status: 404 })
    }

    const allowed = await canAccessListingApplications(
      session.user.id,
      session.user.role,
      listing
    )
    if (!allowed) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const applications = await prisma.application.findMany({
      where: { listingId },
      include: {
        playerProfile: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            displayName: true,
            profilePicture: true,
            primaryPosition: true,
            nationality: true,
            dateOfBirth: true,
            currentClub: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ applications })
  } catch (error) {
    return handleApiError(error)
  }
}
