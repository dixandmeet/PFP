"use client"

import { useEffect, useState } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { 
  Loader2, 
  Users, 
  Eye,
  Send,
  FileText,
  Search,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  Award,
  TrendingUp,
  Activity
} from "lucide-react"
import Link from "next/link"

const mandateSchema = z.object({
  playerProfileId: z.string().min(1, "Sélectionnez un joueur"),
  startDate: z.string().min(1, "Date de début requise"),
  endDate: z.string().min(1, "Date de fin requise"),
  terms: z.string().optional(),
})

type MandateFormData = z.infer<typeof mandateSchema>

interface Player {
  id: string
  firstName: string
  lastName: string
  displayName?: string
  dateOfBirth: string
  nationality: string
  primaryPosition: string
  secondaryPositions: string[]
  currentClub?: string
  currentLeague?: string
  profilePicture?: string
  availableFrom?: string
  contractEndDate?: string
  mandate?: {
    id: string
    status: string
    startDate: string
    endDate: string
  }
}

interface Mandate {
  id: string
  status: string
  startDate: string
  endDate: string
  terms?: string
  createdAt: string
  acceptedAt?: string
  playerProfile: {
    id: string
    firstName: string
    lastName: string
    primaryPosition: string
    currentClub?: string
    profilePicture?: string
  }
}

