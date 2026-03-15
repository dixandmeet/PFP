"use client"

import { useEffect, useState, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Combobox } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Loader2,
  Plus,
  Briefcase,
  Trophy,
  Target,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react"
import { CLUBS, PRO_LEAGUES, AMATEUR_LEAGUES, POSITIONS } from "@/lib/constants/football-data"

const careerEntrySchema = z.object({
  clubName: z.string().min(2, "Le nom du club est requis"),
  league: z.string().optional(),
  country: z.string().optional(),
  season: z.string().min(1, "La saison est requise"),
  startDate: z.string().min(1, "La date de début est requise"),
  endDate: z.string().optional(),
  position: z.string().optional(),
  appearances: z.string().optional(),
  minutesPlayed: z.string().optional(),
  goals: z.string().optional(),
  assists: z.string().optional(),
})

type CareerEntryFormData = z.infer<typeof careerEntrySchema>

interface CareerEntry {
  id: string
  clubName: string
  league?: string
  country?: string
  season: string
  startDate: string
  endDate?: string
  position?: string
  appearances?: number
  minutesPlayed?: number
  goals?: number
  assists?: number
}

interface CareerTimelineProps {
  playerProfileId: string
  className?: string
}

function isCurrentSeason(season: string): boolean {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const currentSeasonStart = month >= 7 ? year : year - 1
  return (
    season.startsWith(String(currentSeasonStart)) ||
    season.includes(String(currentSeasonStart))
  )
}

