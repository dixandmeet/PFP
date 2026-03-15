// API: Recherche externe via TheSportsDB (clubs et joueurs)
import { NextRequest, NextResponse } from "next/server"
import { footballAggregator } from "@/lib/services/football"
import { handleApiError } from "@/lib/utils/api-helpers"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")
    const type = searchParams.get("type") || "all" // all, clubs, players

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        clubs: [],
        players: [],
        query: "",
        timestamp: Date.now(),
      })
    }

    const searchQuery = query.trim()
    
    // Recherche en parallèle selon le type demandé
    const [clubs, players] = await Promise.all([
      // Recherche clubs
      (type === "all" || type === "clubs") 
        ? footballAggregator.searchTeams(searchQuery)
        : Promise.resolve([]),
      // Recherche joueurs
      (type === "all" || type === "players")
        ? footballAggregator.searchPlayers(searchQuery)
        : Promise.resolve([]),
    ])

    // Formater les clubs pour l'affichage
    const formattedClubs = clubs.map(club => ({
      id: club.id,
      name: club.name,
      shortName: club.shortName,
      logo: club.logo,
      country: club.country,
      league: club.league,
      isExternal: true,
    }))

    // Formater les joueurs pour l'affichage
    const formattedPlayers = players.map(player => ({
      id: player.id,
      name: player.name,
      position: player.position,
      nationality: player.nationality,
      image: player.image,
      dateOfBirth: player.dateOfBirth,
      isExternal: true,
    }))

    return NextResponse.json({
      clubs: formattedClubs,
      players: formattedPlayers,
      query: searchQuery,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("[API Search External] Error:", error)
    return handleApiError(error)
  }
}
