"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Trophy,
  Footprints,
  Flame,
  Target,
  Hand,
  Grid3x3,
  Loader2,
  Zap,
  Crosshair,
  Eye,
  Dumbbell,
  Shield,
  Save,
  Play,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import {
  EVALUATION_SUB_CRITERIA,
  SKILL_CATEGORY_WEIGHTS,
  type PlayerAttribute,
} from "@/lib/rating/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminVideo {
  id: string
  skillCategory: string
  totalScore: number | null
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
    playerProfile: {
      firstName: string | null
      lastName: string | null
      primaryPosition: string | null
    } | null
  }
  fileAsset: {
    id: string
    url: string
    filename: string
    mimeType: string
  }
  skillEvaluation: {
    id: string
    pacScore: number
    finScore: number
    tecScore: number
    visScore: number
    phyScore: number
    defScore: number
    gkScore: number
    compositeScore: number
    subCriteria: Record<string, number> | null
    createdAt: string
    updatedAt: string
  } | null
}

interface VideoEvaluationDialogProps {
  video: AdminVideo | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

// ── Mappings ──────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, typeof Trophy> = {
  MATCH_HIGHLIGHTS: Trophy,
  TECHNICAL: Footprints,
  PHYSICAL_ATHLETIC: Flame,
  SET_PIECES: Target,
  GOALKEEPING: Hand,
  TACTICAL: Grid3x3,
}

const CATEGORY_LABELS: Record<string, string> = {
  MATCH_HIGHLIGHTS: "Extraits match",
  TECHNICAL: "Technique",
  PHYSICAL_ATHLETIC: "Physique & vitesse",
  SET_PIECES: "Coups de pied arrêtés",
  GOALKEEPING: "Gardien de but",
  TACTICAL: "Tactique & placement",
}

const CATEGORY_COLORS: Record<string, string> = {
  MATCH_HIGHLIGHTS: "bg-amber-50 text-amber-700 border-amber-200",
  TECHNICAL: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PHYSICAL_ATHLETIC: "bg-orange-50 text-orange-700 border-orange-200",
  SET_PIECES: "bg-red-50 text-red-700 border-red-200",
  GOALKEEPING: "bg-blue-50 text-blue-700 border-blue-200",
  TACTICAL: "bg-purple-50 text-purple-700 border-purple-200",
}

const ATTRIBUTE_CONFIG: {
  key: PlayerAttribute
  label: string
  short: string
  icon: typeof Zap
  color: string
  gradientFrom: string
}[] = [
  { key: "PAC", label: "Vitesse", short: "PAC", icon: Zap, color: "bg-blue-100 text-blue-700", gradientFrom: "from-blue-500" },
  { key: "FIN", label: "Finition", short: "FIN", icon: Crosshair, color: "bg-red-100 text-red-700", gradientFrom: "from-red-500" },
  { key: "TEC", label: "Technique", short: "TEC", icon: Footprints, color: "bg-emerald-100 text-emerald-700", gradientFrom: "from-emerald-500" },
  { key: "VIS", label: "Vision", short: "VIS", icon: Eye, color: "bg-purple-100 text-purple-700", gradientFrom: "from-purple-500" },
  { key: "PHY", label: "Physique", short: "PHY", icon: Dumbbell, color: "bg-amber-100 text-amber-700", gradientFrom: "from-amber-500" },
  { key: "DEF", label: "Défense", short: "DEF", icon: Shield, color: "bg-slate-200 text-slate-700", gradientFrom: "from-slate-500" },
  { key: "GK", label: "Gardien", short: "GK", icon: Hand, color: "bg-orange-100 text-orange-700", gradientFrom: "from-orange-500" },
]

// ── Score color helper ────────────────────────────────────────────────────────

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-600"
  if (score >= 60) return "text-pitch-600"
  if (score >= 40) return "text-amber-600"
  return "text-red-500"
}

function getScoreBadgeClass(score: number) {
  if (score >= 80) return "bg-emerald-100 text-emerald-700 border-emerald-200"
  if (score >= 60) return "bg-pitch-100 text-pitch-700 border-pitch-200"
  if (score >= 40) return "bg-amber-100 text-amber-700 border-amber-200"
  return "bg-red-100 text-red-600 border-red-200"
}

// ── Slider component ──────────────────────────────────────────────────────────

