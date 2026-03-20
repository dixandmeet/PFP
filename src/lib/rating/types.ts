import type { FootballVideoSkillCategory } from "@prisma/client"

// ── Attributs joueur ──────────────────────────────────────────────────────────

export const PLAYER_ATTRIBUTES = ["PAC", "FIN", "TEC", "VIS", "PHY", "DEF", "GK"] as const
export type PlayerAttribute = (typeof PLAYER_ATTRIBUTES)[number]

// ── Poids par catégorie de vidéo ──────────────────────────────────────────────
// Quand un admin évalue une vidéo d'une catégorie donnée,
// le score de chaque attribut est pondéré selon cette table.

export const SKILL_CATEGORY_WEIGHTS: Record<
  FootballVideoSkillCategory,
  Partial<Record<PlayerAttribute, number>>
> = {
  TECHNICAL:         { TEC: 0.6, FIN: 0.2, VIS: 0.2 },
  PHYSICAL_ATHLETIC: { PHY: 0.6, PAC: 0.3, DEF: 0.1 },
  SET_PIECES:        { FIN: 0.5, TEC: 0.3, VIS: 0.2 },
  GOALKEEPING:       { GK: 0.7, DEF: 0.2, PHY: 0.1 },
  MATCH_HIGHLIGHTS:  { PAC: 1/6, FIN: 1/6, TEC: 1/6, VIS: 1/6, PHY: 1/6, DEF: 1/6 },
  TACTICAL:          { VIS: 0.5, DEF: 0.3, TEC: 0.2 },
  // Catégories sans impact sur le rating
  PORTRAIT:          {},
  UNSPECIFIED:       {},
}

// ── Poids OVR par position ────────────────────────────────────────────────────
// Codes de position depuis src/lib/constants/football-data.ts

export const POSITION_OVR_WEIGHTS: Record<string, Record<PlayerAttribute, number>> = {
  // Gardien
  GK:  { PAC: 0.05, FIN: 0.00, TEC: 0.10, VIS: 0.10, PHY: 0.15, DEF: 0.20, GK: 0.40 },
  // Défenseurs centraux
  DC:  { PAC: 0.10, FIN: 0.05, TEC: 0.10, VIS: 0.10, PHY: 0.25, DEF: 0.35, GK: 0.05 },
  LIB: { PAC: 0.10, FIN: 0.05, TEC: 0.15, VIS: 0.15, PHY: 0.20, DEF: 0.30, GK: 0.05 },
  // Latéraux
  DG:  { PAC: 0.25, FIN: 0.05, TEC: 0.15, VIS: 0.15, PHY: 0.15, DEF: 0.20, GK: 0.05 },
  DD:  { PAC: 0.25, FIN: 0.05, TEC: 0.15, VIS: 0.15, PHY: 0.15, DEF: 0.20, GK: 0.05 },
  // Milieux défensifs
  MDC: { PAC: 0.10, FIN: 0.05, TEC: 0.15, VIS: 0.20, PHY: 0.20, DEF: 0.25, GK: 0.05 },
  MDF: { PAC: 0.10, FIN: 0.05, TEC: 0.15, VIS: 0.20, PHY: 0.20, DEF: 0.25, GK: 0.05 },
  // Milieux centraux
  MC:  { PAC: 0.15, FIN: 0.10, TEC: 0.20, VIS: 0.20, PHY: 0.15, DEF: 0.15, GK: 0.05 },
  MR:  { PAC: 0.15, FIN: 0.10, TEC: 0.20, VIS: 0.20, PHY: 0.15, DEF: 0.15, GK: 0.05 },
  MOC: { PAC: 0.15, FIN: 0.15, TEC: 0.25, VIS: 0.25, PHY: 0.10, DEF: 0.05, GK: 0.05 },
  // Milieux latéraux
  MG:  { PAC: 0.25, FIN: 0.10, TEC: 0.20, VIS: 0.20, PHY: 0.10, DEF: 0.10, GK: 0.05 },
  MD:  { PAC: 0.25, FIN: 0.10, TEC: 0.20, VIS: 0.20, PHY: 0.10, DEF: 0.10, GK: 0.05 },
  // Ailiers
  AG:  { PAC: 0.25, FIN: 0.15, TEC: 0.25, VIS: 0.15, PHY: 0.10, DEF: 0.05, GK: 0.05 },
  AD:  { PAC: 0.25, FIN: 0.15, TEC: 0.25, VIS: 0.15, PHY: 0.10, DEF: 0.05, GK: 0.05 },
  // Attaquants
  ATT: { PAC: 0.20, FIN: 0.30, TEC: 0.15, VIS: 0.15, PHY: 0.10, DEF: 0.05, GK: 0.05 },
  BU:  { PAC: 0.15, FIN: 0.35, TEC: 0.10, VIS: 0.10, PHY: 0.20, DEF: 0.05, GK: 0.05 },
  SS:  { PAC: 0.20, FIN: 0.25, TEC: 0.20, VIS: 0.15, PHY: 0.10, DEF: 0.05, GK: 0.05 },
  AP:  { PAC: 0.20, FIN: 0.30, TEC: 0.15, VIS: 0.15, PHY: 0.10, DEF: 0.05, GK: 0.05 },
}

