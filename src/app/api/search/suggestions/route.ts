// API: Suggestions aléatoires de clubs, joueurs et agents
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

type SuggestionType = "all" | "clubs" | "players" | "agents"

// Fonction pour mélanger un tableau (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const currentUserId = session?.user?.id

    const { searchParams } = new URL(request.url)
    const type = (searchParams.get("type") as SuggestionType) || "all"
    const limit = Math.min(parseInt(searchParams.get("limit") || "6"), 20)

    const results: {
      clubs: any[]
      players: any[]
      agents: any[]
      footballTeams: any[]
      footballPlayers: any[]
    } = {
      clubs: [],
      players: [],
      agents: [],
      footballTeams: [],
      footballPlayers: [],
    }

    // Récupérer les IDs des entités suivies par l'utilisateur actuel
    let followedIds: Set<string> = new Set()
    if (currentUserId) {
      const follows = await prisma.entityFollow.findMany({
        where: { userId: currentUserId },
        select: { entityId: true },
      })
      followedIds = new Set(follows.map(f => f.entityId))
    }

    // Récupérer les clubs (profils utilisateurs)
    if (type === "all" || type === "clubs") {
      const clubs = await prisma.clubProfile.findMany({
        take: limit * 3, // Prendre plus pour avoir de la variété après le shuffle
        select: {
          id: true,
          userId: true,
          clubName: true,
          shortName: true,
          logo: true,
          league: true,
          country: true,
          isVerified: true,
        },
        orderBy: { createdAt: "desc" },
      })
      results.clubs = shuffleArray(clubs).slice(0, limit).map(club => ({
        ...club,
        isFollowing: followedIds.has(club.id),
        entityType: "CLUB",
      }))

      // Récupérer aussi des équipes football de la BDD
      const footballTeams = await prisma.footballTeam.findMany({
        take: limit * 3,
        select: {
          id: true,
          name: true,
          shortName: true,
          logo: true,
          league: true,
          country: true,
          sportsDbId: true,
        },
        orderBy: { createdAt: "desc" },
      })
      results.footballTeams = shuffleArray(footballTeams).slice(0, limit).map(team => ({
        ...team,
        isFollowing: followedIds.has(team.id),
        entityType: "CLUB",
      }))
    }

    // Récupérer les joueurs (profils utilisateurs)
    if (type === "all" || type === "players") {
      const players = await prisma.playerProfile.findMany({
        where: { isSearchable: true },
        take: limit * 3,
        select: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          displayName: true,
          primaryPosition: true,
          profilePicture: true,
          currentClub: true,
          nationality: true,
        },
        orderBy: { createdAt: "desc" },
      })
      results.players = shuffleArray(players).slice(0, limit).map(player => ({
        ...player,
        isFollowing: followedIds.has(player.id),
        entityType: "PLAYER",
      }))

      // Récupérer aussi des joueurs football de la BDD
      const footballPlayers = await prisma.footballPlayer.findMany({
        take: limit * 3,
        select: {
          id: true,
          name: true,
          position: true,
          nationality: true,
          image: true,
          cutout: true,
          teamName: true,
          sportsDbId: true,
        },
        orderBy: { createdAt: "desc" },
      })
      results.footballPlayers = shuffleArray(footballPlayers).slice(0, limit).map(player => ({
        ...player,
        isFollowing: followedIds.has(player.id),
        entityType: "PLAYER",
      }))
    }

    // Récupérer les agents
    if (type === "all" || type === "agents") {
      const agents = await prisma.agentProfile.findMany({
        take: limit * 3,
        select: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          agencyName: true,
          profilePicture: true,
          isVerified: true,
        },
        orderBy: { createdAt: "desc" },
      })
      results.agents = shuffleArray(agents).slice(0, limit).map(agent => ({
        ...agent,
        isFollowing: followedIds.has(agent.id),
        entityType: "AGENT",
      }))
    }

    return NextResponse.json(results)
  } catch (error) {
    return handleApiError(error)
  }
}
