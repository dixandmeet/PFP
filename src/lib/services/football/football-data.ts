// ============================================
// Football-Data.org Client
// Source principale pour calendriers et classements
// Quota: 10 requêtes/minute (plan gratuit)
// ============================================

import axios, { AxiosInstance, AxiosError } from "axios"
import {
  FootballDataMatch,
  FootballDataTeam,
  FootballDataStanding,
  ProfootMatch,
  ProfootTeam,
  ProfootStandings,
  ProfootStandingEntry,
  ProfootTeamRef,
  MatchStatus,
  CompetitionCode,
  FOOTBALL_DATA_COMPETITIONS
} from "./types"
import { FootballCacheService, footballCache } from "./cache"
import { FootballRateLimiter, rateLimiter, RateLimitError } from "./rate-limiter"

const FOOTBALL_DATA_BASE_URL = "https://api.football-data.org/v4"

interface FootballDataMatchesResponse {
  filters: Record<string, unknown>
  resultSet: {
    count: number
    first: string
    last: string
    played: number
  }
  competition: {
    id: number
    name: string
    code: string
    type: string
    emblem: string
  }
  matches: FootballDataMatch[]
}

interface FootballDataStandingsResponse {
  filters: Record<string, unknown>
  competition: {
    id: number
    name: string
    code: string
    type: string
    emblem: string
  }
  season: {
    id: number
    startDate: string
    endDate: string
    currentMatchday: number
    winner: unknown | null
  }
  standings: FootballDataStanding[]
}

interface FootballDataTeamResponse extends FootballDataTeam {
  area: {
    id: number
    name: string
    code: string
    flag: string
  }
  runningCompetitions: Array<{
    id: number
    name: string
    code: string
    type: string
    emblem: string
  }>
}

export class FootballDataError extends Error {
  public statusCode?: number
  public errorCode?: number

  constructor(message: string, statusCode?: number, errorCode?: number) {
    super(message)
    this.name = "FootballDataError"
    this.statusCode = statusCode
    this.errorCode = errorCode
  }
}

export class FootballDataClient {
  private client: AxiosInstance
  private cache: FootballCacheService
  private rateLimiter: FootballRateLimiter

  constructor(
    apiKey?: string,
    cache?: FootballCacheService,
    limiter?: FootballRateLimiter
  ) {
    const key = apiKey || process.env.FOOTBALL_DATA_API_KEY

    if (!key) {
      console.warn("[FootballData] Aucune clé API configurée. Les requêtes échoueront.")
    }

    this.client = axios.create({
      baseURL: FOOTBALL_DATA_BASE_URL,
      headers: {
        "X-Auth-Token": key || "",
        "Content-Type": "application/json"
      },
      timeout: 10000
    })

    this.cache = cache || footballCache
    this.rateLimiter = limiter || rateLimiter
  }

