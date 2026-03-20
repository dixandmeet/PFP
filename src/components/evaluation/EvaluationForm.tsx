"use client"

import { Footprints, Eye, Flame, Shield } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { RatingSlider } from "./RatingSlider"
import {
  EVALUATION_CATEGORIES,
  CATEGORY_COLOR_MAP,
  type CriterionScores,
} from "@/lib/evaluation/types"

const ICON_MAP: Record<string, typeof Footprints> = {
  Footprints,
  Eye,
  Flame,
  Shield,
}

interface EvaluationFormProps {
  scores: CriterionScores
  categoryScores: Record<string, number>
  onScoreChange: (key: string, value: number) => void
}

export function EvaluationForm({ scores, categoryScores, onScoreChange }: EvaluationFormProps) {
  return (
    <Tabs defaultValue={EVALUATION_CATEGORIES[0].key} className="w-full">
      <TabsList className="w-full grid grid-cols-4 h-11">
        {EVALUATION_CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.iconName] ?? Footprints
          const colors = CATEGORY_COLOR_MAP[cat.color]
          const catScore = categoryScores[cat.key] ?? 0

          return (
            <TabsTrigger
              key={cat.key}
              value={cat.key}
              className="gap-1.5 text-xs sm:text-sm data-[state=active]:shadow-sm"
            >
              <Icon className="h-3.5 w-3.5 hidden sm:block" />
              <span className="truncate">{cat.label}</span>
              <Badge
                className={`text-[10px] px-1.5 py-0 ml-0.5 hidden sm:inline-flex ${colors?.bg ?? "bg-slate-50"} ${colors?.text ?? "text-slate-600"} ${colors?.border ?? "border-slate-200"}`}
              >
                {catScore}
              </Badge>
            </TabsTrigger>
          )
        })}
      </TabsList>

      {EVALUATION_CATEGORIES.map((cat) => {
        const colors = CATEGORY_COLOR_MAP[cat.color]

        return (
          <TabsContent key={cat.key} value={cat.key} className="mt-4">
            <div className="space-y-5">
              {cat.criteria.map((criterion) => (
                <RatingSlider
                  key={criterion.key}
                  label={criterion.label}
                  value={scores[criterion.key] ?? 3}
                  onChange={(v) => onScoreChange(criterion.key, v)}
                  description={criterion.description}
                  gradient={colors?.gradient ?? "from-pitch-400 to-pitch-600"}
                  borderColor={`border-${cat.color}-500`}
                />
              ))}
            </div>
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