function EvalSlider({
  label,
  value,
  max,
  onChange,
}: {
  label: string
  value: number
  max: number
  onChange: (v: number) => void
}) {
  const pct = max > 0 ? (value / max) * 100 : 0

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-700">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-slate-900 min-w-[3rem] text-right">
          {value}<span className="text-slate-400 font-normal">/{max}</span>
        </span>
      </div>
      <div className="relative flex items-center h-6">
        {/* Track background */}
        <div className="absolute inset-x-0 h-2 rounded-full bg-slate-100" />
        {/* Filled track */}
        <div
          className="absolute left-0 h-2 rounded-full bg-gradient-to-r from-pitch-400 to-pitch-600 transition-all duration-75"
          style={{ width: `${pct}%` }}
        />
        {/* Native input (invisible but functional) */}
        <input
          type="range"
          min={0}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="relative z-10 w-full h-6 appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-pitch-500
            [&::-webkit-slider-thumb]:shadow-sm
            [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150
            [&::-webkit-slider-thumb]:hover:scale-125
            [&::-webkit-slider-thumb]:active:scale-110
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-pitch-500
            [&::-moz-range-thumb]:shadow-sm
            [&::-moz-range-track]:bg-transparent
          "
        />
      </div>
    </div>
  )
}

// ── Composant principal ───────────────────────────────────────────────────────

