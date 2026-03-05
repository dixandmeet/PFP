// API: Récupérer les matchs d'une équipe de football
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { footballAggregator } from "@/lib/services/football"
import { handleApiError } from "@/lib/utils/api-helpers"
import { searchTeam } from "@/lib/services/thesportsdb"
import { isCuid, generateSlug } from "@/lib/utils/slug"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Récupérer l'équipe (par ID ou slug)
    let team: { id: string; name: string; sportsDbId: string | null } | null = null

    if (isCuid(id)) {
      team = await prisma.footballTeam.findUnique({
        where: { id },
        select: { id: true, name: true, sportsDbId: true }
      })
    } else {
      // Recherche par slug
      const allTeams = await prisma.footballTeam.findMany({
        select: { id: true, name: true, sportsDbId: true }
      })
      team = allTeams.find(t => generateSlug(t.name) === id) || null
    }

    if (!team) {
      return NextResponse.json(
        { error: "Équipe non trouvée" },
        { status: 404 }
      )
    }

    // Si pas de sportsDbId, essayer de le trouver via TheSportsDB (lazy loading)
    if (!team.sportsDbId) {
      try {
        console.log(`[API Football Matches] Recherche sportsDbId pour ${team.name}...`)
        const sportsDbTeam = await searchTeam(team.name)
        
        if (sportsDbTeam?.idTeam) {
          // Mettre à jour l'équipe avec le sportsDbId trouvé
          await prisma.footballTeam.update({
            where: { id: team.id },
            data: { sportsDbId: sportsDbTeam.idTeam }
          })
          
          // Rafraîchir l'objet team avec le nouveau sportsDbId
          team = { ...team, sportsDbId: sportsDbTeam.idTeam }
          console.log(`[API Football Matches] sportsDbId trouvé et sauvegardé: ${sportsDbTeam.idTeam}`)
        }
      } catch (error) {
        console.error("[API Football Matches] Erreur recherche sportsDbId:", error)
        // Continuer même si la recherche échoue
      }
    }

    // Récupérer les matchs via l'aggregator (avec validation intégrée)
    const matches = await footballAggregator.getTeamMatches(team.id, {
      upcoming: true,
      past: true,
      limit: 10
    })

    return NextResponse.json({
      upcoming: matches.upcoming,
      past: matches.past
    })
  } catch (error) {
    console.error("[API Football Matches] Error:", error)
    return handleApiError(error)
  }
}
