// ── Types & Constantes — Système d'évaluation manuelle joueur ─────────────────

// ── Types de base ─────────────────────────────────────────────────────────────

export type PositionGroup = "ATT" | "MIL" | "DEF" | "GK" | "DEFAULT"

export interface Criterion {
  key: string
  label: string
  weight: number
  description: string
}

export interface EvaluationCategory {
  key: string
  label: string
  weight: number
  color: string          // Tailwind color class prefix (ex: "emerald")
  iconName: string       // Nom d'icône Lucide
  criteria: Criterion[]
}

export interface CriterionDetail {
  key: string
  label: string
  rawScore: number       // 1-5
  weightedScore: number  // contribution au total
  categoryKey: string
}

export interface EvaluationResult {
  totalScore: number
  level: string
  categoryScores: Record<string, number>   // catégorieKey → 0-100
  criterionDetails: CriterionDetail[]
  strengths: { key: string; label: string; score: number }[]
  weaknesses: { key: string; label: string; score: number }[]
}

export interface PlayerEvaluationData {
  playerId: string
  positionGroup: PositionGroup
  scores: CriterionScores
  notes: string
  result: EvaluationResult
  evaluatedAt: string    // ISO date
}

export type CriterionScores = Record<string, number>

// ── Catégories & Critères (16 critères, 4 catégories) ─────────────────────────

export const EVALUATION_CATEGORIES: EvaluationCategory[] = [
  {
    key: "technique",
    label: "Technique",
    weight: 30,
    color: "emerald",
    iconName: "Footprints",
    criteria: [
      { key: "controle",  label: "Contrôle de balle", weight: 8, description: "Capacité à recevoir et maîtriser le ballon dans toutes les situations" },
      { key: "passe",     label: "Qualité de passe",  weight: 7, description: "Précision et variété des passes courtes et longues" },
      { key: "dribble",   label: "Dribble",           weight: 7, description: "Habileté à éliminer un adversaire balle au pied" },
      { key: "finition",  label: "Finition",          weight: 8, description: "Efficacité devant le but, qualité de frappe" },
    ],
  },
  {
    key: "intelligence",
    label: "Intelligence",
    weight: 25,
    color: "blue",
    iconName: "Eye",
    criteria: [
      { key: "vision",      label: "Vision du jeu",      weight: 7, description: "Capacité à lire le jeu et anticiper les mouvements" },
      { key: "placement",   label: "Placement",          weight: 6, description: "Positionnement intelligent sur le terrain" },
      { key: "decision",    label: "Prise de décision",  weight: 6, description: "Choix judicieux et rapides dans le jeu" },
      { key: "lecture",     label: "Lecture du jeu",      weight: 6, description: "Compréhension tactique des situations de jeu" },
    ],
  },
  {
    key: "physique",
    label: "Physique",
    weight: 25,
    color: "orange",
    iconName: "Flame",
    criteria: [
      { key: "vitesse",    label: "Vitesse",    weight: 7, description: "Vitesse de pointe et capacité d'accélération" },
      { key: "endurance",  label: "Endurance",  weight: 6, description: "Capacité à maintenir l'effort sur la durée du match" },
      { key: "puissance",  label: "Puissance",  weight: 6, description: "Force physique dans les duels et les frappes" },
      { key: "agilite",    label: "Agilité",    weight: 6, description: "Souplesse, coordination et changements de direction" },
    ],
  },
  {
    key: "mental",
    label: "Mental",
    weight: 20,
    color: "purple",
    iconName: "Shield",
    criteria: [
      { key: "concentration", label: "Concentration",  weight: 5, description: "Capacité à rester focalisé pendant tout le match" },
      { key: "combativite",   label: "Combativité",    weight: 5, description: "Engagement, détermination et volonté de se battre" },
      { key: "discipline",    label: "Discipline",     weight: 5, description: "Respect des consignes tactiques et fair-play" },
      { key: "confiance",     label: "Confiance",      weight: 5, description: "Assurance dans ses capacités et prise d'initiative" },
    ],
  },
]

