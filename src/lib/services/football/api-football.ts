// ============================================
// API-Football Client (api-sports.io)
// Utilisé UNIQUEMENT pour les scores en direct
// Quota: 100 requêtes/jour (plan gratuit)
// ============================================

import axios, { AxiosInstance, AxiosError } from "axios"
import {
  ApiFootballFixture,
  ApiFootballPlayerSearch,
  ApiFootballTeamSearch,
  ProfootMatch,
  ProfootPlayer,
  ProfootTeam,
  ProfootTeamRef,
  MatchStatus,
  ExternalIds
} from "./types"
import { FootballCacheService, footballCache } from "./cache"
import { FootballRateLimiter, rateLimiter, RateLimitError } from "./rate-limiter"

const API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io"

interface ApiFootballResponse<T> {
  get: string
  parameters: Record<string, string>
  errors: Record<string, string> | string[]
  results: number
  paging: {
    current: number
    total: number
  }
  response: T
}

export class ApiFootballError extends Error {
  public statusCode?: number
  public errors?: Record<string, string> | string[]

  constructor(message: string, statusCode?: number, errors?: Record<string, string> | string[]) {
    super(message)
    this.name = "ApiFootballError"
    this.statusCode = statusCode
    this.errors = errors
  }
}

export class ApiFootballClient {
  private client: AxiosInstance
  private cache: FootballCacheService
  private rateLimiter: FootballRateLimiter

