"use client"

import { Progress } from "@/components/ui/progress"

interface ScoreCardProps {
  score: number
  breakdown: {
    profile: number
    activity: number
    engagement: number
    network: number
  }
}

const levels = [
  { min: 0, label: "Amateur" },
  { min: 40, label: "Confirme" },
  { min: 65, label: "Elite" },
  { min: 85, label: "Pret Pro" },
]

function getLevel(score: number) {
  return levels.reduce((current, level) => (score >= level.min ? level : current), levels[0]).label
}

export function ScoreCard({ score, breakdown }: ScoreCardProps) {
  return (
    <div className="rounded-2xl border border-stadium-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-stadium-900">Score joueur</h3>
        <span className="rounded-full bg-pitch-100 px-2.5 py-1 text-xs font-semibold text-pitch-700">
          {getLevel(score)}
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-end justify-between">
          <p className="text-3xl font-bold text-stadium-900">{score}/100</p>
          <p className="text-xs text-stadium-500">Indice de preparation carriere</p>
        </div>
        <Progress value={score} className="h-2.5 bg-stadium-100 [&>div]:bg-pitch-600" />
      </div>

      <div className="mt-5 space-y-2">
        {Object.entries(breakdown).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between text-sm">
            <p className="capitalize text-stadium-600">
              {key === "profile"
                ? "Profil"
                : key === "activity"
                  ? "Activite"
                  : key === "engagement"
                    ? "Engagement"
                    : "Reseau"}
            </p>
            <p className="font-semibold text-stadium-900">{value}/25</p>
          </div>
        ))}
      </div>
    </div>
  )
}
