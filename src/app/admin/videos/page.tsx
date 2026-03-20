"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { DataTable, type Column } from "@/components/admin/DataTable"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Trophy,
  Footprints,
  Flame,
  Target,
  Hand,
  Grid3x3,
  CheckCircle2,
  Clock,
  ClipboardCheck,
  Video,
  AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  VideoEvaluationDialog,
  type AdminVideo,
} from "@/components/admin/VideoEvaluationDialog"

// ── Mappings ──────────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, typeof Trophy> = {
  MATCH_HIGHLIGHTS: Trophy,
  TECHNICAL: Footprints,
  PHYSICAL_ATHLETIC: Flame,
  SET_PIECES: Target,
  GOALKEEPING: Hand,
  TACTICAL: Grid3x3,
}

const CATEGORY_LABELS: Record<string, string> = {
  MATCH_HIGHLIGHTS: "Extraits match",
  TECHNICAL: "Technique",
  PHYSICAL_ATHLETIC: "Physique & vitesse",
  SET_PIECES: "Coups de pied arrêtés",
  GOALKEEPING: "Gardien de but",
  TACTICAL: "Tactique & placement",
}

const CATEGORY_COLORS: Record<string, string> = {
  MATCH_HIGHLIGHTS: "bg-amber-50 text-amber-700 border-amber-200",
  TECHNICAL: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PHYSICAL_ATHLETIC: "bg-orange-50 text-orange-700 border-orange-200",
  SET_PIECES: "bg-red-50 text-red-700 border-red-200",
  GOALKEEPING: "bg-blue-50 text-blue-700 border-blue-200",
  TACTICAL: "bg-purple-50 text-purple-700 border-purple-200",
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminVideosPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-pitch-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminVideosContent />
    </Suspense>
  )
}