// ── Tous les critères à plat ──────────────────────────────────────────────────

export const ALL_CRITERIA: Criterion[] = EVALUATION_CATEGORIES.flatMap((c) => c.criteria)

export const ALL_CRITERION_KEYS: string[] = ALL_CRITERIA.map((c) => c.key)

// ── Poids total (somme des poids de tous les critères) ────────────────────────

export const TOTAL_WEIGHT = ALL_CRITERIA.reduce((sum, c) => sum + c.weight, 0)

// ── Ajustements par position ──────────────────────────────────────────────────
// Multiplicateur appliqué au poids du critère selon le groupe de position

export const POSITION_ADJUSTMENTS: Record<PositionGroup, Partial<Record<string, number>>> = {
  ATT:     { finition: 1.2, dribble: 1.1 },
  MIL:     { vision: 1.2, decision: 1.15 },
  DEF:     { placement: 1.2, lecture: 1.15 },
  GK:      {},
  DEFAULT: {},
}

// ── Mapping position DB → groupe ──────────────────────────────────────────────

const POSITION_GROUP_MAP: Record<string, PositionGroup> = {
  // Attaquants
  ATT: "ATT", BU: "ATT", SS: "ATT", AP: "ATT", AG: "ATT", AD: "ATT",
  // Milieux
  MC: "MIL", MOC: "MIL", MDC: "MIL", MDF: "MIL", MR: "MIL", MG: "MIL", MD: "MIL", MF: "MIL",
  // Défenseurs
  DC: "DEF", LIB: "DEF", DG: "DEF", DD: "DEF", DF: "DEF",
  // Gardien
  GK: "GK",
}

export function resolvePositionGroup(dbPosition: string | null | undefined): PositionGroup {
  if (!dbPosition) return "DEFAULT"
  return POSITION_GROUP_MAP[dbPosition] ?? "DEFAULT"
}

// ── Niveaux ───────────────────────────────────────────────────────────────────

export const LEVEL_THRESHOLDS = [
  { min: 85, label: "Potentiel pro",   color: "text-amber-500" },
  { min: 75, label: "Semi-pro",        color: "text-emerald-600" },
  { min: 60, label: "Bon",             color: "text-blue-600" },
  { min: 40, label: "Intermédiaire",   color: "text-slate-600" },
  { min: 0,  label: "Amateur",         color: "text-slate-400" },
] as const

export function getPlayerLevel(score: number): string {
  for (const t of LEVEL_THRESHOLDS) {
    if (score >= t.min) return t.label
  }
  return "Amateur"
}

export function getLevelColor(score: number): string {
  for (const t of LEVEL_THRESHOLDS) {
    if (score >= t.min) return t.color
  }
  return "text-slate-400"
}

// ── Couleurs par catégorie ────────────────────────────────────────────────────

export const CATEGORY_COLOR_MAP: Record<string, {
  bg: string
  fill: string
  text: string
  border: string
  gradient: string
}> = {
  emerald: {
    bg: "bg-emerald-50",
    fill: "bg-emerald-500",
    text: "text-emerald-700",
    border: "border-emerald-200",
    gradient: "from-emerald-400 to-emerald-600",
  },
  blue: {
    bg: "bg-blue-50",
    fill: "bg-blue-500",
    text: "text-blue-700",
    border: "border-blue-200",
    gradient: "from-blue-400 to-blue-600",
  },
  orange: {
    bg: "bg-orange-50",
    fill: "bg-orange-500",
    text: "text-orange-700",
    border: "border-orange-200",
    gradient: "from-orange-400 to-orange-600",
  },
  purple: {
    bg: "bg-purple-50",
    fill: "bg-purple-500",
    text: "text-purple-700",
    border: "border-purple-200",
    gradient: "from-purple-400 to-purple-600",
  },
}