export const DEFAULT_OVR_WEIGHTS: Record<PlayerAttribute, number> = {
  PAC: 0.20, FIN: 0.20, TEC: 0.15, VIS: 0.15, PHY: 0.15, DEF: 0.15, GK: 0.00,
}

// ── Sous-critères d'évaluation par catégorie ──────────────────────────────────

export const EVALUATION_SUB_CRITERIA: Record<string, { key: string; label: string; max: number }[]> = {
  TECHNICAL: [
    { key: "ballControl", label: "Contrôle de balle", max: 20 },
    { key: "passing", label: "Qualité de passe", max: 20 },
    { key: "dribbling", label: "Dribble", max: 20 },
    { key: "firstTouch", label: "Première touche", max: 20 },
    { key: "creativity", label: "Créativité", max: 20 },
  ],
  PHYSICAL_ATHLETIC: [
    { key: "speed", label: "Vitesse", max: 20 },
    { key: "acceleration", label: "Accélération", max: 20 },
    { key: "strength", label: "Force", max: 20 },
    { key: "stamina", label: "Endurance", max: 20 },
    { key: "agility", label: "Agilité", max: 20 },
  ],
  SET_PIECES: [
    { key: "accuracy", label: "Précision", max: 20 },
    { key: "power", label: "Puissance", max: 20 },
    { key: "technique", label: "Technique", max: 20 },
    { key: "composure", label: "Sang-froid", max: 20 },
    { key: "consistency", label: "Régularité", max: 20 },
  ],
  GOALKEEPING: [
    { key: "reflexes", label: "Réflexes", max: 20 },
    { key: "positioning", label: "Placement", max: 20 },
    { key: "handling", label: "Prise de balle", max: 20 },
    { key: "distribution", label: "Relance", max: 20 },
    { key: "commandArea", label: "Jeu aérien", max: 20 },
  ],
  MATCH_HIGHLIGHTS: [
    { key: "impact", label: "Impact sur le jeu", max: 20 },
    { key: "decisionMaking", label: "Prise de décision", max: 20 },
    { key: "workRate", label: "Volume de jeu", max: 20 },
    { key: "positioning", label: "Placement", max: 20 },
    { key: "clutch", label: "Performance sous pression", max: 20 },
  ],
  TACTICAL: [
    { key: "awareness", label: "Lecture du jeu", max: 20 },
    { key: "positioning", label: "Placement tactique", max: 20 },
    { key: "anticipation", label: "Anticipation", max: 20 },
    { key: "communication", label: "Communication", max: 20 },
    { key: "adaptability", label: "Adaptabilité", max: 20 },
  ],
}

// ── Confiance ─────────────────────────────────────────────────────────────────

export function confidenceLevelFromCount(count: number): string {
  if (count >= 5) return "HIGH"
  if (count >= 3) return "MEDIUM"
  return "LOW"
}

// ── Types d'attribut scores ───────────────────────────────────────────────────

export type AttributeScores = Record<PlayerAttribute, number>

/** Mapping entre les champs DB VideoSkillEvaluation et les attributs */
export const ATTRIBUTE_DB_FIELDS: Record<PlayerAttribute, string> = {
  PAC: "pacScore",
  FIN: "finScore",
  TEC: "tecScore",
  VIS: "visScore",
  PHY: "phyScore",
  DEF: "defScore",
  GK: "gkScore",
}
