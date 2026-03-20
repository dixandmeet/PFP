"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Film, TrendingUp, HardDrive, Coins, ExternalLink } from "lucide-react"
type GamificationStatus = {
  progression: {
    level: string
    xp: number
    creditBonusPct: number
    unlocks: Record<string, boolean>
  }
  subscription: {
    plan: string
    storageQuotaBytes: number
    storageBonusBytes: string
    effectiveQuotaBytes: string
    bytesUsed: string
    maxRewardedUploadsPerDay: number
    rewardedUploadsToday: number
  }
  sinkCosts: Record<string, number>
}

const LEVEL_FR: Record<string, string> = {
  ROOKIE: "Rookie",
  AMATEUR: "Amateur",
  COMPETITOR: "Compétiteur",
  ELITE: "Élite",
  PRO: "Pro",
}

function formatBytes(n: bigint): string {
  const abs = n < BigInt(0) ? -n : n
  const u = ["o", "Ko", "Mo", "Go", "To"]
  let i = 0
  let v = Number(abs)
  if (v < 1024) return `${v} ${u[0]}`
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024
    i++
  }
  return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${u[i]}`
}

export function PlayerGamificationPanel() {
  const [data, setData] = useState<GamificationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError(null)
      try {
        const res = await fetch("/api/player/gamification/status")
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          if (!cancelled) {
            setError(typeof err.error === "string" ? err.error : "Impossible de charger la progression")
            setData(null)
          }
          return
        }
        const json = await res.json()
        if (!cancelled) setData(json)
      } catch {
        if (!cancelled) setError("Erreur réseau")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <Card className="border border-stadium-200 overflow-hidden">
        <div className="h-40 bg-stadium-100 animate-pulse" />
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className="border border-stadium-200">
        <CardContent className="p-4 text-sm text-stadium-500">
          {error || "Progression indisponible"}
        </CardContent>
      </Card>
    )
  }

  const used = BigInt(data.subscription.bytesUsed)
  const cap = BigInt(data.subscription.effectiveQuotaBytes)
  const pct =
    cap > BigInt(0) ? Math.min(100, Number((used * BigInt(100)) / cap)) : 0
  const uploadsToday = data.subscription.rewardedUploadsToday
  const uploadsMax = data.subscription.maxRewardedUploadsPerDay
  const uploadsPct = uploadsMax > 0 ? Math.min(100, (uploadsToday / uploadsMax) * 100) : 0

  return (
    <Card className="border border-pitch-200/60 overflow-hidden shadow-sm">
      <div className="bg-gradient-to-br from-pitch-600/95 to-pitch-800 text-white px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base leading-tight">Vidéos & progression</h2>
              <p className="text-xs text-pitch-100 mt-0.5">
                Gagnez des crédits bonus en uploadant des vidéos de qualité
              </p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-0 hover:bg-white/25 shrink-0">
            {LEVEL_FR[data.progression.level] ?? data.progression.level}
          </Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-1.5 text-pitch-100">
            <TrendingUp className="h-4 w-4 text-gold-300 shrink-0" />
            <span>
              <strong className="text-white">{data.progression.xp}</strong> XP
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-pitch-100">
            <Coins className="h-4 w-4 text-gold-300 shrink-0" />
            <span>
              +{Math.round(data.progression.creditBonusPct * 100)} % bonus crédits vidéo
            </span>
          </div>
        </div>
      </div>

      <CardContent className="p-5 space-y-5">
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-stadium-600 mb-2">
            <span className="flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5" />
              Stockage vidéos
            </span>
            <span className="tabular-nums">
              {formatBytes(used)} / {formatBytes(cap)}
            </span>
          </div>
          <Progress value={pct} className="h-2 bg-stadium-100" />
          {BigInt(data.subscription.storageBonusBytes) > BigInt(0) && (
            <p className="text-[11px] text-stadium-500 mt-1.5">
              Dont +{formatBytes(BigInt(data.subscription.storageBonusBytes))} achetés en crédits
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-medium text-stadium-600 mb-2">
            <span>Vidéos récompensées aujourd&apos;hui</span>
            <span className="tabular-nums">
              {uploadsToday} / {uploadsMax}
            </span>
          </div>
          <Progress value={uploadsPct} className="h-2 bg-stadium-100" />
          <p className="text-[11px] text-stadium-500 mt-1.5">
            Limite anti-spam selon votre plan ({data.subscription.plan}). Les vidéos refusées ne comptent pas
            dans ce quota.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 border-t border-stadium-100">
          <p className="text-xs text-stadium-600">
            Uploadez depuis Reels ou votre profil, puis la finalisation attribue le score et les crédits bonus
            (wallet <strong>Bonus</strong>).
          </p>
          <Link
            href="/reels"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-pitch-600 hover:text-pitch-700 whitespace-nowrap"
          >
            Vers les Reels
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
