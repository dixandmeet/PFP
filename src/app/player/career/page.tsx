"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Trophy, AlertCircle, RefreshCw } from "lucide-react"

import { CareerHeader } from "@/components/career/CareerHeader"
import { CareerStats, CareerStatsSkeleton } from "@/components/career/CareerStats"
import { ExperienceList } from "@/components/career/ExperienceList"
import { ExperiencePreview } from "@/components/career/ExperiencePreview"
import type { CareerEntry } from "@/components/career/ExperienceCard"

const careerFormSchema = z.object({
  clubName: z.string().min(1, "Nom du club requis"),
  league: z.string().optional(),
  country: z.string().optional(),
  season: z.string().regex(/^\d{4}\/(\d{2}|\d{4})$/, "Format: 2024/25 ou 2024/2025"),
  startDate: z.string().min(1, "Date de début requise"),
  endDate: z.string().optional(),
  position: z.string().optional(),
  appearances: z.number().int().min(0).optional().or(z.literal("")),
  minutesPlayed: z.number().int().min(0).optional().or(z.literal("")),
  goals: z.number().int().min(0).optional().or(z.literal("")),
  assists: z.number().int().min(0).optional().or(z.literal("")),
})

type CareerFormData = z.infer<typeof careerFormSchema>

const POSITIONS = [
  "Gardien", "Défenseur central", "Latéral droit", "Latéral gauche",
  "Milieu défensif", "Milieu central", "Milieu offensif",
  "Ailier droit", "Ailier gauche", "Avant-centre", "Second attaquant",
]

