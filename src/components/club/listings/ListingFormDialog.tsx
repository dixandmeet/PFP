"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Loader2 } from "lucide-react"
import {
  CONTRACT_TYPES,
  LISTING_POSITIONS,
  type ClubListing,
} from "@/lib/club/listings"

function createListingFormSchema(teamOptional: boolean) {
  return z.object({
    teamId: teamOptional
      ? z.string().optional()
      : z.string().min(1, "L'équipe est requise"),
    title: z.string().min(5, "Le titre doit faire au moins 5 caractères"),
    description: z.string().min(20, "La description doit faire au moins 20 caractères"),
    position: z.string().min(1, "La position est requise"),
    minAge: z.string().optional(),
    maxAge: z.string().optional(),
    nationality: z.array(z.string()).optional(),
    salaryMin: z.string().optional(),
    salaryMax: z.string().optional(),
    currency: z.string().optional(),
    contractType: z.string().optional(),
    startDate: z.string().optional(),
  })
}

export type ListingFormData = z.infer<ReturnType<typeof createListingFormSchema>>

interface ClubTeam {
  id: string
  name: string
  level: string
}

interface ClubOption {
  id: string
  clubName: string
  country: string
}

interface ListingFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teams: ClubTeam[]
  editingListing: ClubListing | null
  saving: boolean
  onSubmit: (data: ListingFormData) => Promise<void>
  seed?: Partial<ListingFormData> | null
  clubs?: ClubOption[]
  clubProfileId?: string
  onClubChange?: (clubProfileId: string) => void
  loadingClubs?: boolean
  loadingTeams?: boolean
  teamOptional?: boolean
}

export function ListingFormDialog({
  open,
  onOpenChange,
  teams,
  editingListing,
  saving,
  onSubmit,
  seed,
  clubs,
  clubProfileId,
  onClubChange,
  loadingClubs = false,
  loadingTeams = false,
  teamOptional = false,
}: ListingFormDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(createListingFormSchema(teamOptional)),
    defaultValues: {
      currency: "EUR",
      teamId: "",
    },
  })

  useEffect(() => {
    if (!open) return

    if (editingListing) {
      reset({
        teamId: editingListing.teamId || "",
        title: editingListing.title,
        description: editingListing.description,
        position: editingListing.position,
        minAge: editingListing.minAge?.toString() || "",
        maxAge: editingListing.maxAge?.toString() || "",
        salaryMin: editingListing.salaryMin?.toString() || "",
        salaryMax: editingListing.salaryMax?.toString() || "",
        currency: editingListing.currency || "EUR",
        contractType: editingListing.contractType || "",
        startDate: editingListing.startDate?.split("T")[0] || "",
      })
      return
    }

    reset({
      currency: "EUR",
      teamId: seed?.teamId || "",
      title: seed?.title || "",
      description: seed?.description || "",
      position: seed?.position || "",
      minAge: seed?.minAge || "",
      maxAge: seed?.maxAge || "",
      salaryMin: seed?.salaryMin || "",
      salaryMax: seed?.salaryMax || "",
      contractType: seed?.contractType || "",
      startDate: seed?.startDate || "",
    })
  }, [open, editingListing, seed, reset])

  useEffect(() => {
    if (!clubs || editingListing) return
    setValue("teamId", "")
  }, [clubProfileId, clubs, editingListing, setValue])

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingListing ? "Modifier l'annonce" : "Nouvelle annonce"}
          </DialogTitle>
          <DialogDescription>
            Créez une offre de recrutement attractive
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {clubs && onClubChange && (
            <div>
              <Label>Club *</Label>
              <Select
                onValueChange={onClubChange}
                value={clubProfileId || undefined}
                disabled={loadingClubs}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={loadingClubs ? "Chargement..." : "Sélectionner le club"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id}>
                      {club.clubName} ({club.country})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!loadingClubs && clubs.length === 0 && (
                <p className="mt-1 text-sm text-amber-600">Aucun club disponible</p>
              )}
            </div>
          )}

          {(teams.length > 0 || !teamOptional) && (
            <div>
              <Label>{teamOptional ? "Équipe" : "Équipe *"}</Label>
              <Select
                onValueChange={(value) => setValue("teamId", value)}
                value={watch("teamId") || undefined}
                disabled={loadingTeams || (clubs ? !clubProfileId : false)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingTeams
                        ? "Chargement..."
                        : clubs && !clubProfileId
                          ? "Sélectionnez d'abord un club"
                          : teams.length === 0
                            ? "Aucune équipe disponible"
                            : "Sélectionner l'équipe"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name} ({team.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.teamId && (
                <p className="mt-1 text-sm text-red-600">{errors.teamId.message}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Ex: Attaquant expérimenté pour l'équipe première"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Décrivez le poste, les attentes, l'environnement..."
              rows={5}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="position">Position *</Label>
            <Select
              onValueChange={(value) => setValue("position", value)}
              value={watch("position") || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {LISTING_POSITIONS.map((pos) => (
                  <SelectItem key={pos.value} value={pos.value}>
                    {pos.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.position && (
              <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minAge">Âge minimum</Label>
              <Input
                id="minAge"
                type="number"
                {...register("minAge")}
                placeholder="18"
              />
            </div>
            <div>
              <Label htmlFor="maxAge">Âge maximum</Label>
              <Input
                id="maxAge"
                type="number"
                {...register("maxAge")}
                placeholder="30"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="salaryMin">Salaire min</Label>
              <Input
                id="salaryMin"
                type="number"
                {...register("salaryMin")}
                placeholder="50000"
              />
            </div>
            <div>
              <Label htmlFor="salaryMax">Salaire max</Label>
              <Input
                id="salaryMax"
                type="number"
                {...register("salaryMax")}
                placeholder="100000"
              />
            </div>
            <div>
              <Label htmlFor="currency">Devise</Label>
              <Select
                onValueChange={(value) => setValue("currency", value)}
                value={watch("currency") || "EUR"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="contractType">Type de contrat</Label>
            <Select
              onValueChange={(value) => setValue("contractType", value)}
              value={watch("contractType") || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {CONTRACT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="startDate">Date de début souhaitée</Label>
            <Input id="startDate" type="date" {...register("startDate")} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={
                saving ||
                loadingClubs ||
                loadingTeams ||
                (clubs ? !clubProfileId || (!teamOptional && teams.length === 0) : false)
              }
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
