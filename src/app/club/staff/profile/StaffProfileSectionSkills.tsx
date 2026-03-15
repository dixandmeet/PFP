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
      <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-gray-200 bg-white">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Erreur de chargement</h2>
        <p className="text-sm text-gray-500 mb-6">Impossible de charger vos compétences. Veuillez réessayer.</p>
        <Button onClick={loadData} className="bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2">
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Vos spécialités et domaines d&apos;expertise.</p>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-6 animate-pulse">
          <div className="h-10 bg-gray-100 rounded-lg w-full mb-4" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-gray-100 rounded-full" style={{ width: `${60 + i * 20}px` }} />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ajouter une compétence..."
                maxLength={MAX_SKILL_LENGTH}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={() => addSkill(inputValue)}
                disabled={!inputValue.trim() || skills.length >= MAX_SKILLS}
                className="bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
            </div>

            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-sm font-medium group"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(index)}
                      className="text-purple-400 hover:text-red-500 transition-colors"
                      title="Retirer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-3">
                  <Award className="h-6 w-6 text-purple-500" />
                </div>
                <p className="text-sm text-gray-400 text-center max-w-xs">
                  Aucune compétence ajoutée. Tapez une compétence ou sélectionnez-en une parmi les suggestions
                  ci-dessous.
                </p>
              </div>
            )}

            <p className="text-xs text-gray-400">
              {skills.length}/{MAX_SKILLS} compétences
            </p>
          </div>

          {availableSuggestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-600">Suggestions</h3>
              <div className="flex flex-wrap gap-2">
                {availableSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => addSkill(suggestion)}
                    disabled={skills.length >= MAX_SKILLS}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 text-sm hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-3 h-3" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Compétences sauvegardées avec succès.
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={saving || !hasChanges} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
