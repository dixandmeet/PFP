// API: Recherche unifiée (joueurs, clubs, agents)
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"

// Fonction pour normaliser les accents (recherche plus flexible)
function normalizeString(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")
    const limit = parseInt(searchParams.get("limit") || "5")

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        players: [],
        clubs: [],
        agents: [],
        footballPlayers: [],
        footballTeams: [],
        query: "",
        timestamp: Date.now(),
      })
    }

    const searchQuery = query.trim()
    // Version normalisée sans accents pour recherche flexible
    const normalizedQuery = normalizeString(searchQuery)

    // Exécuter les 5 requêtes en parallèle (profils utilisateurs + données football)
    const [players, clubs, agents, footballPlayers, footballTeams] = await Promise.all([
      // Recherche joueurs (profils utilisateurs)
      prisma.playerProfile.findMany({
        where: {
          isSearchable: true,
          OR: [
            { firstName: { contains: searchQuery, mode: "insensitive" } },
            { firstName: { contains: normalizedQuery, mode: "insensitive" } },
            { lastName: { contains: searchQuery, mode: "insensitive" } },
            { lastName: { contains: normalizedQuery, mode: "insensitive" } },
            { displayName: { contains: searchQuery, mode: "insensitive" } },
            { displayName: { contains: normalizedQuery, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          displayName: true,
          primaryPosition: true,
          profilePicture: true,
          currentClub: true,
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      }),

      // Recherche clubs (profils utilisateurs)
      prisma.clubProfile.findMany({
        where: {
          OR: [
            { clubName: { contains: searchQuery, mode: "insensitive" } },
            { clubName: { contains: normalizedQuery, mode: "insensitive" } },
            { shortName: { contains: searchQuery, mode: "insensitive" } },
            { shortName: { contains: normalizedQuery, mode: "insensitive" } },
            { city: { contains: searchQuery, mode: "insensitive" } },
            { city: { contains: normalizedQuery, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          userId: true,
          clubName: true,
          shortName: true,
          logo: true,
          league: true,
          country: true,
        },
        take: limit,
        orderBy: [{ isVerified: "desc" }, { createdAt: "desc" }],
      }),

      // Recherche agents (profils utilisateurs)
      prisma.agentProfile.findMany({
        where: {
          OR: [
            { firstName: { contains: searchQuery, mode: "insensitive" } },
            { firstName: { contains: normalizedQuery, mode: "insensitive" } },
            { lastName: { contains: searchQuery, mode: "insensitive" } },
            { lastName: { contains: normalizedQuery, mode: "insensitive" } },
            { agencyName: { contains: searchQuery, mode: "insensitive" } },
            { agencyName: { contains: normalizedQuery, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          agencyName: true,
          profilePicture: true,
        },
        take: limit,
        orderBy: [{ isVerified: "desc" }, { createdAt: "desc" }],
      }),

      // Recherche joueurs football (données TheSportsDB/API-Football)
      // Recherche avec la requête originale ET la version normalisée (sans accents)
      prisma.footballPlayer.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" } },
            { name: { contains: normalizedQuery, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          position: true,
          nationality: true,
          dateOfBirth: true,
          number: true,
          image: true,
          cutout: true,
          teamName: true,
          sportsDbId: true,
          apiFootballId: true,
        },
        take: limit,
        orderBy: { lastSyncedAt: "desc" },
      }),

      // Recherche équipes football (données TheSportsDB/API-Football)
      prisma.footballTeam.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: "insensitive" } },
            { name: { contains: normalizedQuery, mode: "insensitive" } },
            { shortName: { contains: searchQuery, mode: "insensitive" } },
            { shortName: { contains: normalizedQuery, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          shortName: true,
          country: true,
          league: true,
          logo: true,
          sportsDbId: true,
          apiFootballId: true,
        },
        take: limit,
        orderBy: { lastSyncedAt: "desc" },
      }),
    ])

    return NextResponse.json({
      players,
      clubs,
      agents,
      footballPlayers,
      footballTeams,
      query: searchQuery,
      timestamp: Date.now(),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
