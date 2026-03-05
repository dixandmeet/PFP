"use client"

import { cn } from "@/lib/utils"
import { Target, Heart, Eye, ChevronRight } from "lucide-react"
import type { ProfileStats } from "@/types/interests"

interface ProfileInsightsProps {
  stats: ProfileStats
  className?: string
}

interface KpiCardProps {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  helperText?: string
  iconBg: string
  iconColor: string
}

function KpiCard({ label, value, icon: Icon, helperText, iconBg, iconColor }: KpiCardProps) {
  return (
    <button
      type="button"
      className={cn(
        "group relative flex items-center gap-4 p-5 rounded-xl bg-white border border-slate-200",
        "hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5",
        "transition-all duration-200 cursor-pointer text-left w-full",
        "focus-visible:ring-2 focus-visible:ring-pitch-500 focus-visible:ring-offset-2"
      )}
    >
      <div className={cn("flex items-center justify-center w-11 h-11 rounded-xl", iconBg)}>
        <Icon className={cn("h-5 w-5", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
          {label}
        </p>
        <p className="text-[26px] font-bold text-slate-900 leading-none">{value}</p>
        {helperText && (
          <p className="text-[11px] text-slate-400 mt-1 leading-tight">{helperText}</p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0" />
    </button>
  )
}

export function ProfileInsights({ stats, className }: ProfileInsightsProps) {
  const { viewsThisMonth, opportunitiesCount, receivedInterestsCount } = stats

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-4", className)}>
      <KpiCard
        label="Opportunités"
        value={String(opportunitiesCount)}
        icon={Target}
        iconBg="bg-pitch-50"
        iconColor="text-pitch-600"
        helperText={opportunitiesCount === 0 ? "Aucune opportunité pour l'instant" : undefined}
      />
      <KpiCard
        label="Intérêts reçus"
        value={String(receivedInterestsCount)}
        icon={Heart}
        iconBg="bg-rose-50"
        iconColor="text-rose-500"
        helperText={receivedInterestsCount === 0 ? "Ton profil est prêt à être découvert" : undefined}
      />
      <KpiCard
        label="Vues ce mois"
        value={viewsThisMonth < 5 ? "—" : String(viewsThisMonth)}
        icon={Eye}
        iconBg="bg-sky-50"
        iconColor="text-sky-500"
        helperText={viewsThisMonth < 5 ? "Stats en cours d'activation" : undefined}
      />
    </div>
  )
}
