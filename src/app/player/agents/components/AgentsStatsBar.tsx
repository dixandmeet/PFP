"use client"

import { Users, Clock, CheckCircle, FileText } from "lucide-react"

interface AgentsStatsBarProps {
  agentsCount: number
  pendingCount: number
  activeCount: number
  totalMandates: number
  onStatClick?: (target: string) => void
}

const stats = [
  { key: "agents", icon: Users, label: "Agents disponibles" },
  { key: "pending", icon: Clock, label: "En attente" },
  { key: "active", icon: CheckCircle, label: "Mandats actifs" },
  { key: "total", icon: FileText, label: "Total mandats" },
] as const

export function AgentsStatsBar({
  agentsCount,
  pendingCount,
  activeCount,
  totalMandates,
  onStatClick,
}: AgentsStatsBarProps) {
  const values: Record<string, number> = {
    agents: agentsCount,
    pending: pendingCount,
    active: activeCount,
    total: totalMandates,
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {stats.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => onStatClick?.(key)}
          aria-label={`${label}: ${values[key]}`}
          className="group flex items-center gap-3 bg-white border border-stadium-200/60 rounded-2xl px-4 py-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-pitch-300 focus-visible:ring-2 focus-visible:ring-pitch-500 focus-visible:ring-offset-2 cursor-pointer"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-pitch-50 text-pitch-600 transition-colors duration-200 group-hover:bg-pitch-100">
            <Icon className="h-4 w-4" />
          </div>
          <div className="text-left min-w-0">
            <div className="text-xl font-black text-stadium-900 leading-none tabular-nums">
              {values[key]}
            </div>
            <div className="text-xs text-stadium-500 font-medium truncate mt-0.5">
              {label}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
