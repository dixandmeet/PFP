"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Image from "next/image"
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
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  Users,
  Plus,
  Shield,
  UserCheck,
  ClipboardList,
  Search,
  Upload,
} from "lucide-react"
import { TEAM_LEVEL_LABELS, type TeamLevelValue } from "@/lib/constants/team-options"

// Composants métier
import { KPIStatCard } from "@/components/club/teams/KPIStatCard"
import { TeamCard } from "@/components/club/teams/TeamCard"
import { ConfirmDeleteDialog } from "@/components/club/teams/ConfirmDeleteDialog"
import { EmptyState } from "@/components/club/teams/EmptyState"
import type { TeamPlayerData } from "@/components/club/teams/PlayerRow"

// ─── Schemas & Types ──────────────────────────────────────────────

const staffSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  role: z.string().min(2, "Le rôle est requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
})

type StaffFormData = z.infer<typeof staffSchema>

interface Team {
  id: string
  name: string
  level: string
  division?: string | null
  category?: string | null
  competitionName?: string | null
  staffMembers: StaffMember[]
  teamPlayers: TeamPlayerData[]
}

interface StaffMember {
  id: string
  name: string
  role: string
  email?: string
}

interface PlayerSearchResult {
  id: string
  firstName: string
  lastName: string
  primaryPosition: string
  profilePicture?: string | null
}

// ─── Constantes ───────────────────────────────────────────────────

const DEBOUNCE_MS = 250
const PLAYER_SEARCH_DEBOUNCE_MS = 300
const ALL_LEVELS = "ALL"

const POSITION_LABELS: Record<string, string> = {
  GK: "Gardien",
  DF: "Défenseur",
  MF: "Milieu",
  FW: "Attaquant",
}

// ─── Page ─────────────────────────────────────────────────────────