export function VideoEvaluationDialog({
  video,
  open,
  onClose,
  onSuccess,
}: VideoEvaluationDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subCriteriaValues, setSubCriteriaValues] = useState<Record<string, number>>({})
  const [videoExpanded, setVideoExpanded] = useState(true)

  // Sous-critères pour cette catégorie
  const criteria = video
    ? EVALUATION_SUB_CRITERIA[video.skillCategory] ?? []
    : []

  // Initialiser / pré-remplir les valeurs
  useEffect(() => {
    if (!video || !open) return

    if (video.skillEvaluation?.subCriteria) {
      const existing = video.skillEvaluation.subCriteria as Record<string, number>
      const initial: Record<string, number> = {}
      for (const c of criteria) {
        initial[c.key] = existing[c.key] ?? 0
      }
      setSubCriteriaValues(initial)
    } else {
      const initial: Record<string, number> = {}
      for (const c of criteria) {
        initial[c.key] = 10
      }
      setSubCriteriaValues(initial)
    }
    setVideoExpanded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.id, open])

  // Score global normalisé (0-100)
  const normalizedScore = useMemo(() => {
    if (criteria.length === 0) return 0
    const maxPossible = criteria.reduce((sum, c) => sum + c.max, 0)
    const actual = criteria.reduce((sum, c) => sum + (subCriteriaValues[c.key] ?? 0), 0)
    return maxPossible > 0 ? Math.round((actual / maxPossible) * 100) : 0
  }, [criteria, subCriteriaValues])

  // Scores par attribut
  const attributeScores = useMemo(() => {
    if (!video) return {} as Record<PlayerAttribute, number>
    const weights = SKILL_CATEGORY_WEIGHTS[video.skillCategory as keyof typeof SKILL_CATEGORY_WEIGHTS] ?? {}
    const scores: Record<string, number> = {}
    for (const attr of ATTRIBUTE_CONFIG) {
      const weight = weights[attr.key] ?? 0
      scores[attr.key] = weight > 0 ? normalizedScore : 0
    }
    return scores as Record<PlayerAttribute, number>
  }, [video, normalizedScore])

  const handleSliderChange = useCallback((key: string, value: number) => {
    setSubCriteriaValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSubmit = async () => {
    if (!video) return

    setIsSubmitting(true)
    try {
      const weights = SKILL_CATEGORY_WEIGHTS[video.skillCategory as keyof typeof SKILL_CATEGORY_WEIGHTS] ?? {}
      const body: Record<string, unknown> = {
        pac: (weights.PAC ?? 0) > 0 ? normalizedScore : 0,
        fin: (weights.FIN ?? 0) > 0 ? normalizedScore : 0,
        tec: (weights.TEC ?? 0) > 0 ? normalizedScore : 0,
        vis: (weights.VIS ?? 0) > 0 ? normalizedScore : 0,
        phy: (weights.PHY ?? 0) > 0 ? normalizedScore : 0,
        def: (weights.DEF ?? 0) > 0 ? normalizedScore : 0,
        gk: (weights.GK ?? 0) > 0 ? normalizedScore : 0,
        subCriteria: subCriteriaValues,
      }

      const res = await fetch(`/api/admin/videos/${video.id}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Erreur lors de l'évaluation")
      }

      toast({
        title: "Évaluation enregistrée",
        description: `Score composite : ${normalizedScore}/100`,
      })

      onSuccess()
      onClose()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!video) return null

  const playerName = video.user.playerProfile
    ? `${video.user.playerProfile.firstName ?? ""} ${video.user.playerProfile.lastName ?? ""}`.trim()
    : video.user.name ?? video.user.email
  const position = video.user.playerProfile?.primaryPosition ?? "—"
  const CategoryIcon = CATEGORY_ICONS[video.skillCategory] ?? Trophy
  const categoryColor = CATEGORY_COLORS[video.skillCategory] ?? "bg-slate-50 text-slate-600 border-slate-200"
  const isEditing = !!video.skillEvaluation

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* ── Header fixe ──────────────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2.5 text-lg">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100">
                  <CategoryIcon className="h-4 w-4 text-slate-600" />
                </div>
                {isEditing ? "Modifier" : "Évaluer"} — {CATEGORY_LABELS[video.skillCategory] ?? video.skillCategory}
              </DialogTitle>
              <Badge className={categoryColor}>
                {CATEGORY_LABELS[video.skillCategory] ?? video.skillCategory}
              </Badge>
            </div>
            <DialogDescription className="text-sm">
              {playerName} · {position} · {format(new Date(video.createdAt), "d MMM yyyy", { locale: fr })}
              {video.totalScore !== null && (
                <span className="ml-2 text-slate-400">· Qualité vidéo : {video.totalScore}/100</span>
              )}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* ── Contenu scrollable ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-6">

            {/* Vidéo (collapsible) */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setVideoExpanded(!videoExpanded)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700"
              >
                <span className="flex items-center gap-2">
                  <Play className="h-3.5 w-3.5" />
                  Aperçu vidéo
                </span>
                {videoExpanded ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>
              {videoExpanded && (
                <div className="bg-black">
                  {video.fileAsset.url?.trim() ? (
                    <video
                      src={video.fileAsset.url}
                      controls
                      className="w-full max-h-[280px] object-contain"
                      preload="metadata"
                    />
                  ) : (
                    <div className="flex h-[160px] items-center justify-center text-sm text-white/60">
                      URL vidéo indisponible
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Sous-critères d'évaluation ─────────────────────────── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Sous-critères d&apos;évaluation
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 uppercase tracking-wide">Score</span>
                  <span className={`text-2xl font-bold tabular-nums ${getScoreColor(normalizedScore)}`}>
                    {normalizedScore}
                  </span>
                  <span className="text-sm text-slate-400">/100</span>
                </div>
              </div>

              {/* Barre de progression globale */}
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-200 ${
                    normalizedScore >= 80 ? "bg-emerald-500" :
                    normalizedScore >= 60 ? "bg-pitch-500" :
                    normalizedScore >= 40 ? "bg-amber-500" :
                    "bg-red-400"
                  }`}
                  style={{ width: `${normalizedScore}%` }}
                />
              </div>

              <div className="space-y-3 pt-1">
                {criteria.map((criterion) => (
                  <EvalSlider
                    key={criterion.key}
                    label={criterion.label}
                    value={subCriteriaValues[criterion.key] ?? 0}
                    max={criterion.max}
                    onChange={(v) => handleSliderChange(criterion.key, v)}
                  />
                ))}
              </div>
            </div>

            {/* ── Attributs impactés ──────────────────────────────────── */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Attributs impactés
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ATTRIBUTE_CONFIG.map((attr) => {
                  const score = attributeScores[attr.key] ?? 0
                  const weights = SKILL_CATEGORY_WEIGHTS[video.skillCategory as keyof typeof SKILL_CATEGORY_WEIGHTS] ?? {}
                  const weight = weights[attr.key] ?? 0
                  if (weight === 0) return null

                  const Icon = attr.icon
                  return (
                    <div
                      key={attr.key}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${attr.color}`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs opacity-70">{attr.label}</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold tabular-nums leading-none">{score}</span>
                          <span className="text-[10px] opacity-50">
                            ×{Math.round(weight * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer fixe ──────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={getScoreBadgeClass(normalizedScore)}>
              Score : {normalizedScore}/100
            </Badge>
            {isEditing && (
              <span className="text-xs text-slate-400">
                Dernière modification : {format(new Date(video.skillEvaluation!.updatedAt), "d MMM yyyy", { locale: fr })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting} size="sm">
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} size="sm">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Enregistrement…
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  {isEditing ? "Mettre à jour" : "Enregistrer"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
