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
  DialogClose,
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
import { Loader2, Plus, Trophy, AlertCircle, RefreshCw, X, MapPin, Calendar, Trash2 } from "lucide-react"

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
}).refine(
  (data) => {
    if (data.endDate && data.startDate) {
      return new Date(data.endDate) >= new Date(data.startDate)
    }
    return true
  },
  { message: "La date de fin doit être après la date de début", path: ["endDate"] }
)

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
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)

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

  const watchedStartDate = form.watch("startDate")
  useEffect(() => {
    if (watchedStartDate) {
      const currentSeason = form.getValues("season")
      if (!currentSeason) {
        const year = new Date(watchedStartDate).getFullYear()
        form.setValue("season", `${year}/${String(year + 1).slice(-2)}`)
      }
    }
  }, [watchedStartDate])

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
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
              onSelect={(id) => { setSelectedId(id); setMobilePreviewOpen(true) }}
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
        </div>
      )}

      {/* Mobile experience preview popup */}
      <Dialog open={mobilePreviewOpen} onOpenChange={setMobilePreviewOpen}>
        <DialogContent className="lg:hidden p-0 max-w-lg w-full max-h-[85dvh] overflow-hidden rounded-t-2xl sm:rounded-2xl [&>button:last-child]:hidden flex flex-col">
          <DialogTitle className="sr-only">{selectedEntry?.clubName || "Détails de l'expérience"}</DialogTitle>
          {selectedEntry && (
            <>
              {/* Header */}
              <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 pt-6 pb-5 shrink-0">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjZykiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-50" />
                <DialogClose className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <X className="h-4 w-4" />
                </DialogClose>
                <div className="relative flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <Trophy className="h-5 w-5 text-white/80" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-white">{selectedEntry.clubName}</h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/80 ring-1 ring-white/20">
                        {selectedEntry.season}
                      </span>
                      {selectedEntry.position && (
                        <span className="text-sm text-white/50">{selectedEntry.position}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">
                {/* Infos */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Informations</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedEntry.league && (
                      <div className="p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100">
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Ligue</p>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-semibold text-slate-800">{selectedEntry.league}</span>
                        </div>
                      </div>
                    )}
                    {selectedEntry.country && (
                      <div className="p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100">
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Pays</p>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-semibold text-slate-800">{selectedEntry.country}</span>
                        </div>
                      </div>
                    )}
                    <div className="p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100 col-span-2">
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Période</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-800">
                          {formatDate(selectedEntry.startDate)} – {selectedEntry.endDate ? formatDate(selectedEntry.endDate) : "Présent"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistiques */}
                {(selectedEntry.appearances != null || selectedEntry.goals != null || selectedEntry.assists != null || selectedEntry.minutesPlayed != null) && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Statistiques</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100 text-center">
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Matchs</p>
                        <p className="text-xl font-bold text-slate-900">{selectedEntry.appearances ?? "–"}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100 text-center">
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Buts</p>
                        <p className="text-xl font-bold text-amber-600">{selectedEntry.goals ?? "–"}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100 text-center">
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Passes D.</p>
                        <p className="text-xl font-bold text-blue-600">{selectedEntry.assists ?? "–"}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100 text-center">
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Minutes</p>
                        <p className="text-xl font-bold text-slate-600">{selectedEntry.minutesPlayed ?? "–"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-slate-100 bg-white px-5 py-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => { setDeleteTarget(selectedEntry.id); setMobilePreviewOpen(false) }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-red-600 ring-1 ring-red-200 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer cette expérience
                </button>
                <button
                  type="button"
                  onClick={() => { setMobilePreviewOpen(false); setDialogOpen(true) }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une expérience
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) form.reset() }}>
        <DialogContent className="w-full max-w-lg max-h-[90dvh] overflow-y-auto p-0 gap-0 rounded-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-slate-100">
            <div className="h-9 w-9 rounded-xl bg-green-600/10 flex items-center justify-center shrink-0">
              <Trophy className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">Ajouter une expérience</DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0">
                Renseignez votre passage dans un club
              </DialogDescription>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">
            {/* Club */}
            <div className="space-y-1.5">
              <Label htmlFor="clubName" className="text-sm font-medium text-slate-700">Club *</Label>
              <Input
                id="clubName"
                placeholder="Ex: Olympique de Marseille"
                className="rounded-xl"
                {...form.register("clubName")}
                error={form.formState.errors.clubName?.message}
              />
            </div>

            {/* Période */}
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Période</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="startDate" className="text-sm font-medium text-slate-700">Date de début *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    className="rounded-xl"
                    {...form.register("startDate")}
                    error={form.formState.errors.startDate?.message}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="endDate" className="text-sm font-medium text-slate-700">
                    Date de fin
                    <span className="text-slate-400 font-normal ml-1">(vide = en cours)</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    min={watchedStartDate || undefined}
                    className="rounded-xl"
                    {...form.register("endDate")}
                    error={form.formState.errors.endDate?.message}
                  />
                </div>
              </div>
            </div>

            {/* Saison & Poste */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="season" className="text-sm font-medium text-slate-700">
                  Saison *
                  <span className="text-slate-400 font-normal ml-1">ex: 2024/25</span>
                </Label>
                <Input
                  id="season"
                  placeholder="2024/25"
                  className="rounded-xl"
                  {...form.register("season")}
                  error={form.formState.errors.season?.message}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="position" className="text-sm font-medium text-slate-700">Poste</Label>
                <Select
                  onValueChange={(v) => form.setValue("position", v)}
                  defaultValue=""
                >
                  <SelectTrigger className="rounded-xl">
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

            {/* Ligue & Pays */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="league" className="text-sm font-medium text-slate-700">Ligue</Label>
                <Input id="league" placeholder="Ex: Ligue 1" className="rounded-xl" {...form.register("league")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country" className="text-sm font-medium text-slate-700">Pays</Label>
                <Input id="country" placeholder="Ex: France" className="rounded-xl" {...form.register("country")} />
              </div>
            </div>

            {/* Statistiques */}
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2">Statistiques <span className="normal-case font-normal">(optionnel)</span></p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="appearances" className="text-sm font-medium text-slate-700">Matchs joués</Label>
                  <Input id="appearances" type="number" min={0} placeholder="0" className="rounded-xl"
                    {...form.register("appearances", { valueAsNumber: true })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="goals" className="text-sm font-medium text-slate-700">Buts</Label>
                  <Input id="goals" type="number" min={0} placeholder="0" className="rounded-xl"
                    {...form.register("goals", { valueAsNumber: true })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="assists" className="text-sm font-medium text-slate-700">Passes décisives</Label>
                  <Input id="assists" type="number" min={0} placeholder="0" className="rounded-xl"
                    {...form.register("assists", { valueAsNumber: true })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="minutesPlayed" className="text-sm font-medium text-slate-700">Minutes jouées</Label>
                  <Input id="minutesPlayed" type="number" min={0} placeholder="0" className="rounded-xl"
                    {...form.register("minutesPlayed", { valueAsNumber: true })} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1 sm:flex-none rounded-xl">
                Annuler
              </Button>
              <Button type="submit" disabled={saving} className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? "Enregistrement..." : "Ajouter l'expérience"}
              </Button>
            </div>
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
