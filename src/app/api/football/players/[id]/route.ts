// API: Récupérer un joueur de football par son ID ou slug
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"
import { generateSlug, isCuid } from "@/lib/utils/slug"

const THESPORTSDB_BASE_URL = "https://www.thesportsdb.com/api/v1/json/3"

// Interface pour le joueur TheSportsDB
interface TheSportsDBPlayer {
  idPlayer: string
  strPlayer: string
  strNationality: string
  strPosition: string
  strNumber: string | null
  dateBorn: string | null
  strThumb: string | null
  strCutout: string | null
  strTeam: string | null
}

// Interface pour l'équipe TheSportsDB
interface TheSportsDBTeam {
  idTeam: string
  strTeam: string
  strTeamBadge: string | null
  strCountry: string
  strLeague: string | null
}

// Rechercher une équipe depuis TheSportsDB par son nom
async function searchTeamFromTheSportsDB(teamName: string): Promise<{
  id: string
  slug: string
  name: string
  logo: string | null
  country: string | null
  league: string | null
} | null> {
  try {
    const encodedName = encodeURIComponent(teamName.replace(/ /g, "_"))
    const response = await fetch(`${THESPORTSDB_BASE_URL}/searchteams.php?t=${encodedName}`)
    if (!response.ok) return null
    
    const data = await response.json()
    const teams = data?.teams as TheSportsDBTeam[] | null
    
    // Filtrer pour ne garder que les équipes de football
    const soccerTeam = teams?.find(t => true) // TheSportsDB retourne déjà filtré par sport
    
    if (!soccerTeam) return null
    
    return {
      id: soccerTeam.idTeam,
      slug: generateSlug(soccerTeam.strTeam),
      name: soccerTeam.strTeam,
      logo: soccerTeam.strTeamBadge,
      country: soccerTeam.strCountry,
      league: soccerTeam.strLeague
    }
  } catch (error) {
    console.error("[API Player] Erreur recherche équipe TheSportsDB:", error)
    return null
  }
}

// Rechercher un joueur depuis TheSportsDB par son nom (pour les slugs)
async function searchPlayerFromTheSportsDB(playerName: string) {
  try {
    const encodedName = encodeURIComponent(playerName.replace(/-/g, " ").replace(/ /g, "_"))
    const response = await fetch(`${THESPORTSDB_BASE_URL}/searchplayers.php?p=${encodedName}`)
    if (!response.ok) return null
    
    const data = await response.json()
    const players = data?.player as TheSportsDBPlayer[] | null
    
    // Filtrer pour ne garder que les joueurs de football
    const soccerPlayer = players?.find(p => (p as any).strSport === "Soccer")
    
    if (!soccerPlayer) return null
    
    return soccerPlayer
  } catch (error) {
    console.error("[API Player] Erreur recherche joueur TheSportsDB:", error)
    return null
  }
}

