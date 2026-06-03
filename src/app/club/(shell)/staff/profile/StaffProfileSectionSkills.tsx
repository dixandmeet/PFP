"use client"

import { useEffect, useState, useCallback, useRef, KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  Award,
  Plus,
  X,
  AlertCircle,
  RefreshCw,
  Save,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const SUGGESTED_SKILLS = [
  "Tactique",
  "Recrutement",
  "Formation",
  "Analyse vidéo",
  "Préparation physique",
  "Gestion d'équipe",
  "Développement jeunes",
  "Scouting",
  "Data & Statistiques",
  "Communication",
  "Négociation",
  "Stratégie de jeu",
  "Coaching individuel",
  "Planification d'entraînement",
  "Gestion de match",
  "Leadership",
  "Réhabilitation",
  "Nutrition sportive",
  "Psychologie du sport",
  "Relations médias",
]

const MAX_SKILLS = 30
const MAX_SKILL_LENGTH = 50

export function StaffProfileSectionSkills() {
  const { toast } = useToast()
  const [skills, setSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [hasChanges, setHasChanges] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const savedSkillsRef = useRef<string[]>([])

  const loadData = useCallback(async () => {
    setError(false)
    setLoading(true)
    try {
      const res = await fetch("/api/club/staff/profile")
      if (!res.ok) throw new Error()
      const data = await res.json()
      const loaded = Array.isArray(data.skills) ? data.skills : []
      setSkills(loaded)
      savedSkillsRef.current = loaded
      setHasChanges(false)
    } catch {
      setError(true)
      toast({
        title: "Erreur",
        description: "Impossible de charger les compétences",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const addSkill = useCallback(
    (skill: string) => {
      const trimmed = skill.trim()
      if (!trimmed) return
      if (trimmed.length > MAX_SKILL_LENGTH) {
        toast({
          title: "Trop long",
          description: `Maximum ${MAX_SKILL_LENGTH} caractères par compétence`,
          variant: "destructive",
        })
        return
      }
      if (skills.length >= MAX_SKILLS) {
        toast({
          title: "Limite atteinte",
          description: `Maximum ${MAX_SKILLS} compétences`,
          variant: "destructive",
        })
        return
      }
      if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
        toast({
          title: "Doublon",
          description: "Cette compétence est déjà ajoutée",
          variant: "destructive",
        })
        return
      }
      const updated = [...skills, trimmed]
      setSkills(updated)
      setHasChanges(JSON.stringify(updated) !== JSON.stringify(savedSkillsRef.current))
      setInputValue("")
    },
    [skills, toast]
  )

  const removeSkill = useCallback((index: number) => {
    setSkills((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      setHasChanges(JSON.stringify(updated) !== JSON.stringify(savedSkillsRef.current))
      return updated
    })
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        addSkill(inputValue)
      }
    },
    [addSkill, inputValue]
  )

  const handleSave = useCallback(async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch("/api/club/staff/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erreur lors de la sauvegarde")
      }
      savedSkillsRef.current = [...skills]
      setHasChanges(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: unknown) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de sauvegarder",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }, [skills, toast])

  const availableSuggestions = SUGGESTED_SKILLS.filter(
    (s) => !skills.some((sk) => sk.toLowerCase() === s.toLowerCase())
  )

  if (error && !loading && skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-stadium-200 bg-stadium-50/50 py-12">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <h2 className="mb-1 text-base font-semibold text-stadium-900">Erreur de chargement</h2>
        <p className="mb-6 text-sm text-stadium-500">
          Impossible de charger vos compétences. Veuillez réessayer.
        </p>
        <Button onClick={loadData} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-full rounded-xl bg-stadium-100" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 rounded-full bg-stadium-100"
                style={{ width: `${60 + i * 20}px` }}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Saisir une compétence et appuyer sur Entrée…"
                maxLength={MAX_SKILL_LENGTH}
                className="flex-1 rounded-xl"
              />
              <Button
                type="button"
                onClick={() => addSkill(inputValue)}
                disabled={!inputValue.trim() || skills.length >= MAX_SKILLS}
                className="shrink-0 gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter
              </Button>
            </div>

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 rounded-full bg-pitch-50 px-3 py-1.5 text-sm font-medium text-pitch-800 ring-1 ring-pitch-200"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="rounded-full p-0.5 text-pitch-400 transition-colors hover:bg-pitch-100 hover:text-red-500"
                      title="Retirer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stadium-200 bg-stadium-50/50 py-10">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-pitch-50">
                  <Award className="h-6 w-6 text-pitch-600" />
                </div>
                <p className="max-w-xs text-center text-sm text-stadium-400">
                  Aucune compétence ajoutée. Saisissez-en une ou choisissez une suggestion ci-dessous.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-stadium-400">
              <span>{skills.length}/{MAX_SKILLS} compétences</span>
              {hasChanges && <span className="font-medium text-amber-600">Modifications non enregistrées</span>}
            </div>
          </div>

          {availableSuggestions.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-stadium-400">
                Suggestions
              </h3>
              <div className="flex flex-wrap gap-2">
                {availableSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => addSkill(suggestion)}
                    disabled={skills.length >= MAX_SKILLS}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border border-stadium-200 bg-white px-3 py-1.5 text-sm text-stadium-600 transition-colors",
                      "hover:border-pitch-300 hover:bg-pitch-50 hover:text-pitch-700",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                  >
                    <Plus className="h-3 w-3" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 text-sm text-pitch-600">
              <CheckCircle2 className="h-4 w-4" />
              Compétences sauvegardées avec succès.
            </div>
          )}

          <div className="flex justify-end border-t border-stadium-100 pt-5">
            <Button onClick={handleSave} disabled={saving || !hasChanges} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Enregistrer
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