export function CareerTimeline({ playerProfileId, className }: CareerTimelineProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [careerEntries, setCareerEntries] = useState<CareerEntry[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CareerEntryFormData>({
    resolver: zodResolver(careerEntrySchema),
  })

  const clubOptions = useMemo(
    () =>
      CLUBS.map((club) => ({
        value: club.name,
        label: club.name,
        sublabel: `${club.league}, ${club.country}`,
      })),
    []
  )

  const countryOptions = useMemo(() => {
    const all = [
      ...CLUBS.map((c) => c.country),
      ...PRO_LEAGUES.map((l) => l.country),
      ...AMATEUR_LEAGUES.map((l) => l.country),
    ]
    return [...new Set(all)].sort((a, b) => a.localeCompare(b))
  }, [])

  const allLeagues = useMemo(() => [...PRO_LEAGUES, ...AMATEUR_LEAGUES], [])

  const selectedCountry = watch("country")
  const filteredLeagues = useMemo(() => {
    if (!selectedCountry) return allLeagues
    return allLeagues.filter((l) => l.country === selectedCountry)
  }, [selectedCountry, allLeagues])

  const positionsByCategory = useMemo(() => {
    const grouped: Record<string, typeof POSITIONS> = {}
    POSITIONS.forEach((pos) => {
      if (!grouped[pos.category]) grouped[pos.category] = []
      grouped[pos.category].push(pos)
    })
    return grouped
  }, [])

  const handleClubChange = (clubName: string) => {
    setValue("clubName", clubName)
    const club = CLUBS.find((c) => c.name === clubName)
    if (club) {
      setValue("league", club.league)
      setValue("country", club.country)
    }
  }

  useEffect(() => {
    async function loadCareerEntries() {
      try {
        const res = await fetch(`/api/players/${playerProfileId}`)
        if (!res.ok) throw new Error("Erreur de chargement")
        const data = await res.json()
        setCareerEntries(data.careerEntries || [])
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de carrière",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    if (playerProfileId) loadCareerEntries()
  }, [playerProfileId, toast])

  const onSubmit = async (data: CareerEntryFormData) => {
    setSaving(true)
    try {
      const payload = {
        clubName: data.clubName,
        league: data.league || undefined,
        country: data.country || undefined,
        season: data.season,
        startDate: data.startDate,
        endDate: data.endDate || undefined,
        position: data.position || undefined,
        appearances: data.appearances ? parseInt(data.appearances) : undefined,
        minutesPlayed: data.minutesPlayed ? parseInt(data.minutesPlayed) : undefined,
        goals: data.goals ? parseInt(data.goals) : undefined,
        assists: data.assists ? parseInt(data.assists) : undefined,
      }

      const res = await fetch(`/api/players/${playerProfileId}/career`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Erreur de sauvegarde")
      }

      const newEntry = await res.json()
      setCareerEntries([newEntry, ...careerEntries])
      toast({ title: "Succès", description: "Entrée de carrière ajoutée" })
      reset()
      setDialogOpen(false)
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white", className)}>
      {/* Section header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <Trophy className="h-4 w-4 text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">Parcours</h3>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-pitch-600 hover:bg-pitch-50 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Ajouter
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Nouvelle expérience
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Ajoutez une expérience dans un club avec vos statistiques
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700 font-semibold">
                    Nom du club <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name="clubName"
                    control={control}
                    render={({ field }) => (
                      <Combobox
                        options={clubOptions}
                        value={field.value}
                        onValueChange={handleClubChange}
                        placeholder="Sélectionner un club"
                        searchPlaceholder="Rechercher un club..."
                        emptyText="Aucun club trouvé."
                        className="mt-2"
                      />
                    )}
                  />
                  {errors.clubName && (
                    <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.clubName.message}</span>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-slate-700 font-semibold">
                    Saison <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    {...register("season")}
                    placeholder="2023/24"
                    className="mt-2"
                  />
                  {errors.season && (
                    <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.season.message}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700 font-semibold">Ligue</Label>
                  <Controller
                    name="league"
                    control={control}
                    render={({ field }) => {
                      const match = field.value
                        ? filteredLeagues.find((l) => l.name === field.value)
                        : null
                      const selectVal = match ? `${match.country}::${match.name}` : ""
                      return (
                        <Select
                          value={selectVal}
                          onValueChange={(v) => {
                            field.onChange(v.includes("::") ? v.split("::")[1] : v)
                          }}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Sélectionner une ligue" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredLeagues.map((l) => (
                              <SelectItem key={`${l.country}-${l.name}`} value={`${l.country}::${l.name}`}>
                                {l.name} {!selectedCountry && `(${l.country})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )
                    }}
                  />
                </div>
                <div>
                  <Label className="text-slate-700 font-semibold">Pays</Label>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Sélectionner un pays" />
                        </SelectTrigger>
                        <SelectContent>
                          {countryOptions.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700 font-semibold">
                    Date de début <span className="text-red-500">*</span>
                  </Label>
                  <Input type="date" {...register("startDate")} className="mt-2" />
                  {errors.startDate && (
                    <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.startDate.message}</span>
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-slate-700 font-semibold">Date de fin</Label>
                  <Input type="date" {...register("endDate")} className="mt-2" />
                </div>
              </div>

              <div>
                <Label className="text-slate-700 font-semibold">Position</Label>
                <Controller
                  name="position"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Sélectionner une position" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(positionsByCategory).map(([cat, positions]) => (
                          <SelectGroup key={cat}>
                            <SelectLabel className="font-bold text-slate-700">{cat}</SelectLabel>
                            {positions.map((pos) => (
                              <SelectItem key={pos.code} value={pos.name}>
                                {pos.name} ({pos.code})
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-4 text-sm">Statistiques</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-600 text-xs font-semibold">Apparitions</Label>
                    <Input type="number" {...register("appearances")} placeholder="35" className="mt-1 bg-white" />
                  </div>
                  <div>
                    <Label className="text-slate-600 text-xs font-semibold">Minutes jouées</Label>
                    <Input type="number" {...register("minutesPlayed")} placeholder="2850" className="mt-1 bg-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <Label className="text-slate-600 text-xs font-semibold">Buts</Label>
                    <Input type="number" {...register("goals")} placeholder="12" className="mt-1 bg-white" />
                  </div>
                  <div>
                    <Label className="text-slate-600 text-xs font-semibold">Passes décisives</Label>
                    <Input type="number" {...register("assists")} placeholder="8" className="mt-1 bg-white" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="font-semibold"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-pitch-600 hover:bg-pitch-700 text-white font-semibold"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Timeline body */}
      <div className="px-5 py-4">
        {careerEntries.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Aucune expérience ajoutée"
            description="Commencez à construire votre CV en ajoutant vos expériences"
            action={
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-pitch-600 hover:bg-pitch-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter votre première expérience
              </Button>
            }
          />
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-2 bottom-2 w-px bg-slate-200" />

            <div className="space-y-6">
              {careerEntries.map((entry, idx) => {
                const isCurrent = isCurrentSeason(entry.season)
                const hasStats =
                  entry.appearances != null ||
                  entry.goals != null ||
                  entry.assists != null ||
                  entry.minutesPlayed != null

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.08 }}
                    className="relative pl-12"
                  >
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        "absolute left-3.5 top-3 w-3 h-3 rounded-full border-2 border-white z-10",
                        isCurrent ? "bg-pitch-500 ring-2 ring-pitch-200" : "bg-slate-300"
                      )}
                    />

                    <div
                      className={cn(
                        "group rounded-xl border p-4 transition-all duration-200",
                        "hover:shadow-md hover:-translate-y-0.5",
                        isCurrent
                          ? "border-pitch-200 bg-pitch-50/30"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-bold text-slate-900">{entry.clubName}</h4>
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border",
                                isCurrent
                                  ? "bg-gold-50 text-gold-700 border-gold-200"
                                  : "bg-slate-50 text-slate-500 border-slate-200"
                              )}
                            >
                              {entry.season}
                            </span>
                            {entry.position && (
                              <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                                {entry.position}
                              </span>
                            )}
                          </div>
                          {(entry.league || entry.country) && (
                            <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                              <MapPin className="h-3 w-3" />
                              {[entry.league, entry.country].filter(Boolean).join(", ")}
                            </p>
                          )}
                          <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(entry.startDate).toLocaleDateString("fr-FR", {
                              month: "short",
                              year: "numeric",
                            })}{" "}
                            –{" "}
                            {entry.endDate
                              ? new Date(entry.endDate).toLocaleDateString("fr-FR", {
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Présent"}
                          </p>
                        </div>

                        {/* Actions (visible on hover) */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            title="Modifier"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Stats */}
                      {hasStats && (
                        <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-100">
                          <MiniStat
                            label="Matchs"
                            value={entry.appearances}
                            icon={Target}
                          />
                          <MiniStat
                            label="Minutes"
                            value={entry.minutesPlayed}
                            icon={Clock}
                            format
                          />
                          <MiniStat
                            label="Buts"
                            value={entry.goals}
                            icon={Trophy}
                          />
                          <MiniStat
                            label="Passes D."
                            value={entry.assists}
                            icon={Target}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MiniStat({
  label,
  value,
  icon: Icon,
  format,
}: {
  label: string
  value?: number | null
  icon: React.ComponentType<{ className?: string }>
  format?: boolean
}) {
  if (value == null) return <div />
  return (
    <div className="text-center">
      <p className="text-[24px] font-bold text-slate-900 leading-none">
        {format ? value.toLocaleString() : value}
      </p>
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mt-1">
        {label}
      </p>
    </div>
  )
}
