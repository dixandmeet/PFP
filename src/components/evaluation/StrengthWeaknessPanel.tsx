"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Item {
  key: string
  label: string
  score: number
}

interface StrengthWeaknessPanelProps {
  strengths: Item[]
  weaknesses: Item[]
}

function scoreBadgeClass(score: number): string {
  if (score >= 4) return "bg-emerald-50 text-emerald-700 border-emerald-200"
  if (score >= 3) return "bg-blue-50 text-blue-700 border-blue-200"
  if (score >= 2) return "bg-amber-50 text-amber-700 border-amber-200"
  return "bg-red-50 text-red-600 border-red-200"
}

export function StrengthWeaknessPanel({ strengths, weaknesses }: StrengthWeaknessPanelProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Points clés</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Forces */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Forces</span>
          </div>
          <div className="space-y-2">
            {strengths.map((s) => (
              <div key={s.key} className="flex items-center justify-between">
                <span className="text-xs text-slate-600 truncate mr-2">{s.label}</span>
                <Badge className={`text-[10px] px-1.5 py-0 ${scoreBadgeClass(s.score)}`}>
                  {s.score}/5
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Faiblesses */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingDown className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">À travailler</span>
          </div>
          <div className="space-y-2">
            {weaknesses.map((w) => (
              <div key={w.key} className="flex items-center justify-between">
                <span className="text-xs text-slate-600 truncate mr-2">{w.label}</span>
                <Badge className={`text-[10px] px-1.5 py-0 ${scoreBadgeClass(w.score)}`}>
                  {w.score}/5
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
