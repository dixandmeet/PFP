// ============================================
// Football Data Aggregator
// Service principal qui centralise les appels aux 3 APIs
// et gère le mapping des IDs, le cache et les quotas
// ============================================
//
// RÔLE DE CHAQUE SERVICE:
// - Football-Data.org: Source PRINCIPALE pour calendriers et classements (fiable)
// - TheSportsDB: Assets UNIQUEMENT (logos, bannières, photos stade, maillots)
// - API-Football: Scores en direct et fallback images
//
// NOTE: TheSportsDB peut retourner des données incohérentes pour les matchs,
// c'est pourquoi Football-Data.org est priorisé pour les calendriers.
// ============================================

import { prisma } from "@/lib/prisma"
import {
  ProfootTeam,
  ProfootMatch,
  ProfootStandings,
  ProfootTeamRef,
  ProfootPlayer,
  CompetitionCode,
  FOOTBALL_DATA_COMPETITIONS,
  FootballApiConfig
} from "./types"
import { FootballCacheService, footballCache } from "./cache"
import { FootballRateLimiter, rateLimiter, RateLimitError } from "./rate-limiter"
import { ApiFootballClient, apiFootballClient } from "./api-football"
import { FootballDataClient, footballDataClient } from "./football-data"
import { TheSportsDBClient, theSportsDBClient, THESPORTSDB_TEAM_IDS } from "./thesportsdb"

export class FootballDataAggregator {
  private apiFootball: ApiFootballClient
  private footballData: FootballDataClient
  private sportsDb: TheSportsDBClient
  private cache: FootballCacheService
  private rateLimiter: FootballRateLimiter

  constructor(
    config?: FootballApiConfig,
    cache?: FootballCacheService,
    limiter?: FootballRateLimiter
  ) {
    this.cache = cache || footballCache
    this.rateLimiter = limiter || rateLimiter

    // Initialiser les clients avec la configuration fournie
    this.apiFootball = config?.apiFootballKey
      ? new ApiFootballClient(config.apiFootballKey, this.cache, this.rateLimiter)
      : apiFootballClient

    this.footballData = config?.footballDataKey
      ? new FootballDataClient(config.footballDataKey, this.cache, this.rateLimiter)
      : footballDataClient

    this.sportsDb = config?.theSportsDbKey
      ? new TheSportsDBClient(config.theSportsDbKey, this.cache)
      : theSportsDBClient
  }

  // ============================================
  // ÉQUIPES
  // ============================================

  /**
   * Récupère une équipe par son ID Profoot (interne)
   */
  async getTeam(id: string): Promise<ProfootTeam | null> {
    // Chercher dans la base de données
    const dbTeam = await prisma.footballTeam.findUnique({
      where: { id }
    })

    if (!dbTeam) return null

    return this.transformDbTeam(dbTeam)
  }

  /**
   * Récupère une équipe par l'un de ses IDs externes
   */
  async getTeamByExternalId(
    source: "apiFootball" | "footballData" | "sportsDb",
    externalId: string | number
  ): Promise<ProfootTeam | null> {
    const where =
      source === "apiFootball"
        ? { apiFootballId: Number(externalId) }
        : source === "footballData"
        ? { footballDataId: Number(externalId) }
        : { sportsDbId: String(externalId) }

    const dbTeam = await prisma.footballTeam.findFirst({ where })

    if (dbTeam) {
      return this.transformDbTeam(dbTeam)
    }

    // Si pas trouvé, essayer de récupérer depuis l'API appropriée
    if (source === "footballData" && this.rateLimiter.canMakeRequest("football-data")) {
      const team = await this.footballData.getTeam(Number(externalId))
      if (team) {
        // Sauvegarder en DB
        const saved = await this.saveTeamToDb(team, { footballData: Number(externalId) })
        return saved
      }
    }

    if (source === "sportsDb") {
      const sportsDbTeam = await this.sportsDb.getTeamById(String(externalId))
      if (sportsDbTeam) {
        return await this.sportsDb.upsertTeamFromSportsDB(sportsDbTeam.strTeam)
      }
    }

    return null
  }

