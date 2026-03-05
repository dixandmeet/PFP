// ============================================
// Profoot Profile - Interfaces Unifiées
// Format normalisé pour toutes les sources API
// ============================================

// ==================== ENUMS ====================

export type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED" | "POSTPONED" | "CANCELLED" | "SUSPENDED"

export type CacheType = "live" | "schedule" | "standings" | "team" | "assets"

export type ApiSource = "api-football" | "football-data" | "thesportsdb"

// ==================== EXTERNAL IDS ====================

export interface ExternalIds {
  apiFootball?: number
  footballData?: number
  sportsDb?: string
}

// ==================== TEAM ====================

export interface ProfootTeamRef {
  id: string
  name: string
  shortName: string
  logo: string | null
}

export interface ProfootTeam {
  id: string
  name: string
  shortName: string
  country: string
  league: string | null
  logo: string | null
  banner: string | null
  venue: string | null
  founded: number | null
  jersey: string | null
  stadiumImage: string | null
  externalIds: ExternalIds
  lastSyncedAt: Date | null
}

// ==================== MATCH ====================

export interface ProfootScore {
  home: number | null
  away: number | null
}

export interface ProfootMatch {
  id: string
  homeTeam: ProfootTeamRef
  awayTeam: ProfootTeamRef
  score: ProfootScore
  status: MatchStatus
  date: string
  competition: string
  competitionCode: string | null
  matchday: number | null
  venue: string | null
  season: string | null
  externalIds: ExternalIds
}

// ==================== STANDINGS ====================

export interface ProfootStandingEntry {
  position: number
  team: ProfootTeamRef
  playedGames: number
  won: number
  draw: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: string | null // ex: "WWDLW"
}

export interface ProfootStandings {
  competition: string
  competitionCode: string
  season: string
  matchday: number | null
  table: ProfootStandingEntry[]
  lastUpdated: Date
}

// ==================== PLAYER ====================

export interface ProfootPlayer {
  id: string
  name: string
  position: string
  nationality: string
  number: number | null
  dateOfBirth: string | null
  image: string | null
  externalIds: ExternalIds
}

// ==================== COMPETITION ====================

export interface ProfootCompetition {
  code: string
  name: string
  country: string
  type: "LEAGUE" | "CUP" | "PLAYOFFS"
  logo: string | null
  currentSeason: string | null
  currentMatchday: number | null
}

// ==================== ASSETS ====================

export interface TeamAssets {
  logo: string | null
  banner: string | null
  jersey: string | null
  stadiumImage: string | null
  fanart: string[]
}

// ==================== API RESPONSES (RAW) ====================

// API-Football (api-sports.io) raw response types
export interface ApiFootballTeam {
  team: {
    id: number
    name: string
    code: string | null
    country: string
    founded: number | null
    national: boolean
    logo: string
  }
  venue: {
    id: number | null
    name: string | null
    address: string | null
    city: string | null
    capacity: number | null
    surface: string | null
    image: string | null
  } | null
}

// API-Football Player search response
export interface ApiFootballPlayerSearch {
  player: {
    id: number
    name: string
    firstname: string
    lastname: string
    age: number | null
    birth: {
      date: string | null
      place: string | null
      country: string | null
    }
    nationality: string | null
    height: string | null
    weight: string | null
    injured: boolean
    photo: string
  }
  statistics: Array<{
    team: {
      id: number
      name: string
      logo: string
    }
    league: {
      id: number
      name: string
      country: string
      logo: string
      flag: string | null
      season: number
    }
    games: {
      position: string | null
      appearences: number | null
      lineups: number | null
      minutes: number | null
      number: number | null
    }
  }>
}

// API-Football Team search response
export interface ApiFootballTeamSearch {
  team: {
    id: number
    name: string
    code: string | null
    country: string
    founded: number | null
    national: boolean
    logo: string
  }
  venue: {
    id: number | null
    name: string | null
    address: string | null
    city: string | null
    capacity: number | null
    surface: string | null
    image: string | null
  } | null
}

export interface ApiFootballFixture {
  fixture: {
    id: number
    referee: string | null
    timezone: string
    date: string
    timestamp: number
    periods: {
      first: number | null
      second: number | null
    }
    venue: {
      id: number | null
      name: string | null
      city: string | null
    }
    status: {
      long: string
      short: string
      elapsed: number | null
    }
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
    flag: string | null
    season: number
    round: string
  }
  teams: {
    home: {
      id: number
      name: string
      logo: string
      winner: boolean | null
    }
    away: {
      id: number
      name: string
      logo: string
      winner: boolean | null
    }
  }
  goals: {
    home: number | null
    away: number | null
  }
  score: {
    halftime: { home: number | null; away: number | null }
    fulltime: { home: number | null; away: number | null }
    extratime: { home: number | null; away: number | null }
    penalty: { home: number | null; away: number | null }
  }
}

// Football-Data.org raw response types
export interface FootballDataTeam {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string
  address: string | null
  website: string | null
  founded: number | null
  clubColors: string | null
  venue: string | null
  lastUpdated: string
}

