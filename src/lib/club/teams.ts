import type { TeamPlayerData } from "@/components/club/teams/PlayerRow"
import {
  TEAM_LEVELS,
  TEAM_LEVEL_LABELS,
  type TeamLevelValue,
} from "@/lib/constants/team-options"

export interface StaffMember {
  id: string
  name: string
  role: string
  email?: string
}

export interface ClubTeam {
  id: string
  name: string
  level: string
  division?: string | null
  category?: string | null
  competitionName?: string | null
  createdAt?: string
  staffMembers: StaffMember[]
  teamPlayers: TeamPlayerData[]
}

export type TeamLevelFilter = "ALL" | TeamLevelValue
export type TeamCategoryFilter = "ALL" | string
export type TeamDivisionFilter = "ALL" | string
export type TeamCompositionFilter =
  | "ALL"
  | "WITH_PLAYERS"
  | "NO_PLAYERS"
  | "WITH_STAFF"
  | "NO_STAFF"
  | "EMPTY"
export type TeamSortOption =
  | "NAME_ASC"
  | "NAME_DESC"
  | "PLAYERS_DESC"
  | "STAFF_DESC"
  | "RECENT"

export interface TeamFilters {
  query: string
  level: TeamLevelFilter
  category: TeamCategoryFilter
  division: TeamDivisionFilter
  composition: TeamCompositionFilter
}

export const DEFAULT_TEAM_FILTERS: TeamFilters = {
  query: "",
  level: "ALL",
  category: "ALL",
  division: "ALL",
  composition: "ALL",
}

export const TEAM_SORT_OPTIONS: { value: TeamSortOption; label: string }[] = [
  { value: "NAME_ASC", label: "Nom A→Z" },
  { value: "NAME_DESC", label: "Nom Z→A" },
  { value: "PLAYERS_DESC", label: "Plus de joueurs" },
  { value: "STAFF_DESC", label: "Plus de staff" },
  { value: "RECENT", label: "Plus récentes" },
]

export const COMPOSITION_FILTER_OPTIONS: {
  value: TeamCompositionFilter
  label: string
}[] = [
  { value: "ALL", label: "Toutes" },
  { value: "WITH_PLAYERS", label: "Avec joueurs" },
  { value: "NO_PLAYERS", label: "Sans joueurs" },
  { value: "WITH_STAFF", label: "Avec staff" },
  { value: "NO_STAFF", label: "Sans staff" },
  { value: "EMPTY", label: "Vides" },
]

function teamSearchHaystack(team: ClubTeam): string {
  return [
    team.name,
    team.category,
    team.division,
    team.competitionName,
    TEAM_LEVEL_LABELS[team.level as TeamLevelValue] || team.level,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

function matchesComposition(
  team: ClubTeam,
  composition: TeamCompositionFilter
): boolean {
  const playerCount = team.teamPlayers.length
  const staffCount = team.staffMembers.length

  switch (composition) {
    case "ALL":
      return true
    case "WITH_PLAYERS":
      return playerCount > 0
    case "NO_PLAYERS":
      return playerCount === 0
    case "WITH_STAFF":
      return staffCount > 0
    case "NO_STAFF":
      return staffCount === 0
    case "EMPTY":
      return playerCount === 0 && staffCount === 0
    default:
      return true
  }
}

export function filterTeams(teams: ClubTeam[], filters: TeamFilters): ClubTeam[] {
  const query = filters.query.trim().toLowerCase()

  return teams.filter((team) => {
    if (filters.level !== "ALL" && team.level !== filters.level) {
      return false
    }
    if (filters.category !== "ALL" && team.category !== filters.category) {
      return false
    }
    if (filters.division !== "ALL" && team.division !== filters.division) {
      return false
    }
    if (!matchesComposition(team, filters.composition)) {
      return false
    }
    if (query && !teamSearchHaystack(team).includes(query)) {
      return false
    }
    return true
  })
}

export function sortTeams(teams: ClubTeam[], sort: TeamSortOption): ClubTeam[] {
  const sorted = [...teams]

  switch (sort) {
    case "NAME_ASC":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "fr"))
    case "NAME_DESC":
      return sorted.sort((a, b) => b.name.localeCompare(a.name, "fr"))
    case "PLAYERS_DESC":
      return sorted.sort(
        (a, b) => b.teamPlayers.length - a.teamPlayers.length
      )
    case "STAFF_DESC":
      return sorted.sort(
        (a, b) => b.staffMembers.length - a.staffMembers.length
      )
    case "RECENT":
      return sorted.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bTime - aTime
      })
    default:
      return sorted
  }
}

export function computeTeamKpis(teams: ClubTeam[]) {
  return {
    totalTeams: teams.length,
    totalPlayers: teams.reduce((acc, t) => acc + t.teamPlayers.length, 0),
    totalStaff: teams.reduce((acc, t) => acc + t.staffMembers.length, 0),
    totalApplications: 0,
  }
}

export interface TeamFilterOptions {
  levels: TeamLevelValue[]
  categories: string[]
  divisions: string[]
}

export function getFilterOptions(teams: ClubTeam[]): TeamFilterOptions {
  const levels = new Set<TeamLevelValue>()
  const categories = new Set<string>()
  const divisions = new Set<string>()

  for (const team of teams) {
    if (TEAM_LEVELS.includes(team.level as TeamLevelValue)) {
      levels.add(team.level as TeamLevelValue)
    }
    if (team.category) categories.add(team.category)
    if (team.division) divisions.add(team.division)
  }

  const sortAlpha = (a: string, b: string) => a.localeCompare(b, "fr")

  return {
    levels: Array.from(levels),
    categories: Array.from(categories).sort(sortAlpha),
    divisions: Array.from(divisions).sort(sortAlpha),
  }
}