  constructor(
    apiKey?: string,
    cache?: FootballCacheService,
    limiter?: FootballRateLimiter
  ) {
    const key = apiKey || process.env.API_FOOTBALL_KEY

    if (!key) {
      console.warn("[ApiFootball] Aucune clé API configurée. Les requêtes échoueront.")
    }

    this.client = axios.create({
      baseURL: API_FOOTBALL_BASE_URL,
      headers: {
        "x-apisports-key": key || "",
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
  ): Promise<ApiFootballResponse<T>> {
    // Vérifier le rate limit
    await this.rateLimiter.checkAndIncrement("api-football")

    try {
      const response = await this.client.get<ApiFootballResponse<T>>(endpoint, {
        params
      })

      // Vérifier les erreurs dans la réponse
      if (response.data.errors && Object.keys(response.data.errors).length > 0) {
        throw new ApiFootballError(
          "API returned errors",
          200,
          response.data.errors
        )
      }

      return response.data
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error
      }

      if (error instanceof AxiosError) {
        throw new ApiFootballError(
          error.message,
          error.response?.status,
          error.response?.data?.errors
        )
      }

      throw error
    }
  }

  /**
   * Récupère tous les matchs en direct
   */
  async getLiveMatches(leagueId?: number): Promise<ProfootMatch[]> {
    const cacheKey = this.cache.generateKey(
      "api-football",
      "live",
      leagueId ? `league-${leagueId}` : "all"
    )

    // Vérifier le cache (5 minutes pour le live)
    const cached = await this.cache.get<ProfootMatch[]>(cacheKey)
    if (cached) {
      return cached
    }

    const params: Record<string, string | number> = { live: "all" }
    if (leagueId) {
      params.league = leagueId
    }

    const response = await this.request<ApiFootballFixture[]>("/fixtures", params)
    const matches = response.response.map(fixture => this.transformFixture(fixture))

    // Mettre en cache
    await this.cache.set(cacheKey, matches, "api-football", "live")

    return matches
  }

  /**
   * Récupère les détails d'un match spécifique
   */
  async getMatchDetails(matchId: number): Promise<ProfootMatch | null> {
    const cacheKey = this.cache.generateKey("api-football", "live", `match-${matchId}`)

    const cached = await this.cache.get<ProfootMatch>(cacheKey)
    if (cached) {
      return cached
    }

    const response = await this.request<ApiFootballFixture[]>("/fixtures", {
      id: matchId
    })

    if (response.response.length === 0) {
      return null
    }

    const match = this.transformFixture(response.response[0])

    await this.cache.set(cacheKey, match, "api-football", "live")

    return match
  }

  /**
   * Récupère les matchs d'une équipe (live uniquement)
   */
  async getTeamLiveMatches(teamId: number): Promise<ProfootMatch[]> {
    const cacheKey = this.cache.generateKey("api-football", "live", `team-${teamId}`)

    const cached = await this.cache.get<ProfootMatch[]>(cacheKey)
    if (cached) {
      return cached
    }

    const response = await this.request<ApiFootballFixture[]>("/fixtures", {
      team: teamId,
      live: "all"
    })

    const matches = response.response.map(fixture => this.transformFixture(fixture))

    await this.cache.set(cacheKey, matches, "api-football", "live")

    return matches
  }

  /**
   * Récupère les matchs en direct pour plusieurs ligues
   */
  async getLiveMatchesByLeagues(leagueIds: number[]): Promise<ProfootMatch[]> {
    const cacheKey = this.cache.generateKey(
      "api-football",
      "live",
      `leagues-${leagueIds.join("-")}`
    )

    const cached = await this.cache.get<ProfootMatch[]>(cacheKey)
    if (cached) {
      return cached
    }

    // API-Football accepte plusieurs ligues séparées par des tirets
    const response = await this.request<ApiFootballFixture[]>("/fixtures", {
      live: "all",
      league: leagueIds.join("-")
    })

    const matches = response.response.map(fixture => this.transformFixture(fixture))

    await this.cache.set(cacheKey, matches, "api-football", "live")

    return matches
  }

  /**
   * Transforme un fixture API-Football en ProfootMatch
   */
  private transformFixture(fixture: ApiFootballFixture): ProfootMatch {
    return {
      id: `apifootball-${fixture.fixture.id}`,
      homeTeam: this.transformTeamRef(
        fixture.teams.home.id,
        fixture.teams.home.name,
        fixture.teams.home.logo
      ),
      awayTeam: this.transformTeamRef(
        fixture.teams.away.id,
        fixture.teams.away.name,
        fixture.teams.away.logo
      ),
      score: {
        home: fixture.goals.home,
        away: fixture.goals.away
      },
      status: this.mapStatus(fixture.fixture.status.short),
      date: fixture.fixture.date,
      competition: fixture.league.name,
      competitionCode: null, // API-Football n'utilise pas de codes
      matchday: this.extractMatchday(fixture.league.round),
      venue: fixture.fixture.venue.name,
      season: `${fixture.league.season}/${fixture.league.season + 1}`,
      externalIds: {
        apiFootball: fixture.fixture.id
      }
    }
  }

  /**
   * Transforme une équipe en référence Profoot
   */
  private transformTeamRef(id: number, name: string, logo: string): ProfootTeamRef {
    return {
      id: `apifootball-team-${id}`,
      name,
      shortName: this.generateShortName(name),
      logo
    }
  }

  /**
   * Génère un nom court à partir du nom complet
   */
  private generateShortName(name: string): string {
    const knownShortNames: Record<string, string> = {
      "Paris Saint-Germain": "PSG",
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

    // Prendre les premiers mots significatifs
    return name
      .replace(/^FC |^AC |^AS |^SS |^SC |^1\. /, "")
      .split(" ")
      .slice(0, 2)
      .join(" ")
  }

  /**
   * Mappe le statut API-Football vers le statut Profoot
   */
  private mapStatus(status: string): MatchStatus {
    const statusMap: Record<string, MatchStatus> = {
      TBD: "SCHEDULED",
      NS: "SCHEDULED",
      "1H": "LIVE",
      HT: "LIVE",
      "2H": "LIVE",
      ET: "LIVE",
      P: "LIVE",
      BT: "LIVE",
      SUSP: "SUSPENDED",
      INT: "SUSPENDED",
      FT: "FINISHED",
      AET: "FINISHED",
      PEN: "FINISHED",
      PST: "POSTPONED",
      CANC: "CANCELLED",
      ABD: "CANCELLED",
      AWD: "FINISHED",
      WO: "FINISHED"
    }

    return statusMap[status] || "SCHEDULED"
  }

  /**
   * Extrait le numéro de journée depuis le round
   */
  private extractMatchday(round: string): number | null {
    const match = round.match(/\d+/)
    return match ? parseInt(match[0], 10) : null
  }

  /**
   * Recherche un joueur par nom et retourne sa photo
   * ATTENTION: Consomme du quota - utiliser en fallback uniquement
   */
  async searchPlayer(playerName: string): Promise<{ photo: string | null; id: number } | null> {
    const cacheKey = this.cache.generateKey(
      "api-football",
      "team", // Utilise "team" car pas de type "player" dans CacheType
      `player-search-${playerName.toLowerCase().replace(/\s+/g, "-")}`
    )

    const cached = await this.cache.get<{ photo: string | null; id: number }>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      // Obtenir la saison actuelle
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth()
      // La saison commence en août, donc si on est avant août, on prend l'année précédente
      const season = currentMonth < 7 ? currentYear - 1 : currentYear

      const response = await this.request<ApiFootballPlayerSearch[]>("/players", {
        search: playerName,
        season: season
      })

      if (response.response.length === 0) {
        console.log(`[ApiFootball] Aucun joueur trouvé pour: ${playerName}`)
        return null
      }

      const player = response.response[0]
      const result = {
        photo: player.player.photo || null,
        id: player.player.id
      }

      // Mettre en cache pour 24h
      await this.cache.set(cacheKey, result, "api-football", "team")

      console.log(`[ApiFootball] Joueur trouvé: ${player.player.name} avec photo: ${result.photo ? "oui" : "non"}`)
      return result
    } catch (error) {
      console.error(`[ApiFootball] Erreur recherche joueur ${playerName}:`, error)
      return null
    }
  }

  /**
   * Recherche une équipe par nom et retourne son logo
   * ATTENTION: Consomme du quota - utiliser en fallback uniquement
   */
  async searchTeam(teamName: string): Promise<{ logo: string | null; id: number } | null> {
    const cacheKey = this.cache.generateKey(
      "api-football",
      "team",
      `team-search-${teamName.toLowerCase().replace(/\s+/g, "-")}`
    )

    const cached = await this.cache.get<{ logo: string | null; id: number }>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const response = await this.request<ApiFootballTeamSearch[]>("/teams", {
        search: teamName
      })

      if (response.response.length === 0) {
        console.log(`[ApiFootball] Aucune équipe trouvée pour: ${teamName}`)
        return null
      }

      const team = response.response[0]
      const result = {
        logo: team.team.logo || null,
        id: team.team.id
      }

      // Mettre en cache pour 24h
      await this.cache.set(cacheKey, result, "api-football", "team")

      console.log(`[ApiFootball] Équipe trouvée: ${team.team.name} avec logo: ${result.logo ? "oui" : "non"}`)
      return result
    } catch (error) {
      console.error(`[ApiFootball] Erreur recherche équipe ${teamName}:`, error)
      return null
    }
  }

  /**
   * Obtient le quota restant pour API-Football
   */
  getRemainingQuota(): number {
    return this.rateLimiter.getRemainingQuota("api-football")
  }

  /**
   * Vérifie si des requêtes peuvent encore être effectuées aujourd'hui
   */
  canMakeRequest(): boolean {
    return this.rateLimiter.canMakeRequest("api-football")
  }
}

// Instance singleton
export const apiFootballClient = new ApiFootballClient()
