import { POSITIONS } from "@/lib/constants/football-data"

/** Codes parfois présents en base mais absents de POSITIONS */
const POSITION_CODE_ALIASES: Record<string, string> = {
  DF: "Défenseur",
  DEF: "Défenseur",
  DEFENSEUR: "Défenseur",
  MIL: "Milieu",
  MILIEU: "Milieu",
  ATT: "Attaquant",
  ATTAQUANT: "Attaquant",
  G: "Gardien",
  GB: "Gardien",
}

/**
 * Libellé français lisible pour un code de poste (ex. DC → « Défenseur central », DF → « Défenseur »).
 */
export function getPlayerPositionLabel(code: string | null | undefined): string {
  if (!code || !code.trim()) return ""
  const normalized = code.trim().toUpperCase()

  const fromList = POSITIONS.find((p) => p.code.toUpperCase() === normalized)
  if (fromList) return fromList.name

  const fromAlias = POSITION_CODE_ALIASES[normalized]
  if (fromAlias) return fromAlias

  return code.trim()
}