export type TeamFilterDimension = "level" | "category" | "division" | "composition"

function getTeamsForDimensionCount(
  teams: ClubTeam[],
  filters: TeamFilters,
  dimension: TeamFilterDimension
): ClubTeam[] {
  const partial: TeamFilters = { ...filters }
  if (dimension === "level") partial.level = "ALL"
  if (dimension === "category") partial.category = "ALL"
  if (dimension === "division") partial.division = "ALL"
  if (dimension === "composition") partial.composition = "ALL"
  return filterTeams(teams, partial)
}

export function countTeamsForLevel(
  teams: ClubTeam[],
  level: TeamLevelFilter,
  filters?: TeamFilters
): number {
  const base = filters ? getTeamsForDimensionCount(teams, filters, "level") : teams
  if (level === "ALL") return base.length
  return base.filter((t) => t.level === level).length
}

export function countTeamsForCategory(
  teams: ClubTeam[],
  category: TeamCategoryFilter,
  filters?: TeamFilters
): number {
  const base = filters ? getTeamsForDimensionCount(teams, filters, "category") : teams
  if (category === "ALL") return base.length
  return base.filter((t) => t.category === category).length
}

export function countTeamsForDivision(
  teams: ClubTeam[],
  division: TeamDivisionFilter,
  filters?: TeamFilters
): number {
  const base = filters ? getTeamsForDimensionCount(teams, filters, "division") : teams
  if (division === "ALL") return base.length
  return base.filter((t) => t.division === division).length
}

export function countTeamsForComposition(
  teams: ClubTeam[],
  composition: TeamCompositionFilter,
  filters?: TeamFilters
): number {
  const base = filters ? getTeamsForDimensionCount(teams, filters, "composition") : teams
  if (composition === "ALL") return base.length
  return base.filter((t) => matchesComposition(t, composition)).length
}

export function getContextualFilterOptions(
  teams: ClubTeam[],
  filters: TeamFilters
): TeamFilterOptions {
  const levels = new Set<TeamLevelValue>()
  const categories = new Set<string>()
  const divisions = new Set<string>()

  for (const team of getTeamsForDimensionCount(teams, filters, "level")) {
    if (TEAM_LEVELS.includes(team.level as TeamLevelValue)) {
      levels.add(team.level as TeamLevelValue)
    }
  }
  for (const team of getTeamsForDimensionCount(teams, filters, "category")) {
    if (team.category) categories.add(team.category)
  }
  for (const team of getTeamsForDimensionCount(teams, filters, "division")) {
    if (team.division) divisions.add(team.division)
  }

  const sortAlpha = (a: string, b: string) => a.localeCompare(b, "fr")

  return {
    levels: Array.from(levels),
    categories: Array.from(categories).sort(sortAlpha),
    divisions: Array.from(divisions).sort(sortAlpha),
  }
}

export function sanitizeTeamFilters(
  teams: ClubTeam[],
  filters: TeamFilters
): TeamFilters {
  const options = getContextualFilterOptions(teams, filters)
  return {
    ...filters,
    category:
      filters.category !== "ALL" && !options.categories.includes(filters.category)
        ? "ALL"
        : filters.category,
    division:
      filters.division !== "ALL" && !options.divisions.includes(filters.division)
        ? "ALL"
        : filters.division,
    level:
      filters.level !== "ALL" && !options.levels.includes(filters.level as TeamLevelValue)
        ? "ALL"
        : filters.level,
  }
}

export function countActiveTeamFilters(filters: TeamFilters, sort: TeamSortOption): number {
  return (
    (filters.query.trim() ? 1 : 0) +
    (filters.level !== "ALL" ? 1 : 0) +
    (filters.category !== "ALL" ? 1 : 0) +
    (filters.division !== "ALL" ? 1 : 0) +
    (filters.composition !== "ALL" ? 1 : 0) +
    (sort !== "NAME_ASC" ? 1 : 0)
  )
}

export function getActiveFilterTags(filters: TeamFilters): {
  key: "level" | "category" | "division" | "composition"
  label: string
  value: string
}[] {
  const tags: {
    key: "level" | "category" | "division" | "composition"
    label: string
    value: string
  }[] = []

  if (filters.level !== "ALL") {
    tags.push({
      key: "level",
      label: "Niveau",
      value:
        TEAM_LEVEL_LABELS[filters.level as TeamLevelValue] || filters.level,
    })
  }
  if (filters.category !== "ALL") {
    tags.push({ key: "category", label: "Catégorie", value: filters.category })
  }
  if (filters.division !== "ALL") {
    tags.push({ key: "division", label: "Division", value: filters.division })
  }
  if (filters.composition !== "ALL") {
    const opt = COMPOSITION_FILTER_OPTIONS.find((o) => o.value === filters.composition)
    tags.push({
      key: "composition",
      label: "Effectif",
      value: opt?.label ?? filters.composition,
    })
  }

  return tags
}

export function hasActiveFilters(filters: TeamFilters): boolean {
  return (
    filters.query.trim() !== "" ||
    filters.level !== "ALL" ||
    filters.category !== "ALL" ||
    filters.division !== "ALL" ||
    filters.composition !== "ALL"
  )
}

export function getDefaultExpandedTeamIds(teams: ClubTeam[]): string[] {
  if (teams.length <= 3) {
    return teams.map((t) => t.id)
  }
  return []
}
