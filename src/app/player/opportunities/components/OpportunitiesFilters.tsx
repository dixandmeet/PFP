"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const positions = [
  { value: "GK", label: "Gardien" },
  { value: "DF", label: "Defenseur" },
  { value: "MF", label: "Milieu" },
  { value: "FW", label: "Attaquant" },
]

const sortOptions = [
  { value: "recent", label: "Plus recent" },
  { value: "salary", label: "Salaire" },
]

interface OpportunitiesFiltersProps {
  searchQuery: string
  setSearchQuery: (q: string) => void
  position: string
  setPosition: (p: string) => void
  sortBy: string
  setSortBy: (s: string) => void
  onReset: () => void
  hasActiveFilters: boolean
}

export function OpportunitiesFilters({
  searchQuery,
  setSearchQuery,
  position,
  setPosition,
  sortBy,
  setSortBy,
  onReset,
  hasActiveFilters,
}: OpportunitiesFiltersProps) {
  return (
    <div className="bg-white ring-1 ring-slate-200 rounded-2xl shadow-sm p-4">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher un titre, club, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-slate-200 focus:ring-2 focus:ring-green-600/30 focus:border-green-600/30"
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          <Select value={position} onValueChange={setPosition}>
            <SelectTrigger className="w-[160px] border-slate-200 focus:ring-2 focus:ring-green-600/30">
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent>
              {positions.map((pos) => (
                <SelectItem key={pos.value} value={pos.value}>
                  {pos.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] border-slate-200 focus:ring-2 focus:ring-green-600/30">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Reinitialiser
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
