"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Video } from "lucide-react"

const SKILL_LABELS: Record<string, string> = {
  UNSPECIFIED: "Non classé",
  MATCH_HIGHLIGHTS: "Extraits match",
  TECHNICAL: "Technique",
  PHYSICAL_ATHLETIC: "Physique & vitesse",
  SET_PIECES: "Coups de pied arrêtés",
  GOALKEEPING: "Gardien de but",
  TACTICAL: "Tactique & placement",
  PORTRAIT: "Présentation",
}

type PublicVideo = {
  id: string
  skillCategory: string
  durationSeconds: number | null
  createdAt: string
  fileAsset: { url: string; mimeType: string }
}

function formatDuration(sec: number | null): string {
  if (sec == null || sec <= 0) return ""
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return m > 0 ? `${m} min ${s}s` : `${s}s`
}

export function PublicPlayerVideosTab({
  userId,
  enabled,
}: {
  userId: string
  enabled: boolean
}) {
  const [videos, setVideos] = useState<PublicVideo[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!enabled) return
    setError(null)
    setVideos(null)
    try {
      const res = await fetch(`/api/users/${userId}/player-videos`)
      if (res.status === 403) {
        setError("Contenu réservé aux abonnés")
        setVideos([])
        return
      }
      if (!res.ok) {
        setError("Impossible de charger les vidéos")
        setVideos([])
        return
      }
      const data = await res.json()
      setVideos(data.videos ?? [])
    } catch {
      setError("Impossible de charger les vidéos")
      setVideos([])
    }
  }, [userId, enabled])

  useEffect(() => {
    load()
  }, [load])

  if (!enabled) return null

  if (videos === null) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-stadium-100 bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-pitch-600" />
      </div>
    )
  }

  if (error && videos.length === 0) {
    return (
      <div className="rounded-2xl border border-stadium-100 bg-white px-6 py-10 text-center text-sm text-stadium-500">
        {error}
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stadium-200 bg-stadium-50/50 px-6 py-12 text-center">
        <Video className="mx-auto mb-3 h-10 w-10 text-stadium-300" />
        <p className="text-sm font-medium text-stadium-700">Aucune vidéo publiée pour l’instant</p>
        <p className="mt-1 text-xs text-stadium-500">
          Les vidéos validées apparaîtront ici.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {videos.map((v) => (
        <article
          key={v.id}
          className="overflow-hidden rounded-2xl border border-stadium-100 bg-white shadow-sm"
        >
          <div className="aspect-video bg-black">
            {v.fileAsset.url?.trim() ? (
              <video
                src={v.fileAsset.url}
                controls
                className="h-full w-full object-contain"
                preload="metadata"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-xs text-white/50">
                Vidéo indisponible
              </div>
            )}
          </div>
          <div className="border-t border-stadium-100 px-4 py-3">
            <p className="text-sm font-semibold text-stadium-900">
              {SKILL_LABELS[v.skillCategory] ?? v.skillCategory}
            </p>
            <p className="mt-0.5 text-xs text-stadium-500">
              {[formatDuration(v.durationSeconds)].filter(Boolean).join(" · ")}
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}
