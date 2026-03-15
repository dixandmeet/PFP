// ============================================
// TheSportsDB Client
// Utilisé pour récupérer les assets (logos, images stades)
// et les stocker en base de données
// API Key gratuite: Pratiquement illimitée
// ============================================

import axios, { AxiosInstance, AxiosError } from "axios"
import { prisma } from "@/lib/prisma"
import {
  TheSportsDBTeam,
  TheSportsDBEvent,
  TheSportsDBPlayer,
  ProfootTeam,
  ProfootMatch,
  ProfootPlayer,
  ProfootTeamRef,
  TeamAssets,
  MatchStatus
} from "./types"
import { FootballCacheService, footballCache } from "./cache"

const THESPORTSDB_BASE_URL = "https://www.thesportsdb.com/api/v1/json"

interface TheSportsDBTeamResponse {
  teams: TheSportsDBTeam[] | null
}

interface TheSportsDBEventResponse {
  events: TheSportsDBEvent[] | null
}

interface TheSportsDBResultsResponse {
  results: TheSportsDBEvent[] | null
}

interface TheSportsDBPlayerResponse {
  player: TheSportsDBPlayer[] | null
}

export class TheSportsDBError extends Error {
  public statusCode?: number

  constructor(message: string, statusCode?: number) {
    super(message)
    this.name = "TheSportsDBError"
    this.statusCode = statusCode
  }
}

export class TheSportsDBClient {
  private client: AxiosInstance
  private cache: FootballCacheService
  private apiKey: string

  constructor(apiKey?: string, cache?: FootballCacheService) {
    this.apiKey = apiKey || process.env.THESPORTSDB_API_KEY || "3"  // Clé gratuite par défaut
    this.cache = cache || footballCache

    this.client = axios.create({
      baseURL: `${THESPORTSDB_BASE_URL}/${this.apiKey}`,
      timeout: 10000
    })
  }

