"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Loader2,
  Video,
  Trophy,
  Crosshair,
  Dumbbell,
  Target,
  Goal,
  Map,
  UserRound,
  Upload,
  ExternalLink,
  Coins,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Trash2,
  RotateCcw,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import {
  VIDEO_PROFILE_SKILL_TRACKERS,
  videoProfileCompletenessPct,
} from "@/lib/gamification/video-profile-completeness"

type VideoStatus = "PENDING_REVIEW" | "AWARDED" | "REJECTED"

type SkillCategory =
  | "UNSPECIFIED"
  | "MATCH_HIGHLIGHTS"
  | "TECHNICAL"
  | "PHYSICAL_ATHLETIC"
  | "SET_PIECES"
  | "GOALKEEPING"
  | "TACTICAL"
  | "PORTRAIT"

export type ProfileVideoRow = {
  id: string
  context: string
  skillCategory: SkillCategory
  status: VideoStatus
  rejectReason: string | null
  creditsAwarded: number
  totalScore: number | null
  durationSeconds: number | null
  width: number | null
  height: number | null
  createdAt: string
  deletedAt?: string | null
  fileAsset: { id: string; url: string; filename: string; mimeType: string }
  scoreDetail: {
    technicalPts: number
    detectionPts: number
    actionsPts: number
    contextPts: number
  } | null
}

const SLOT_DEFS: {
  id: SkillCategory
  label: string
  hint: string
  icon: typeof Video
}[] = [
  {
    id: "MATCH_HIGHLIGHTS",
    label: "Extraits match",
    hint: "Buts, actions décisives, lecture de jeu en situation réelle.",
    icon: Trophy,
  },
  {
    id: "TECHNICAL",
    label: "Technique",
    hint: "Contrôles, passes, frappes, dribbles — qualité de geste.",
    icon: Crosshair,
  },
  {
    id: "PHYSICAL_ATHLETIC",
    label: "Physique & vitesse",
    hint: "Explosivité, accélération, endurance ou force utile au terrain.",
    icon: Dumbbell,
  },
  {
    id: "SET_PIECES",
    label: "Coups de pied arrêtés",
    hint: "Corners, CF, penalties — précision sous pression.",
    icon: Target,
  },
  {
    id: "GOALKEEPING",
    label: "Gardien de but",
    hint: "Arrêts, relances, jeu au pied — si tu es GK, ce slot parle aux recruteurs.",
    icon: Goal,
  },
  {
    id: "TACTICAL",
    label: "Tactique & placement",
    hint: "Déplacements sans ballon, couvertures, transitions.",
    icon: Map,
  },
  {
    id: "PORTRAIT",
    label: "Présentation",
    hint: "Courte intro : qui tu es, ton projet, ton niveau — format portrait lisible.",
    icon: UserRound,
  },
]

function probeVideoMeta(file: File): Promise<{
  durationSeconds: number
  width?: number
  height?: number
}> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const el = document.createElement("video")
    el.preload = "metadata"
    el.onloadedmetadata = () => {
      const durationSeconds = Number.isFinite(el.duration)
        ? Math.max(0, Math.round(el.duration))
        : 0
      const width = el.videoWidth || undefined
      const height = el.videoHeight || undefined
      URL.revokeObjectURL(url)
      resolve({ durationSeconds, width, height })
    }
    el.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("meta"))
    }
    el.src = url
  })
}

function pickLatestForCategory(
  videos: ProfileVideoRow[],
  category: SkillCategory
): ProfileVideoRow | undefined {
  return videos.find(
    (v) => v.skillCategory === category && v.status !== "REJECTED"
  )
}