// Récupérer un joueur depuis TheSportsDB par son ID
async function getPlayerFromTheSportsDB(sportsDbId: string) {
  try {
    const response = await fetch(`${THESPORTSDB_BASE_URL}/lookupplayer.php?id=${sportsDbId}`)
    if (!response.ok) return null
    
    const data = await response.json()
    const player = data?.players?.[0] as TheSportsDBPlayer | undefined
    
    if (!player) return null
    
    // Récupérer les infos de l'équipe si on a un nom d'équipe
    let team = null
    if (player.strTeam) {
      team = await searchTeamFromTheSportsDB(player.strTeam)
    }
    
    return {
      id: `sportsdb-${player.idPlayer}`,
      slug: generateSlug(player.strPlayer),
      name: player.strPlayer,
      position: player.strPosition,
      nationality: player.strNationality,
      dateOfBirth: player.dateBorn,
      number: player.strNumber ? parseInt(player.strNumber) : null,
      image: player.strThumb,
      cutout: player.strCutout,
      teamName: player.strTeam,
      teamId: null,
      team
    }
  } catch (error) {
    console.error("[API Player] Erreur TheSportsDB:", error)
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Vérifier si c'est un ID TheSportsDB (préfixé par "sportsdb-")
    if (id.startsWith("sportsdb-")) {
      const sportsDbId = id.replace("sportsdb-", "")
      const sportsDbPlayer = await getPlayerFromTheSportsDB(sportsDbId)
      
      if (!sportsDbPlayer) {
        return NextResponse.json(
          { error: "Joueur non trouvé" },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ player: sportsDbPlayer })
    }

    // Vérifier si c'est un CUID (ID de la BDD)
    if (isCuid(id)) {
      const player = await prisma.footballPlayer.findUnique({
        where: { id },
        include: {
          team: {
            select: {
              id: true,
              name: true,
              logo: true,
              country: true,
              league: true
            }
          }
        }
      })

      if (!player) {
        return NextResponse.json(
          { error: "Joueur non trouvé" },
          { status: 404 }
        )
      }

      // Si pas de team en BDD mais un teamName, récupérer les infos via TheSportsDB
      let teamData: { id: string; slug: string; name: string; logo: string | null; country: string | null; league: string | null } | null = player.team ? {
        id: player.team.id,
        slug: generateSlug(player.team.name),
        name: player.team.name,
        logo: player.team.logo,
        country: player.team.country,
        league: player.team.league
      } : null

      if (!teamData && player.teamName) {
        teamData = await searchTeamFromTheSportsDB(player.teamName)
      }

      return NextResponse.json({
        player: {
          id: player.id,
          slug: generateSlug(player.name),
          name: player.name,
          position: player.position,
          nationality: player.nationality,
          dateOfBirth: player.dateOfBirth?.toISOString().split("T")[0] || null,
          number: player.number,
          image: player.image,
          cutout: player.cutout,
          teamName: player.teamName,
          teamId: player.teamId,
          team: teamData
        }
      })
    }

    // Sinon, c'est un slug - chercher par nom dans la BDD puis TheSportsDB
    // D'abord chercher dans la BDD
    const allPlayers = await prisma.footballPlayer.findMany({
      include: {
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
            country: true,
            league: true
          }
        }
      }
    })
    
    const dbPlayer = allPlayers.find(p => generateSlug(p.name) === id)
    
    if (dbPlayer) {
      // Si pas de team en BDD mais un teamName, récupérer les infos via TheSportsDB
      let teamData: { id: string; slug: string; name: string; logo: string | null; country: string | null; league: string | null } | null = dbPlayer.team ? {
        id: dbPlayer.team.id,
        slug: generateSlug(dbPlayer.team.name),
        name: dbPlayer.team.name,
        logo: dbPlayer.team.logo,
        country: dbPlayer.team.country,
        league: dbPlayer.team.league
      } : null

      if (!teamData && dbPlayer.teamName) {
        teamData = await searchTeamFromTheSportsDB(dbPlayer.teamName)
      }

      return NextResponse.json({
        player: {
          id: dbPlayer.id,
          slug: generateSlug(dbPlayer.name),
          name: dbPlayer.name,
          position: dbPlayer.position,
          nationality: dbPlayer.nationality,
          dateOfBirth: dbPlayer.dateOfBirth?.toISOString().split("T")[0] || null,
          number: dbPlayer.number,
          image: dbPlayer.image,
          cutout: dbPlayer.cutout,
          teamName: dbPlayer.teamName,
          teamId: dbPlayer.teamId,
          team: teamData
        }
      })
    }

    // Chercher dans TheSportsDB par nom
    const searchedPlayer = await searchPlayerFromTheSportsDB(id)
    if (searchedPlayer) {
      const sportsDbPlayer = await getPlayerFromTheSportsDB(searchedPlayer.idPlayer)
      if (sportsDbPlayer) {
        return NextResponse.json({ player: sportsDbPlayer })
      }
    }

    return NextResponse.json(
      { error: "Joueur non trouvé" },
      { status: 404 }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
