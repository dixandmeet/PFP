"use client"

import { EVALUATION_CATEGORIES, CATEGORY_COLOR_MAP, getLevelColor } from "@/lib/evaluation/types"
import type { EvaluationResult } from "@/lib/evaluation/types"

interface ScoreCardProps {
  result: EvaluationResult
}

function getScoreColor(score: number): string {
  if (score >= 85) return "text-amber-500"
  if (score >= 75) return "text-emerald-600"
  if (score >= 60) return "text-blue-600"
  if (score >= 40) return "text-slate-600"
  return "text-red-500"
}

function getStrokeColor(score: number): string {
  if (score >= 85) return "stroke-amber-500"
  if (score >= 75) return "stroke-emerald-500"
  if (score >= 60) return "stroke-blue-500"
  if (score >= 40) return "stroke-slate-400"
  return "stroke-red-400"
}

export function ScoreCard({ result }: ScoreCardProps) {
  const { totalScore, level, categoryScores } = result
  const circumference = 2 * Math.PI * 54
  const progress = (totalScore / 100) * circumference
  const offset = circumference - progress

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Score circulaire */}
      <div className="flex flex-col items-center mb-5">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            {/* Background circle */}
            <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" className="stroke-slate-100" />
            {/* Progress circle */}
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={`${getStrokeColor(totalScore)} transition-all duration-500`}
            />
          </svg>
          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold tabular-nums ${getScoreColor(totalScore)}`}>
              {totalScore}
            </span>
            <span className="text-xs text-slate-400">/100</span>
          </div>
        </div>
        {/* Level badge */}
        <span className={`mt-2 text-sm font-semibold ${getLevelColor(totalScore)}`}>
          {level}
        </span>
      </div>

      {/* Mini barres par catégorie */}
      <div className="space-y-2.5">
        {EVALUATION_CATEGORIES.map((cat) => {
          const score = categoryScores[cat.key] ?? 0
          const colors = CATEGORY_COLOR_MAP[cat.color]
          return (
            <div key={cat.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-600">{cat.label}</span>
                <span className="text-xs font-semibold tabular-nums text-slate-700">{score}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
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