interface AllPlayer {
  id: string
  firstName: string
  lastName: string
  primaryPosition: string
  currentClub?: string
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  ACTIVE: { label: "Actif", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
  EXPIRED: { label: "Expiré", color: "bg-gray-100 text-gray-700 border-gray-200", icon: AlertCircle },
  TERMINATED: { label: "Résilié", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  REJECTED: { label: "Refusé", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
}

export default function AgentPlayersPage() {
  const { toast } = useToast()
  const [players, setPlayers] = useState<Player[]>([])
  const [mandates, setMandates] = useState<Mandate[]>([])
  const [allPlayers, setAllPlayers] = useState<AllPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mandateSearchQuery, setMandateSearchQuery] = useState("")
  const [playerSearchQuery, setPlayerSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("players")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MandateFormData>({
    resolver: zodResolver(mandateSchema),
  })

  // Charger les données
  useEffect(() => {
    async function loadData() {
      try {
        // Charger les mandats actifs et les joueurs
        const [mandatesResponse, allPlayersResponse] = await Promise.all([
          fetch("/api/mandates"),
          fetch("/api/players?limit=100"),
        ])

        if (mandatesResponse.ok) {
          const mandatesData = await mandatesResponse.json()
          const allMandates = mandatesData.mandates || []
          setMandates(allMandates)

          // Charger les détails des joueurs avec mandat actif
          const activeMandates = allMandates.filter((m: Mandate) => m.status === "ACTIVE")
          const playersWithMandates = await Promise.all(
            activeMandates.map(async (mandate: Mandate) => {
              try {
                const playerResponse = await fetch(`/api/players/${mandate.playerProfile.id}`)
                if (playerResponse.ok) {
                  const playerData = await playerResponse.json()
                  return {
                    ...playerData,
                    mandate: {
                      id: mandate.id,
                      status: mandate.status,
                      startDate: mandate.startDate,
                      endDate: mandate.endDate,
                    },
                  }
                }
                return null
              } catch (error) {
                return null
              }
            })
          )
          setPlayers(playersWithMandates.filter((p) => p !== null))
        }

        if (allPlayersResponse.ok) {
          const playersData = await allPlayersResponse.json()
          setAllPlayers(playersData.players || [])
        }
      } catch (error) {
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

  const onSubmit = async (data: MandateFormData) => {
    setSaving(true)
    try {
      const response = await fetch("/api/mandates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la création")
      }

      const newMandate = await response.json()
      setMandates([newMandate, ...mandates])

      toast({
        title: "Succès",
        description: "Mandat créé avec succès",
      })

      reset()
      setDialogOpen(false)
      setActiveTab("mandates")
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

  const handleTerminate = async (mandateId: string) => {
    try {
      const response = await fetch(`/api/mandates/${mandateId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "TERMINATED" }),
      })

      if (!response.ok) throw new Error("Erreur")

      setMandates(
        mandates.map((m) =>
          m.id === mandateId ? { ...m, status: "TERMINATED" } : m
        )
      )

      toast({
        title: "Succès",
        description: "Mandat résilié",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de résilier le mandat",
        variant: "destructive",
      })
    }
  }

  const filteredPlayers = searchQuery
    ? players.filter(
        (p) =>
          p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.primaryPosition.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.currentClub?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : players

  const filteredAllPlayers = playerSearchQuery
    ? allPlayers.filter(
        (p) =>
          p.firstName.toLowerCase().includes(playerSearchQuery.toLowerCase()) ||
          p.lastName.toLowerCase().includes(playerSearchQuery.toLowerCase())
      )
    : allPlayers

  const mandatesByStatus = mandates.reduce((acc, mandate) => {
    if (!acc[mandate.status]) acc[mandate.status] = []
    acc[mandate.status].push(mandate)
    return acc
  }, {} as Record<string, Mandate[]>)

  const statusOrder = ["PENDING", "ACTIVE", "EXPIRED", "TERMINATED", "REJECTED"]

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header avec gradient */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mes Agents
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Gérez vos joueurs et mandats en un seul endroit
            </p>
          </div>
          <Button 
            onClick={() => setDialogOpen(true)}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="mr-2 h-5 w-5" />
            Nouveau mandat
          </Button>
        </div>
      </div>

      {/* Stats en relief */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Joueurs actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{players.length}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {mandatesByStatus.PENDING?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Mandats actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {mandatesByStatus.ACTIVE?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total mandats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{mandates.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs avec design moderne */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100">
          <TabsTrigger value="players" className="text-base data-[state=active]:bg-white data-[state=active]:shadow">
            <Users className="mr-2 h-4 w-4" />
            Mes Joueurs ({players.length})
          </TabsTrigger>
          <TabsTrigger value="mandates" className="text-base data-[state=active]:bg-white data-[state=active]:shadow">
            <FileText className="mr-2 h-4 w-4" />
            Tous les Mandats ({mandates.length})
          </TabsTrigger>
        </TabsList>

        {/* Onglet Joueurs */}
        <TabsContent value="players" className="space-y-6">
          {/* Recherche */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, position, club..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </CardContent>
          </Card>

          {/* Liste des joueurs */}
          {filteredPlayers.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-gray-100 p-6 mb-4">
                  <Users className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-xl font-medium text-gray-900 mb-2">
                  {searchQuery ? "Aucun joueur trouvé" : "Aucun joueur sous mandat"}
                </p>
                <p className="text-gray-500 mb-6">
                  {searchQuery 
                    ? "Essayez avec d'autres critères de recherche"
                    : "Créez votre premier mandat pour commencer"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setDialogOpen(true)} size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Créer un mandat
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPlayers.map((player) => (
                <Card key={player.id} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">
                          {player.firstName} {player.lastName}
                        </CardTitle>
                        {player.displayName && (
                          <p className="text-sm text-gray-500 italic mb-2">
                            "{player.displayName}"
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="font-medium">
                            {player.primaryPosition}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {calculateAge(player.dateOfBirth)} ans
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Nationalité */}
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{player.nationality}</span>
                      </div>

                      {/* Club actuel */}
                      {player.currentClub && (
                        <div className="text-sm bg-gray-50 p-3 rounded-lg">
                          <span className="text-gray-600">Club : </span>
                          <span className="font-semibold">{player.currentClub}</span>
                          {player.currentLeague && (
                            <span className="text-gray-500 block mt-1">
                              {player.currentLeague}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Contrat */}
                      {player.contractEndDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          <span className="text-gray-600">
                            Contrat jusqu'au{" "}
                            <span className="font-medium">
                              {new Date(player.contractEndDate).toLocaleDateString("fr-FR")}
                            </span>
                          </span>
                        </div>
                      )}

                      {/* Positions secondaires */}
                      {player.secondaryPositions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {player.secondaryPositions.map((pos, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {pos}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Mandat */}
                      {player.mandate && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <p className="text-sm font-medium text-green-900">
                              Mandat actif jusqu'au{" "}
                              {new Date(player.mandate.endDate).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-3">
                        <Link href={`/agent/players/${player.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="mr-2 h-4 w-4" />
                            Voir profil
                          </Button>
                        </Link>
                        <Link href="/agent/search" className="flex-1">
                          <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                            <Send className="mr-2 h-4 w-4" />
                            Soumettre
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Actions rapides */}
          {players.length > 0 && (
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  <Link href="/agent/search">
                    <Button variant="outline" className="w-full justify-start h-12 bg-white">
                      <Search className="mr-2 h-5 w-5" />
                      Rechercher des opportunités
                    </Button>
                  </Link>
                  <Link href="/agent/submissions">
                    <Button variant="outline" className="w-full justify-start h-12 bg-white">
                      <Send className="mr-2 h-5 w-5" />
                      Mes soumissions
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start h-12 bg-white"
                    onClick={() => setActiveTab("mandates")}
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    Voir tous les mandats
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Onglet Mandats */}
        <TabsContent value="mandates" className="space-y-6">
          {mandates.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-gray-100 p-6 mb-4">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
                <p className="text-xl font-medium text-gray-900 mb-2">Aucun mandat</p>
                <p className="text-gray-500 mb-6">
                  Créez votre premier mandat avec un joueur
                </p>
                <Button onClick={() => setDialogOpen(true)} size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Créer un mandat
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {statusOrder.map((status) => {
                const mandatesInStatus = mandatesByStatus[status]
                if (!mandatesInStatus || mandatesInStatus.length === 0) return null

                const config = statusConfig[status]
                const Icon = config.icon

                return (
                  <div key={status}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${config.color.split(' ')[0]} bg-opacity-20`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h2 className="text-2xl font-bold">{config.label}</h2>
                      <Badge variant="outline" className="text-base px-3 py-1">
                        {mandatesInStatus.length}
                      </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {mandatesInStatus.map((mandate) => (
                        <Card 
                          key={mandate.id} 
                          className={`hover:shadow-lg transition-all duration-300 border-2 ${config.color.includes('border') ? config.color.split(' ').find(c => c.includes('border')) : ''}`}
                        >
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg mb-2">
                                  {mandate.playerProfile.firstName}{" "}
                                  {mandate.playerProfile.lastName}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {mandate.playerProfile.primaryPosition}
                                  </Badge>
                                  <Badge className={config.color}>
                                    {config.label}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {mandate.playerProfile.currentClub && (
                                <div className="text-sm text-gray-600">
                                  <span className="font-medium">
                                    {mandate.playerProfile.currentClub}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center gap-2 text-sm bg-gray-50 p-3 rounded-lg">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <div>
                                  <div className="font-medium">
                                    Du {new Date(mandate.startDate).toLocaleDateString("fr-FR")}
                                  </div>
                                  <div className="text-gray-600">
                                    au {new Date(mandate.endDate).toLocaleDateString("fr-FR")}
                                  </div>
                                </div>
                              </div>

                              {mandate.terms && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-sm text-gray-700 line-clamp-3">
                                    {mandate.terms}
                                  </p>
                                </div>
                              )}

                              {mandate.status === "ACTIVE" && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="w-full mt-2"
                                  onClick={() => handleTerminate(mandate.id)}
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Résilier le mandat
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog création mandat */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Nouveau mandat</DialogTitle>
            <DialogDescription>
              Créer un mandat avec un de vos joueurs
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label htmlFor="playerProfileId" className="text-base">Joueur *</Label>
              <div className="space-y-3 mt-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher un joueur..."
                    value={playerSearchQuery}
                    onChange={(e) => setPlayerSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  onValueChange={(value) => setValue("playerProfileId", value)}
                  defaultValue={watch("playerProfileId")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un joueur" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAllPlayers.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {player.firstName} {player.lastName}
                          </span>
                          <span className="text-gray-500">•</span>
                          <span className="text-sm text-gray-500">
                            {player.primaryPosition}
                          </span>
                          {player.currentClub && (
                            <>
                              <span className="text-gray-500">•</span>
                              <span className="text-sm text-gray-500">
                                {player.currentClub}
                              </span>
                            </>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.playerProfileId && (
                <p className="text-sm text-red-600 mt-2">
                  {errors.playerProfileId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-base">Date de début *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  className="mt-2"
                />
                {errors.startDate && (
                  <p className="text-sm text-red-600 mt-2">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="endDate" className="text-base">Date de fin *</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  className="mt-2"
                />
                {errors.endDate && (
                  <p className="text-sm text-red-600 mt-2">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="terms" className="text-base">Conditions du mandat</Label>
              <Textarea
                id="terms"
                {...register("terms")}
                placeholder="Commission, exclusivité, zone géographique, clauses spécifiques..."
                rows={5}
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-2">
                Décrivez les termes et conditions du mandat (optionnel)
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer le mandat
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