  /**
   * Recherche des équipes par nom
   * Fallback sur API-Football si pas de logo trouvé
   */
  async searchTeams(query: string): Promise<ProfootTeam[]> {
    console.log(`[Aggregator] Searching teams for: ${query}`)
    
    // D'abord chercher en base de données
    const dbTeams = await prisma.footballTeam.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { shortName: { contains: query, mode: "insensitive" } }
        ]
      },
      take: 10
    })

    if (dbTeams.length > 0) {
      console.log(`[Aggregator] Found ${dbTeams.length} teams in database`)
      
      // Vérifier si des équipes n'ont pas de logo et essayer API-Football
      const teamsWithMissingLogos = dbTeams.filter(t => !t.logo)
      if (teamsWithMissingLogos.length > 0 && this.rateLimiter.canMakeRequest("api-football")) {
        console.log(`[Aggregator] ${teamsWithMissingLogos.length} équipes sans logo, essai API-Football...`)
        await this.enrichTeamsWithApiFootball(teamsWithMissingLogos)
        // Recharger les équipes depuis la BDD
        const refreshedTeams = await prisma.footballTeam.findMany({
          where: { id: { in: dbTeams.map(t => t.id) } }
        })
        return refreshedTeams.map(t => this.transformDbTeam(t))
      }
      
      return dbTeams.map(t => this.transformDbTeam(t))
    }

    // Sinon, rechercher via TheSportsDB (pas de rate limit strict)
    console.log(`[Aggregator] No database results, searching TheSportsDB...`)
    const sportsDbTeam = await this.sportsDb.searchTeam(query)
    if (sportsDbTeam) {
      console.log(`[Aggregator] TheSportsDB found: ${sportsDbTeam.strTeam}`)
      const team = await this.sportsDb.upsertTeamFromSportsDB(sportsDbTeam.strTeam)
      
      // Si pas de logo TheSportsDB, essayer API-Football
      if (team && !team.logo && this.rateLimiter.canMakeRequest("api-football")) {
        console.log(`[Aggregator] Pas de logo TheSportsDB pour ${team.name}, essai API-Football...`)
        const dbTeam = await prisma.footballTeam.findUnique({ where: { id: team.id } })
        if (dbTeam) {
          await this.enrichTeamsWithApiFootball([dbTeam])
          const refreshedTeam = await prisma.footballTeam.findUnique({ where: { id: team.id } })
          return refreshedTeam ? [this.transformDbTeam(refreshedTeam)] : []
        }
      }
      
      return team ? [team] : []
    }

    // Dernier recours : essayer API-Football directement
    if (this.rateLimiter.canMakeRequest("api-football")) {
      console.log(`[Aggregator] Aucun résultat TheSportsDB, essai API-Football...`)
      const apiFootballResult = await this.apiFootball.searchTeam(query)
      if (apiFootballResult?.logo) {
        console.log(`[Aggregator] API-Football found team with logo`)
        // Créer une entrée en BDD
        const newTeam = await prisma.footballTeam.create({
          data: {
            name: query,
            country: "Unknown",
            logo: apiFootballResult.logo,
            apiFootballId: apiFootballResult.id
          }
        })
        return [this.transformDbTeam(newTeam)]
      }
    }

    console.log(`[Aggregator] No teams found for: ${query}`)
    return []
  }

  /**
   * Enrichit les équipes avec les logos d'API-Football
   */
  private async enrichTeamsWithApiFootball(teams: Array<{ id: string; name: string }>): Promise<void> {
    for (const team of teams) {
      try {
        if (!this.rateLimiter.canMakeRequest("api-football")) {
          console.log(`[Aggregator] Quota API-Football atteint, arrêt de l'enrichissement`)
          break
        }
        
        const apiFootballResult = await this.apiFootball.searchTeam(team.name)
        if (apiFootballResult?.logo) {
          await prisma.footballTeam.update({
            where: { id: team.id },
            data: {
              logo: apiFootballResult.logo,
              apiFootballId: apiFootballResult.id
            }
          })
          console.log(`[Aggregator] Logo API-Football ajouté pour ${team.name}`)
        }
      } catch (error) {
        console.error(`[Aggregator] Erreur enrichissement API-Football pour ${team.name}:`, error)
      }
    }
  }

  /**
   * Recherche des joueurs par nom via TheSportsDB et les enregistre dans la BDD
   * Fallback sur API-Football si pas d'image trouvée
   */
  async searchPlayers(query: string): Promise<ProfootPlayer[]> {
    console.log(`[Aggregator] Searching players for: ${query}`)
    
    // D'abord chercher en base de données
    const dbPlayers = await prisma.footballPlayer.findMany({
      where: {
        name: { contains: query, mode: "insensitive" }
      },
      take: 10
    })

    if (dbPlayers.length > 0) {
      console.log(`[Aggregator] Found ${dbPlayers.length} players in database`)
      
      // Vérifier si des joueurs n'ont pas d'image et essayer API-Football
      const playersWithMissingImages = dbPlayers.filter(p => !p.image && !p.cutout)
      if (playersWithMissingImages.length > 0 && this.rateLimiter.canMakeRequest("api-football")) {
        console.log(`[Aggregator] ${playersWithMissingImages.length} joueurs sans image, essai API-Football...`)
        await this.enrichPlayersWithApiFootball(playersWithMissingImages)
        // Recharger les joueurs depuis la BDD
        const refreshedPlayers = await prisma.footballPlayer.findMany({
          where: { id: { in: dbPlayers.map(p => p.id) } }
        })
        return refreshedPlayers.map(p => this.transformDbPlayer(p))
      }
      
      return dbPlayers.map(p => this.transformDbPlayer(p))
    }

    // Sinon, rechercher via TheSportsDB et enregistrer dans la BDD
    console.log(`[Aggregator] No database results, searching TheSportsDB...`)
    const players = await this.sportsDb.searchAndSavePlayers(query)
    console.log(`[Aggregator] TheSportsDB found ${players.length} players`)
    
    // Si des joueurs n'ont pas d'image, essayer API-Football comme fallback
    const playersWithoutImages = players.filter(p => !p.image)
    if (playersWithoutImages.length > 0 && this.rateLimiter.canMakeRequest("api-football")) {
      console.log(`[Aggregator] ${playersWithoutImages.length} joueurs sans image après TheSportsDB, essai API-Football...`)
      // Récupérer les joueurs de la BDD pour avoir leurs IDs
      const dbPlayersToEnrich = await prisma.footballPlayer.findMany({
        where: { id: { in: players.map(p => p.id) }, image: null, cutout: null }
      })
      await this.enrichPlayersWithApiFootball(dbPlayersToEnrich)
      // Recharger les joueurs depuis la BDD
      const refreshedPlayers = await prisma.footballPlayer.findMany({
        where: { id: { in: players.map(p => p.id) } }
      })
      return refreshedPlayers.map(p => this.transformDbPlayer(p))
    }
    
    return players
  }

  /**
   * Enrichit les joueurs avec les photos d'API-Football
   */
  private async enrichPlayersWithApiFootball(players: Array<{ id: string; name: string }>): Promise<void> {
    for (const player of players) {
      try {
        if (!this.rateLimiter.canMakeRequest("api-football")) {
          console.log(`[Aggregator] Quota API-Football atteint, arrêt de l'enrichissement`)
          break
        }
        
        const apiFootballResult = await this.apiFootball.searchPlayer(player.name)
        if (apiFootballResult?.photo) {
          await prisma.footballPlayer.update({
            where: { id: player.id },
            data: {
              image: apiFootballResult.photo,
              apiFootballId: apiFootballResult.id
            }
          })
          console.log(`[Aggregator] Image API-Football ajoutée pour ${player.name}`)
        }
      } catch (error) {
        console.error(`[Aggregator] Erreur enrichissement API-Football pour ${player.name}:`, error)
      }
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
   * Récupère une équipe par son slug (ex: "paris-saint-germain")
   */
  async getTeamBySlug(slug: string): Promise<ProfootTeam | null> {
    // Chercher dans le mapping TheSportsDB
    const sportsDbId = THESPORTSDB_TEAM_IDS[slug]
    
    if (sportsDbId) {
      // Vérifier en base de données
      const dbTeam = await prisma.footballTeam.findFirst({
        where: { sportsDbId }
      })

      if (dbTeam) {
        // Vérifier si les assets doivent être mis à jour
        if (this.shouldRefreshAssets(dbTeam.lastSyncedAt)) {
          await this.syncTeamAssets(dbTeam.id)
          const refreshed = await prisma.footballTeam.findUnique({
            where: { id: dbTeam.id }
          })
          return refreshed ? this.transformDbTeam(refreshed) : null
        }
        return this.transformDbTeam(dbTeam)
      }

      // Sinon, récupérer depuis TheSportsDB
      const teamData = await this.sportsDb.getTeamData(sportsDbId)
      return teamData?.team || null
    }

    // Fallback: rechercher par nom
    const teamName = slug.replace(/-/g, " ")
    const results = await this.searchTeams(teamName)
    return results[0] || null
  }

  // ============================================
  // MATCHS
  // ============================================

  /**
   * Récupère les matchs à venir d'une compétition
   * Source: Football-Data.org (cache 1h)
   */
  async getUpcomingMatches(
    competitionCode: CompetitionCode,
    limit: number = 10
  ): Promise<ProfootMatch[]> {
    try {
      return await this.footballData.getUpcomingMatches(competitionCode, limit)
    } catch (error) {
      if (error instanceof RateLimitError) {
        console.warn(`[Aggregator] Rate limit atteint pour Football-Data, pas de fallback disponible`)
        return []
      }
      throw error
    }
  }

  /**
   * Récupère les matchs en direct
   * Source: API-Football (cache 5 min)
   * ATTENTION: Quota limité à 100 req/jour
   */
  async getLiveMatches(leagueId?: number): Promise<ProfootMatch[]> {
    if (!this.rateLimiter.canMakeRequest("api-football")) {
      console.warn("[Aggregator] Quota API-Football épuisé pour aujourd'hui")
      return []
    }

    try {
      return await this.apiFootball.getLiveMatches(leagueId)
    } catch (error) {
      if (error instanceof RateLimitError) {
        console.warn(`[Aggregator] Rate limit atteint pour API-Football`)
        return []
      }
      throw error
    }
  }

  /**
   * Récupère les matchs du jour
   * Source: Football-Data.org (cache 1h)
   */
  async getTodayMatches(): Promise<ProfootMatch[]> {
    try {
      return await this.footballData.getTodayMatches()
    } catch (error) {
      if (error instanceof RateLimitError) {
        console.warn(`[Aggregator] Rate limit atteint pour Football-Data`)
        return []
      }
      throw error
    }
  }

  /**
   * Récupère les matchs d'une équipe
   * Source: Football-Data.org (prioritaire, plus fiable) puis TheSportsDB (fallback avec validation)
   */
  async getTeamMatches(
    teamId: string,
    options?: {
      upcoming?: boolean
      past?: boolean
      limit?: number
    }
  ): Promise<{
    upcoming: ProfootMatch[]
    past: ProfootMatch[]
  }> {
    const team = await this.getTeam(teamId)
    if (!team) {
      return { upcoming: [], past: [] }
    }

    let upcoming: ProfootMatch[] = []
    let past: ProfootMatch[] = []

    // SOURCE PRIORITAIRE: Football-Data.org (plus fiable pour les calendriers)
    if (team.externalIds.footballData && this.rateLimiter.canMakeRequest("football-data")) {
      try {
        const today = new Date().toISOString().split("T")[0]
        const pastDate = new Date()
        pastDate.setDate(pastDate.getDate() - 30)
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 30)

        if (options?.upcoming !== false) {
          upcoming = await this.footballData.getTeamMatches(team.externalIds.footballData, {
            dateFrom: today,
            dateTo: futureDate.toISOString().split("T")[0],
            limit: options?.limit
          })
        }

        if (options?.past !== false) {
          past = await this.footballData.getTeamMatches(team.externalIds.footballData, {
            dateFrom: pastDate.toISOString().split("T")[0],
            dateTo: today,
            status: "FINISHED",
            limit: options?.limit
          })
        }

        return { upcoming, past }
      } catch (error) {
        console.warn("[Aggregator] Erreur Football-Data, fallback sur TheSportsDB")
      }
    }

    // FALLBACK: TheSportsDB (avec validation obligatoire)
    if (team.externalIds.sportsDb) {
      if (options?.upcoming !== false) {
        const rawUpcoming = await this.sportsDb.getTeamNextEvents(team.externalIds.sportsDb)
        const validatedUpcoming = this.validateMatchesForTeam(rawUpcoming, team.name)
        
        if (validatedUpcoming.hasInconsistency) {
          this.logApiInconsistency(teamId, team.name, "TheSportsDB", rawUpcoming)
          // Ne pas utiliser les données incohérentes
          upcoming = []
        } else {
          upcoming = validatedUpcoming.valid
        }
      }
      
      if (options?.past !== false) {
        const rawPast = await this.sportsDb.getTeamLastResults(team.externalIds.sportsDb)
        const validatedPast = this.validateMatchesForTeam(rawPast, team.name)
        
        if (validatedPast.hasInconsistency) {
          this.logApiInconsistency(teamId, team.name, "TheSportsDB", rawPast)
          // Ne pas utiliser les données incohérentes
          past = []
        } else {
          past = validatedPast.valid
        }
      }
    }

    return { upcoming, past }
  }

  // ============================================
  // CLASSEMENTS
  // ============================================

  /**
   * Récupère les classements d'une compétition
   * Source: Football-Data.org (cache 1h)
   */
  async getStandings(competitionCode: CompetitionCode): Promise<ProfootStandings | null> {
    try {
      return await this.footballData.getStandings(competitionCode)
    } catch (error) {
      if (error instanceof RateLimitError) {
        console.warn(`[Aggregator] Rate limit atteint pour Football-Data`)
        return null
      }
      throw error
    }
  }

  // ============================================
  // ASSETS
  // ============================================

  /**
   * Synchronise les assets d'une équipe depuis TheSportsDB
   * Les assets sont stockés en base de données
   */
  async syncTeamAssets(teamId: string): Promise<boolean> {
    const team = await prisma.footballTeam.findUnique({
      where: { id: teamId }
    })

    if (!team || !team.sportsDbId) {
      console.warn(`[Aggregator] Impossible de sync les assets: équipe ${teamId} sans sportsDbId`)
      return false
    }

    const assets = await this.sportsDb.syncTeamAssets(teamId, team.sportsDbId)
    return assets !== null
  }

  /**
   * Synchronise les assets de toutes les équipes qui en ont besoin
   */
  async syncAllOutdatedAssets(): Promise<number> {
    const outdatedDate = new Date()
    outdatedDate.setDate(outdatedDate.getDate() - 7) // Plus vieux que 7 jours

    const teamsToSync = await prisma.footballTeam.findMany({
      where: {
        sportsDbId: { not: null },
        OR: [
          { lastSyncedAt: null },
          { lastSyncedAt: { lt: outdatedDate } }
        ]
      },
      select: { id: true, sportsDbId: true }
    })

    let synced = 0
    for (const team of teamsToSync) {
      try {
        const success = await this.syncTeamAssets(team.id)
        if (success) synced++
        // Petit délai pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`[Aggregator] Erreur sync assets pour ${team.id}:`, error)
      }
    }

    return synced
  }

  // ============================================
  // MAPPING DES IDS
  // ============================================

  /**
   * Lie les IDs de différentes APIs pour une même équipe
   */
  async linkTeamIds(
    teamId: string,
    externalIds: {
      apiFootball?: number
      footballData?: number
      sportsDb?: string
    }
  ): Promise<ProfootTeam | null> {
    const updated = await prisma.footballTeam.update({
      where: { id: teamId },
      data: {
        ...(externalIds.apiFootball && { apiFootballId: externalIds.apiFootball }),
        ...(externalIds.footballData && { footballDataId: externalIds.footballData }),
        ...(externalIds.sportsDb && { sportsDbId: externalIds.sportsDb })
      }
    })

    return this.transformDbTeam(updated)
  }

  /**
   * Trouve ou crée une équipe et lie les IDs
   */
  async findOrCreateTeam(
    name: string,
    country: string,
    externalIds?: {
      apiFootball?: number
      footballData?: number
      sportsDb?: string
    }
  ): Promise<ProfootTeam> {
    // Chercher par IDs externes d'abord
    if (externalIds?.footballData) {
      const existing = await prisma.footballTeam.findFirst({
        where: { footballDataId: externalIds.footballData }
      })
      if (existing) return this.transformDbTeam(existing)
    }

    if (externalIds?.apiFootball) {
      const existing = await prisma.footballTeam.findFirst({
        where: { apiFootballId: externalIds.apiFootball }
      })
      if (existing) return this.transformDbTeam(existing)
    }

    if (externalIds?.sportsDb) {
      const existing = await prisma.footballTeam.findFirst({
        where: { sportsDbId: externalIds.sportsDb }
      })
      if (existing) return this.transformDbTeam(existing)
    }

    // Chercher par nom
    const existingByName = await prisma.footballTeam.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        country: { equals: country, mode: "insensitive" }
      }
    })

    if (existingByName) {
      // Mettre à jour les IDs si nécessaire
      if (externalIds) {
        return (await this.linkTeamIds(existingByName.id, externalIds))!
      }
      return this.transformDbTeam(existingByName)
    }

    // Créer une nouvelle équipe
    const newTeam = await prisma.footballTeam.create({
      data: {
        name,
        country,
        ...(externalIds?.apiFootball && { apiFootballId: externalIds.apiFootball }),
        ...(externalIds?.footballData && { footballDataId: externalIds.footballData }),
        ...(externalIds?.sportsDb && { sportsDbId: externalIds.sportsDb })
      }
    })

    // Essayer de récupérer les assets
    if (newTeam.sportsDbId || externalIds?.sportsDb) {
      await this.syncTeamAssets(newTeam.id)
      const refreshed = await prisma.footballTeam.findUnique({ where: { id: newTeam.id } })
      return this.transformDbTeam(refreshed!)
    }

    return this.transformDbTeam(newTeam)
  }

  // ============================================
  // UTILITAIRES
  // ============================================

  /**
   * Obtient le statut des quotas de toutes les APIs
   */
  getQuotaStatus(): Record<string, { remaining: number; limit: number; resetAt: Date }> {
    const status = this.rateLimiter.getAllStatus()
    return {
      apiFootball: {
        remaining: status["api-football"].remaining,
        limit: status["api-football"].limit,
        resetAt: status["api-football"].resetAt
      },
      footballData: {
        remaining: status["football-data"].remaining,
        limit: status["football-data"].limit,
        resetAt: status["football-data"].resetAt
      },
      theSportsDb: {
        remaining: status["thesportsdb"].remaining,
        limit: status["thesportsdb"].limit,
        resetAt: status["thesportsdb"].resetAt
      }
    }
  }

  /**
   * Obtient les statistiques du cache
   */
  async getCacheStats() {
    return await this.cache.getStats()
  }

  /**
   * Nettoie le cache expiré
   */
  async cleanupCache(): Promise<number> {
    return await this.cache.cleanup()
  }

  /**
   * Liste des compétitions supportées
   */
  getSupportedCompetitions() {
    return FOOTBALL_DATA_COMPETITIONS
  }

  // ============================================
  // HELPERS PRIVÉS
  // ============================================

  /**
   * Valide que les matchs retournés concernent bien l'équipe demandée
   * Détecte les incohérences de l'API TheSportsDB
   */
  private validateMatchesForTeam(
    matches: ProfootMatch[],
    teamName: string
  ): { valid: ProfootMatch[]; hasInconsistency: boolean } {
    if (matches.length === 0) {
      return { valid: [], hasInconsistency: false }
    }

    const normalizedTeamName = teamName.toLowerCase().trim()
    // Extraire les mots clés du nom de l'équipe (ex: "Paris Saint-Germain" -> ["paris", "saint", "germain"])
    const teamKeywords = normalizedTeamName.split(/[\s-]+/).filter(w => w.length > 2)

    const valid = matches.filter(match => {
      const homeTeam = match.homeTeam.name.toLowerCase()
      const awayTeam = match.awayTeam.name.toLowerCase()
      
      // Vérifier si au moins un mot clé du nom d'équipe est présent
      const matchesTeam = teamKeywords.some(keyword => 
        homeTeam.includes(keyword) || awayTeam.includes(keyword)
      ) || homeTeam.includes(normalizedTeamName) || awayTeam.includes(normalizedTeamName)
        || normalizedTeamName.includes(homeTeam) || normalizedTeamName.includes(awayTeam)

      return matchesTeam
    })

    return { 
      valid, 
      hasInconsistency: valid.length === 0 && matches.length > 0 
    }
  }

  /**
   * Log une incohérence détectée dans les données d'une API
   */
  private logApiInconsistency(
    teamId: string,
    teamName: string,
    source: string,
    receivedMatches: ProfootMatch[]
  ): void {
    const matchSummary = receivedMatches.slice(0, 3).map(m => 
      `${m.homeTeam.name} vs ${m.awayTeam.name}`
    ).join(", ")
    
    console.error(`[API_INCONSISTENCY] Source: ${source}`)
    console.error(`[API_INCONSISTENCY] Requested team: ${teamName} (${teamId})`)
    console.error(`[API_INCONSISTENCY] Received matches for: ${matchSummary}${receivedMatches.length > 3 ? ` (+${receivedMatches.length - 3} more)` : ""}`)
    console.error(`[API_INCONSISTENCY] Action: Data rejected, returning empty result`)
  }

  private transformDbTeam(team: {
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

  private async saveTeamToDb(
    team: ProfootTeam,
    externalIds?: { apiFootball?: number; footballData?: number; sportsDb?: string }
  ): Promise<ProfootTeam> {
    const saved = await prisma.footballTeam.create({
      data: {
        name: team.name,
        shortName: team.shortName,
        country: team.country,
        league: team.league,
        logo: team.logo,
        banner: team.banner,
        venue: team.venue,
        founded: team.founded,
        jersey: team.jersey,
        stadiumImage: team.stadiumImage,
        ...(externalIds?.apiFootball && { apiFootballId: externalIds.apiFootball }),
        ...(externalIds?.footballData && { footballDataId: externalIds.footballData }),
        ...(externalIds?.sportsDb && { sportsDbId: externalIds.sportsDb })
      }
    })

    return this.transformDbTeam(saved)
  }

  private shouldRefreshAssets(lastSyncedAt: Date | null): boolean {
    if (!lastSyncedAt) return true
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return lastSyncedAt < sevenDaysAgo
  }
}

// Instance singleton
export const footballAggregator = new FootballDataAggregator()