  /**
   * Effectue une requête à l'API
   */
  private async request<T>(endpoint: string): Promise<T | null> {
    try {
      const response = await this.client.get<T>(endpoint)
      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(`[TheSportsDB] Erreur: ${error.message}`)
        throw new TheSportsDBError(error.message, error.response?.status)
      }
      throw error
    }
  }

  /**
   * Recherche une équipe par nom
   */
  async searchTeam(teamName: string): Promise<TheSportsDBTeam | null> {
    const cacheKey = this.cache.generateKey(
      "thesportsdb",
      "team",
      `search-${teamName.toLowerCase().replace(/\s+/g, "-")}`
    )

    const cached = await this.cache.get<TheSportsDBTeam>(cacheKey)
    if (cached) {
      return cached
    }

    // Essayer plusieurs variations du nom de recherche
    const searchVariations = [
      teamName,
      teamName + " FC",
      teamName + " AC",
      "FC " + teamName,
      "AC " + teamName,
    ]

    for (const variation of searchVariations) {
      const encodedName = encodeURIComponent(variation.replace(/ /g, "_"))
      console.log(`[TheSportsDB] Searching for: ${variation}`)
      
      try {
        const response = await this.request<TheSportsDBTeamResponse>(
          `/searchteams.php?t=${encodedName}`
        )

        // Filtrer pour ne garder que les équipes de football
        const soccerTeams = response?.teams?.filter(t => t.strSport === "Soccer") || []
        
        if (soccerTeams.length > 0) {
          const team = soccerTeams[0]
          console.log(`[TheSportsDB] Found team: ${team.strTeam}`)
          await this.cache.set(cacheKey, team, "thesportsdb", "team")
          return team
        }
      } catch (error) {
        console.error(`[TheSportsDB] Error searching for ${variation}:`, error)
      }
    }

    console.log(`[TheSportsDB] No team found for: ${teamName}`)
    return null
  }

  /**
   * Recherche des joueurs par nom
   */
  async searchPlayers(playerName: string): Promise<ProfootPlayer[]> {
    const cacheKey = this.cache.generateKey(
      "thesportsdb",
      "team", // Utilise "team" car pas de type "player" dans CacheType
      `search-player-${playerName.toLowerCase().replace(/\s+/g, "-")}`
    )

    const cached = await this.cache.get<ProfootPlayer[]>(cacheKey)
    if (cached) {
      return cached
    }

    const encodedName = encodeURIComponent(playerName.replace(/ /g, "_"))
    const response = await this.request<TheSportsDBPlayerResponse>(
      `/searchplayers.php?p=${encodedName}`
    )

    // Filtrer pour ne garder que les joueurs de football
    const soccerPlayers = response?.player?.filter(p => p.strSport === "Soccer") || []
    
    // Transformer en ProfootPlayer
    const players = soccerPlayers.slice(0, 10).map(p => this.transformPlayer(p))

    if (players.length > 0) {
      await this.cache.set(cacheKey, players, "thesportsdb", "team")
    }

    return players
  }

  /**
   * Transforme un joueur TheSportsDB en ProfootPlayer
   */
  private transformPlayer(player: TheSportsDBPlayer): ProfootPlayer {
    return {
      id: `sportsdb-player-${player.idPlayer}`,
      name: player.strPlayer,
      position: player.strPosition || "Unknown",
      nationality: player.strNationality || "Unknown",
      number: player.strNumber ? parseInt(player.strNumber) : null,
      dateOfBirth: player.dateBorn,
      image: player.strCutout || player.strThumb,
      externalIds: {
        sportsDb: player.idPlayer
      }
    }
  }

  /**
   * Crée ou met à jour un joueur dans la BDD avec les données TheSportsDB
   */
  async upsertPlayerFromSportsDB(sportsDbPlayer: TheSportsDBPlayer): Promise<ProfootPlayer | null> {
    if (!sportsDbPlayer || sportsDbPlayer.strSport !== "Soccer") return null

    // Chercher si le joueur existe déjà
    let existingPlayer = await prisma.footballPlayer.findFirst({
      where: {
        OR: [
          { sportsDbId: sportsDbPlayer.idPlayer },
          { name: { equals: sportsDbPlayer.strPlayer, mode: "insensitive" } }
        ]
      }
    })

    const playerData = {
      name: sportsDbPlayer.strPlayer,
      position: sportsDbPlayer.strPosition || null,
      nationality: sportsDbPlayer.strNationality || null,
      dateOfBirth: sportsDbPlayer.dateBorn ? new Date(sportsDbPlayer.dateBorn) : null,
      number: sportsDbPlayer.strNumber ? parseInt(sportsDbPlayer.strNumber) : null,
      sportsDbId: sportsDbPlayer.idPlayer,
      image: sportsDbPlayer.strThumb || null,
      cutout: sportsDbPlayer.strCutout || null,
      teamName: sportsDbPlayer.strTeam || null,
      lastSyncedAt: new Date()
    }

    if (existingPlayer) {
      existingPlayer = await prisma.footballPlayer.update({
        where: { id: existingPlayer.id },
        data: playerData
      })
    } else {
      existingPlayer = await prisma.footballPlayer.create({
        data: playerData
      })
    }

    return this.transformDbPlayer(existingPlayer)
  }

  /**
   * Recherche et enregistre les joueurs dans la BDD
   */
  async searchAndSavePlayers(playerName: string): Promise<ProfootPlayer[]> {
    console.log(`[TheSportsDB] Searching players for: ${playerName}`)
    
    const encodedName = encodeURIComponent(playerName.replace(/ /g, "_"))
    
    try {
      const response = await this.request<TheSportsDBPlayerResponse>(
        `/searchplayers.php?p=${encodedName}`
      )

      console.log(`[TheSportsDB] Player search response:`, response?.player?.length ?? 0, "results")

      // Filtrer pour ne garder que les joueurs de football
      const soccerPlayers = response?.player?.filter(p => p.strSport === "Soccer") || []
      console.log(`[TheSportsDB] Soccer players found: ${soccerPlayers.length}`)
      
      // Enregistrer chaque joueur dans la BDD
      const savedPlayers: ProfootPlayer[] = []
      for (const player of soccerPlayers.slice(0, 10)) {
        const saved = await this.upsertPlayerFromSportsDB(player)
        if (saved) {
          savedPlayers.push(saved)
        }
      }

      return savedPlayers
    } catch (error) {
      console.error(`[TheSportsDB] Error searching players:`, error)
      return []
    }
  }

  /**
   * Transforme un joueur DB en ProfootPlayer
   */
  private transformDbPlayer(player: {
    id: string
    name: string
    position: string | null
    nationality: string | null
    dateOfBirth: Date | null
    number: number | null
    sportsDbId: string | null
    apiFootballId: number | null
    image: string | null
    cutout: string | null
  }): ProfootPlayer {
    return {
      id: player.id,
      name: player.name,
      position: player.position || "Unknown",
      nationality: player.nationality || "Unknown",
      number: player.number,
      dateOfBirth: player.dateOfBirth?.toISOString().split("T")[0] || null,
      image: player.cutout || player.image,
      externalIds: {
        sportsDb: player.sportsDbId || undefined,
        apiFootball: player.apiFootballId || undefined
      }
    }
  }

  /**
   * Récupère une équipe par son ID TheSportsDB
   */
  async getTeamById(teamId: string): Promise<TheSportsDBTeam | null> {
    const cacheKey = this.cache.generateKey("thesportsdb", "team", `id-${teamId}`)

    const cached = await this.cache.get<TheSportsDBTeam>(cacheKey)
    if (cached) {
      return cached
    }

    const response = await this.request<TheSportsDBTeamResponse>(
      `/lookupteam.php?id=${teamId}`
    )

    const team = response?.teams?.[0] || null

    if (team) {
      await this.cache.set(cacheKey, team, "thesportsdb", "team")
    }

    return team
  }

  /**
   * Récupère les assets d'une équipe
   */
  async getTeamAssets(teamId: string): Promise<TeamAssets | null> {
    const cacheKey = this.cache.generateKey("thesportsdb", "assets", `team-${teamId}`)

    const cached = await this.cache.get<TeamAssets>(cacheKey)
    if (cached) {
      return cached
    }

    const team = await this.getTeamById(teamId)
    if (!team) return null

    const assets: TeamAssets = {
      logo: team.strTeamBadge || null,
      banner: team.strTeamBanner || null,
      jersey: team.strTeamJersey || null,
      stadiumImage: team.strStadiumThumb || null,
      fanart: [
        team.strTeamFanart1,
        team.strTeamFanart2,
        team.strTeamFanart3,
        team.strTeamFanart4
      ].filter((url): url is string => !!url)
    }

    await this.cache.set(cacheKey, assets, "thesportsdb", "assets")

    return assets
  }

  /**
   * Synchronise les assets d'une équipe dans la base de données
   */
  async syncTeamAssets(
    profootTeamId: string,
    sportsDbId: string
  ): Promise<TeamAssets | null> {
    const assets = await this.getTeamAssets(sportsDbId)
    if (!assets) return null

    // Mettre à jour la table FootballTeam avec les assets
    await prisma.footballTeam.update({
      where: { id: profootTeamId },
      data: {
        logo: assets.logo,
        banner: assets.banner,
        jersey: assets.jersey,
        stadiumImage: assets.stadiumImage,
        lastSyncedAt: new Date()
      }
    })

    return assets
  }

  /**
   * Crée ou met à jour une équipe avec les données TheSportsDB
   */
  async upsertTeamFromSportsDB(teamName: string): Promise<ProfootTeam | null> {
    const sportsDbTeam = await this.searchTeam(teamName)
    if (!sportsDbTeam) return null

    // Chercher si l'équipe existe déjà
    let existingTeam = await prisma.footballTeam.findFirst({
      where: {
        OR: [
          { sportsDbId: sportsDbTeam.idTeam },
          { name: { equals: sportsDbTeam.strTeam, mode: "insensitive" } }
        ]
      }
    })

    const teamData = {
      name: sportsDbTeam.strTeam,
      shortName: sportsDbTeam.strTeamShort || this.generateShortName(sportsDbTeam.strTeam),
      country: sportsDbTeam.strCountry,
      league: sportsDbTeam.strLeague,
      sportsDbId: sportsDbTeam.idTeam,
      logo: sportsDbTeam.strTeamBadge,
      banner: sportsDbTeam.strTeamBanner,
      jersey: sportsDbTeam.strTeamJersey,
      stadiumImage: sportsDbTeam.strStadiumThumb,
      venue: sportsDbTeam.strStadium,
      founded: sportsDbTeam.intFormedYear ? parseInt(sportsDbTeam.intFormedYear) : null,
      lastSyncedAt: new Date()
    }

    if (existingTeam) {
      existingTeam = await prisma.footballTeam.update({
        where: { id: existingTeam.id },
        data: teamData
      })
    } else {
      existingTeam = await prisma.footballTeam.create({
        data: teamData
      })
    }

    return this.transformToProfoot(existingTeam)
  }

  /**
   * Récupère les prochains matchs d'une équipe
   * NOTE: Ces données peuvent être incohérentes, la validation est faite dans l'aggregator
   */
  async getTeamNextEvents(teamId: string): Promise<ProfootMatch[]> {
    const cacheKey = this.cache.generateKey("thesportsdb", "schedule", `next-${teamId}`)

    const cached = await this.cache.get<ProfootMatch[]>(cacheKey)
    if (cached) {
      return cached
    }

    const response = await this.request<TheSportsDBEventResponse>(
      `/eventsnext.php?id=${teamId}`
    )

    if (!response?.events) return []

    const matches = response.events.map(event => this.transformEvent(event, "SCHEDULED"))

    await this.cache.set(cacheKey, matches, "thesportsdb", "schedule")

    return matches
  }

  /**
   * Récupère les derniers résultats d'une équipe
   */
  async getTeamLastResults(teamId: string): Promise<ProfootMatch[]> {
    const cacheKey = this.cache.generateKey("thesportsdb", "schedule", `last-${teamId}`)

    const cached = await this.cache.get<ProfootMatch[]>(cacheKey)
    if (cached) {
      return cached
    }

    const response = await this.request<TheSportsDBResultsResponse>(
      `/eventslast.php?id=${teamId}`
    )

    if (!response?.results) return []

    const matches = response.results.map(event => this.transformEvent(event, "FINISHED"))

    await this.cache.set(cacheKey, matches, "thesportsdb", "schedule")

    return matches
  }

  /**
   * Transforme un événement TheSportsDB en ProfootMatch
   */
  private transformEvent(
    event: TheSportsDBEvent,
    defaultStatus: MatchStatus
  ): ProfootMatch {
    const homeScore = event.intHomeScore !== null ? parseInt(event.intHomeScore) : null
    const awayScore = event.intAwayScore !== null ? parseInt(event.intAwayScore) : null

    // Déterminer le statut
    let status: MatchStatus = defaultStatus
    if (event.strStatus) {
      const statusLower = event.strStatus.toLowerCase()
      if (statusLower.includes("live") || statusLower.includes("progress")) {
        status = "LIVE"
      } else if (statusLower.includes("postpone")) {
        status = "POSTPONED"
      } else if (statusLower.includes("cancel")) {
        status = "CANCELLED"
      } else if (statusLower.includes("finish") || statusLower.includes("ft")) {
        status = "FINISHED"
      }
    }

    // Construire la date complète
    const dateStr = event.dateEvent + (event.strTime ? `T${event.strTime}` : "T00:00:00")

    return {
      id: `sportsdb-${event.idEvent}`,
      homeTeam: {
        id: `sportsdb-team-${event.idHomeTeam}`,
        name: event.strHomeTeam,
        shortName: this.generateShortName(event.strHomeTeam),
        logo: event.strHomeTeamBadge
      },
      awayTeam: {
        id: `sportsdb-team-${event.idAwayTeam}`,
        name: event.strAwayTeam,
        shortName: this.generateShortName(event.strAwayTeam),
        logo: event.strAwayTeamBadge
      },
      score: {
        home: isNaN(homeScore!) ? null : homeScore,
        away: isNaN(awayScore!) ? null : awayScore
      },
      status,
      date: dateStr,
      competition: event.strLeague,
      competitionCode: null,
      matchday: event.intRound ? parseInt(event.intRound) : null,
      venue: event.strVenue,
      season: event.strSeason,
      externalIds: {
        sportsDb: event.idEvent
      }
    }
  }

  /**
   * Transforme une équipe DB en ProfootTeam
   */
  private transformToProfoot(team: {
    id: string
    name: string
    shortName: string | null
    country: string
    league: string | null
    logo: string | null
    banner: string | null
    jersey: string | null
    stadiumImage: string | null
    venue: string | null
    founded: number | null
    apiFootballId: number | null
    footballDataId: number | null
    sportsDbId: string | null
    lastSyncedAt: Date | null
  }): ProfootTeam {
    return {
      id: team.id,
      name: team.name,
      shortName: team.shortName || team.name.slice(0, 3),
      country: team.country,
      league: team.league,
      logo: team.logo,
      banner: team.banner,
      venue: team.venue,
      founded: team.founded,
      jersey: team.jersey,
      stadiumImage: team.stadiumImage,
      externalIds: {
        apiFootball: team.apiFootballId || undefined,
        footballData: team.footballDataId || undefined,
        sportsDb: team.sportsDbId || undefined
      },
      lastSyncedAt: team.lastSyncedAt
    }
  }

  /**
   * Génère un nom court
   */
  private generateShortName(name: string): string {
    const knownShortNames: Record<string, string> = {
      "Paris Saint-Germain": "PSG",
      "Paris SG": "PSG",
      "Manchester United": "Man Utd",
      "Manchester City": "Man City",
      "Tottenham Hotspur": "Spurs",
      "Wolverhampton Wanderers": "Wolves",
      "Brighton and Hove Albion": "Brighton",
      "Newcastle United": "Newcastle",
      "West Ham United": "West Ham"
    }

    if (knownShortNames[name]) {
      return knownShortNames[name]
    }

    return name
      .replace(/^FC |^AC |^AS |^SS |^SC |^1\. /, "")
      .split(" ")
      .slice(0, 2)
      .join(" ")
  }

  /**
   * Récupère toutes les données d'une équipe (pour compatibilité avec l'ancien service)
   */
  async getTeamData(teamNameOrId: string): Promise<{
    team: ProfootTeam | null
    lastResults: ProfootMatch[]
    upcomingMatches: ProfootMatch[]
  } | null> {
    // Chercher l'équipe
    let sportsDbTeam = await this.getTeamById(teamNameOrId)

    if (!sportsDbTeam) {
      sportsDbTeam = await this.searchTeam(teamNameOrId.replace(/-/g, " "))
    }

    if (!sportsDbTeam) {
      return null
    }

    // Synchroniser dans la DB et récupérer les matchs
    const team = await this.upsertTeamFromSportsDB(sportsDbTeam.strTeam)
    const [lastResults, upcomingMatches] = await Promise.all([
      this.getTeamLastResults(sportsDbTeam.idTeam),
      this.getTeamNextEvents(sportsDbTeam.idTeam)
    ])

    return {
      team,
      lastResults,
      upcomingMatches
    }
  }
}

