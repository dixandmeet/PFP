// API: Récupérer une équipe de football par son ID ou slug
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"
import { lookupTeam, getTeamPlayers } from "@/lib/services/thesportsdb"
import { footballAggregator } from "@/lib/services/football"
import { isCuid, generateSlug } from "@/lib/utils/slug"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    let team

    // Déterminer si c'est un ID ou un slug
    if (isCuid(id)) {
      // Recherche par ID interne
      team = await prisma.footballTeam.findUnique({
        where: { id },
        include: {
          players: {
            orderBy: [
              { position: "asc" },
              { name: "asc" }
            ]
          }
        }
      })
    } else {
      // Recherche par slug (basé sur le nom)
      // Stratégie 1: Recherche exacte par slug en BDD
      const allTeams = await prisma.footballTeam.findMany({
        include: {
          players: {
            orderBy: [
              { position: "asc" },
              { name: "asc" }
            ]
          }
        }
      })
      
      team = allTeams.find(t => generateSlug(t.name) === id)
      
      // Stratégie 2: Recherche par sportsDbId si le slug ressemble à un ID numérique
      if (!team && /^\d+$/.test(id)) {
        team = allTeams.find(t => t.sportsDbId === id)
      }
      
      // Stratégie 3: Recherche partielle sur le nom (pour les slugs partiels)
      if (!team) {
        const searchTerm = id.replace(/-/g, " ").toLowerCase()
        team = allTeams.find(t => 
          t.name.toLowerCase().includes(searchTerm) ||
          generateSlug(t.name).includes(id)
        )
      }
      
      // Stratégie 4: Recherche par shortName
      if (!team) {
        team = allTeams.find(t => 
          t.shortName && generateSlug(t.shortName) === id
        )
      }
      
      // Stratégie 5: FALLBACK sur les APIs externes via l'aggregator
      // Si pas trouvé en BDD, chercher via les APIs et enregistrer automatiquement
      if (!team) {
        console.log(`[API Teams] Équipe "${id}" non trouvée en BDD, recherche via APIs externes...`)
        
        // Convertir le slug en terme de recherche
        const searchTerm = id.replace(/-/g, " ")
        
        // Utiliser l'aggregator qui va chercher via TheSportsDB/API-Football
        // et enregistrer automatiquement l'équipe en BDD
        const externalResults = await footballAggregator.searchTeams(searchTerm)
        
        if (externalResults.length > 0) {
          const externalTeam = externalResults[0]
          console.log(`[API Teams] Équipe trouvée via API: ${externalTeam.name} (ID: ${externalTeam.id})`)
          
          // Récupérer l'équipe complète depuis la BDD (maintenant qu'elle est enregistrée)
          team = await prisma.footballTeam.findUnique({
            where: { id: externalTeam.id },
            include: {
              players: {
                orderBy: [
                  { position: "asc" },
                  { name: "asc" }
                ]
              }
            }
          })
        }
      }
    }

    if (!team) {
      return NextResponse.json(
        { error: "Équipe non trouvée", searchedId: id },
        { status: 404 }
      )
    }

    // Récupérer des données enrichies depuis TheSportsDB
    let description: string | null = null
    let enrichedCountry = team.country
    let enrichedLeague = team.league
    let enrichedVenue = team.venue
    let enrichedFounded = team.founded
    let additionalPlayers: Array<{
      id: string
      name: string
      position: string | null
      nationality: string | null
      image: string | null
      number: number | null
    }> = []

    // Essayer d'enrichir les données depuis TheSportsDB
    try {
      // D'abord essayer avec le sportsDbId, sinon avec le nom
      let sportsDbInfo = team.sportsDbId ? await lookupTeam(team.sportsDbId) : null
      
      // Si pas trouvé par ID, essayer par nom
      if (!sportsDbInfo && team.name) {
        sportsDbInfo = await lookupTeam(team.name)
      }
      
      if (sportsDbInfo) {
        description = sportsDbInfo.description || null
        // Enrichir les données manquantes
        if (!enrichedCountry || enrichedCountry === "Unknown") {
          enrichedCountry = sportsDbInfo.country || enrichedCountry
        }
        if (!enrichedLeague) {
          enrichedLeague = sportsDbInfo.league || enrichedLeague
        }
        if (!enrichedVenue) {
          enrichedVenue = sportsDbInfo.venue || enrichedVenue
        }
        if (!enrichedFounded && sportsDbInfo.founded) {
          enrichedFounded = sportsDbInfo.founded
        }

        // Si pas assez de joueurs en BDD, récupérer depuis TheSportsDB
        if (team.players.length < 10) {
          const sportsDbPlayers = await getTeamPlayers(String(sportsDbInfo.id))
          additionalPlayers = sportsDbPlayers
            .filter(p => !team.players.some(tp => tp.name.toLowerCase() === p.name.toLowerCase()))
            .slice(0, 30)
            .map(p => ({
              id: `sportsdb-${p.id}`,
              name: p.name,
              position: p.position,
              nationality: p.nationality,
              image: p.image || null,
              number: p.number || null,
            }))
        }
      }
    } catch (error) {
      console.error("Erreur enrichissement TheSportsDB:", error)
    }

    // Combiner les joueurs de la BDD et de TheSportsDB
    const allPlayers = [
      ...team.players.map(p => ({
        id: p.id,
        name: p.name,
        position: p.position,
        nationality: p.nationality,
        image: p.cutout || p.image,
        number: p.number,
      })),
      ...additionalPlayers
    ]

    // Grouper les joueurs par position
    const playersByPosition = {
      goalkeepers: allPlayers.filter(p => p.position === "Goalkeeper"),
      defenders: allPlayers.filter(p => p.position === "Defence" || p.position?.includes("Back") || p.position?.includes("Defender")),
      midfielders: allPlayers.filter(p => p.position === "Midfield" || p.position?.includes("Midfield")),
      forwards: allPlayers.filter(p => p.position === "Offence" || p.position?.includes("Forward") || p.position?.includes("Wing") || p.position?.includes("Striker")),
      other: allPlayers.filter(p => !p.position || p.position === "Unknown")
    }

    return NextResponse.json({
      team: {
        id: team.id,
        slug: generateSlug(team.name),
        name: team.name,
        shortName: team.shortName,
        country: enrichedCountry,
        league: enrichedLeague,
        logo: team.logo,
        banner: team.banner,
        stadiumImage: team.stadiumImage,
        jersey: team.jersey,
        venue: enrichedVenue,
        founded: enrichedFounded,
        sportsDbId: team.sportsDbId,
        description,
      },
      players: allPlayers,
      playersByPosition,
      totalPlayers: allPlayers.length
    })
  } catch (error) {
    return handleApiError(error)
  }
}
