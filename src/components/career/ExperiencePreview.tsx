"use client"

import {
  Building2,
  Shirt,
  Trophy,
  MapPin,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { CareerEntry } from "./ExperienceCard"

interface ExperiencePreviewProps {
  entry: CareerEntry | null
  formatDate: (dateStr: string) => string
  onDelete: (id: string) => void
  onAddExperience: () => void
}

export function ExperiencePreview({ entry, formatDate, onDelete, onAddExperience }: ExperiencePreviewProps) {
  if (!entry) {
    return (
      <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Building2 className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm text-slate-500 mb-1 font-medium">Aucune expérience sélectionnée</p>
        <p className="text-xs text-slate-400">Cliquez sur une expérience pour voir ses détails</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-50 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-600/10 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-green-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 text-lg truncate">{entry.clubName}</h3>
            <Badge variant="outline" className="font-mono text-[11px] px-1.5 py-0 border-slate-300 text-slate-500 mt-0.5">
              {entry.season}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-2">
          {entry.position && (
            <MetaRow icon={Shirt} label="Poste" value={entry.position} />
          )}
          {entry.league && (
            <MetaRow icon={Trophy} label="Ligue" value={entry.league} />
          )}
          {entry.country && (
            <MetaRow icon={MapPin} label="Pays" value={entry.country} />
          )}
          <MetaRow
            icon={Calendar}
            label="Période"
            value={`${formatDate(entry.startDate)} - ${entry.endDate ? formatDate(entry.endDate) : "Présent"}`}
          />
        </div>

        <div className="pt-3 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Statistiques</p>
          <div className="grid grid-cols-2 gap-3">
            <PreviewStat icon={Target} label="Matchs" value={entry.appearances} />
            <PreviewStat icon={Trophy} label="Buts" value={entry.goals} color="text-amber-600" />
            <PreviewStat icon={TrendingUp} label="Passes D." value={entry.assists} color="text-blue-600" />
            <PreviewStat icon={Clock} label="Minutes" value={entry.minutesPlayed} color="text-slate-600" />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={() => onDelete(entry.id)}
            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl ring-1 ring-slate-200 border-0"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
          <Button
            variant="outline"
            onClick={onAddExperience}
            className="w-full rounded-xl ring-1 ring-slate-200 border-0 hover:bg-slate-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une expérience
          </Button>
        </div>
      </div>
    </div>
  )
}

function MetaRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="w-4 h-4 text-slate-400 shrink-0" />
      <span className="text-slate-500">{label}:</span>
      <span className="text-slate-900 font-medium">{value}</span>
    </div>
  )
}

function PreviewStat({
  icon: Icon,
  label,
  value,
  color = "text-green-600",
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | null
  color?: string
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 text-center">
      <div className="flex items-center justify-center mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-lg font-semibold text-slate-900">{value ?? "-"}</p>
      <p className="text-[10px] text-slate-400">{label}</p>
    </div>
  )
}
