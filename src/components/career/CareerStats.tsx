"use client"

import { Building2, Shirt, Target, TrendingUp } from "lucide-react"

interface CareerStatsProps {
  clubs: number
  appearances: number
  goals: number
  assists: number
}

const stats = [
  { key: "clubs", label: "Clubs", icon: Building2 },
  { key: "appearances", label: "Matchs", icon: Shirt },
  { key: "goals", label: "Buts", icon: Target },
  { key: "assists", label: "Passes D.", icon: TrendingUp },
] as const

export function CareerStats({ clubs, appearances, goals, assists }: CareerStatsProps) {
  const values: Record<string, number> = { clubs, appearances, goals, assists }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-4 flex items-center gap-3"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600/10 flex items-center justify-center">
            <stat.icon className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-900 leading-tight">
              {values[stat.key]}
            </p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function CareerStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-4 flex items-center gap-3 animate-pulse"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100" />
          <div className="space-y-2">
            <div className="h-6 w-10 bg-slate-100 rounded" />
            <div className="h-3 w-14 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
