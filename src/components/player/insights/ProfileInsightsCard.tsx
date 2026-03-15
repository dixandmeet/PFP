"use client"

import { cn } from "@/lib/utils"
import { Target, Heart, Eye } from "lucide-react"
import type { ProfileStats } from "@/types/interests"

interface ProfileInsightsCardProps {
  stats: ProfileStats
  className?: string
}

interface KpiTileProps {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  helperText?: string
  onClick?: () => void
}

function KpiTile({ label, value, icon: Icon, helperText, onClick }: KpiTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 p-4 rounded-xl border border-stadium-200",
        "bg-white hover:border-pitch-300 hover:shadow-md",
        "transition-all duration-200 cursor-pointer",
        "focus-visible:ring-2 focus-visible:ring-pitch-500 focus-visible:ring-offset-2",
        "flex-1 min-w-0"
      )}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-pitch-50">
        <Icon className="h-5 w-5 text-pitch-600" />
      </div>
      <span className="text-2xl font-bold text-stadium-900">{value}</span>
      <span className="text-xs font-medium text-stadium-500">{label}</span>
      {helperText && (
        <span className="text-[11px] text-stadium-400 text-center leading-tight">
          {helperText}
        </span>
      )}
    </button>
  )
}

export function ProfileInsightsCard({ stats, className }: ProfileInsightsCardProps) {
  const { viewsThisMonth, opportunitiesCount, receivedInterestsCount } = stats

  const viewsValue = viewsThisMonth < 5 ? "—" : String(viewsThisMonth)
  const viewsHelper =
    viewsThisMonth < 5 ? "Stats en cours d'activation" : undefined

  const oppsHelper =
    opportunitiesCount === 0 ? "Aucune opportunité pour l'instant" : undefined

  const interestsHelper =
    receivedInterestsCount === 0
      ? "Ton profil est prêt à être découvert"
      : undefined

  return (
    <div
      className={cn(
        "rounded-2xl border border-stadium-200 bg-gradient-to-br from-white to-pitch-50/30 p-5",
        className
      )}
    >
      <h2 className="text-base font-bold text-stadium-800 mb-4">
        Opportunités & Intérêts
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiTile
          label="Opportunités"
          value={String(opportunitiesCount)}
          icon={Target}
          helperText={oppsHelper}
        />
        <KpiTile
          label="Intérêts reçus"
          value={String(receivedInterestsCount)}
          icon={Heart}
          helperText={interestsHelper}
        />
        <KpiTile
          label="Vues ce mois"
          value={viewsValue}
          icon={Eye}
          helperText={viewsHelper}
        />
      </div>
    </div>
  )
}
