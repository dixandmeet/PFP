"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Download,
  Pencil,
  Trash2,
  Users,
  RefreshCw,
  Plus,
  Globe,
  Database,
  ChevronLeft,
  ChevronRight,
  X,
  UserPlus,
  UserMinus,
  Loader2,
} from "lucide-react"

interface FootballTeam {
  id: string
  name: string
  shortName: string | null
  country: string
  league: string | null
  logo: string | null
  banner: string | null
  venue: string | null
  founded: number | null
  sportsDbId: string | null
  jersey: string | null
  stadiumImage: string | null
  lastSyncedAt: string | null
  players?: FootballPlayer[]
  _count?: { players: number }
  // TheSportsDB search result fields
  description?: string
  alreadySaved?: boolean
  savedId?: string | null
}

interface FootballPlayer {
  id: string
  name: string
  position: string | null
  nationality: string | null
  dateOfBirth: string | null
  number: number | null
  image: string | null
  cutout: string | null
  sportsDbId: string | null
  teamId: string | null
  teamName: string | null
}

export default function AdminClubsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-pitch-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminClubsContent />
    </Suspense>
  )
}

function AdminClubsContent() {
  const [activeTab, setActiveTab] = useState("database")
  const [clubs, setClubs] = useState<FootballTeam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [externalSearchQuery, setExternalSearchQuery] = useState("")
  const [externalResults, setExternalResults] = useState<FootballTeam[]>([])
  const [isSearchingExternal, setIsSearchingExternal] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })

  const [selectedClub, setSelectedClub] = useState<FootballTeam | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPlayersOpen, setIsPlayersOpen] = useState(false)
  const [clubPlayers, setClubPlayers] = useState<FootballPlayer[]>([])
  const [isSyncingPlayers, setIsSyncingPlayers] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    shortName: "",
    country: "",
    league: "",
    logo: "",
    banner: "",
    venue: "",
    founded: "",
  })

  const fetchClubs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        pageSize: String(pagination.pageSize),
        source: "db",
      })
      if (searchQuery) params.set("search", searchQuery)

      const res = await fetch(`/api/admin/clubs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setClubs(data.clubs)
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }))
      }
    } catch (error) {
      console.error("Error fetching clubs:", error)
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.pageSize, searchQuery])

  useEffect(() => {
    fetchClubs()
  }, [fetchClubs])

  const handleSearchExternal = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!externalSearchQuery.trim()) return

    setIsSearchingExternal(true)
    try {
      const params = new URLSearchParams({
        source: "thesportsdb",
        search: externalSearchQuery,
      })
      const res = await fetch(`/api/admin/clubs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setExternalResults(data.clubs)
      }
    } catch (error) {
      console.error("Error searching external:", error)
    } finally {
      setIsSearchingExternal(false)
    }
  }

  const handleImportClub = async (clubName: string) => {
    setIsImporting(true)
    try {
      const res = await fetch("/api/admin/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import", teamName: clubName }),
      })
      if (res.ok) {
        await handleSearchExternal()
        fetchClubs()
      }
    } catch (error) {
      console.error("Error importing club:", error)
    } finally {
      setIsImporting(false)
    }
  }

  const handleEditClub = (club: FootballTeam) => {
    setSelectedClub(club)
    setEditForm({
      name: club.name || "",
      shortName: club.shortName || "",
      country: club.country || "",
      league: club.league || "",
      logo: club.logo || "",
      banner: club.banner || "",
      venue: club.venue || "",
      founded: club.founded ? String(club.founded) : "",
    })
    setIsEditOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedClub) return

    try {
      const res = await fetch(`/api/admin/clubs/${selectedClub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          founded: editForm.founded ? parseInt(editForm.founded) : null,
        }),
      })
      if (res.ok) {
        setIsEditOpen(false)
        fetchClubs()
      }
    } catch (error) {
      console.error("Error saving club:", error)
    }
  }

  const handleDeleteClub = async (clubId: string) => {
    if (!confirm("Supprimer ce club de la base de données ?")) return

    try {
      const res = await fetch(`/api/admin/clubs/${clubId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchClubs()
      }
    } catch (error) {
      console.error("Error deleting club:", error)
    }
  }

  const handleOpenPlayers = async (club: FootballTeam) => {
    setSelectedClub(club)
    setIsPlayersOpen(true)
    try {
      const res = await fetch(`/api/admin/clubs/${club.id}/players`)
      if (res.ok) {
        const data = await res.json()
        setClubPlayers(data.players)
      }
    } catch (error) {
      console.error("Error fetching players:", error)
    }
  }

  const handleSyncPlayers = async () => {
    if (!selectedClub) return
    setIsSyncingPlayers(true)
    try {
      const res = await fetch(`/api/admin/clubs/${selectedClub.id}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync" }),
      })
      if (res.ok) {
        const playersRes = await fetch(
          `/api/admin/clubs/${selectedClub.id}/players`
        )
        if (playersRes.ok) {
          const data = await playersRes.json()
          setClubPlayers(data.players)
        }
      }
    } catch (error) {
      console.error("Error syncing players:", error)
    } finally {
      setIsSyncingPlayers(false)
    }
  }

  const handleDissociatePlayer = async (playerId: string) => {
    if (!selectedClub) return
    try {
      const res = await fetch(`/api/admin/clubs/${selectedClub.id}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dissociate", playerId }),
      })
      if (res.ok) {
        setClubPlayers((prev) => prev.filter((p) => p.id !== playerId))
      }
    } catch (error) {
      console.error("Error dissociating player:", error)
    }
  }

  const handleSearchDb = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  return (
    <div>
      <AdminHeader
        title="Gestion des clubs"
        description={`${pagination.total} clubs en base de données`}
      />

      <div className="p-4 lg:p-6 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="database" className="gap-2">
              <Database className="h-4 w-4" />
              Base de données
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2">
              <Globe className="h-4 w-4" />
              Recherche externe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="database" className="space-y-4">
            <form onSubmit={handleSearchDb} className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Rechercher un club..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Button type="submit" variant="outline" size="sm" className="h-9">
                Rechercher
              </Button>
            </form>

            <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Club
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Pays / Ligue
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Joueurs
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Source
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Chargement...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : clubs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                        Aucun club trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    clubs.map((club) => (
                      <TableRow key={club.id} className="hover:bg-slate-50/50">
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            {club.logo ? (
                              <img
                                src={club.logo}
                                alt={club.name}
                                className="h-8 w-8 object-contain"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                                ?
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {club.name}
                              </p>
                              {club.shortName && (
                                <p className="text-xs text-slate-500">
                                  {club.shortName}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <p className="text-sm text-slate-600">
                            {club.country}
                          </p>
                          <p className="text-xs text-slate-400">
                            {club.league || "-"}
                          </p>
                        </TableCell>
                        <TableCell className="py-3">
                          <span className="text-sm text-slate-600">
                            {club._count?.players || 0}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          {club.sportsDbId ? (
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                            >
                              TheSportsDB
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs bg-slate-50 text-slate-600 border-slate-200"
                            >
                              Manuel
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditClub(club)}
                              title="Modifier"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenPlayers(club)}
                              title="Joueurs"
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteClub(club.id)}
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-end gap-1">
                <span className="text-sm text-slate-500 mr-2">
                  Page {pagination.page} sur {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: prev.page - 1,
                    }))
                  }
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: prev.page + 1,
                    }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-900 mb-2">
                Rechercher un club sur TheSportsDB
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Recherchez un club par nom pour l{"'"}importer dans la base de
                données avec toutes ses informations (logo, stade, etc.)
              </p>
              <form
                onSubmit={handleSearchExternal}
                className="flex gap-2 max-w-lg"
              >
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Ex: Paris Saint-Germain, Real Madrid..."
                    value={externalSearchQuery}
                    onChange={(e) => setExternalSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="h-9"
                  disabled={isSearchingExternal}
                >
                  {isSearchingExternal ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Search className="h-4 w-4 mr-1" />
                  )}
                  Rechercher
                </Button>
              </form>
            </div>

            {externalResults.length > 0 && (
              <div className="space-y-3">
                {externalResults.map((club) => (
                  <div
                    key={club.id}
                    className="bg-white border border-slate-200 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      {club.logo ? (
                        <img
                          src={club.logo}
                          alt={club.name}
                          className="h-16 w-16 object-contain flex-shrink-0"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                          ?
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-base font-semibold text-slate-900">
                            {club.name}
                          </h4>
                          {club.alreadySaved && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                            >
                              Deja en BDD
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 mb-2">
                          <span>{club.country}</span>
                          {club.league && <span>{club.league}</span>}
                          {club.venue && <span>{club.venue}</span>}
                          {club.founded && <span>Fondé en {club.founded}</span>}
                        </div>
                        {club.description && (
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {club.description}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {club.alreadySaved ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleImportClub(club.name)}
                            disabled={isImporting}
                          >
                            {isImporting ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <RefreshCw className="h-4 w-4 mr-1" />
                            )}
                            Mettre à jour
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleImportClub(club.name)}
                            disabled={isImporting}
                          >
                            {isImporting ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                              <Download className="h-4 w-4 mr-1" />
                            )}
                            Importer
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {externalResults.length === 0 &&
              !isSearchingExternal &&
              externalSearchQuery && (
                <div className="text-center text-sm text-slate-500 py-8">
                  Aucun résultat trouvé pour &ldquo;{externalSearchQuery}&rdquo;
                </div>
              )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le club</DialogTitle>
            <DialogDescription>
              Modifier les informations du club {selectedClub?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700">
                  Nom
                </label>
                <Input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="h-9 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">
                  Nom court
                </label>
                <Input
                  value={editForm.shortName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, shortName: e.target.value })
                  }
                  className="h-9 mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700">
                  Pays
                </label>
                <Input
                  value={editForm.country}
                  onChange={(e) =>
                    setEditForm({ ...editForm, country: e.target.value })
                  }
                  className="h-9 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">
                  Ligue
                </label>
                <Input
                  value={editForm.league}
                  onChange={(e) =>
                    setEditForm({ ...editForm, league: e.target.value })
                  }
                  className="h-9 mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">
                URL du logo
              </label>
              <Input
                value={editForm.logo}
                onChange={(e) =>
                  setEditForm({ ...editForm, logo: e.target.value })
                }
                className="h-9 mt-1"
                placeholder="https://..."
              />
              {editForm.logo && (
                <img
                  src={editForm.logo}
                  alt="Logo preview"
                  className="h-12 w-12 object-contain mt-2"
                />
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">
                URL du banner
              </label>
              <Input
                value={editForm.banner}
                onChange={(e) =>
                  setEditForm({ ...editForm, banner: e.target.value })
                }
                className="h-9 mt-1"
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700">
                  Stade
                </label>
                <Input
                  value={editForm.venue}
                  onChange={(e) =>
                    setEditForm({ ...editForm, venue: e.target.value })
                  }
                  className="h-9 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">
                  Année de fondation
                </label>
                <Input
                  value={editForm.founded}
                  onChange={(e) =>
                    setEditForm({ ...editForm, founded: e.target.value })
                  }
                  className="h-9 mt-1"
                  type="number"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(false)}
              >
                Annuler
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                Enregistrer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPlayersOpen} onOpenChange={setIsPlayersOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Joueurs - {selectedClub?.name}
            </DialogTitle>
            <DialogDescription>
              {clubPlayers.length} joueurs associés
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {selectedClub?.sportsDbId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncPlayers}
                disabled={isSyncingPlayers}
              >
                {isSyncingPlayers ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Synchroniser depuis TheSportsDB
              </Button>
            )}

            {clubPlayers.length === 0 ? (
              <div className="text-center text-sm text-slate-500 py-8">
                Aucun joueur associé.
                {selectedClub?.sportsDbId &&
                  " Cliquez sur Synchroniser pour importer les joueurs."}
              </div>
            ) : (
              <div className="rounded-md border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="text-xs font-semibold text-slate-600 uppercase">
                        Joueur
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 uppercase">
                        Position
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 uppercase">
                        Nationalité
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600 uppercase">
                        N.
                      </TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clubPlayers.map((player) => (
                      <TableRow key={player.id} className="hover:bg-slate-50/50">
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            {(player.cutout || player.image) ? (
                              <img
                                src={player.cutout || player.image || ""}
                                alt={player.name}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                                {player.name.charAt(0)}
                              </div>
                            )}
                            <span className="text-sm font-medium text-slate-900">
                              {player.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-sm text-slate-600">
                          {player.position || "-"}
                        </TableCell>
                        <TableCell className="py-2 text-sm text-slate-600">
                          {player.nationality || "-"}
                        </TableCell>
                        <TableCell className="py-2 text-sm text-slate-600">
                          {player.number || "-"}
                        </TableCell>
                        <TableCell className="py-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDissociatePlayer(player.id)}
                            title="Dissocier"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