// Instance singleton
export const theSportsDBClient = new TheSportsDBClient()

// ============================================
// Mapping des IDs TheSportsDB (re-export pour compatibilité)
// ============================================

export const THESPORTSDB_TEAM_IDS: Record<string, string> = {
  // France - Ligue 1
  "paris-saint-germain": "133714",
  "olympique-de-marseille": "133720",
  "olympique-lyonnais": "133700",
  "as-monaco": "134113",
  "losc-lille": "133703",
  "stade-rennais": "133726",
  "rc-lens": "133715",
  "nice": "133717",

  // Espagne - La Liga
  "fc-barcelona": "133739",
  "real-madrid": "133738",
  "atletico-madrid": "133703",
  "sevilla": "133748",
  "real-sociedad": "133742",
  "villarreal": "133750",
  "athletic-bilbao": "133701",
  "valencia": "133749",

  // Angleterre - Premier League
  "manchester-united": "133612",
  "manchester-city": "133613",
  "liverpool": "133602",
  "arsenal": "133604",
  "chelsea": "133610",
  "tottenham-hotspur": "133616",
  "newcastle-united": "134777",
  "brighton": "133619",
  "aston-villa": "133601",
  "west-ham-united": "133615",

  // Allemagne - Bundesliga
  "bayern-munich": "133626",
  "borussia-dortmund": "133620",
  "rb-leipzig": "134777",
  "bayer-leverkusen": "133624",

  // Italie - Serie A
  "juventus": "133676",
  "ac-milan": "133628",
  "inter-milan": "133627",
  "napoli": "133673",
  "as-roma": "133629",
  "lazio": "133630"
}

/**
 * Obtient l'ID TheSportsDB depuis un slug
 */
export function getTheSportsDBId(slug: string): string | null {
  return THESPORTSDB_TEAM_IDS[slug] || null
}
