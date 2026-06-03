import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"
import { resolveClubContext } from "@/lib/services/club-reports"
import {
  generateClubSlug,
  getTeamData,
  getMockMatches,
} from "@/lib/services/thesportsdb"

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const ctx = await resolveClubContext(session.user.id, session.user.role)
    if (!ctx) {
      return NextResponse.json({ error: "Club non actif ou introuvable" }, { status: 403 })
    }

    const clubProfile = await prisma.clubProfile.findUnique({
      where: { id: ctx.clubProfileId },
      select: { clubName: true },
    })

    if (!clubProfile) {
      return NextResponse.json({ error: "Club introuvable" }, { status: 404 })
    }

    const clubSlug = generateClubSlug(clubProfile.clubName)
    const teamData = await getTeamData(clubSlug)
    const fallback = getMockMatches(clubSlug)

    const upcoming =
      teamData?.upcomingMatches?.length
        ? teamData.upcomingMatches
        : fallback.upcomingMatches
    const lastResults =
      teamData?.lastResults?.length ? teamData.lastResults : fallback.lastResults

    return NextResponse.json({
      upcomingMatches: upcoming,
      lastResults,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
