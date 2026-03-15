"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AnimatePresence, motion } from "framer-motion"
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
  RefreshCw,
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

const statusConfig: Record<string, { label: string; bg: string; text: string; ring: string; dot: string; icon: any }> = {
  PENDING: { label: "En attente", bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", dot: "bg-amber-500", icon: Clock },
  ACTIVE: { label: "Actif", bg: "bg-green-50", text: "text-green-700", ring: "ring-green-200", dot: "bg-green-500", icon: CheckCircle },
  EXPIRED: { label: "Expiré", bg: "bg-slate-50", text: "text-slate-600", ring: "ring-slate-200", dot: "bg-slate-400", icon: AlertCircle },
  TERMINATED: { label: "Résilié", bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200", dot: "bg-red-500", icon: XCircle },
  REJECTED: { label: "Refusé", bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200", dot: "bg-red-500", icon: XCircle },
}

export default function AgentPlayersPage() {
  const { toast } = useToast()
  const [players, setPlayers] = useState<Player[]>([])
  const [mandates, setMandates] = useState<Mandate[]>([])
  const [allPlayers, setAllPlayers] = useState<AllPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [playerSearchQuery, setPlayerSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"players" | "mandates">("players")

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

  useEffect(() => {
    async function loadData() {
      try {
        const [mandatesResponse, allPlayersResponse] = await Promise.all([
          fetch("/api/mandates"),
          fetch("/api/players?limit=100"),
        ])

        if (mandatesResponse.ok) {
          const mandatesData = await mandatesResponse.json()
          const allMandates = mandatesData.mandates || []
          setMandates(allMandates)

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
              } catch {
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
    } catch {
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
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded-lg w-48" />
          <div className="h-4 bg-slate-100 rounded w-72" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white ring-1 ring-slate-200 rounded-2xl p-5 space-y-3">
                <div className="h-3 bg-slate-100 rounded w-20" />
                <div className="h-7 bg-slate-200 rounded w-12" />
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white ring-1 ring-slate-200 rounded-2xl p-5 space-y-4">
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
                <div className="h-10 bg-slate-100 rounded-xl w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mes Joueurs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gérez vos joueurs et mandats en un seul endroit
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouveau mandat
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="bg-white ring-1 ring-slate-200 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-green-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{players.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Joueurs actifs</p>
        </div>

        <div className="bg-white ring-1 ring-slate-200 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {mandatesByStatus.PENDING?.length || 0}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">En attente</p>
        </div>

        <div className="bg-white ring-1 ring-slate-200 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {mandatesByStatus.ACTIVE?.length || 0}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Mandats actifs</p>
        </div>

        <div className="bg-white ring-1 ring-slate-200 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center">
              <FileText className="h-4 w-4 text-slate-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{mandates.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total mandats</p>
        </div>
      </motion.div>

      {/* Tab switcher */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <div className="bg-white ring-1 ring-slate-200 rounded-2xl shadow-sm p-1.5 inline-flex gap-1">
          <button
            onClick={() => setActiveTab("players")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "players"
                ? "bg-green-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Users className="inline-block mr-1.5 h-4 w-4 -mt-0.5" />
            Mes Joueurs ({players.length})
          </button>
          <button
            onClick={() => setActiveTab("mandates")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === "mandates"
                ? "bg-green-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <FileText className="inline-block mr-1.5 h-4 w-4 -mt-0.5" />
            Tous les Mandats ({mandates.length})
          </button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.15 }}
      >
        <div className="bg-white ring-1 ring-slate-200 rounded-2xl shadow-sm p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher par nom, position, club..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-slate-200 focus:ring-2 focus:ring-green-600/30 rounded-xl"
            />
          </div>
        </div>
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "players" ? (
          <motion.div
            key="players"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {filteredPlayers.length === 0 ? (
              <div className="bg-white ring-1 ring-slate-200 rounded-2xl shadow-sm p-12 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  {searchQuery ? "Aucun joueur trouvé" : "Aucun joueur sous mandat"}
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  {searchQuery
                    ? "Essayez avec d'autres critères de recherche"
                    : "Créez votre premier mandat pour commencer"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setDialogOpen(true)}
                    className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un mandat
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredPlayers.map((player, idx) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.04 }}
                    className="bg-white ring-1 ring-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:ring-green-600/40 transition-all duration-200 p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-900 truncate">
                          {player.firstName} {player.lastName}
                        </h3>
                        {player.displayName && (
                          <p className="text-xs text-slate-400 italic truncate">
                            &quot;{player.displayName}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-xs font-medium ring-1 ring-green-600/20">
                        {player.primaryPosition}
                      </span>
                      <span className="text-xs text-slate-500">
                        {calculateAge(player.dateOfBirth)} ans
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{player.nationality}</span>
                      </div>

                      {player.currentClub && (
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs text-slate-500">Club</p>
                          <p className="text-sm font-medium text-slate-800">{player.currentClub}</p>
                          {player.currentLeague && (
                            <p className="text-xs text-slate-500 mt-0.5">{player.currentLeague}</p>
                          )}
                        </div>
                      )}

                      {player.secondaryPositions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {player.secondaryPositions.map((pos, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs"
                            >
                              {pos}
                            </span>
                          ))}
                        </div>
                      )}

                      {player.mandate && (
                        <div className="bg-green-50 ring-1 ring-green-200 rounded-xl p-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                          <p className="text-xs font-medium text-green-800">
                            Mandat actif jusqu&apos;au{" "}
                            {new Date(player.mandate.endDate).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                      <Link href={`/agent/players/${player.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full rounded-xl border-slate-200 text-slate-600 hover:border-slate-300 text-xs"
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          Voir profil
                        </Button>
                      </Link>
                      <Link href="/agent/search" className="flex-1">
                        <Button
                          size="sm"
                          className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs"
                        >
                          <Send className="mr-1.5 h-3.5 w-3.5" />
                          Soumettre
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Quick actions */}
            {players.length > 0 && (
              <div className="bg-white ring-1 ring-slate-200 rounded-2xl shadow-sm p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Actions rapides</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  <Link href="/agent/search">
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl border-slate-200 text-slate-600 hover:border-slate-300 h-10"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Rechercher des opportunités
                    </Button>
                  </Link>
                  <Link href="/agent/submissions">
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-xl border-slate-200 text-slate-600 hover:border-slate-300 h-10"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Mes soumissions
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl border-slate-200 text-slate-600 hover:border-slate-300 h-10"
                    onClick={() => setActiveTab("mandates")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Voir tous les mandats
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="mandates"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {mandates.length === 0 ? (
              <div className="bg-white ring-1 ring-slate-200 rounded-2xl shadow-sm p-12 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700 mb-1">Aucun mandat</p>
                <p className="text-xs text-slate-500 mb-4">
                  Créez votre premier mandat avec un joueur
                </p>
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un mandat
                </Button>
              </div>
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
                        <div className={`h-8 w-8 rounded-xl ${config.bg} flex items-center justify-center`}>
                          <Icon className={`h-4 w-4 ${config.text}`} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">{config.label}</h2>
                        <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                          {mandatesInStatus.length}
                        </span>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {mandatesInStatus.map((mandate, idx) => (
                          <motion.div
                            key={mandate.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: idx * 0.04 }}
                            className={`bg-white ring-1 ${config.ring} rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-5`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-slate-900 truncate">
                                  {mandate.playerProfile.firstName}{" "}
                                  {mandate.playerProfile.lastName}
                                </h3>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-xs font-medium ring-1 ring-green-600/20">
                                    {mandate.playerProfile.primaryPosition}
                                  </span>
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${config.bg} ${config.text} text-xs font-medium ring-1 ${config.ring}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                                    {config.label}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2.5">
                              {mandate.playerProfile.currentClub && (
                                <p className="text-xs text-slate-600 font-medium">
                                  {mandate.playerProfile.currentClub}
                                </p>
                              )}

                              <div className="bg-slate-50 rounded-xl p-3 flex items-start gap-2.5">
                                <Calendar className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                <div className="text-xs">
                                  <p className="font-medium text-slate-700">
                                    Du {new Date(mandate.startDate).toLocaleDateString("fr-FR")}
                                  </p>
                                  <p className="text-slate-500">
                                    au {new Date(mandate.endDate).toLocaleDateString("fr-FR")}
                                  </p>
                                </div>
                              </div>

                              {mandate.terms && (
                                <div className="bg-slate-50 rounded-xl p-3">
                                  <p className="text-xs text-slate-600 line-clamp-3">
                                    {mandate.terms}
                                  </p>
                                </div>
                              )}

                              {mandate.status === "ACTIVE" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full mt-2 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-xs"
                                  onClick={() => handleTerminate(mandate.id)}
                                >
                                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                  Résilier le mandat
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg ring-1 ring-slate-200 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Nouveau mandat
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Créer un mandat avec un de vos joueurs
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Joueur *
              </Label>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Rechercher un joueur..."
                    value={playerSearchQuery}
                    onChange={(e) => setPlayerSearchQuery(e.target.value)}
                    className="pl-10 border-slate-200 focus:ring-2 focus:ring-green-600/30 rounded-xl"
                  />
                </div>
                <Select
                  onValueChange={(value) => setValue("playerProfileId", value)}
                  defaultValue={watch("playerProfileId")}
                >
                  <SelectTrigger className="border-slate-200 focus:ring-2 focus:ring-green-600/30 rounded-xl">
                    <SelectValue placeholder="Sélectionner un joueur" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAllPlayers.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        <span className="font-medium">
                          {player.firstName} {player.lastName}
                        </span>
                        <span className="text-slate-400 mx-1">·</span>
                        <span className="text-slate-500">{player.primaryPosition}</span>
                        {player.currentClub && (
                          <>
                            <span className="text-slate-400 mx-1">·</span>
                            <span className="text-slate-500">{player.currentClub}</span>
                          </>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.playerProfileId && (
                <p className="text-xs text-red-600 mt-2">
                  {errors.playerProfileId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-sm font-medium text-slate-700">
                  Date de début *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  className="mt-2 border-slate-200 focus:ring-2 focus:ring-green-600/30 rounded-xl"
                />
                {errors.startDate && (
                  <p className="text-xs text-red-600 mt-2">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="endDate" className="text-sm font-medium text-slate-700">
                  Date de fin *
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  className="mt-2 border-slate-200 focus:ring-2 focus:ring-green-600/30 rounded-xl"
                />
                {errors.endDate && (
                  <p className="text-xs text-red-600 mt-2">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="terms" className="text-sm font-medium text-slate-700">
                Conditions du mandat
              </Label>
              <p className="text-xs text-slate-500 mb-2">
                Commission, exclusivité, zone géographique, clauses spécifiques...
              </p>
              <Textarea
                id="terms"
                {...register("terms")}
                placeholder="Décrivez les termes et conditions du mandat..."
                rows={4}
                className="border-slate-200 focus:ring-2 focus:ring-green-600/30 rounded-xl resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="rounded-xl border-slate-200 text-slate-600"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm"
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
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