export default function ClubTeamsPage() {
  const router = useRouter()
  const { toast } = useToast()

  // Data
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [clubProfileId, setClubProfileId] = useState<string | null>(null)

  // Staff dialog (ajout)
  const [staffDialogOpen, setStaffDialogOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [saving, setSaving] = useState(false)

  // Player dialog (ajout)
  const [playerDialogOpen, setPlayerDialogOpen] = useState(false)
  const [playerSearchQuery, setPlayerSearchQuery] = useState("")
  const [playerSearchResults, setPlayerSearchResults] = useState<PlayerSearchResult[]>([])
  const [searchingPlayers, setSearchingPlayers] = useState(false)
  const [addingPlayer, setAddingPlayer] = useState<string | null>(null) // playerProfileId being added
  const playerSearchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Delete staff confirm dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<StaffMember | null>(null)
  const [teamOfMemberToDelete, setTeamOfMemberToDelete] = useState<Team | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Delete player confirm dialog
  const [deletePlayerDialogOpen, setDeletePlayerDialogOpen] = useState(false)
  const [playerToDelete, setPlayerToDelete] = useState<TeamPlayerData | null>(null)
  const [teamOfPlayerToDelete, setTeamOfPlayerToDelete] = useState<Team | null>(null)
  const [deletingPlayer, setDeletingPlayer] = useState(false)

  // Delete team confirm dialog
  const [deleteTeamDialogOpen, setDeleteTeamDialogOpen] = useState(false)
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null)
  const [deletingTeam, setDeletingTeam] = useState(false)

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState(ALL_LEVELS)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const staffForm = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
  })

  // ─── Debounce search ─────────────────────────────────────────────

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(value)
    }, DEBOUNCE_MS)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (playerSearchDebounceRef.current) clearTimeout(playerSearchDebounceRef.current)
    }
  }, [])

  // ─── Filtered teams ──────────────────────────────────────────────

  const filteredTeams = useMemo(() => {
    let result = teams

    // Filtre par niveau
    if (levelFilter !== ALL_LEVELS) {
      result = result.filter((t) => t.level === levelFilter)
    }

    // Filtre par recherche (nom de l'équipe)
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.trim().toLowerCase()
      result = result.filter((t) => t.name.toLowerCase().includes(q))
    }

    return result
  }, [teams, levelFilter, debouncedQuery])

  // ─── KPIs ─────────────────────────────────────────────────────────

  const kpis = useMemo(() => {
    const totalTeams = teams.length
    const totalStaff = teams.reduce((acc, t) => acc + t.staffMembers.length, 0)
    const totalPlayers = teams.reduce((acc, t) => acc + t.teamPlayers.length, 0)
    // TODO: Ajouter les candidatures quand la donnée sera disponible
    const totalApplications = 0
    return { totalTeams, totalStaff, totalPlayers, totalApplications }
  }, [teams])

  // ─── Niveaux disponibles (pour le filtre) ─────────────────────────

  const availableLevels = useMemo(() => {
    const levels = new Set(teams.map((t) => t.level))
    return Array.from(levels)
  }, [teams])

  // ─── Load data ────────────────────────────────────────────────────

  useEffect(() => {
    async function loadData() {
      try {
        const userResponse = await fetch("/api/users/me")
        if (!userResponse.ok) throw new Error("Erreur")

        const userData = await userResponse.json()

        if (!userData.clubProfile) {
          toast({
            title: "Profil manquant",
            description: "Créez d'abord votre profil club",
            variant: "destructive",
          })
          return
        }

        setClubProfileId(userData.clubProfile.id)

        const teamsResponse = await fetch(`/api/clubs/${userData.clubProfile.id}/teams`)
        if (!teamsResponse.ok) throw new Error("Erreur")

        const teamsData = await teamsResponse.json()
        setTeams(teamsData.teams || [])
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de charger les équipes",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  // ─── Player search ─────────────────────────────────────────────────

  const searchPlayers = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setPlayerSearchResults([])
      return
    }

    setSearchingPlayers(true)
    try {
      const response = await fetch(`/api/players?query=${encodeURIComponent(query.trim())}&limit=8`)
      if (!response.ok) throw new Error("Erreur")
      const data = await response.json()
      setPlayerSearchResults(
        (data.players || []).map((p: PlayerSearchResult) => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          primaryPosition: p.primaryPosition,
          profilePicture: p.profilePicture,
        }))
      )
    } catch {
      setPlayerSearchResults([])
    } finally {
      setSearchingPlayers(false)
    }
  }, [])

  const handlePlayerSearchChange = useCallback((value: string) => {
    setPlayerSearchQuery(value)
    if (playerSearchDebounceRef.current) clearTimeout(playerSearchDebounceRef.current)
    playerSearchDebounceRef.current = setTimeout(() => {
      searchPlayers(value)
    }, PLAYER_SEARCH_DEBOUNCE_MS)
  }, [searchPlayers])

  // ─── Handlers ─────────────────────────────────────────────────────

  const handleAddStaff = (team: Team) => {
    setSelectedTeam(team)
    staffForm.reset()
    setStaffDialogOpen(true)
  }

  const handleAddPlayer = (team: Team) => {
    setSelectedTeam(team)
    setPlayerSearchQuery("")
    setPlayerSearchResults([])
    setPlayerDialogOpen(true)
  }

  const handleSelectPlayer = async (playerProfile: PlayerSearchResult) => {
    if (!selectedTeam || !clubProfileId) return

    // Vérifier si le joueur est déjà dans l'équipe
    const alreadyInTeam = selectedTeam.teamPlayers.some(
      (tp) => tp.playerProfile.id === playerProfile.id
    )
    if (alreadyInTeam) {
      toast({
        title: "Déjà dans l'équipe",
        description: `${playerProfile.firstName} ${playerProfile.lastName} est déjà dans cette équipe.`,
        variant: "destructive",
      })
      return
    }

    setAddingPlayer(playerProfile.id)
    try {
      const response = await fetch(
        `/api/clubs/${clubProfileId}/teams/${selectedTeam.id}/players`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playerProfileId: playerProfile.id }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur")
      }

      const newTeamPlayer: TeamPlayerData = await response.json()

      setTeams(
        teams.map((team) =>
          team.id === selectedTeam.id
            ? { ...team, teamPlayers: [...team.teamPlayers, newTeamPlayer] }
            : team
        )
      )

      // Mettre à jour selectedTeam aussi pour la vérif des doublons
      setSelectedTeam((prev) =>
        prev ? { ...prev, teamPlayers: [...prev.teamPlayers, newTeamPlayer] } : prev
      )

      toast({
        title: "Joueur ajouté",
        description: `${playerProfile.firstName} ${playerProfile.lastName} a été ajouté à ${selectedTeam.name}`,
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur inconnue"
      toast({ title: "Erreur", description: message, variant: "destructive" })
    } finally {
      setAddingPlayer(null)
    }
  }

  const handleRequestDeletePlayer = (player: TeamPlayerData, team: Team) => {
    setPlayerToDelete(player)
    setTeamOfPlayerToDelete(team)
    setDeletePlayerDialogOpen(true)
  }

  const handleConfirmDeletePlayer = async () => {
    if (!playerToDelete || !teamOfPlayerToDelete || !clubProfileId) return

    setDeletingPlayer(true)
    try {
      const response = await fetch(
        `/api/clubs/${clubProfileId}/teams/${teamOfPlayerToDelete.id}/players/${playerToDelete.id}`,
        { method: "DELETE" }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur")
      }

      setTeams(
        teams.map((team) =>
          team.id === teamOfPlayerToDelete.id
            ? {
                ...team,
                teamPlayers: team.teamPlayers.filter(
                  (tp) => tp.id !== playerToDelete.id
                ),
              }
            : team
        )
      )

      toast({ title: "Succès", description: "Joueur retiré de l'équipe" })
      setDeletePlayerDialogOpen(false)
      setPlayerToDelete(null)
      setTeamOfPlayerToDelete(null)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur inconnue"
      toast({ title: "Erreur", description: message, variant: "destructive" })
    } finally {
      setDeletingPlayer(false)
    }
  }

  const handleRequestDeleteStaff = (member: StaffMember, team: Team) => {
    setMemberToDelete(member)
    setTeamOfMemberToDelete(team)
    setDeleteDialogOpen(true)
  }

  const handleRequestDeleteTeam = (team: Team) => {
    setTeamToDelete(team)
    setDeleteTeamDialogOpen(true)
  }

  const onSubmitStaff = async (data: StaffFormData) => {
    if (!selectedTeam || !clubProfileId) return

    setSaving(true)
    try {
      const response = await fetch(
        `/api/clubs/${clubProfileId}/teams/${selectedTeam.id}/staff`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur")
      }

      const newStaff = await response.json()
      setTeams(
        teams.map((team) =>
          team.id === selectedTeam.id
            ? { ...team, staffMembers: [...team.staffMembers, newStaff] }
            : team
        )
      )

      toast({ title: "Succès", description: "Membre du staff ajouté" })
      staffForm.reset()
      setStaffDialogOpen(false)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur inconnue"
      toast({ title: "Erreur", description: message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!memberToDelete || !teamOfMemberToDelete || !clubProfileId) return

    setDeleting(true)
    try {
      const response = await fetch(
        `/api/clubs/${clubProfileId}/teams/${teamOfMemberToDelete.id}/staff/${memberToDelete.id}`,
        { method: "DELETE" }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur")
      }

      setTeams(
        teams.map((team) =>
          team.id === teamOfMemberToDelete.id
            ? {
                ...team,
                staffMembers: team.staffMembers.filter(
                  (s) => s.id !== memberToDelete.id
                ),
              }
            : team
        )
      )

      toast({ title: "Succès", description: "Membre supprimé" })
      setDeleteDialogOpen(false)
      setMemberToDelete(null)
      setTeamOfMemberToDelete(null)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur inconnue"
      toast({ title: "Erreur", description: message, variant: "destructive" })
    } finally {
      setDeleting(false)
    }
  }

  const handleConfirmDeleteTeam = async () => {
    if (!teamToDelete || !clubProfileId) return

    setDeletingTeam(true)
    try {
      const response = await fetch(
        `/api/clubs/${clubProfileId}/teams/${teamToDelete.id}`,
        { method: "DELETE" }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur")
      }

      setTeams(teams.filter((t) => t.id !== teamToDelete.id))
      toast({ title: "Succès", description: `Équipe "${teamToDelete.name}" supprimée` })
      setDeleteTeamDialogOpen(false)
      setTeamToDelete(null)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur inconnue"
      toast({ title: "Erreur", description: message, variant: "destructive" })
    } finally {
      setDeletingTeam(false)
    }
  }

  // ─── Loading state ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-pitch-500" />
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────

  const isSearchActive = debouncedQuery.trim() !== "" || levelFilter !== ALL_LEVELS

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl sm:px-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stadium-900 sm:text-3xl">
            Équipes & Staff
          </h1>
          <p className="mt-1 text-sm text-stadium-500">
            Gérez vos équipes et membres du staff
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Importer — disabled pour l'instant */}
          <Button
            variant="outline"
            size="sm"
            disabled
            title="Fonctionnalité bientôt disponible"
            className="gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Importer</span>
          </Button>
          <Button
            size="sm"
            onClick={() => router.push("/club/teams/new")}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Nouvelle équipe
          </Button>
        </div>
      </div>

      {/* ── KPI Row ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-8 lg:grid-cols-4">
        <KPIStatCard
          label="Équipes"
          value={kpis.totalTeams}
          icon={Users}
          iconClassName="bg-pitch-50 text-pitch-600"
        />
        <KPIStatCard
          label="Joueurs"
          value={kpis.totalPlayers}
          icon={UserCheck}
          iconClassName="bg-blue-50 text-blue-600"
        />
        <KPIStatCard
          label="Staff"
          value={kpis.totalStaff}
          icon={Shield}
          iconClassName="bg-amber-50 text-amber-600"
        />
        <KPIStatCard
          label="Candidatures"
          value={kpis.totalApplications}
          icon={ClipboardList}
          iconClassName="bg-violet-50 text-violet-600"
        />
      </div>

      {/* ── Barre de recherche + filtre ────────────────────────────── */}
      {teams.length > 0 && (
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Input
              placeholder="Rechercher une équipe…"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              icon={<Search className="h-4 w-4" />}
              className="h-10"
            />
          </div>
          {availableLevels.length > 1 && (
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-48 h-10 rounded-xl">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_LEVELS}>Toutes les catégories</SelectItem>
                {availableLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {TEAM_LEVEL_LABELS[level as TeamLevelValue] || level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {/* ── Contenu principal ──────────────────────────────────────── */}
      {teams.length === 0 ? (
        /* Empty state global — aucune équipe */
        <div className="rounded-2xl border border-stadium-200 bg-white shadow-sm">
          <EmptyState
            icon={Users}
            title="Aucune équipe"
            description="Créez votre première équipe pour commencer à gérer votre staff."
            actionLabel="Créer ma première équipe"
            onAction={() => router.push("/club/teams/new")}
          />
        </div>
      ) : filteredTeams.length === 0 && isSearchActive ? (
        /* Empty state recherche */
        <div className="rounded-2xl border border-stadium-200 bg-white shadow-sm">
          <EmptyState
            icon={Search}
            title="Aucune équipe trouvée"
            description="Essayez avec d'autres termes de recherche ou modifiez les filtres."
          />
        </div>
      ) : (
        /* Liste des équipes */
        <div className="space-y-5">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onAddStaff={handleAddStaff}
              onAddPlayer={handleAddPlayer}
              onDeleteStaff={(member) => handleRequestDeleteStaff(member, team)}
              onDeletePlayer={(player) => handleRequestDeletePlayer(player, team)}
              onDeleteTeam={handleRequestDeleteTeam}
            />
          ))}
        </div>
      )}

      {/* ── Dialog ajout staff ─────────────────────────────────────── */}
      <Dialog open={staffDialogOpen} onOpenChange={setStaffDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau membre du staff</DialogTitle>
            <DialogDescription>
              Ajouter un membre au staff de {selectedTeam?.name}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={staffForm.handleSubmit(onSubmitStaff)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="staffName">Nom *</Label>
              <Input
                id="staffName"
                {...staffForm.register("name")}
                placeholder="Jean Dupont"
              />
              {staffForm.formState.errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {staffForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="staffRole">Rôle *</Label>
              <Input
                id="staffRole"
                {...staffForm.register("role")}
                placeholder="Entraîneur, Scout, Directeur sportif..."
              />
              {staffForm.formState.errors.role && (
                <p className="text-sm text-red-600 mt-1">
                  {staffForm.formState.errors.role.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="staffEmail">Email</Label>
              <Input
                id="staffEmail"
                type="email"
                {...staffForm.register("email")}
                placeholder="jean.dupont@club.com"
              />
              {staffForm.formState.errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {staffForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStaffDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ajout…
                  </>
                ) : (
                  "Ajouter"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Dialog ajout joueur ────────────────────────────────────── */}
      <Dialog open={playerDialogOpen} onOpenChange={setPlayerDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter un joueur</DialogTitle>
            <DialogDescription>
              Recherchez un joueur inscrit sur la plateforme pour l&apos;ajouter à {selectedTeam?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="playerSearch">Rechercher un joueur</Label>
              <Input
                id="playerSearch"
                placeholder="Nom du joueur..."
                value={playerSearchQuery}
                onChange={(e) => handlePlayerSearchChange(e.target.value)}
                icon={<Search className="h-4 w-4" />}
                autoFocus
              />
            </div>

            {/* Résultats de recherche */}
            <div className="min-h-[120px] max-h-[320px] overflow-y-auto">
              {searchingPlayers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-stadium-400" />
                </div>
              ) : playerSearchQuery.trim().length < 2 ? (
                <p className="text-center text-sm text-stadium-400 py-8">
                  Tapez au moins 2 caractères pour rechercher
                </p>
              ) : playerSearchResults.length === 0 ? (
                <p className="text-center text-sm text-stadium-400 py-8">
                  Aucun joueur trouvé
                </p>
              ) : (
                <div className="space-y-1">
                  {playerSearchResults.map((player) => {
                    const isAlreadyInTeam = selectedTeam?.teamPlayers.some(
                      (tp) => tp.playerProfile.id === player.id
                    )
                    const isAdding = addingPlayer === player.id

                    return (
                      <button
                        key={player.id}
                        type="button"
                        disabled={isAlreadyInTeam || isAdding}
                        onClick={() => handleSelectPlayer(player)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-stadium-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {/* Avatar */}
                        <div className="relative h-9 w-9 shrink-0">
                          {player.profilePicture ? (
                            <Image
                              src={player.profilePicture}
                              alt={`${player.firstName} ${player.lastName}`}
                              fill
                              className="rounded-full object-cover"
                              sizes="36px"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pitch-100 text-xs font-semibold text-pitch-700">
                              {player.firstName[0]}{player.lastName[0]}
                            </div>
                          )}
                        </div>

                        {/* Infos */}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-stadium-900 truncate">
                            {player.firstName} {player.lastName}
                          </p>
                          <p className="text-xs text-stadium-500">
                            {POSITION_LABELS[player.primaryPosition] || player.primaryPosition}
                          </p>
                        </div>

                        {/* Status */}
                        {isAlreadyInTeam ? (
                          <span className="text-xs text-stadium-400 shrink-0">Déjà ajouté</span>
                        ) : isAdding ? (
                          <Loader2 className="h-4 w-4 animate-spin text-pitch-500 shrink-0" />
                        ) : (
                          <span className="text-xs font-medium text-pitch-600 shrink-0">Ajouter</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPlayerDialogOpen(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog confirmation suppression staff ──────────────────── */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) {
            setMemberToDelete(null)
            setTeamOfMemberToDelete(null)
          }
        }}
        title={`Supprimer ${memberToDelete?.name} ?`}
        description="Cette action est irréversible. Le membre sera retiré du staff de l'équipe."
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />

      {/* ── Dialog confirmation suppression joueur ─────────────────── */}
      <ConfirmDeleteDialog
        open={deletePlayerDialogOpen}
        onOpenChange={(open) => {
          setDeletePlayerDialogOpen(open)
          if (!open) {
            setPlayerToDelete(null)
            setTeamOfPlayerToDelete(null)
          }
        }}
        title={`Retirer ${playerToDelete?.playerProfile.firstName} ${playerToDelete?.playerProfile.lastName} ?`}
        description="Le joueur sera retiré de l'équipe. Son profil ne sera pas supprimé."
        loading={deletingPlayer}
        onConfirm={handleConfirmDeletePlayer}
      />

      {/* ── Dialog confirmation suppression équipe ──────────────────── */}
      <ConfirmDeleteDialog
        open={deleteTeamDialogOpen}
        onOpenChange={(open) => {
          setDeleteTeamDialogOpen(open)
          if (!open) setTeamToDelete(null)
        }}
        title={`Supprimer l'équipe "${teamToDelete?.name}" ?`}
        description="Cette action est irréversible. L'équipe et tous ses membres du staff seront définitivement supprimés."
        loading={deletingTeam}
        onConfirm={handleConfirmDeleteTeam}
      />
    </div>
  )
}
