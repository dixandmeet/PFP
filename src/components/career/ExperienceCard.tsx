"use client"

import { Eye, Pencil, Trash2, Shirt, Trophy, MapPin, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface CareerEntry {
  id: string
  clubName: string
  league: string | null
  country: string | null
  season: string
  startDate: string
  endDate: string | null
  position: string | null
  appearances: number | null
  minutesPlayed: number | null
  goals: number | null
  assists: number | null
}

interface ExperienceCardProps {
  entry: CareerEntry
  isSelected: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  formatDate: (dateStr: string) => string
}

export function ExperienceCard({ entry, isSelected, onSelect, onDelete, formatDate }: ExperienceCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl ring-1 shadow-sm p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? "ring-green-600 ring-2 shadow-md"
          : "ring-slate-200 hover:ring-slate-300"
      }`}
      onClick={() => onSelect(entry.id)}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h3 className="font-bold text-slate-900 text-base truncate">{entry.clubName}</h3>
          <Badge variant="outline" className="font-mono text-[11px] px-1.5 py-0 shrink-0 border-slate-300 text-slate-600">
            {entry.season}
          </Badge>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSelect(entry.id) }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
            title="Voir"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onSelect(entry.id) }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Modifier"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(entry.id) }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap mb-3">
        {entry.position && (
          <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md">
            <Shirt className="w-3 h-3" />
            {entry.position}
          </span>
        )}
        {entry.league && (
          <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md">
            <Trophy className="w-3 h-3" />
            {entry.league}
          </span>
        )}
        {entry.country && (
          <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md">
            <MapPin className="w-3 h-3" />
            {entry.country}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(entry.startDate)} - {entry.endDate ? formatDate(entry.endDate) : "Présent"}
        </span>
      </div>

      {(entry.appearances != null || entry.goals != null || entry.assists != null || entry.minutesPlayed != null) && (
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          <StatMini label="Matchs" value={entry.appearances} />
          <StatMini label="Buts" value={entry.goals} />
          <StatMini label="Passes D." value={entry.assists} />
          <StatMini label="Minutes" value={entry.minutesPlayed} />
        </div>
      )}
    </div>
  )
}

function StatMini({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="text-center">
      <p className="text-sm font-semibold text-slate-900">{value ?? "-"}</p>
      <p className="text-[10px] text-slate-400">{label}</p>
    </div>
  )
}