export default function PlayerCareerPage() {
  const { toast } = useToast()
  const [entries, setEntries] = useState<CareerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const form = useForm<CareerFormData>({
    resolver: zodResolver(careerFormSchema),
    defaultValues: {
      clubName: "",
      league: "",
      country: "",
      season: "",
      startDate: "",
      endDate: "",
      position: "",
    },
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setError(false)
    setLoading(true)
    try {
      const meRes = await fetch("/api/users/me")
      if (!meRes.ok) return
      const me = await meRes.json()

      if (!me.playerProfile?.id) return
      setProfileId(me.playerProfile.id)

      const res = await fetch(`/api/players/${me.playerProfile.id}/career`)
      if (res.ok) {
        const data = await res.json()
        const fetched: CareerEntry[] = data.entries || []
        setEntries(fetched)
        if (fetched.length > 0 && !selectedId) {
          setSelectedId(fetched[0].id)
        }
      }
    } catch {
      setError(true)
      toast({ title: "Erreur", description: "Impossible de charger le parcours", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: CareerFormData) => {
    if (!profileId) return
    setSaving(true)

    try {
      const payload: any = {
        clubName: data.clubName,
        season: data.season,
        startDate: data.startDate,
      }
      if (data.league) payload.league = data.league
      if (data.country) payload.country = data.country
      if (data.endDate) payload.endDate = data.endDate
      if (data.position) payload.position = data.position
      if (data.appearances !== "" && data.appearances !== undefined) payload.appearances = Number(data.appearances)
      if (data.minutesPlayed !== "" && data.minutesPlayed !== undefined) payload.minutesPlayed = Number(data.minutesPlayed)
      if (data.goals !== "" && data.goals !== undefined) payload.goals = Number(data.goals)
      if (data.assists !== "" && data.assists !== undefined) payload.assists = Number(data.assists)

      const res = await fetch(`/api/players/${profileId}/career`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erreur")
      }

      toast({ title: "Ajouté", description: "Expérience ajoutée avec succès" })
      form.reset()
      setDialogOpen(false)
      loadData()
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!profileId || !deleteTarget) return
    setDeleting(true)

    try {
      const res = await fetch(`/api/players/${profileId}/career?entryId=${deleteTarget}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erreur")
      }

      toast({ title: "Supprimé", description: "Expérience supprimée" })
      if (selectedId === deleteTarget) {
        setSelectedId(null)
      }
      setDeleteTarget(null)
      loadData()
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" })
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      month: "short",
      year: "numeric",
    })
  }

  const totalStats = entries.reduce(
    (acc, e) => ({
      appearances: acc.appearances + (e.appearances || 0),
      goals: acc.goals + (e.goals || 0),
      assists: acc.assists + (e.assists || 0),
      minutes: acc.minutes + (e.minutesPlayed || 0),
    }),
    { appearances: 0, goals: 0, assists: 0, minutes: 0 }
  )

  const selectedEntry = entries.find((e) => e.id === selectedId) || null

  if (error && !loading && entries.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Erreur de chargement</h2>
          <p className="text-sm text-slate-500 mb-6">Impossible de charger votre parcours. Veuillez réessayer.</p>
          <Button onClick={loadData} className="bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2">
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
      <CareerHeader
        experienceCount={entries.length}
        onAddExperience={() => setDialogOpen(true)}
      />

      {loading ? (
        <CareerStatsSkeleton />
      ) : entries.length > 0 ? (
        <CareerStats
          clubs={new Set(entries.map((e) => e.clubName)).size}
          appearances={totalStats.appearances}
          goals={totalStats.goals}
          assists={totalStats.assists}
        />
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <ExperienceList
              entries={[]}
              selectedId={null}
              onSelect={() => {}}
              onDelete={() => {}}
              formatDate={formatDate}
              isLoading
            />
          </div>
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-8 animate-pulse min-h-[300px]" />
          </div>
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Trophy className="w-7 h-7 text-slate-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Aucune expérience ajoutée</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-sm">
            Ajoutez vos expériences en club pour enrichir votre profil et attirer les recruteurs.
          </p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2"
          >
            <Plus className="w-4 h-4" />
            Ajouter une expérience
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <ExperienceList
              entries={entries}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={setDeleteTarget}
              formatDate={formatDate}
            />
          </div>
          <div className="hidden lg:block lg:col-span-5">
            <div className="sticky top-6">
              <ExperiencePreview
                entry={selectedEntry}
                formatDate={formatDate}
                onDelete={setDeleteTarget}
                onAddExperience={() => setDialogOpen(true)}
              />
            </div>
          </div>
          {selectedEntry && (
            <div className="lg:hidden">
              <ExperiencePreview
                entry={selectedEntry}
                formatDate={formatDate}
                onDelete={setDeleteTarget}
                onAddExperience={() => setDialogOpen(true)}
              />
            </div>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter une expérience</DialogTitle>
            <DialogDescription>
              Renseignez les informations de votre passage dans un club.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clubName">Club *</Label>
              <Input
                id="clubName"
                placeholder="Ex: Olympique de Marseille"
                {...form.register("clubName")}
                error={form.formState.errors.clubName?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="season">Saison *</Label>
                <Input
                  id="season"
                  placeholder="2024/25"
                  {...form.register("season")}
                  error={form.formState.errors.season?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Poste</Label>
                <Select
                  onValueChange={(v) => form.setValue("position", v)}
                  defaultValue=""
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITIONS.map((pos) => (
                      <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="league">Ligue</Label>
                <Input
                  id="league"
                  placeholder="Ex: Ligue 1"
                  {...form.register("league")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  placeholder="Ex: France"
                  {...form.register("country")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startDate">Début *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...form.register("startDate")}
                  error={form.formState.errors.startDate?.message}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...form.register("endDate")}
                />
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm font-medium text-stadium-700 mb-3">Statistiques (optionnel)</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="appearances" className="text-xs">Matchs</Label>
                  <Input
                    id="appearances"
                    type="number"
                    min={0}
                    placeholder="0"
                    {...form.register("appearances", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="goals" className="text-xs">Buts</Label>
                  <Input
                    id="goals"
                    type="number"
                    min={0}
                    placeholder="0"
                    {...form.register("goals", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="assists" className="text-xs">Passes D.</Label>
                  <Input
                    id="assists"
                    type="number"
                    min={0}
                    placeholder="0"
                    {...form.register("assists", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="minutesPlayed" className="text-xs">Minutes</Label>
                  <Input
                    id="minutesPlayed"
                    type="number"
                    min={0}
                    placeholder="0"
                    {...form.register("minutesPlayed", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={saving} className="gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Ajouter
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette expérience ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'entrée sera définitivement supprimée de votre parcours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