export interface FootballDataMatch {
  id: number
  utcDate: string
  status: string
  matchday: number | null
  stage: string | null
  group: string | null
  lastUpdated: string
  homeTeam: {
    id: number
    name: string
    shortName: string
    tla: string
    crest: string
  }
  awayTeam: {
    id: number
    name: string
    shortName: string
    tla: string
    crest: string
  }
  score: {
    winner: string | null
    duration: string
    fullTime: { home: number | null; away: number | null }
    halfTime: { home: number | null; away: number | null }
  }
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
    currentMatchday: number | null
  }
}

export interface FootballDataStanding {
  stage: string
  type: string
  group: string | null
  table: Array<{
    position: number
    team: {
      id: number
      name: string
      shortName: string
      tla: string
      crest: string
    }
    playedGames: number
    form: string | null
    won: number
    draw: number
    lost: number
    points: number
    goalsFor: number
    goalsAgainst: number
    goalDifference: number
  }>
}

// TheSportsDB raw response types
export interface TheSportsDBTeam {
  idTeam: string
  strTeam: string
  strTeamShort: string | null
  strAlternate: string | null
  intFormedYear: string | null
  strSport: string
  strLeague: string
  strStadium: string | null
  strStadiumThumb: string | null
  strStadiumDescription: string | null
  strStadiumLocation: string | null
  intStadiumCapacity: string | null
  strWebsite: string | null
  strTeamBadge: string | null
  strTeamJersey: string | null
  strTeamLogo: string | null
  strTeamFanart1: string | null
  strTeamFanart2: string | null
  strTeamFanart3: string | null
  strTeamFanart4: string | null
  strTeamBanner: string | null
  strCountry: string
  strDescriptionEN: string | null
  strDescriptionFR: string | null
}

export interface TheSportsDBEvent {
  idEvent: string
  strEvent: string
  strHomeTeam: string
  strAwayTeam: string
  idHomeTeam: string
  idAwayTeam: string
  intHomeScore: string | null
  intAwayScore: string | null
  strHomeTeamBadge: string | null
  strAwayTeamBadge: string | null
  strLeague: string
  strSeason: string
  intRound: string | null
  dateEvent: string
  strTime: string | null
  strStatus: string | null
  strThumb: string | null
  strVenue: string | null
}

export interface TheSportsDBPlayer {
  idPlayer: string
  strPlayer: string
  strNationality: string
  strPosition: string
  strTeam: string | null
  strTeam2: string | null
  strThumb: string | null
  strCutout: string | null
  dateBorn: string | null
  strNumber: string | null
  strSport: string
  strDescriptionEN: string | null
}

// ==================== TRANSFORMERS ====================

// Helper type for transformer functions
export type TeamTransformer<T> = (raw: T, existingIds?: ExternalIds) => Partial<ProfootTeam>
export type MatchTransformer<T> = (raw: T, teams?: Map<string, ProfootTeamRef>) => Partial<ProfootMatch>

// ==================== SERVICE CONFIG ====================

export interface FootballApiConfig {
  apiFootballKey?: string
  footballDataKey?: string
  theSportsDbKey?: string
}

export interface CacheDurations {
  live: number      // ms - scores en direct
  schedule: number  // ms - calendrier des matchs
  standings: number // ms - classements
  team: number      // ms - infos équipe
  assets: number    // ms - assets (logos, images)
}

export const DEFAULT_CACHE_DURATIONS: CacheDurations = {
  live: 5 * 60 * 1000,           // 5 minutes
  schedule: 60 * 60 * 1000,       // 1 heure
  standings: 60 * 60 * 1000,      // 1 heure
  team: 24 * 60 * 60 * 1000,      // 24 heures
  assets: 7 * 24 * 60 * 60 * 1000 // 7 jours
}

// ==================== RATE LIMITING ====================

export interface RateLimitConfig {
  requests: number
  windowMs: number
}

export const API_RATE_LIMITS: Record<ApiSource, RateLimitConfig> = {
  "api-football": { requests: 100, windowMs: 24 * 60 * 60 * 1000 },   // 100/jour
  "football-data": { requests: 10, windowMs: 60 * 1000 },              // 10/min
  "thesportsdb": { requests: 1000, windowMs: 60 * 60 * 1000 }          // Pratiquement illimité
}

// ==================== COMPETITION CODES ====================

// Codes des compétitions supportées par Football-Data.org (tier gratuit)
export const FOOTBALL_DATA_COMPETITIONS = {
  // Ligues
  PL: "Premier League",
  FL1: "Ligue 1",
  BL1: "Bundesliga",
  SA: "Serie A",
  PD: "La Liga",
  DED: "Eredivisie",
  PPL: "Primeira Liga",
  // Coupes
  CL: "UEFA Champions League",
  EC: "UEFA Euro",
  WC: "FIFA World Cup"
} as const

export type CompetitionCode = keyof typeof FOOTBALL_DATA_COMPETITIONS
