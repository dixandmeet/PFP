"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Edit, FileText, Plus } from "lucide-react"

interface ProfilePresentationCardProps {
  bio?: string
  onEditClick?: () => void
  className?: string
}

export function ProfilePresentationCard({ bio, onEditClick, className }: ProfilePresentationCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white", className)}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <FileText className="h-4 w-4 text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">Présentation</h3>
        </div>
        {bio && (
          <button
            type="button"
            onClick={onEditClick}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-pitch-500"
          >
            <Edit className="h-3 w-3" />
            Éditer
          </button>
        )}
      </div>
      <div className="px-5 py-4">
        {bio ? (
          <>
            <p
              className={cn(
                "text-sm text-slate-600 leading-relaxed whitespace-pre-line",
                !expanded && "line-clamp-4"
              )}
            >
              {bio}
            </p>
            {bio.length > 200 && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="mt-2 text-xs font-semibold text-pitch-600 hover:text-pitch-700 transition-colors"
              >
                {expanded ? "Voir moins" : "Voir plus"}
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center text-center py-6">
            <p className="text-sm text-slate-400 mb-3">
              Aucune présentation pour le moment
            </p>
            <button
              type="button"
              onClick={onEditClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-pitch-600 border border-pitch-200 hover:bg-pitch-50 transition-colors focus-visible:ring-2 focus-visible:ring-pitch-500"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter une présentation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