function AdminVideosContent() {
  const [videos, setVideos] = useState<AdminVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [evaluatedFilter, setEvaluatedFilter] = useState<string>("all")

  // Dialog state
  const [selectedVideo, setSelectedVideo] = useState<AdminVideo | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchVideos = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.pageSize),
      })
      if (categoryFilter !== "all") params.set("category", categoryFilter)
      if (evaluatedFilter !== "all") params.set("evaluated", evaluatedFilter)

      const res = await fetch(`/api/admin/videos?${params}`)
      if (res.ok) {
        const data = await res.json()
        setVideos(data.videos)
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }))
      } else {
        const errData = await res.json().catch(() => ({ error: res.statusText }))
        setError(errData.error || "Erreur lors du chargement des vidéos")
      }
    } catch {
      setError("Impossible de contacter le serveur")
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.pageSize, categoryFilter, evaluatedFilter])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handlePageSizeChange = (size: number) => {
    setPagination((prev) => ({ ...prev, page: 1, pageSize: size }))
  }

  const handleEvaluate = (video: AdminVideo) => {
    setSelectedVideo(video)
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setSelectedVideo(null)
  }

  const handleEvaluationSuccess = () => {
    fetchVideos()
  }

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleEvaluatedChange = (value: string) => {
    setEvaluatedFilter(value)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  // ── Colonnes DataTable ────────────────────────────────────────────────────

  const columns: Column<AdminVideo>[] = [
    {
      key: "player",
      header: "Joueur",
      cell: (video) => {
        const profile = video.user.playerProfile
        const name = profile
          ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
          : video.user.name ?? video.user.email
        return (
          <div>
            <div className="text-sm font-medium text-slate-900">{name}</div>
            <div className="text-xs text-slate-500">
              {profile?.primaryPosition ?? "—"}
            </div>
          </div>
        )
      },
    },
    {
      key: "category",
      header: "Catégorie",
      cell: (video) => {
        const Icon = CATEGORY_ICONS[video.skillCategory] ?? Trophy
        const colorClass =
          CATEGORY_COLORS[video.skillCategory] ?? "bg-slate-50 text-slate-600 border-slate-200"
        return (
          <Badge className={`${colorClass} gap-1`}>
            <Icon className="h-3 w-3" />
            {CATEGORY_LABELS[video.skillCategory] ?? video.skillCategory}
          </Badge>
        )
      },
    },
    {
      key: "quality",
      header: "Qualité",
      cell: (video) => (
        <span className="text-sm tabular-nums text-slate-600">
          {video.totalScore !== null ? `${video.totalScore}/100` : "—"}
        </span>
      ),
      className: "text-center",
    },
    {
      key: "status",
      header: "Évaluation",
      cell: (video) => {
        if (video.skillEvaluation) {
          return (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Évalué · {video.skillEvaluation.compositeScore}
            </Badge>
          )
        }
        return (
          <Badge className="bg-slate-50 text-slate-500 border-slate-200 gap-1">
            <Clock className="h-3 w-3" />
            En attente
          </Badge>
        )
      },
    },
    {
      key: "date",
      header: "Date",
      cell: (video) => (
        <span className="text-sm text-slate-500">
          {format(new Date(video.createdAt), "d MMM yyyy", { locale: fr })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (video) => (
        <Button
          size="sm"
          variant={video.skillEvaluation ? "outline" : "default"}
          onClick={(e) => {
            e.stopPropagation()
            handleEvaluate(video)
          }}
          className="gap-1"
        >
          <ClipboardCheck className="h-3.5 w-3.5" />
          {video.skillEvaluation ? "Modifier" : "Évaluer"}
        </Button>
      ),
      className: "text-right",
    },
  ]

  // ── Render ────────────────────────────────────────────────────────────────

  const totalEvaluated = videos.filter((v) => v.skillEvaluation).length
  const totalPending = videos.filter((v) => !v.skillEvaluation).length

  return (
    <>
      <AdminHeader
        title="Évaluation vidéos"
        description="Évaluez les compétences football des joueurs à partir de leurs vidéos"
      />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Stats mini */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-sm">
          <div className="flex items-center gap-1.5">
            <Video className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-slate-900">{pagination.total}</span>
            <span className="text-slate-500">vidéo{pagination.total !== 1 ? "s" : ""}</span>
          </div>
          {evaluatedFilter === "all" && (
            <>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-1.5 text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="font-medium">{totalEvaluated}</span>
                <span>évaluée{totalEvaluated !== 1 ? "s" : ""}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-medium">{totalPending}</span>
                <span>en attente</span>
              </div>
            </>
          )}
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-52 h-9 text-sm">
              <SelectValue placeholder="Toutes catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              <SelectItem value="MATCH_HIGHLIGHTS">Extraits match</SelectItem>
              <SelectItem value="TECHNICAL">Technique</SelectItem>
              <SelectItem value="PHYSICAL_ATHLETIC">Physique & vitesse</SelectItem>
              <SelectItem value="SET_PIECES">Coups de pied arrêtés</SelectItem>
              <SelectItem value="GOALKEEPING">Gardien de but</SelectItem>
              <SelectItem value="TACTICAL">Tactique & placement</SelectItem>
            </SelectContent>
          </Select>

          <Select value={evaluatedFilter} onValueChange={handleEvaluatedChange}>
            <SelectTrigger className="w-44 h-9 text-sm">
              <SelectValue placeholder="Tout statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tout statut</SelectItem>
              <SelectItem value="false">En attente</SelectItem>
              <SelectItem value="true">Évaluées</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
            <Button variant="ghost" size="sm" onClick={fetchVideos} className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-100">
              Réessayer
            </Button>
          </div>
        )}

        {/* Table */}
        <DataTable
          data={videos}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Aucune vidéo à évaluer"
          pagination={{
            page: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
      </div>

      {/* Dialog d'évaluation */}
      <VideoEvaluationDialog
        video={selectedVideo}
        open={dialogOpen}
        onClose={handleDialogClose}
        onSuccess={handleEvaluationSuccess}
      />
    </>
  )
}
