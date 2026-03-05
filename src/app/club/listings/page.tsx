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
import { Badge } from "@/components/ui/badge"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { 
  Loader2, 
  Target, 
  Plus,
  Edit,
  FileText,
  Users,
  CheckCircle,
  AlertTriangle,
  Shield
} from "lucide-react"

// Schema Zod avec teamId obligatoire
const listingSchema = z.object({
  teamId: z.string().min(1, "L'équipe est requise"),
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

type ListingFormData = z.infer<typeof listingSchema>

interface ClubTeam {
  id: string
  name: string
  level: string
  division?: string | null
  category?: string | null
  competitionName?: string | null
}

interface Listing {
  id: string
  title: string
  description: string
  position: string
  teamId?: string | null
  minAge?: number
  maxAge?: number
  nationality: string[]
  salaryMin?: number
  salaryMax?: number
  currency: string
  contractType?: string
  startDate?: string
  status: string
  publishedAt?: string
  closedAt?: string
  team?: {
    id: string
    name: string
    level: string
  } | null
  _count?: {
    applications: number
    submissions: number
  }
}

const positions = [
  { value: "GK", label: "Gardien" },
  { value: "DF", label: "Défenseur" },
  { value: "MF", label: "Milieu" },
  { value: "FW", label: "Attaquant" },
]

const contractTypes = [
  { value: "Permanent", label: "Permanent" },
  { value: "Loan", label: "Prêt" },
  { value: "Trial", label: "Essai" },
]

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Brouillon", color: "bg-gray-100 text-gray-700" },
  PUBLISHED: { label: "Publiée", color: "bg-green-100 text-green-700" },
  CLOSED: { label: "Fermée", color: "bg-red-100 text-red-700" },
}

export default function ClubListingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [listings, setListings] = useState<Listing[]>([])
  const [teams, setTeams] = useState<ClubTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingListing, setEditingListing] = useState<Listing | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      currency: "EUR",
      teamId: "",
    },
  })

  const hasTeams = teams.length > 0

  // Charger les annonces ET les équipes du club
  useEffect(() => {
    async function loadData() {
      try {
        // 1. Récupérer le profil club
        const userResponse = await fetch("/api/users/me")
        if (!userResponse.ok) throw new Error("Erreur utilisateur")
        const userData = await userResponse.json()

        if (!userData.clubProfile) {
          setLoading(false)
          return
        }

        const clubProfileId = userData.clubProfile.id

        // 2. Charger annonces et équipes en parallèle
        const [listingsRes, teamsRes] = await Promise.all([
          fetch("/api/listings"),
          fetch(`/api/clubs/${clubProfileId}/teams`),
        ])

        if (listingsRes.ok) {
          const listingsData = await listingsRes.json()
          setListings(listingsData.listings || [])
        }

        if (teamsRes.ok) {
          const teamsData = await teamsRes.json()
          setTeams(teamsData.teams || [])
        }
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const handleEdit = (listing: Listing) => {
    setEditingListing(listing)
    setValue("teamId", listing.teamId || "")
    setValue("title", listing.title)
    setValue("description", listing.description)
    setValue("position", listing.position)
    setValue("minAge", listing.minAge?.toString() || "")
    setValue("maxAge", listing.maxAge?.toString() || "")
    setValue("salaryMin", listing.salaryMin?.toString() || "")
    setValue("salaryMax", listing.salaryMax?.toString() || "")
    setValue("currency", listing.currency || "EUR")
    setValue("contractType", listing.contractType || "")
    setValue("startDate", listing.startDate?.split("T")[0] || "")
    setDialogOpen(true)
  }

  const handleNew = () => {
    if (!hasTeams) return
    setEditingListing(null)
    reset({
      currency: "EUR",
      teamId: "",
    })
    setDialogOpen(true)
  }

  const onSubmit = async (data: ListingFormData) => {
    setSaving(true)
    try {
      const payload = {
        ...data,
        minAge: data.minAge ? parseInt(data.minAge) : null,
        maxAge: data.maxAge ? parseInt(data.maxAge) : null,
        salaryMin: data.salaryMin ? parseInt(data.salaryMin) : null,
        salaryMax: data.salaryMax ? parseInt(data.salaryMax) : null,
        nationality: data.nationality || [],
        teamId: data.teamId || null,
      }

      const url = editingListing
        ? `/api/listings/${editingListing.id}`
        : `/api/listings`
      
      const method = editingListing ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const err = await response.json()
        const message =
          err.details?.length > 0
            ? `${err.error}: ${err.details.map((d: { path: string[]; message: string }) => `${d.path.join(".")} ${d.message}`).join("; ")}`
            : err.error || "Erreur lors de la sauvegarde"
        throw new Error(message)
      }

      const savedListing = await response.json()

      if (editingListing) {
        setListings(
          listings.map((l) => (l.id === savedListing.id ? savedListing : l))
        )
        toast({ title: "Succès", description: "Annonce mise à jour" })
      } else {
        setListings([savedListing, ...listings])
        toast({ title: "Succès", description: "Annonce créée" })
      }

      reset()
      setDialogOpen(false)
      setEditingListing(null)
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

  const handlePublish = async (listingId: string) => {
    try {
      const response = await fetch(`/api/listings/${listingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      })

      if (!response.ok) throw new Error("Erreur")

      setListings(
        listings.map((l) =>
          l.id === listingId ? { ...l, status: "PUBLISHED", publishedAt: new Date().toISOString() } : l
        )
      )

      toast({ title: "Succès", description: "Annonce publiée" })
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de publier l'annonce",
        variant: "destructive",
      })
    }
  }

  const handleClose = async (listingId: string) => {
    try {
      const response = await fetch(`/api/listings/${listingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLOSED" }),
      })

      if (!response.ok) throw new Error("Erreur")

      setListings(
        listings.map((l) =>
          l.id === listingId ? { ...l, status: "CLOSED" } : l
        )
      )

      toast({ title: "Succès", description: "Annonce fermée" })
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de fermer l'annonce",
        variant: "destructive",
      })
    }
  }

  const listingsByStatus = listings.reduce((acc, listing) => {
    if (!acc[listing.status]) acc[listing.status] = []
    acc[listing.status].push(listing)
    return acc
  }, {} as Record<string, Listing[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mes Annonces</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos offres de recrutement
          </p>
        </div>

        <Button onClick={handleNew} disabled={!hasTeams}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle annonce
        </Button>
      </div>

      {/* Alerte si aucune équipe */}
      {!hasTeams && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Équipe requise</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Vous devez créer au moins une équipe avant de pouvoir déposer une annonce.
            </span>
            <Button
              size="sm"
              variant="outline"
              className="ml-4 shrink-0"
              onClick={() => router.push("/club/teams/new")}
            >
              <Shield className="mr-2 h-4 w-4" />
              Créer une équipe
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Brouillons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {listingsByStatus.DRAFT?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Publiées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {listingsByStatus.PUBLISHED?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Fermées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {listingsByStatus.CLOSED?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des annonces */}
      {listings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">Aucune annonce</p>
            {hasTeams ? (
              <Button onClick={handleNew}>
                <Plus className="mr-2 h-4 w-4" />
                Créer votre première annonce
              </Button>
            ) : (
              <Button onClick={() => router.push("/club/teams/new")}>
                <Shield className="mr-2 h-4 w-4" />
                Créer une équipe d&apos;abord
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const statusBadge = statusConfig[listing.status]
            return (
              <Card key={listing.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">
                          {listing.title}
                        </CardTitle>
                        <Badge className={statusBadge.color}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                      <CardDescription className="mt-2">
                        {listing.position}
                        {listing.team && (
                          <span> • {listing.team.name}</span>
                        )}
                        {" "}• Créée le{" "}
                        {new Date(
                          listing.publishedAt || listing.closedAt || Date.now()
                        ).toLocaleDateString("fr-FR")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {listing.description}
                    </p>

                    {listing._count && (
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span>
                            {listing._count.applications} candidature(s)
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>
                            {listing._count.submissions} soumission(s)
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(listing)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </Button>

                      {listing.status === "DRAFT" && (
                        <Button
                          size="sm"
                          onClick={() => handlePublish(listing.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Publier
                        </Button>
                      )}

                      {listing.status === "PUBLISHED" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleClose(listing.id)}
                        >
                          Fermer
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dialog création/édition */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingListing ? "Modifier l'annonce" : "Nouvelle annonce"}
            </DialogTitle>
            <DialogDescription>
              Créez une offre de recrutement attractive
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Sélection de l'équipe */}
            <div>
              <Label>Équipe *</Label>
              <Select
                onValueChange={(value) => setValue("teamId", value)}
                value={watch("teamId") || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner l'équipe" />
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
                <p className="text-sm text-red-600 mt-1">
                  {errors.teamId.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Ex: Attaquant expérimenté pour l'équipe première"
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.title.message}
                </p>
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
                <p className="text-sm text-red-600 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="position">Position *</Label>
              <Select
                onValueChange={(value) => setValue("position", value)}
                defaultValue={watch("position")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos.value} value={pos.value}>
                      {pos.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.position && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.position.message}
                </p>
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
                  defaultValue={watch("currency")}
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
                defaultValue={watch("contractType")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {contractTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">Date de début souhaitée</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>Enregistrer</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
