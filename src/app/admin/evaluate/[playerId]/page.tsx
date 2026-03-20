"use client"

import { useEffect, useState, Suspense } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Save, RotateCcw, Loader2 } from "lucide-react"
import { usePlayerEvaluation } from "@/hooks/usePlayerEvaluation"
import {
  EvaluationForm,
  ScoreCard,
  CategoryBreakdown,
  StrengthWeaknessPanel,
} from "@/components/evaluation"
import { resolvePositionGroup } from "@/lib/evaluation/types"
import type { PositionGroup } from "@/lib/evaluation/types"

// ── Types ─────────────────────────────────────────────────────────────────────

interface PlayerData {
  id: string
  name: string | null
  email: string
  playerProfile: {
    firstName: string | null
    lastName: string | null
    primaryPosition: string | null
  } | null
}

// ── Position options ──────────────────────────────────────────────────────────

const POSITION_GROUP_OPTIONS: { value: PositionGroup; label: string }[] = [
  { value: "ATT", label: "Attaquant" },
  { value: "MIL", label: "Milieu" },
  { value: "DEF", label: "Défenseur" },
  { value: "GK", label: "Gardien" },
  { value: "DEFAULT", label: "Non spécifié" },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EvaluatePlayerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-pitch-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <EvaluatePlayerContent />
    </Suspense>
  )
}

function EvaluatePlayerContent() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const playerId = params.playerId as string

  const [player, setPlayer] = useState<PlayerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch player data
  useEffect(() => {
    async function fetchPlayer() {
      try {
        const res = await fetch(`/api/admin/users?role=PLAYER&pageSize=100`)
        if (res.ok) {
          const data = await res.json()
          const found = data.users.find((u: PlayerData) => u.id === playerId)
          if (found) setPlayer(found)
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false)
      }
    }
    fetchPlayer()
  }, [playerId])

  const {
    scores,
    positionGroup,
    setPositionGroup,
    notes,
    setNotes,
    result,
    setScore,
    reset,
    toData,
  } = usePlayerEvaluation({
    playerId,
    initialPosition: player?.playerProfile?.primaryPosition,
  })

  // Update position group when player data loads
  useEffect(() => {
    if (player?.playerProfile?.primaryPosition) {
      setPositionGroup(resolvePositionGroup(player.playerProfile.primaryPosition))
    }
  }, [player, setPositionGroup])

  const playerName = player?.playerProfile
    ? `${player.playerProfile.firstName ?? ""} ${player.playerProfile.lastName ?? ""}`.trim() || player.name || player.email
    : player?.name ?? player?.email ?? "Joueur"

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const data = toData()
      // Pour l'instant : sauvegarde locale (toast succès)
      console.log("[Évaluation manuelle]", data)
      toast({
        title: "Évaluation enregistrée",
        description: `Score global : ${data.result.totalScore}/100 — ${data.result.level}`,
      })
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer l'évaluation",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    reset()
    toast({ title: "Réinitialisé", description: "Tous les scores sont revenus à 3" })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!player) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-500">Joueur introuvable</p>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mt-2 gap-1">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
      </div>
    )
  }

  return (
    <>
      <AdminHeader
        title={`Évaluation — ${playerName}`}
        description={`Position : ${player.playerProfile?.primaryPosition ?? "Non définie"}`}
      />

      <div className="p-4 lg:p-6">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/evaluate")}
          className="mb-4 gap-1 text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Button>

        {/* Layout 2 colonnes */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Colonne gauche : formulaire */}
          <div className="lg:col-span-2 space-y-5">
            {/* Sélecteur de position */}
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                      Groupe de position
                    </Label>
                    <Select
                      value={positionGroup}
                      onValueChange={(v) => setPositionGroup(v as PositionGroup)}
                    >
                      <SelectTrigger className="w-48 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POSITION_GROUP_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Le groupe de position ajuste les poids de certains critères pour mieux refléter les exigences du poste.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Formulaire d'évaluation */}
            <Card>
              <CardContent className="pt-5">
                <EvaluationForm
                  scores={scores}
                  categoryScores={result.categoryScores}
                  onScoreChange={setScore}
                />
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardContent className="pt-5">
                <Label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Notes / Commentaires
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observations libres sur le joueur..."
                  className="min-h-[80px] resize-y"
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={handleReset}
                className="gap-1.5 text-slate-600"
              >
                <RotateCcw className="h-4 w-4" />
                Réinitialiser
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-1.5"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Enregistrer l&apos;évaluation
              </Button>
            </div>
          </div>

          {/* Colonne droite : résultats en temps réel */}
          <div className="space-y-4">
            <ScoreCard result={result} />
            <CategoryBreakdown categoryScores={result.categoryScores} />
            <StrengthWeaknessPanel
              strengths={result.strengths}
              weaknesses={result.weaknesses}
            />
          </div>
        </div>
      </div>
    </>
  )
}
