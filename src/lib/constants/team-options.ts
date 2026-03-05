// Constantes pour les options d'équipe (level, division, category, compétition)

export const TEAM_LEVELS = ["PRO", "AMATEUR", "ACADEMY"] as const
export type TeamLevelValue = (typeof TEAM_LEVELS)[number]

export const TEAM_LEVEL_LABELS: Record<TeamLevelValue, string> = {
  PRO: "Professionnel",
  AMATEUR: "Amateur",
  ACADEMY: "Centre de formation / Jeunes",
}

// --- Divisions par level (hors FR+ACADEMY) ---

export const DIVISIONS_BY_LEVEL: Record<TeamLevelValue, string[]> = {
  PRO: ["D1", "D2", "D3", "D4"],
  AMATEUR: ["D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12"],
  ACADEMY: ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "D11", "D12"],
}

// --- Catégories jeunes FR ---

export const FR_ACADEMY_CATEGORIES = [
  "U19",
  "U17",
  "U16",
  "U15",
  "U14",
  "U13",
  "U11",
  "U9",
  "U7",
] as const
export type FrAcademyCategory = (typeof FR_ACADEMY_CATEGORIES)[number]

// Grille FR Academy : pour chaque catégorie, les compétitions par échelon
interface CompetitionTier {
  National: string[]
  Regional: string[]
  Dept: string[]
}

export const FR_ACADEMY_GRID: Record<FrAcademyCategory, CompetitionTier> = {
  U19: {
    National: ["Championnat National U19"],
    Regional: ["Régional 1", "Régional 2"],
    Dept: ["D1", "D2", "D3"],
  },
  U17: {
    National: ["Championnat National U17"],
    Regional: ["Régional 1", "Régional 2"],
    Dept: ["D1", "D2", "D3"],
  },
  U16: {
    National: ["(intégré aux U17 nationaux)"],
    Regional: ["Régional"],
    Dept: ["District"],
  },
  U15: {
    National: [],
    Regional: ["Régional 1", "Régional 2"],
    Dept: ["D1", "D2", "D3"],
  },
  U14: {
    National: [],
    Regional: ["Régional"],
    Dept: ["District"],
  },
  U13: {
    National: [],
    Regional: [],
    Dept: ["D1", "D2", "D3"],
  },
  U11: {
    National: [],
    Regional: [],
    Dept: ["District (plateaux)"],
  },
  U9: {
    National: [],
    Regional: [],
    Dept: ["District (plateaux)"],
  },
  U7: {
    National: [],
    Regional: [],
    Dept: ["District (plateaux)"],
  },
}

/**
 * Retourne la liste des compétitions disponibles pour une catégorie FR Academy.
 * Concatène National + Regional + Dept en filtrant les tableaux vides.
 */
export function getCompetitionOptions(category: FrAcademyCategory): string[] {
  const tier = FR_ACADEMY_GRID[category]
  if (!tier) return []
  return [...tier.National, ...tier.Regional, ...tier.Dept]
}

/**
 * Retourne les divisions disponibles pour un level donné.
 */
export function getDivisionsForLevel(level: TeamLevelValue): string[] {
  return DIVISIONS_BY_LEVEL[level] ?? []
}

/**
 * Détermine si le mode FR Academy s'applique.
 */
export function isFrAcademy(country: string, level: TeamLevelValue): boolean {
  return country === "FR" && level === "ACADEMY"
}
