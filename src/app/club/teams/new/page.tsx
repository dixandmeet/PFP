"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft } from "lucide-react"
import {
  TEAM_LEVELS,
  TEAM_LEVEL_LABELS,
  FR_ACADEMY_CATEGORIES,
  getDivisionsForLevel,
  getCompetitionOptions,
  isFrAcademy,
  type TeamLevelValue,
  type FrAcademyCategory,
} from "@/lib/constants/team-options"

// Schema Zod côté client — validation de base, la validation conditionnelle
// complète est faite côté serveur avec le country du club.
const clientTeamSchema = z.object({
  name: z.string().min(2, "Le nom doit faire au moins 2 caractères"),
  level: z.enum(["PRO", "AMATEUR", "ACADEMY"], {
    required_error: "Le niveau est requis",
  }),
  division: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  competitionName: z.string().optional().nullable(),
})

type TeamFormData = z.infer<typeof clientTeamSchema>

export default function NewTeamPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [clubProfileId, setClubProfileId] = useState<string | null>(null)
  const [clubCountry, setClubCountry] = useState<string>("")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TeamFormData>({
    resolver: zodResolver(clientTeamSchema),
    defaultValues: {
      name: "",
      level: undefined,
      division: null,
      category: null,
      competitionName: null,
    },
  })

  const watchLevel = watch("level")
  const watchCategory = watch("category")

  // Charger les infos du club
  useEffect(() => {
    async function loadClubInfo() {
      try {
        const response = await fetch("/api/users/me")
        if (!response.ok) throw new Error("Erreur")

        const userData = await response.json()

        if (!userData.clubProfile) {
          toast({
            title: "Profil manquant",
            description: "Créez d'abord votre profil club",
            variant: "destructive",
          })
          router.push("/club/profile")
          return
        }

        setClubProfileId(userData.clubProfile.id)
        setClubCountry(userData.clubProfile.country || "")
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de charger les informations du club",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadClubInfo()
  }, [toast, router])

  // Reset des champs dépendants quand level change
  useEffect(() => {
    setValue("division", null)
    setValue("category", null)
    setValue("competitionName", null)
  }, [watchLevel, setValue])

  // Reset competitionName quand category change
  useEffect(() => {
    setValue("competitionName", null)
  }, [watchCategory, setValue])

  // Déterminer le mode d'affichage
  const showFrAcademy = watchLevel ? isFrAcademy(clubCountry, watchLevel as TeamLevelValue) : false
  const showDivision = watchLevel && !showFrAcademy
  const showCategory = showFrAcademy
  const showCompetition = showFrAcademy && !!watchCategory

  // Options dynamiques
  const divisionOptions = watchLevel ? getDivisionsForLevel(watchLevel as TeamLevelValue) : []
  const competitionOptions = watchCategory
    ? getCompetitionOptions(watchCategory as FrAcademyCategory)
    : []

  const onSubmit = async (data: TeamFormData) => {
    if (!clubProfileId) return

    // Validation côté client avant envoi
    if (showFrAcademy) {
      if (!data.category) {
        toast({
          title: "Erreur",
          description: "La catégorie est requise",
          variant: "destructive",
        })
        return
      }
      if (!data.competitionName) {
        toast({
          title: "Erreur",
          description: "La compétition est requise",
          variant: "destructive",
        })
        return
      }
    } else if (watchLevel && !data.division) {
      toast({
        title: "Erreur",
        description: "La division est requise",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: data.name,
        level: data.level,
        division: showFrAcademy ? null : (data.division || null),
        category: showFrAcademy ? (data.category || null) : null,
        competitionName: showFrAcademy ? (data.competitionName || null) : null,
      }

      const response = await fetch(`/api/clubs/${clubProfileId}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la création")
      }

      toast({
        title: "Succès",
        description: "Équipe créée avec succès",
      })

      router.push("/club/teams")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur inconnue"
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push("/club/teams")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour aux équipes
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Nouvelle équipe</CardTitle>
          <CardDescription>
            Renseignez les informations de votre équipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l&apos;équipe *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Ex: Équipe première, U19, Réserve..."
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Level */}
            <div className="space-y-2">
              <Label>Niveau *</Label>
              <Select
                onValueChange={(value) => setValue("level", value as TeamLevelValue)}
                value={watchLevel || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le niveau" />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {TEAM_LEVEL_LABELS[level]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.level && (
                <p className="text-sm text-red-600">{errors.level.message}</p>
              )}
            </div>

            {/* Division (hors FR+ACADEMY) */}
            {showDivision && (
              <div className="space-y-2">
                <Label>Division / Compétition *</Label>
                <Select
                  onValueChange={(value) => setValue("division", value)}
                  value={watch("division") || undefined}
                  disabled={divisionOptions.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisionOptions.map((div) => (
                      <SelectItem key={div} value={div}>
                        {div}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Category (FR + ACADEMY) */}
            {showCategory && (
              <div className="space-y-2">
                <Label>Catégorie *</Label>
                <Select
                  onValueChange={(value) => setValue("category", value)}
                  value={watch("category") || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {FR_ACADEMY_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* CompetitionName (FR + ACADEMY + category choisie) */}
            {showCompetition && (
              <div className="space-y-2">
                <Label>Compétition *</Label>
                <Select
                  onValueChange={(value) => setValue("competitionName", value)}
                  value={watch("competitionName") || undefined}
                  disabled={competitionOptions.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la compétition" />
                  </SelectTrigger>
                  <SelectContent>
                    {competitionOptions.map((comp) => (
                      <SelectItem key={comp} value={comp}>
                        {comp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {competitionOptions.length === 0 && (
                  <p className="text-sm text-gray-500">
                    Aucune compétition disponible pour cette catégorie
                  </p>
                )}
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/club/teams")}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer l'équipe"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
