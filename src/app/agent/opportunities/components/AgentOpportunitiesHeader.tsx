"use client"

import { Target } from "lucide-react"

interface AgentOpportunitiesHeaderProps {
  listingsCount: number
}

export function AgentOpportunitiesHeader({
  listingsCount,
}: AgentOpportunitiesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Annonces Club
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {listingsCount} annonce{listingsCount > 1 ? "s" : ""} disponible{listingsCount > 1 ? "s" : ""}
          {" · "}
          <span className="text-slate-400">Consultez et soumettez vos joueurs</span>
        </p>
      </div>

      <div className="flex gap-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-green-600/10 text-green-700 ring-1 ring-green-600/20">
          <Target className="h-4 w-4" />
          Opportunites
          {listingsCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-green-600/10 text-green-700">
              {listingsCount}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
