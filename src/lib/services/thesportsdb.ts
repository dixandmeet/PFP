// Service d'intégration avec l'API TheSportsDB
// Documentation: https://www.thesportsdb.com/documentation
// API Key gratuite: 123

const BASE_URL = "https://www.thesportsdb.com/api/v1/json/123"

// Cache simple en mémoire avec expiration
const cache = new Map<string, { data: unknown; expiresAt: number }>()
const CACHE_DURATION = 60 * 60 * 1000 // 1 heure en millisecondes

// ============ Interfaces TheSportsDB ============

interface TheSportsDBTeam {
  idTeam: string
  strTeam: string
  strTeamShort: string
  strAlternate: string
  intFormedYear: string
  strSport: string
  strLeague: string
  strStadium: string
  strStadiumThumb: string
  strStadiumDescription: string
  strStadiumLocation: string
  intStadiumCapacity: string
  strWebsite: string
  strTeamBadge: string
  strTeamJersey: string
  strTeamLogo: string
  strTeamFanart1: string
  strTeamBanner: string
  strCountry: string
  strDescriptionEN: string
  strDescriptionFR: string
}

interface TheSportsDBPlayer {
  idPlayer: string
  strPlayer: string
  strNationality: string
  strPosition: string
  strNumber: string
  dateBorn: string
  strThumb: string
  strCutout: string
  strRender: string
}

interface TheSportsDBEvent {
  idEvent: string
  strEvent: string
  strHomeTeam: string
  strAwayTeam: string
  intHomeScore: string | null
  intAwayScore: string | null
  strHomeTeamBadge: string
  strAwayTeamBadge: string
  strLeague: string
  strSeason: string
  intRound: string
  dateEvent: string
  strTime: string
  strStatus: string
  strThumb: string
  strVenue: string
}

// ============ Interfaces exportées ============

export interface Match {
  id: number
  homeTeam: {
    name: string
    shortName: string
    crest: string
  }
  awayTeam: {
    name: string
    shortName: string
    crest: string
  }
  score: {
    home: number | null
    away: number | null
  }
  date: string
  status: "FINISHED" | "SCHEDULED" | "LIVE" | "POSTPONED"
  competition: string
  matchday: number
}

export interface TeamInfo {
  id: number
  name: string
  shortName: string
  crest: string
  venue: string
  founded: number
  country: string
  league: string
  description: string
  banner: string
  jersey: string
}

export interface Player {
  id: number
  name: string
  position: string
  nationality: string
  number?: number
  image?: string
  dateBorn?: string
}

// ============ Import du mapping ============

import { THESPORTSDB_TEAM_IDS, getDemoClubInfo } from "@/lib/constants/thesportsdb-mapping"

// Re-export pour compatibilité
export { THESPORTSDB_TEAM_IDS }

// ============ Fonctions helper ============

async function fetchFromTheSportsDB<T>(endpoint: string): Promise<T | null> {
  const cacheKey = endpoint
  const cached = cache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      console.error(`Erreur API TheSportsDB: ${response.status}`)
      return null
    }

    const data = await response.json()
    
    cache.set(cacheKey, {
      data,
      expiresAt: Date.now() + CACHE_DURATION,
    })

    return data as T
  } catch (error) {
    console.error("Erreur lors de l'appel à TheSportsDB:", error)
    return null
  }
}

