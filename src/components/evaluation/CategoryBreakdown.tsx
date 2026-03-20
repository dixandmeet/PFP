"use client"

import { Footprints, Eye, Flame, Shield } from "lucide-react"
import { EVALUATION_CATEGORIES, CATEGORY_COLOR_MAP } from "@/lib/evaluation/types"

const ICON_MAP: Record<string, typeof Footprints> = {
  Footprints,
  Eye,
  Flame,
  Shield,
}

interface CategoryBreakdownProps {
  categoryScores: Record<string, number>
}

export function CategoryBreakdown({ categoryScores }: CategoryBreakdownProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Détail par catégorie</h3>
      <div className="space-y-4">
        {EVALUATION_CATEGORIES.map((cat) => {
          const score = categoryScores[cat.key] ?? 0
          const colors = CATEGORY_COLOR_MAP[cat.color]
          const Icon = ICON_MAP[cat.iconName] ?? Footprints

          return (
            <div key={cat.key}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`flex items-center justify-center w-6 h-6 rounded-md ${colors?.bg ?? "bg-slate-50"}`}>
                  <Icon className={`h-3.5 w-3.5 ${colors?.text ?? "text-slate-600"}`} />
                </div>
                <span className="text-sm font-medium text-slate-700 flex-1">{cat.label}</span>
                <span className="text-sm font-bold tabular-nums text-slate-900">{score}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${colors?.fill ?? "bg-slate-400"} transition-all duration-300`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
