"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { DataTable, type Column } from "@/components/admin/DataTable"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ClipboardCheck, AlertCircle, Users } from "lucide-react"
import { EvaluationTypeDialog } from "@/components/admin/EvaluationTypeDialog"
import {
  VideoEvaluationDialog,
  type AdminVideo,
} from "@/components/admin/VideoEvaluationDialog"

// ── Types ─────────────────────────────────────────────────────────────────────

interface PlayerUser {
  id: string
  name: string | null
  email: string
  playerProfile: {
    firstName: string | null
    lastName: string | null
    primaryPosition: string | null
  } | null
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminEvaluatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-pitch-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminEvaluateContent />
    </Suspense>
  )
}

function AdminEvaluateContent() {
  const router = useRouter()
  const [players, setPlayers] = useState<PlayerUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })

  // Dialog state
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerUser | null>(null)
  const [typeDialogOpen, setTypeDialogOpen] = useState(false)
  const [videoDialogOpen, setVideoDialogOpen] = useState(false)
  const [playerVideos, setPlayerVideos] = useState<AdminVideo[]>([])
  const [selectedVideo, setSelectedVideo] = useState<AdminVideo | null>(null)

  const fetchPlayers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        pageSize: String(pagination.pageSize),
        role: "PLAYER",
      })
      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setPlayers(data.users)
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }))
      } else {
        setError("Erreur lors du chargement des joueurs")
      }
    } catch {
      setError("Impossible de contacter le serveur")
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.pageSize])

  useEffect(() => {
fetchPlayers()
  }, [fetchPlayers])

  const handleEvaluate = (player: PlayerUser) => {
    setSelectedPlayer(player)
    setTypeDialogOpen(true)
  }

  const handleSelectVideo = async () => {
    if (!selectedPlayer) return
    setTypeDialogOpen(false)
    // Fetch player videos to pick one
    try {
      const res = await fetch(`/api/admin/videos?limit=50`)
      if (res.ok) {
        const data = await res.json()
        // Filter videos for this player
        const videos = (data.videos as AdminVideo[]).filter(
          (v) => v.user.id === selectedPlayer.id,
        )
        if (videos.length > 0) {
          setPlayerVideos(videos)
          setSelectedVideo(videos[0])
          setVideoDialogOpen(true)
        }
      }
    } catch {
      // silently fail
    }
  }

  const handleSelectManual = () => {
    if (!selectedPlayer) return
    setTypeDialogOpen(false)
    router.push(`/admin/evaluate/${selectedPlayer.id}`)
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handlePageSizeChange = (size: number) => {
    setPagination((prev) => ({ ...prev, page: 1, pageSize: size }))
  }

  const getPlayerName = (player: PlayerUser): string => {
    const profile = player.playerProfile
    if (profile) {
      const name = `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
      if (name) return name
    }
    return player.name ?? player.email
  }

  // ── Colonnes ────────────────────────────────────────────────────────────────

  const columns: Column<PlayerUser>[] = [
    {
      key: "player",
      header: "Joueur",
      cell: (player) => (
        <div>
          <div className="text-sm font-medium text-slate-900">
            {getPlayerName(player)}
          </div>
          <div className="text-xs text-slate-500">{player.email}</div>
        </div>
      ),
    },
    {
      key: "position",
      header: "Position",
      cell: (player) => (
        <Badge className="bg-slate-50 text-slate-600 border-slate-200">
          {player.playerProfile?.primaryPosition ?? "—"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (player) => (
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleEvaluate(player)
          }}
          className="gap-1"
        >
          <ClipboardCheck className="h-3.5 w-3.5" />
          Évaluer
        </Button>
      ),
      className: "text-right",
    },
  ]

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <AdminHeader
        title="Évaluations"
        description="Évaluez les joueurs via vidéo ou évaluation manuelle"
      />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Stats */}
        <div className="flex items-center gap-1.5 text-sm">
          <Users className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-slate-900">{pagination.total}</span>
          <span className="text-slate-500">joueur{pagination.total !== 1 ? "s" : ""}</span>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchPlayers}
              className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              Réessayer
            </Button>
          </div>
        )}

        {/* Table */}
        <DataTable
          data={players}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Aucun joueur trouvé"
          pagination={{
            page: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
      </div>

      {/* Dialog choix type d'évaluation */}
      {selectedPlayer && (
        <EvaluationTypeDialog
          playerName={getPlayerName(selectedPlayer)}
          open={typeDialogOpen}
          onClose={() => {
            setTypeDialogOpen(false)
            setSelectedPlayer(null)
          }}
          onSelectVideo={handleSelectVideo}
          onSelectManual={handleSelectManual}
        />
      )}

      {/* Dialog évaluation vidéo */}
      <VideoEvaluationDialog
        video={selectedVideo}
        open={videoDialogOpen}
        onClose={() => {
          setVideoDialogOpen(false)
          setSelectedVideo(null)
        }}
        onSuccess={fetchPlayers}
      />
    </>
  )
}
