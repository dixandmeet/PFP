"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, RotateCcw } from "lucide-react"

interface ReportsToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  authorTypeFilter: string
  onAuthorTypeChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
  onReset: () => void
  hasActiveFilters: boolean
}

export function ReportsToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  authorTypeFilter,
  onAuthorTypeChange,
  sortBy,
  onSortChange,
  onReset,
  hasActiveFilters,
}: ReportsToolbarProps) {
  return (
    <div className="bg-white ring-1 ring-stadium-200 shadow-sm rounded-2xl p-3">
      <div className="flex flex-col md:flex-row md:items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stadium-400" />
          <Input
            placeholder="Rechercher un rapport..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-sm border-stadium-200 focus:ring-2 focus:ring-pitch-600/30 rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full sm:w-[150px] h-9 text-sm border-stadium-200 rounded-xl focus:ring-2 focus:ring-pitch-600/30">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les statuts</SelectItem>
              <SelectItem value="DRAFT">Brouillon</SelectItem>
              <SelectItem value="PENDING_APPROVAL">En attente</SelectItem>
              <SelectItem value="APPROVED">Approuvé</SelectItem>
              <SelectItem value="REJECTED">Refusé</SelectItem>
            </SelectContent>
          </Select>

          <Select value={authorTypeFilter} onValueChange={onAuthorTypeChange}>
            <SelectTrigger className="w-full sm:w-[150px] h-9 text-sm border-stadium-200 rounded-xl focus:ring-2 focus:ring-pitch-600/30">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les types</SelectItem>
              <SelectItem value="PLAYER">Joueur</SelectItem>
              <SelectItem value="AGENT">Agent</SelectItem>
              <SelectItem value="SCOUT">Recruteur</SelectItem>
              <SelectItem value="COACH">Entraîneur</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-full sm:w-[150px] h-9 text-sm border-stadium-200 rounded-xl focus:ring-2 focus:ring-pitch-600/30">
              <SelectValue placeholder="Trier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Plus récents</SelectItem>
              <SelectItem value="title">Titre (A-Z)</SelectItem>
              <SelectItem value="status">Statut</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs text-stadium-500 hover:text-stadium-700 hover:bg-stadium-50 px-2 py-1.5 rounded-lg transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Réinitialiser
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
