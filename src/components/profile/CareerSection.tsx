"use client"

import { useEffect, useState, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Loader2, Plus, Briefcase, Trophy, Target, Clock, Sparkles, MapPin, Calendar, AlertCircle } from "lucide-react"
import { CLUBS, PRO_LEAGUES, AMATEUR_LEAGUES, POSITIONS } from "@/lib/constants/football-data"

// Schema de validation
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

interface CareerSectionProps {
  playerProfileId: string
}

export function CareerSection({ playerProfileId }: CareerSectionProps) {
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

  // Options pour le combobox des clubs
  const clubOptions = useMemo(() => 
    CLUBS.map((club) => ({
      value: club.name,
      label: club.name,
      sublabel: `${club.league}, ${club.country}`,
    })),
    []
  )

  // Liste des pays uniques (extraits des clubs et ligues)
  const countryOptions = useMemo(() => {
    const countriesFromClubs = CLUBS.map((club) => club.country)
    const countriesFromProLeagues = PRO_LEAGUES.map((league) => league.country)
    const countriesFromAmateurLeagues = AMATEUR_LEAGUES.map((league) => league.country)
    const allCountries = [...new Set([...countriesFromClubs, ...countriesFromProLeagues, ...countriesFromAmateurLeagues])]
    return allCountries.sort((a, b) => a.localeCompare(b))
  }, [])

  // Liste des ligues (combinaison pro + amateur)
  const allLeagues = useMemo(() => {
    return [...PRO_LEAGUES, ...AMATEUR_LEAGUES]
  }, [])

  // Filtrer les ligues par pays sélectionné
  const selectedCountry = watch("country")
  const filteredLeagues = useMemo(() => {
    if (!selectedCountry) return allLeagues
    return allLeagues.filter((league) => league.country === selectedCountry)
  }, [selectedCountry, allLeagues])

  // Positions groupées par catégorie
  const positionsByCategory = useMemo(() => {
    const grouped: Record<string, typeof POSITIONS> = {}
    POSITIONS.forEach((pos) => {
      if (!grouped[pos.category]) {
        grouped[pos.category] = []
      }
      grouped[pos.category].push(pos)
    })
    return grouped
  }, [])

  // Auto-remplir ligue et pays quand un club est sélectionné
  const handleClubChange = (clubName: string) => {
    setValue("clubName", clubName)
    const club = CLUBS.find((c) => c.name === clubName)
    if (club) {
      setValue("league", club.league)
      setValue("country", club.country)
    }
  }

  // Charger les entrées de carrière
  useEffect(() => {
    async function loadCareerEntries() {
      try {
        const profileResponse = await fetch(`/api/players/${playerProfileId}`)
        if (!profileResponse.ok) throw new Error("Erreur de chargement")

        const profileData = await profileResponse.json()
        setCareerEntries(profileData.careerEntries || [])
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de carrière",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (playerProfileId) {
      loadCareerEntries()
    }
  }, [playerProfileId, toast])

  const onSubmit = async (data: CareerEntryFormData) => {
    setSaving(true)
    try {
      // Construire le payload en excluant les valeurs vides (undefined est ignoré par JSON.stringify)
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

      const response = await fetch(`/api/players/${playerProfileId}/career`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur de sauvegarde")
      }

      const newEntry = await response.json()
      setCareerEntries([newEntry, ...careerEntries])

      toast({
        title: "Succès",
        description: "Entrée de carrière ajoutée",
      })

      reset()
      setDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-flex p-4 bg-gradient-to-br from-pitch-100 to-pitch-50 rounded-full mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-pitch-600" />
          </div>
          <p className="text-stadium-600 font-semibold">Chargement du parcours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header de section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-pitch-500 to-pitch-600 rounded-lg">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stadium-900">Mon Parcours</h2>
            <p className="text-sm text-stadium-600">Vos expériences dans les clubs</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-pitch-600 to-pitch-700 hover:from-pitch-700 hover:to-pitch-800 text-white font-bold shadow-lg hover:shadow-xl">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une expérience
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl border-2 border-pitch-200">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-pitch-500 to-pitch-600 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <DialogTitle className="text-2xl font-black text-stadium-900">Nouvelle expérience</DialogTitle>
              </div>
              <DialogDescription className="text-stadium-600">
                Ajoutez une expérience dans un club avec vos statistiques
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clubName" className="text-stadium-700 font-semibold flex items-center gap-2">
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
                    <div className="flex items-center gap-1 text-sm text-red-600 mt-2">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.clubName.message}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="season" className="text-stadium-700 font-semibold flex items-center gap-2">
                    Saison <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="season"
                    {...register("season")}
                    placeholder="2023/24 ou 2023/2024"
                    className="mt-2 border-2 border-pitch-100 focus:border-pitch-300"
                  />
                  {errors.season && (
                    <div className="flex items-center gap-1 text-sm text-red-600 mt-2">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.season.message}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="league" className="text-stadium-700 font-semibold">Ligue</Label>
                  <Controller
                    name="league"
                    control={control}
                    render={({ field }) => {
                      // Trouver la ligue correspondante pour construire la valeur complète
                      const matchingLeague = field.value 
                        ? filteredLeagues.find(l => l.name === field.value) 
                        : null
                      const selectValue = matchingLeague 
                        ? `${matchingLeague.country}::${matchingLeague.name}` 
                        : ""
                      
                      return (
                        <Select 
                          value={selectValue} 
                          onValueChange={(val) => {
                            // La valeur contient "pays::nom", on extrait le nom
                            const leagueName = val.includes("::") ? val.split("::")[1] : val
                            field.onChange(leagueName)
                          }}
                        >
                          <SelectTrigger className="mt-2 border-2 border-pitch-100 focus:border-pitch-300">
                            <SelectValue placeholder="Sélectionner une ligue" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredLeagues.map((league) => (
                              <SelectItem 
                                key={`${league.country}-${league.name}`} 
                                value={`${league.country}::${league.name}`}
                              >
                                {league.name} {!selectedCountry && `(${league.country})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )
                    }}
                  />
                </div>

                <div>
                  <Label htmlFor="country" className="text-stadium-700 font-semibold">Pays</Label>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value || ""} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-2 border-2 border-pitch-100 focus:border-pitch-300">
                          <SelectValue placeholder="Sélectionner un pays" />
                        </SelectTrigger>
                        <SelectContent>
                          {countryOptions.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-stadium-700 font-semibold flex items-center gap-2">
                    Date de début <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register("startDate")}
                    className="mt-2 border-2 border-pitch-100 focus:border-pitch-300"
                  />
                  {errors.startDate && (
                    <div className="flex items-center gap-1 text-sm text-red-600 mt-2">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.startDate.message}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="endDate" className="text-stadium-700 font-semibold">
                    Date de fin <span className="text-stadium-400 text-sm font-normal">(optionnel)</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    {...register("endDate")}
                    className="mt-2 border-2 border-pitch-100 focus:border-pitch-300"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="position" className="text-stadium-700 font-semibold">Position</Label>
                <Controller
                  name="position"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || ""} onValueChange={field.onChange}>
                      <SelectTrigger className="mt-2 border-2 border-pitch-100 focus:border-pitch-300">
                        <SelectValue placeholder="Sélectionner une position" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(positionsByCategory).map(([category, positions]) => (
                          <SelectGroup key={category}>
                            <SelectLabel className="font-bold text-pitch-700">{category}</SelectLabel>
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

              <div className="p-4 bg-pitch-50/50 rounded-xl border-2 border-pitch-100">
                <h4 className="font-bold text-stadium-900 mb-4 flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-gold-600" />
                  Statistiques
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appearances" className="text-stadium-700 font-semibold">Apparitions</Label>
                    <Input
                      id="appearances"
                      type="number"
                      {...register("appearances")}
                      placeholder="35"
                      className="mt-2 border-2 border-pitch-100 focus:border-pitch-300 bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="minutesPlayed" className="text-stadium-700 font-semibold">Minutes jouées</Label>
                    <Input
                      id="minutesPlayed"
                      type="number"
                      {...register("minutesPlayed")}
                      placeholder="2850"
                      className="mt-2 border-2 border-pitch-100 focus:border-pitch-300 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="goals" className="text-stadium-700 font-semibold">Buts</Label>
                    <Input
                      id="goals"
                      type="number"
                      {...register("goals")}
                      placeholder="12"
                      className="mt-2 border-2 border-pitch-100 focus:border-pitch-300 bg-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="assists" className="text-stadium-700 font-semibold">Passes décisives</Label>
                    <Input
                      id="assists"
                      type="number"
                      {...register("assists")}
                      placeholder="8"
                      className="mt-2 border-2 border-pitch-100 focus:border-pitch-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="border-2 border-stadium-200 hover:bg-stadium-50 font-semibold"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-gradient-to-r from-pitch-600 to-pitch-700 hover:from-pitch-700 hover:to-pitch-800 text-white font-bold shadow-lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des entrées de carrière */}
      {careerEntries.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Aucune expérience ajoutée"
          description="Commencez à construire votre CV en ajoutant vos expériences dans les clubs"
          action={
            <Button 
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-to-r from-pitch-600 to-pitch-700 hover:from-pitch-700 hover:to-pitch-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter votre première expérience
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {careerEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="card-stadium hover:-translate-y-1 transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-pitch-500 to-pitch-600 rounded-xl shadow-lg">
                        <Trophy className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-stadium-900">{entry.clubName}</h3>
                        {(entry.league || entry.country) && (
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4 text-stadium-500" />
                            <p className="text-stadium-600 font-medium">
                              {entry.league && entry.country
                                ? `${entry.league}, ${entry.country}`
                                : entry.league || entry.country}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-gradient-to-r from-gold-400 to-gold-600 text-white font-bold border-0 shadow-md mb-2">
                        {entry.season}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-stadium-500 justify-end">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(entry.startDate).toLocaleDateString("fr-FR", {
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          -{" "}
                          {entry.endDate
                            ? new Date(entry.endDate).toLocaleDateString("fr-FR", {
                                month: "short",
                                year: "numeric",
                              })
                            : "Présent"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-br from-pitch-50 to-white rounded-xl border-2 border-pitch-100">
                    {entry.appearances !== null && entry.appearances !== undefined && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-pitch-600" />
                          <div className="text-sm text-stadium-600 font-semibold">Matchs</div>
                        </div>
                        <div className="text-2xl font-black text-pitch-700">
                          {entry.appearances}
                        </div>
                      </div>
                    )}
                    {entry.minutesPlayed !== null && entry.minutesPlayed !== undefined && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-victory-600" />
                          <div className="text-sm text-stadium-600 font-semibold">Minutes</div>
                        </div>
                        <div className="text-2xl font-black text-victory-700">
                          {entry.minutesPlayed.toLocaleString()}
                        </div>
                      </div>
                    )}
                    {entry.goals !== null && entry.goals !== undefined && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Trophy className="h-4 w-4 text-gold-600" />
                          <div className="text-sm text-stadium-600 font-semibold">Buts</div>
                        </div>
                        <div className="text-2xl font-black text-gold-700">{entry.goals}</div>
                      </div>
                    )}
                    {entry.assists !== null && entry.assists !== undefined && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Sparkles className="h-4 w-4 text-pitch-600" />
                          <div className="text-sm text-stadium-600 font-semibold">Passes D.</div>
                        </div>
                        <div className="text-2xl font-black text-pitch-700">
                          {entry.assists}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Position */}
                  {entry.position && (
                    <div className="mt-4 flex items-center gap-2">
                      <Badge className="bg-pitch-100 text-pitch-700 border-2 border-pitch-200 font-semibold">
                        {entry.position}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
