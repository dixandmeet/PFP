"use client"

import { FilterChip } from "@/components/club/recruitment/FilterChip"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  COMPOSITION_FILTER_OPTIONS,
  TEAM_SORT_OPTIONS,
  countTeamsForCategory,
  countTeamsForComposition,
  countTeamsForDivision,
  countTeamsForLevel,
  getActiveFilterTags,
  getContextualFilterOptions,
  hasActiveFilters,
  type ClubTeam,
  type TeamCategoryFilter,
  type TeamCompositionFilter,
  type TeamDivisionFilter,
  type TeamFilters,
  type TeamLevelFilter,
  type TeamSortOption,
} from "@/lib/club/teams"
import { TEAM_LEVEL_LABELS } from "@/lib/constants/team-options"
import { cn } from "@/lib/utils"
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react"

interface TeamsFilterBarProps {
  teams: ClubTeam[]
  filteredCount: number
  filters: TeamFilters
  sort: TeamSortOption
  searchQuery: string
  onSearchChange: (value: string) => void
  onFiltersChange: (filters: TeamFilters) => void
  onSortChange: (sort: TeamSortOption) => void
  onReset: () => void
}

function FilterGroup({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-stadium-400">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}

export function TeamsFilterBar({
  teams,
  filteredCount,
  filters,
  sort,
  searchQuery,
  onSearchChange,
  onFiltersChange,
  onSortChange,
  onReset,
}: TeamsFilterBarProps) {
  const active = hasActiveFilters(filters)
  const filterOptions = getContextualFilterOptions(teams, filters)
  const activeTags = getActiveFilterTags(filters)

  const setLevel = (level: TeamLevelFilter) =>
    onFiltersChange({ ...filters, level })

  const setCategory = (category: TeamCategoryFilter) =>
    onFiltersChange({ ...filters, category })

  const setDivision = (division: TeamDivisionFilter) =>
    onFiltersChange({ ...filters, division })

  const setComposition = (composition: TeamCompositionFilter) =>
    onFiltersChange({ ...filters, composition })

  const clearFilter = (key: (typeof activeTags)[number]["key"]) => {
    onFiltersChange({ ...filters, [key]: "ALL" })
  }

  const showLevelFilters = filterOptions.levels.length > 1
  const showCategoryFilters = filterOptions.categories.length > 0
  const showDivisionFilters = filterOptions.divisions.length > 1

  const compositionOptions = COMPOSITION_FILTER_OPTIONS.filter((opt) => {
    const count = countTeamsForComposition(teams, opt.value, filters)
    return opt.value === "ALL" || count > 0 || filters.composition === opt.value
  })

  const showStructureFilters =
    showLevelFilters || showCategoryFilters || showDivisionFilters

  return (
    <div className="mb-6 rounded-2xl border border-stadium-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Input
            placeholder="Rechercher une équipe, catégorie, division…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            icon={<Search className="h-4 w-4" />}
            className="h-10"
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Select value={sort} onValueChange={(v) => onSortChange(v as TeamSortOption)}>
            <SelectTrigger className="h-10 w-full rounded-xl sm:w-44">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              {TEAM_SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {active && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              className="h-10 gap-1.5 shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Réinitialiser</span>
            </Button>
          )}
        </div>
      </div>

      {(showStructureFilters || compositionOptions.length > 1) && (
        <div className="mt-4 border-t border-stadium-100 pt-4">
          <div className="mb-3 flex items-center gap-2 text-stadium-500">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Affiner les résultats</span>
            {active && (
              <span className="text-xs text-stadium-400">
                · {filteredCount} équipe{filteredCount !== 1 ? "s" : ""}
                {filteredCount !== teams.length ? ` sur ${teams.length}` : ""}
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {showLevelFilters && (
              <FilterGroup label="Niveau">
                <FilterChip
                  active={filters.level === "ALL"}
                  onClick={() => setLevel("ALL")}
                >
                  Tous ({countTeamsForLevel(teams, "ALL", filters)})
                </FilterChip>
                {filterOptions.levels.map((level) => (
                  <FilterChip
                    key={level}
                    active={filters.level === level}
                    onClick={() => setLevel(level)}
                  >
                    {TEAM_LEVEL_LABELS[level]} (
                    {countTeamsForLevel(teams, level, filters)})
                  </FilterChip>
                ))}
              </FilterGroup>
            )}

            {showCategoryFilters && (
              <FilterGroup label="Catégorie">
                <FilterChip
                  active={filters.category === "ALL"}
                  onClick={() => setCategory("ALL")}
                >
                  Toutes ({countTeamsForCategory(teams, "ALL", filters)})
                </FilterChip>
                {filterOptions.categories.map((category) => (
                  <FilterChip
                    key={category}
                    active={filters.category === category}
                    onClick={() => setCategory(category)}
                  >
                    {category} ({countTeamsForCategory(teams, category, filters)})
                  </FilterChip>
                ))}
              </FilterGroup>
            )}

            {showDivisionFilters && (
              <FilterGroup label="Division">
                <FilterChip
                  active={filters.division === "ALL"}
                  onClick={() => setDivision("ALL")}
                >
                  Toutes ({countTeamsForDivision(teams, "ALL", filters)})
                </FilterChip>
                {filterOptions.divisions.map((division) => (
                  <FilterChip
                    key={division}
                    active={filters.division === division}
                    onClick={() => setDivision(division)}
                  >
                    {division} ({countTeamsForDivision(teams, division, filters)})
                  </FilterChip>
                ))}
              </FilterGroup>
            )}

            {compositionOptions.length > 1 && (
              <FilterGroup
                label="Effectif"
                className={cn(
                  showStructureFilters && "sm:col-span-2 lg:col-span-3"
                )}
              >
                {compositionOptions.map((opt) => (
                  <FilterChip
                    key={opt.value}
                    active={filters.composition === opt.value}
                    onClick={() => setComposition(opt.value)}
                  >
                    {opt.label} (
                    {countTeamsForComposition(teams, opt.value, filters)})
                  </FilterChip>
                ))}
              </FilterGroup>
            )}
          </div>
        </div>
      )}

      {(activeTags.length > 0 || filters.query.trim()) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-stadium-100 pt-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-stadium-400">
            Actifs
          </span>
          {filters.query.trim() && (
            <Badge
              variant="secondary"
              className="gap-1 rounded-lg border-stadium-200 bg-stadium-50 px-2 py-0.5 font-normal text-stadium-700 hover:bg-stadium-100"
            >
              « {filters.query.trim()} »
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="rounded p-0.5 hover:bg-stadium-200/60"
                aria-label="Retirer la recherche"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeTags.map((tag) => (
            <Badge
              key={tag.key}
              variant="secondary"
              className="gap-1 rounded-lg border-pitch-200 bg-pitch-50 px-2 py-0.5 font-normal text-pitch-800 hover:bg-pitch-100"
            >
              {tag.label} : {tag.value}
              <button
                type="button"
                onClick={() => clearFilter(tag.key)}
                className="rounded p-0.5 hover:bg-pitch-200/60"
                aria-label={`Retirer le filtre ${tag.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
