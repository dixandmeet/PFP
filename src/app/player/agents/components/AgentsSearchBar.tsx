"use client"

import { useState, forwardRef } from "react"
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
  Search,
  Filter,
  Grid3x3,
  List,
  X,
  ChevronDown,
} from "lucide-react"

interface AgentsSearchBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterCountry: string
  onFilterCountryChange: (value: string) => void
  filterSpecialty: string
  onFilterSpecialtyChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
  allCountries: string[]
  allSpecialties: string[]
  filteredCount: number
  onReset: () => void
}

export const AgentsSearchBar = forwardRef<HTMLInputElement, AgentsSearchBarProps>(
  function AgentsSearchBar(
    {
      searchQuery,
      onSearchChange,
      filterCountry,
      onFilterCountryChange,
      filterSpecialty,
      onFilterSpecialtyChange,
      sortBy,
      onSortChange,
      viewMode,
      onViewModeChange,
      allCountries,
      allSpecialties,
      filteredCount,
      onReset,
    },
    ref
  ) {
    const [filtersOpen, setFiltersOpen] = useState(false)

    const activeFilterCount =
      (filterCountry !== "all" ? 1 : 0) +
      (filterSpecialty !== "all" ? 1 : 0) +
      (sortBy !== "verified" ? 1 : 0)

    const hasActiveFilters = filterCountry !== "all" || filterSpecialty !== "all" || !!searchQuery

    const sortLabel: Record<string, string> = {
      verified: "Verifies d'abord",
      mandates: "Plus de mandats",
      recent: "Recents",
    }

    return (
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stadium-400 pointer-events-none" />
            <Input
              ref={ref}
              placeholder="Rechercher par nom, agence, specialites..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-11 rounded-xl border-stadium-200 bg-white text-sm placeholder:text-stadium-400 focus-visible:ring-2 focus-visible:ring-pitch-500 focus-visible:ring-offset-0 transition-shadow duration-200"
              aria-label="Rechercher un agent"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stadium-400 hover:text-stadium-600 transition-colors"
                aria-label="Effacer la recherche"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`shrink-0 rounded-xl h-11 px-4 font-medium border-stadium-200 transition-all duration-200 ${
              filtersOpen ? "bg-pitch-50 border-pitch-300 text-pitch-700" : "hover:border-pitch-300"
            }`}
            aria-expanded={filtersOpen}
            aria-controls="filter-panel"
            aria-label="Ouvrir les filtres"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtres
            {activeFilterCount > 0 && (
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-pitch-600 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown
              className={`ml-1.5 h-3.5 w-3.5 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
            />
          </Button>

          <div className="shrink-0 flex items-center bg-stadium-100 rounded-xl p-0.5 gap-0.5">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-white text-pitch-600 shadow-sm"
                  : "text-stadium-400 hover:text-stadium-600"
              }`}
              title="Vue grille"
              aria-label="Vue grille"
              aria-pressed={viewMode === "grid"}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-white text-pitch-600 shadow-sm"
                  : "text-stadium-400 hover:text-stadium-600"
              }`}
              title="Vue liste"
              aria-label="Vue liste"
              aria-pressed={viewMode === "list"}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          id="filter-panel"
          className={`overflow-hidden transition-all duration-250 ease-out ${
            filtersOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-wrap items-center gap-3 pt-1 pb-2">
            <Select value={filterCountry} onValueChange={onFilterCountryChange}>
              <SelectTrigger className="w-[170px] h-9 rounded-xl border-stadium-200 text-sm">
                <SelectValue placeholder="Pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les pays</SelectItem>
                {allCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterSpecialty} onValueChange={onFilterSpecialtyChange}>
              <SelectTrigger className="w-[170px] h-9 rounded-xl border-stadium-200 text-sm">
                <SelectValue placeholder="Specialite" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {allSpecialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-[170px] h-9 rounded-xl border-stadium-200 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="verified">Verifies d'abord</SelectItem>
                <SelectItem value="mandates">Plus de mandats</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-pitch-50 text-pitch-700 border border-pitch-200 rounded-lg px-2.5 py-1 text-xs font-medium">
                "{searchQuery}"
                <button onClick={() => onSearchChange("")} className="ml-0.5 hover:text-pitch-900" aria-label="Retirer le filtre recherche">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filterCountry !== "all" && (
              <span className="inline-flex items-center gap-1 bg-pitch-50 text-pitch-700 border border-pitch-200 rounded-lg px-2.5 py-1 text-xs font-medium">
                {filterCountry}
                <button onClick={() => onFilterCountryChange("all")} className="ml-0.5 hover:text-pitch-900" aria-label="Retirer le filtre pays">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filterSpecialty !== "all" && (
              <span className="inline-flex items-center gap-1 bg-pitch-50 text-pitch-700 border border-pitch-200 rounded-lg px-2.5 py-1 text-xs font-medium">
                {filterSpecialty}
                <button onClick={() => onFilterSpecialtyChange("all")} className="ml-0.5 hover:text-pitch-900" aria-label="Retirer le filtre specialite">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={onReset}
              className="text-xs text-stadium-500 hover:text-pitch-600 font-medium transition-colors"
              aria-label="Reinitialiser tous les filtres"
            >
              Tout effacer
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-stadium-500">
            <span className="font-bold text-stadium-900">{filteredCount}</span> agent(s) trouve(s)
          </p>
        </div>
      </div>
    )
  }
)