export function ProfileVideoScoutingTab() {
  const { toast } = useToast()
  const [videos, setVideos] = useState<ProfileVideoRow[]>([])
  const [trashedVideos, setTrashedVideos] = useState<ProfileVideoRow[]>([])
  const [completeness, setCompleteness] = useState(0)
  const [loading, setLoading] = useState(true)
  const [uploadingSlot, setUploadingSlot] = useState<SkillCategory | null>(null)
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null)
  const [restoringVideoId, setRestoringVideoId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    const res = await fetch("/api/player/gamification/videos")
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(typeof err.error === "string" ? err.error : "Erreur chargement")
    }
    const data = await res.json()
    const list = (data.videos ?? []) as ProfileVideoRow[]
    const trash = (data.trashedVideos ?? []) as ProfileVideoRow[]
    setVideos(list)
    setTrashedVideos(trash)
    setCompleteness(
      typeof data.videoProfileCompletenessPct === "number"
        ? data.videoProfileCompletenessPct
        : videoProfileCompletenessPct(list)
    )
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await refresh()
      } catch (e) {
        if (!cancelled) {
          toast({
            title: "Vidéos",
            description: e instanceof Error ? e.message : "Impossible de charger les vidéos",
            variant: "destructive",
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refresh, toast])

  const slotsWithVideo = useMemo(() => {
    return SLOT_DEFS.filter((s) => pickLatestForCategory(videos, s.id)).length
  }, [videos])

  const handleUpload = async (category: SkillCategory, file: File) => {
    setUploadingSlot(category)
    try {
      const meta = await probeVideoMeta(file)
      const formData = new FormData()
      formData.append("file", file)
      formData.append("fileType", "VIDEO")
      formData.append("isPublic", "true")

      const up = await fetch("/api/files/upload-proxy", {
        method: "POST",
        body: formData,
      })
      if (!up.ok) {
        const err = await up.json().catch(() => ({}))
        throw new Error(typeof err.error === "string" ? err.error : "Échec upload")
      }
      const { fileAsset } = await up.json()
      const fileAssetId = fileAsset?.id as string | undefined
      if (!fileAssetId) throw new Error("Réponse upload invalide")

      const fin = await fetch("/api/player/gamification/videos/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileAssetId,
          durationSeconds: meta.durationSeconds,
          width: meta.width,
          height: meta.height,
          skillCategory: category,
        }),
      })
      const result = await fin.json().catch(() => ({}))
      if (!fin.ok) {
        throw new Error(typeof result.error === "string" ? result.error : "Finalisation refusée")
      }

      if (result.status === "REJECTED") {
        toast({
          title: "Vidéo non retenue",
          description:
            result.rejectReason ??
            "Vérifie la qualité, la présence du joueur filmé et évite les doublons.",
          variant: "destructive",
        })
      } else if (result.status === "AWARDED" && result.creditsAwarded > 0) {
        toast({
          title: "Vidéo validée",
          description: `+${result.creditsAwarded} crédits bonus (score ${result.totalScore ?? "—"})`,
        })
      } else {
        toast({ title: "Vidéo enregistrée", description: "Ton profil vidéo a été mis à jour." })
      }

      await refresh()
    } catch (e) {
      toast({
        title: "Upload",
        description: e instanceof Error ? e.message : "Erreur",
        variant: "destructive",
      })
    } finally {
      setUploadingSlot(null)
    }
  }

  const handleDeleteVideo = async (video: ProfileVideoRow) => {
    const accepted = window.confirm(
      "Supprimer cette vidéo de ton profil ? Cette action est irréversible."
    )
    if (!accepted) return

    setDeletingVideoId(video.id)
    try {
      const res = await fetch(`/api/player/gamification/videos/${video.id}`, {
        method: "DELETE",
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(
          typeof payload.error === "string"
            ? payload.error
            : "Impossible de supprimer la vidéo"
        )
      }
      toast({
        title: "Vidéo supprimée",
        description: "Déplacée dans la corbeille. Tu peux la restaurer.",
      })
      await refresh()
    } catch (e) {
      toast({
        title: "Suppression",
        description: e instanceof Error ? e.message : "Erreur",
        variant: "destructive",
      })
    } finally {
      setDeletingVideoId(null)
    }
  }

  const handleRestoreVideo = async (video: ProfileVideoRow) => {
    setRestoringVideoId(video.id)
    try {
      const res = await fetch(`/api/player/gamification/videos/${video.id}`, {
        method: "POST",
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(
          typeof payload.error === "string"
            ? payload.error
            : "Impossible de restaurer la vidéo"
        )
      }
      toast({
        title: "Vidéo restaurée",
        description: "La vidéo est de nouveau visible sur ton profil.",
      })
      await refresh()
    } catch (e) {
      toast({
        title: "Restauration",
        description: e instanceof Error ? e.message : "Erreur",
        variant: "destructive",
      })
    } finally {
      setRestoringVideoId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 text-center space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">
            Enrichis ton profil vidéo
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            Complète ton profil pour augmenter tes chances d&apos;être repéré par les recruteurs.
            Chaque type de clip aide à évaluer ton profil plus vite.
          </p>
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Complétion profil vidéo</span>
            <span className="tabular-nums text-pitch-700">{completeness}%</span>
          </div>
          <Progress value={completeness} className="h-2.5 bg-slate-100" />
          <p className="text-xs text-slate-400">
            {slotsWithVideo}/{VIDEO_PROFILE_SKILL_TRACKERS.length} sections complétées
          </p>
        </div>
        <Link
          href="/player/credits"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-pitch-600 hover:text-pitch-700"
        >
          <Coins className="h-3.5 w-3.5" />
          Crédits & progression (bonus sur vidéos qualifiées)
          <ExternalLink className="h-3 w-3 opacity-60" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SLOT_DEFS.map((slot) => {
          const Icon = slot.icon
          const video = pickLatestForCategory(videos, slot.id)
          const busy = uploadingSlot === slot.id
          const isDeletingThisVideo = deletingVideoId === video?.id

          return (
            <div
              key={slot.id}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-slate-100 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 text-sm">{slot.label}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{slot.hint}</p>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col gap-3">
                {video ? (
                  <>
                    <div className="relative rounded-lg overflow-hidden bg-slate-950 aspect-video">
                      {video.fileAsset.url?.trim() ? (
                        <video
                          src={video.fileAsset.url}
                          className="w-full h-full object-cover"
                          controls
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <div className="flex h-full min-h-[120px] items-center justify-center px-4 text-center text-xs text-slate-400">
                          URL vidéo indisponible
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {video.status === "AWARDED" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 px-2 py-0.5 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Validée
                          {video.totalScore != null && (
                            <span className="tabular-nums opacity-80">· {video.totalScore}/100</span>
                          )}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-900 px-2 py-0.5 font-semibold">
                          <AlertCircle className="h-3.5 w-3.5" />
                          En validation
                        </span>
                      )}
                      {video.creditsAwarded > 0 && (
                        <span className="inline-flex items-center gap-1 text-pitch-700 font-medium">
                          <Coins className="h-3.5 w-3.5" />+{video.creditsAwarded} crédits
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/80">
                    <Video className="h-8 w-8 text-slate-300" />
                    <p className="text-xs text-slate-500 px-4">
                      Ajoute une courte vidéo pour cette section — format paysage ou portrait,
                      joueur bien cadré.
                    </p>
                  </div>
                )}

                <label
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer",
                    "bg-pitch-600 text-white hover:bg-pitch-700",
                    busy && "opacity-60 pointer-events-none"
                  )}
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {video ? "Remplacer la vidéo" : "Ajouter une vidéo"}
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    disabled={busy}
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      e.target.value = ""
                      if (f) void handleUpload(slot.id, f)
                    }}
                  />
                </label>

                {video && (
                  <button
                    type="button"
                    onClick={() => void handleDeleteVideo(video)}
                    disabled={busy || isDeletingThisVideo}
                    className={cn(
                      "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
                      "border border-red-200 text-red-700 hover:bg-red-50",
                      (busy || isDeletingThisVideo) &&
                        "opacity-60 cursor-not-allowed hover:bg-transparent"
                    )}
                  >
                    {isDeletingThisVideo ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    Supprimer la vidéo
                  </button>
                )}

                {videos.some((v) => v.skillCategory === slot.id && v.status === "REJECTED") && (
                  <p className="text-xs text-red-600 flex items-start gap-1">
                    <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    Dernier envoi refusé — améliore la prise de vue ou choisis un autre extrait.
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {trashedVideos.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Corbeille vidéos ({trashedVideos.length})
            </h3>
            <p className="text-xs text-slate-500">
              Restaure une vidéo pour la remettre dans son slot.
            </p>
          </div>
          <div className="space-y-2">
            {trashedVideos.map((video) => (
              <div
                key={video.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {video.fileAsset.filename}
                  </p>
                  <p className="text-xs text-slate-500">
                    {SLOT_DEFS.find((s) => s.id === video.skillCategory)?.label ??
                      "Catégorie"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleRestoreVideo(video)}
                  disabled={restoringVideoId === video.id}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold",
                    "border-slate-300 text-slate-700 hover:bg-slate-50",
                    restoringVideoId === video.id &&
                      "opacity-60 cursor-not-allowed"
                  )}
                >
                  {restoringVideoId === video.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3.5 w-3.5" />
                  )}
                  Restaurer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