  /**
   * Effectue une requête à l'API avec gestion du rate limit
   */
  private async request<T>(
    endpoint: string,
    params?: Record<string, string | number>
  ): Promise<T> {
    // Vérifier le rate limit (10 req/min)
    await this.rateLimiter.checkAndIncrement("football-data")

    try {
      const response = await this.client.get<T>(endpoint, { params })
      return response.data
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error
      }

      if (error instanceof AxiosError) {
        const statusCode = error.response?.status
        const message = error.response?.data?.message || error.message
        const errorCode = error.response?.data?.errorCode

        // Gérer le rate limit côté serveur
        if (statusCode === 429) {
          throw new RateLimitError(
            "football-data",
            0,
            new Date(Date.now() + 60000) // Réessayer dans 1 minute
          )
        }

        throw new FootballDataError(message, statusCode, errorCode)
      }

      throw error
    }
  }

  /**
   * Récupère les matchs d'une compétition
   */
  async getMatches(
    competitionCode: CompetitionCode,
    options?: {
      dateFrom?: string
      dateTo?: string
      matchday?: number
      status?: string
    }
  ): Promise<ProfootMatch[]> {
    const cacheKey = this.cache.generateKey(
      "football-data",
      "schedule",
      `${competitionCode}-${options?.dateFrom || "all"}-${options?.dateTo || "all"}-${options?.matchday || "all"}`
    )

    const cached = await this.cache.get<ProfootMatch[]>(cacheKey)
    if (cached) {
      return cached
    }

    const params: Record<string, string | number> = {}
    if (options?.dateFrom) params.dateFrom = options.dateFrom
    if (options?.dateTo) params.dateTo = options.dateTo
    if (options?.matchday) params.matchday = options.matchday
    if (options?.status) params.status = options.status

    const response = await this.request<FootballDataMatchesResponse>(
      `/competitions/${competitionCode}/matches`,
      params
    )

    const matches = response.matches.map(match =>
      this.transformMatch(match, competitionCode)
    )

    await this.cache.set(cacheKey, matches, "football-data", "schedule")

    return matches
  }

  /**
   * Récupère les matchs à venir d'une compétition
   */
  async getUpcomingMatches(
    competitionCode: CompetitionCode,
    limit: number = 10
  ): Promise<ProfootMatch[]> {
    const today = new Date().toISOString().split("T")[0]
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30)
    const dateTo = futureDate.toISOString().split("T")[0]

    const matches = await this.getMatches(competitionCode, {
      dateFrom: today,
      dateTo,
      status: "SCHEDULED"
    })

    return matches.slice(0, limit)
  }

  /**
   * Récupère les classements d'une compétition
   */
  async getStandings(competitionCode: CompetitionCode): Promise<ProfootStandings> {
    const cacheKey = this.cache.generateKey(
      "football-data",
      "standings",
      competitionCode
    )

    const cached = await this.cache.get<ProfootStandings>(cacheKey)
    if (cached) {
      return cached
    }

    const response = await this.request<FootballDataStandingsResponse>(
      `/competitions/${competitionCode}/standings`
    )

    const standings = this.transformStandings(response, competitionCode)

    await this.cache.set(cacheKey, standings, "football-data", "standings")

    return standings
  }

  /**
   * Récupère les informations d'une équipe
   */
  async getTeam(teamId: number): Promise<ProfootTeam | null> {
    const cacheKey = this.cache.generateKey(
      "football-data",
      "team",
      `team-${teamId}`
    )

    const cached = await this.cache.get<ProfootTeam>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const response = await this.request<FootballDataTeamResponse>(
        `/teams/${teamId}`
      )

      const team = this.transformTeam(response)

      await this.cache.set(cacheKey, team, "football-data", "team")

      return team
    } catch (error) {
      if (error instanceof FootballDataError && error.statusCode === 404) {
        return null
      }
      throw error
    }
  }

  /**
   * Récupère les matchs d'une équipe
   */
  async getTeamMatches(
    teamId: number,
    options?: {
      dateFrom?: string
      dateTo?: string
      status?: string
      limit?: number
    }
  ): Promise<ProfootMatch[]> {
    const cacheKey = this.cache.generateKey(
      "football-data",
      "schedule",
      `team-${teamId}-${options?.dateFrom || "all"}-${options?.dateTo || "all"}`
    )

    const cached = await this.cache.get<ProfootMatch[]>(cacheKey)
    if (cached) {
      return cached
    }

    const params: Record<string, string | number> = {}
    if (options?.dateFrom) params.dateFrom = options.dateFrom
    if (options?.dateTo) params.dateTo = options.dateTo
    if (options?.status) params.status = options.status
    if (options?.limit) params.limit = options.limit

    const response = await this.request<{ matches: FootballDataMatch[] }>(
      `/teams/${teamId}/matches`,
      params
    )

    const matches = response.matches.map(match =>
      this.transformMatch(match, match.competition.code as CompetitionCode)
    )

    await this.cache.set(cacheKey, matches, "football-data", "schedule")

    return matches
  }

  /**
   * Récupère les matchs du jour pour toutes les compétitions supportées
   */
  async getTodayMatches(): Promise<ProfootMatch[]> {
    const today = new Date().toISOString().split("T")[0]
    const cacheKey = this.cache.generateKey(
      "football-data",
      "schedule",
      `today-${today}`
    )

    const cached = await this.cache.get<ProfootMatch[]>(cacheKey)
    if (cached) {
      return cached
    }

    const response = await this.request<{ matches: FootballDataMatch[] }>(
      "/matches",
      { date: today }
    )

    const matches = response.matches.map(match =>
      this.transformMatch(match, match.competition.code as CompetitionCode)
    )

    await this.cache.set(cacheKey, matches, "football-data", "schedule")

    return matches
  }

  /**
   * Liste des compétitions supportées par le tier gratuit
   */
  getSupportedCompetitions(): typeof FOOTBALL_DATA_COMPETITIONS {
    return FOOTBALL_DATA_COMPETITIONS
  }

  /**
   * Transforme un match Football-Data en ProfootMatch
   */
  private transformMatch(
    match: FootballDataMatch,
    competitionCode: CompetitionCode
  ): ProfootMatch {
    return {
      id: `footballdata-${match.id}`,
      homeTeam: this.transformTeamRef(match.homeTeam),
      awayTeam: this.transformTeamRef(match.awayTeam),
      score: {
        home: match.score.fullTime.home,
        away: match.score.fullTime.away
      },
      status: this.mapStatus(match.status),
      date: match.utcDate,
      competition: match.competition.name,
      competitionCode,
      matchday: match.matchday,
      venue: null, // Non fourni dans l'API matches
      season: this.extractSeason(match.season),
      externalIds: {
        footballData: match.id
      }
    }
  }

  /**
   * Transforme une référence d'équipe
   */
  private transformTeamRef(team: FootballDataMatch["homeTeam"]): ProfootTeamRef {
    return {
      id: `footballdata-team-${team.id}`,
      name: team.name,
      shortName: team.shortName || team.tla || team.name.slice(0, 3),
      logo: team.crest
    }
  }

  /**
   * Transforme une équipe complète
   */
  private transformTeam(team: FootballDataTeamResponse): ProfootTeam {
    return {
      id: `footballdata-team-${team.id}`,
      name: team.name,
      shortName: team.shortName || team.tla,
      country: team.area.name,
      league: team.runningCompetitions?.[0]?.name || null,
      logo: team.crest,
      banner: null,
      venue: team.venue,
      founded: team.founded,
      jersey: null,
      stadiumImage: null,
      externalIds: {
        footballData: team.id
      },
      lastSyncedAt: new Date()
    }
  }

  /**
   * Transforme les classements
   */
  private transformStandings(
    response: FootballDataStandingsResponse,
    competitionCode: CompetitionCode
  ): ProfootStandings {
    // Prendre le premier standing (généralement TOTAL pour les ligues)
    const standing = response.standings.find(s => s.type === "TOTAL") || response.standings[0]

    const table: ProfootStandingEntry[] = standing.table.map(entry => ({
      position: entry.position,
      team: {
        id: `footballdata-team-${entry.team.id}`,
        name: entry.team.name,
        shortName: entry.team.shortName || entry.team.tla,
        logo: entry.team.crest
      },
      playedGames: entry.playedGames,
      won: entry.won,
      draw: entry.draw,
      lost: entry.lost,
      goalsFor: entry.goalsFor,
      goalsAgainst: entry.goalsAgainst,
      goalDifference: entry.goalDifference,
      points: entry.points,
      form: entry.form
    }))

    return {
      competition: response.competition.name,
      competitionCode,
      season: `${response.season.startDate.slice(0, 4)}/${parseInt(response.season.startDate.slice(0, 4)) + 1}`,
      matchday: response.season.currentMatchday,
      table,
      lastUpdated: new Date()
    }
  }

  /**
   * Mappe le statut Football-Data vers le statut Profoot
   */
  private mapStatus(status: string): MatchStatus {
    const statusMap: Record<string, MatchStatus> = {
      SCHEDULED: "SCHEDULED",
      TIMED: "SCHEDULED",
      IN_PLAY: "LIVE",
      PAUSED: "LIVE",
      FINISHED: "FINISHED",
      SUSPENDED: "SUSPENDED",
      POSTPONED: "POSTPONED",
      CANCELLED: "CANCELLED",
      AWARDED: "FINISHED"
    }

    return statusMap[status] || "SCHEDULED"
  }

  /**
   * Extrait la saison au format "YYYY/YY"
   */
  private extractSeason(season: FootballDataMatch["season"]): string {
    const startYear = parseInt(season.startDate.slice(0, 4))
    return `${startYear}/${startYear + 1}`
  }

  /**
   * Obtient le quota restant
   */
  getRemainingQuota(): number {
    return this.rateLimiter.getRemainingQuota("football-data")
  }

  /**
   * Vérifie si des requêtes peuvent être effectuées
   */
  canMakeRequest(): boolean {
    return this.rateLimiter.canMakeRequest("football-data")
  }
}

// Instance singleton
export const footballDataClient = new FootballDataClient()
