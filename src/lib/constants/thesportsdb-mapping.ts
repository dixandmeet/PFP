// Mapping des clubs vers les IDs TheSportsDB
// Documentation: https://www.thesportsdb.com/documentation

// Mapping des slugs de clubs vers les IDs TheSportsDB
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
  "lazio": "133630",
  
  // Portugal
  "fc-porto": "133720",
  "benfica": "133616",
  "sporting-cp": "133720",
}

// Informations de base des clubs pour le fallback
export interface ClubBasicInfo {
  name: string
  shortName: string
  country: string
  league: string
  thesportsdbId: string
}

export const DEMO_CLUBS_INFO: Record<string, ClubBasicInfo> = {
  "paris-saint-germain": {
    name: "Paris Saint-Germain",
    shortName: "PSG",
    country: "France",
    league: "Ligue 1",
    thesportsdbId: "133714",
  },
  "fc-barcelona": {
    name: "FC Barcelona",
    shortName: "Barcelona",
    country: "Espagne",
    league: "La Liga",
    thesportsdbId: "133739",
  },
  "manchester-united": {
    name: "Manchester United",
    shortName: "Man Utd",
    country: "Angleterre",
    league: "Premier League",
    thesportsdbId: "133612",
  },
  "real-madrid": {
    name: "Real Madrid",
    shortName: "Real Madrid",
    country: "Espagne",
    league: "La Liga",
    thesportsdbId: "133738",
  },
  "liverpool": {
    name: "Liverpool",
    shortName: "Liverpool",
    country: "Angleterre",
    league: "Premier League",
    thesportsdbId: "133602",
  },
  "bayern-munich": {
    name: "Bayern Munich",
    shortName: "Bayern",
    country: "Allemagne",
    league: "Bundesliga",
    thesportsdbId: "133626",
  },
}

// Obtenir l'ID TheSportsDB depuis un slug
export function getTheSportsDBId(slug: string): string | null {
  return THESPORTSDB_TEAM_IDS[slug] || null
}

// Obtenir les infos de base d'un club démo
export function getDemoClubInfo(slug: string): ClubBasicInfo | null {
  return DEMO_CLUBS_INFO[slug] || null
}