// Générer un slug à partir du nom du club
export function generateClubSlug(clubName: string): string {
  return clubName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Générer un nom court à partir du nom complet
function generateShortName(name: string): string {
  // Cas spéciaux connus
  const shortNames: Record<string, string> = {
    "Paris Saint-Germain": "PSG",
    "Manchester United": "Man Utd",
    "Manchester City": "Man City",
    "FC Barcelona": "Barcelona",
    "Real Madrid CF": "Real Madrid",
    "Tottenham Hotspur": "Spurs",
    "Wolverhampton Wanderers": "Wolves",
    "Brighton and Hove Albion": "Brighton",
    "Newcastle United": "Newcastle",
    "West Ham United": "West Ham",
  }
  
  if (shortNames[name]) return shortNames[name]
  
  // Sinon, prendre les premiers mots significatifs
  return name.split(" ").slice(0, 2).join(" ").replace(/^FC |^AC |^AS /, "")
}

// ============ Fonctions API ============

// Rechercher une équipe par nom
export async function searchTeam(teamName: string): Promise<TheSportsDBTeam | null> {
  const encodedName = encodeURIComponent(teamName.replace(/ /g, "_"))
  const data = await fetchFromTheSportsDB<{ teams: TheSportsDBTeam[] | null }>(
    `/searchteams.php?t=${encodedName}`
  )
  
  return data?.teams?.[0] || null
}

// Récupérer les détails d'une équipe par nom (searchteams est plus fiable que lookupteam avec l'API gratuite)
export async function lookupTeam(teamNameOrId: string): Promise<TeamInfo | null> {
  // L'API gratuite a des limitations sur lookupteam, on utilise searchteams à la place
  // On cherche d'abord par le nom associé à l'ID dans notre mapping
  const teamNames: Record<string, string> = {
    "133714": "Paris SG",
    "133739": "Barcelona",
    "133612": "Manchester United",
    "133738": "Real Madrid",
    "133613": "Manchester City",
    "133602": "Liverpool",
    "133604": "Arsenal",
    "133610": "Chelsea",
    "133626": "Bayern Munich",
    "133676": "Juventus",
    "133628": "AC Milan",
    "133627": "Inter",
    "133720": "Marseille",
    "134113": "Monaco",
    "133700": "Lyon",
  }
  
  const searchName = teamNames[teamNameOrId] || teamNameOrId
  const encodedName = encodeURIComponent(searchName.replace(/ /g, "_"))
  
  const data = await fetchFromTheSportsDB<{ teams: TheSportsDBTeam[] | null }>(
    `/searchteams.php?t=${encodedName}`
  )
  
  // Filtrer pour ne garder que les équipes de football (Soccer)
  const soccerTeams = data?.teams?.filter(t => t.strSport === "Soccer") || []
  const team = soccerTeams[0]
  
  if (!team) return null

  return {
    id: parseInt(team.idTeam),
    name: team.strTeam,
    shortName: team.strTeamShort || generateShortName(team.strTeam),
    crest: team.strTeamBadge,
    venue: team.strStadium,
    founded: parseInt(team.intFormedYear) || 0,
    country: team.strCountry,
    league: team.strLeague,
    description: team.strDescriptionFR || team.strDescriptionEN || "",
    banner: team.strTeamBanner || team.strTeamFanart1,
    jersey: team.strTeamJersey,
  }
}

// Récupérer les joueurs d'une équipe
export async function getTeamPlayers(teamId: string): Promise<Player[]> {
  const data = await fetchFromTheSportsDB<{ player: TheSportsDBPlayer[] | null }>(
    `/lookup_all_players.php?id=${teamId}`
  )
  
  if (!data?.player) return []

  return data.player.map((p, index) => ({
    id: parseInt(p.idPlayer) || index,
    name: p.strPlayer,
    position: translatePosition(p.strPosition),
    nationality: p.strNationality,
    number: p.strNumber ? parseInt(p.strNumber) : undefined,
    image: p.strCutout || p.strThumb || p.strRender,
    dateBorn: p.dateBorn,
  }))
}

// Traduire les positions en format standard
function translatePosition(position: string): string {
  const positionMap: Record<string, string> = {
    "Goalkeeper": "Goalkeeper",
    "Defender": "Defence",
    "Centre-Back": "Defence",
    "Left-Back": "Defence",
    "Right-Back": "Defence",
    "Midfielder": "Midfield",
    "Central Midfield": "Midfield",
    "Defensive Midfield": "Midfield",
    "Attacking Midfield": "Midfield",
    "Left Midfield": "Midfield",
    "Right Midfield": "Midfield",
    "Forward": "Offence",
    "Centre-Forward": "Offence",
    "Left Winger": "Offence",
    "Right Winger": "Offence",
    "Striker": "Offence",
  }
  
  return positionMap[position] || position || "Unknown"
}

// Récupérer les prochains matchs d'une équipe
export async function getTeamNextEvents(teamId: string): Promise<Match[]> {
  const data = await fetchFromTheSportsDB<{ events: TheSportsDBEvent[] | null }>(
    `/eventsnext.php?id=${teamId}`
  )
  
  if (!data?.events) return []

  return data.events.map((event, index) => transformEvent(event, index, "SCHEDULED"))
}

// Récupérer les derniers matchs d'une équipe
export async function getTeamPastEvents(teamId: string): Promise<Match[]> {
  const data = await fetchFromTheSportsDB<{ results: TheSportsDBEvent[] | null }>(
    `/eventslast.php?id=${teamId}`
  )
  
  if (!data?.results) return []

  return data.results.map((event, index) => transformEvent(event, index, "FINISHED"))
}

// Transformer un événement TheSportsDB en Match
function transformEvent(
  event: TheSportsDBEvent, 
  index: number,
  defaultStatus: "FINISHED" | "SCHEDULED"
): Match {
  const homeScore = event.intHomeScore !== null ? parseInt(event.intHomeScore) : null
  const awayScore = event.intAwayScore !== null ? parseInt(event.intAwayScore) : null
  
  // Déterminer le statut
  let status: "FINISHED" | "SCHEDULED" | "LIVE" | "POSTPONED" = defaultStatus
  if (event.strStatus) {
    const statusLower = event.strStatus.toLowerCase()
    if (statusLower.includes("live") || statusLower.includes("progress")) {
      status = "LIVE"
    } else if (statusLower.includes("postpone") || statusLower.includes("cancel")) {
      status = "POSTPONED"
    } else if (statusLower.includes("finish") || statusLower.includes("ft")) {
      status = "FINISHED"
    }
  }

  // Construire la date complète
  const dateStr = event.dateEvent + (event.strTime ? `T${event.strTime}` : "T00:00:00")
  
  return {
    id: parseInt(event.idEvent) || index + 1,
    homeTeam: {
      name: event.strHomeTeam,
      shortName: generateShortName(event.strHomeTeam),
      crest: event.strHomeTeamBadge || "",
    },
    awayTeam: {
      name: event.strAwayTeam,
      shortName: generateShortName(event.strAwayTeam),
      crest: event.strAwayTeamBadge || "",
    },
    score: {
      home: isNaN(homeScore!) ? null : homeScore,
      away: isNaN(awayScore!) ? null : awayScore,
    },
    date: dateStr,
    status,
    competition: event.strLeague,
    matchday: parseInt(event.intRound) || 0,
  }
}

// ============ Fonction principale ============

// Récupérer toutes les données d'une équipe
export async function getTeamData(slugOrId: string): Promise<{
  team: TeamInfo | null
  players: Player[]
  lastResults: Match[]
  upcomingMatches: Match[]
} | null> {
  // Trouver l'ID TheSportsDB
  let teamId = THESPORTSDB_TEAM_IDS[slugOrId]
  
  // Si pas dans le mapping, essayer de chercher par nom
  if (!teamId) {
    const searchResult = await searchTeam(slugOrId.replace(/-/g, " "))
    if (searchResult) {
      teamId = searchResult.idTeam
    }
  }
  
  if (!teamId) {
    console.log(`Équipe non trouvée dans TheSportsDB: ${slugOrId}`)
    return null
  }

  // Récupérer toutes les données en parallèle
  const [team, players, lastResults, upcomingMatches] = await Promise.all([
    lookupTeam(teamId),
    getTeamPlayers(teamId),
    getTeamPastEvents(teamId),
    getTeamNextEvents(teamId),
  ])

  return {
    team,
    players,
    lastResults,
    upcomingMatches,
  }
}

// ============ Données de fallback ============

// Données fictives si l'API ne répond pas
export function getMockMatches(clubSlug?: string): { lastResults: Match[]; upcomingMatches: Match[] } {
  const now = new Date()
  
  // Données par défaut basées sur le slug
  const clubData: Record<string, { name: string; shortName: string; crest: string; league: string; opponents: Array<{ name: string; shortName: string; crest: string }> }> = {
    "paris-saint-germain": {
      name: "Paris Saint-Germain",
      shortName: "PSG",
      crest: "https://www.thesportsdb.com/images/media/team/badge/rwqrrq1473504808.png",
      league: "Ligue 1",
      opponents: [
        { name: "Olympique de Marseille", shortName: "OM", crest: "https://www.thesportsdb.com/images/media/team/badge/yvxswv1448811533.png" },
        { name: "AS Monaco", shortName: "Monaco", crest: "https://www.thesportsdb.com/images/media/team/badge/819x3p1547366644.png" },
        { name: "Olympique Lyonnais", shortName: "Lyon", crest: "https://www.thesportsdb.com/images/media/team/badge/yxspxq1473502522.png" },
      ],
    },
    "fc-barcelona": {
      name: "FC Barcelona",
      shortName: "Barcelona",
      crest: "https://www.thesportsdb.com/images/media/team/badge/tquxwx1448813356.png",
      league: "La Liga",
      opponents: [
        { name: "Real Madrid", shortName: "Real Madrid", crest: "https://www.thesportsdb.com/images/media/team/badge/vwvwvy1467540296.png" },
        { name: "Atletico Madrid", shortName: "Atlético", crest: "https://www.thesportsdb.com/images/media/team/badge/yrtrxs1420666733.png" },
        { name: "Sevilla", shortName: "Sevilla", crest: "https://www.thesportsdb.com/images/media/team/badge/yqyxvq1448813399.png" },
      ],
    },
    "manchester-united": {
      name: "Manchester United",
      shortName: "Man Utd",
      crest: "https://www.thesportsdb.com/images/media/team/badge/xzqdr11517660252.png",
      league: "Premier League",
      opponents: [
        { name: "Manchester City", shortName: "Man City", crest: "https://www.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png" },
        { name: "Liverpool", shortName: "Liverpool", crest: "https://www.thesportsdb.com/images/media/team/badge/uvxuqq1448813372.png" },
        { name: "Arsenal", shortName: "Arsenal", crest: "https://www.thesportsdb.com/images/media/team/badge/uyhbfe1612467038.png" },
      ],
    },
  }

  const club = clubData[clubSlug || "fc-barcelona"] || clubData["fc-barcelona"]
  const clubTeam = { name: club.name, shortName: club.shortName, crest: club.crest }

  return {
    lastResults: club.opponents.map((opponent, i) => ({
      id: i + 1,
      homeTeam: i % 2 === 0 ? clubTeam : opponent,
      awayTeam: i % 2 === 0 ? opponent : clubTeam,
      score: { home: 2 - i, away: i },
      date: new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "FINISHED" as const,
      competition: club.league,
      matchday: 15 - i,
    })),
    upcomingMatches: club.opponents.slice(0, 2).map((opponent, i) => ({
      id: 100 + i,
      homeTeam: i % 2 === 0 ? clubTeam : opponent,
      awayTeam: i % 2 === 0 ? opponent : clubTeam,
      score: { home: null, away: null },
      date: new Date(now.getTime() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "SCHEDULED" as const,
      competition: club.league,
      matchday: 16 + i,
    })),
  }
}

export function getMockSquad(clubSlug?: string): Player[] {
  const squads: Record<string, Player[]> = {
    "paris-saint-germain": [
      { id: 1, name: "Gianluigi Donnarumma", position: "Goalkeeper", nationality: "Italy", number: 99 },
      { id: 2, name: "Achraf Hakimi", position: "Defence", nationality: "Morocco", number: 2 },
      { id: 3, name: "Marquinhos", position: "Defence", nationality: "Brazil", number: 5 },
      { id: 4, name: "Lucas Hernández", position: "Defence", nationality: "France", number: 21 },
      { id: 5, name: "Vitinha", position: "Midfield", nationality: "Portugal", number: 17 },
      { id: 6, name: "Warren Zaïre-Emery", position: "Midfield", nationality: "France", number: 33 },
      { id: 7, name: "Ousmane Dembélé", position: "Offence", nationality: "France", number: 10 },
      { id: 8, name: "Bradley Barcola", position: "Offence", nationality: "France", number: 29 },
    ],
    "fc-barcelona": [
      { id: 1, name: "Marc-André ter Stegen", position: "Goalkeeper", nationality: "Germany", number: 1 },
      { id: 2, name: "Ronald Araújo", position: "Defence", nationality: "Uruguay", number: 4 },
      { id: 3, name: "Jules Koundé", position: "Defence", nationality: "France", number: 23 },
      { id: 4, name: "Pedri", position: "Midfield", nationality: "Spain", number: 8 },
      { id: 5, name: "Gavi", position: "Midfield", nationality: "Spain", number: 6 },
      { id: 6, name: "Lamine Yamal", position: "Offence", nationality: "Spain", number: 19 },
      { id: 7, name: "Raphinha", position: "Offence", nationality: "Brazil", number: 11 },
      { id: 8, name: "Robert Lewandowski", position: "Offence", nationality: "Poland", number: 9 },
    ],
    "manchester-united": [
      { id: 1, name: "André Onana", position: "Goalkeeper", nationality: "Cameroon", number: 24 },
      { id: 2, name: "Diogo Dalot", position: "Defence", nationality: "Portugal", number: 20 },
      { id: 3, name: "Lisandro Martínez", position: "Defence", nationality: "Argentina", number: 6 },
      { id: 4, name: "Casemiro", position: "Midfield", nationality: "Brazil", number: 18 },
      { id: 5, name: "Bruno Fernandes", position: "Midfield", nationality: "Portugal", number: 8 },
      { id: 6, name: "Marcus Rashford", position: "Offence", nationality: "England", number: 10 },
      { id: 7, name: "Alejandro Garnacho", position: "Offence", nationality: "Argentina", number: 17 },
      { id: 8, name: "Rasmus Højlund", position: "Offence", nationality: "Denmark", number: 11 },
    ],
  }

  return squads[clubSlug || "fc-barcelona"] || squads["fc-barcelona"]
}
