"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, FileText, Plus, RotateCcw, User, Trophy, Inbox } from "lucide-react"
import { ClubReportCard } from "@/components/reports/ClubReportCard"
import { SkeletonReportCard } from "@/components/reports/SkeletonReportCard"
import {
  type ClubReportListItem,
  getReportSubjectLabel,
  getReportAuthorLabel,
  CLUB_REPORTS_BASE,
} from "@/lib/reports/club-report-display"
import { cn } from "@/lib/utils"
import { ReportTemplatesSection } from "@/components/reports/ReportTemplatesSection"
import type { ReportTemplate } from "@/lib/reports/templates"

type TabId = "players" | "matches" | "received"

export default function ClubReportsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [tab, setTab] = useState<TabId>("players")
  const [reports, setReports] = useState<ClubReportListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<string | null>(null)

  const loadReports = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const params = new URLSearchParams()
      if (tab === "received") {
        params.set("source", "received")
      } else {
        params.set("source", "owned")
        params.set("kind", tab === "matches" ? "MATCH" : "PLAYER")
      }
      const res = await fetch(`/api/club/reports?${params}`)
      if (!res.ok) throw new Error("Erreur chargement")
      const data = await res.json()
      setReports(data.reports || [])
    } catch {
      setError(true)
      toast({
        title: "Erreur",
        description: "Impossible de charger les rapports",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [tab, toast])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports
    const q = searchQuery.toLowerCase()
    return reports.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        getReportSubjectLabel(r).toLowerCase().includes(q) ||
        getReportAuthorLabel(r).toLowerCase().includes(q)
    )
  }, [reports, searchQuery])

  const handleDelete = async () => {
    if (!reportToDelete) return
    try {
      const res = await fetch(`/api/club/reports/${reportToDelete}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Erreur")
      setReports((prev) => prev.filter((r) => r.id !== reportToDelete))
      toast({ title: "Rapport supprimé" })
    } catch {
      toast({
        title: "Erreur",
        description: "Suppression impossible",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setReportToDelete(null)
    }
  }

  const handleShare = (id: string) => {
    const url = `${window.location.origin}${CLUB_REPORTS_BASE}/${id}`
    navigator.clipboard.writeText(url)
    toast({ title: "Lien copié" })
  }

  const readOnly = tab === "received"
  const newHref =
    tab === "matches"
      ? `${CLUB_REPORTS_BASE}/new?kind=match`
      : `${CLUB_REPORTS_BASE}/new?kind=player`

  const templateKind = tab === "matches" ? "MATCH" : "PLAYER"

  const handleUseTemplate = (template: ReportTemplate) => {
    const kind = template.kind === "MATCH" ? "match" : "player"
    router.push(`${CLUB_REPORTS_BASE}/new?kind=${kind}&template=${template.id}`)
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pitch-500 to-pitch-600 text-white shadow-sm">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stadium-900 sm:text-3xl">Rapports</h1>
            <p className="mt-1 text-sm text-stadium-500">
              Rapports joueurs, matchs et documents reçus des agents
            </p>
          </div>
        </div>
        {tab !== "received" && (
          <Button asChild className="bg-pitch-600 hover:bg-pitch-700">
            <Link href={newHref}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau rapport
            </Link>
          </Button>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            { id: "players" as const, label: "Joueurs", icon: User },
            { id: "matches" as const, label: "Matchs", icon: Trophy },
            { id: "received" as const, label: "Reçus (agents)", icon: Inbox },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              tab === id
                ? "bg-pitch-600 text-white"
                : "bg-white text-stadium-600 ring-1 ring-stadium-200 hover:bg-stadium-50"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <Input
          placeholder="Rechercher un rapport…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {loading ? (
        <div className="space-y-10">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonReportCard key={i} />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-stadium-200 bg-white p-12 text-center">
          <p className="text-stadium-600">Erreur de chargement</p>
          <Button variant="outline" className="mt-4" onClick={loadReports}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="space-y-10">
          <div className="rounded-2xl border border-stadium-200 bg-white p-12 text-center">
            <FileText className="mx-auto mb-3 h-12 w-12 text-stadium-300" />
            <p className="font-medium text-stadium-700">Aucun rapport</p>
            <p className="mt-1 text-sm text-stadium-500">
              {tab === "received"
                ? "Les rapports joints par les agents apparaîtront ici."
                : "Créez votre premier rapport pour commencer."}
            </p>
            {tab !== "received" && (
              <Button asChild className="mt-4">
                <Link href={newHref}>Créer un rapport</Link>
              </Button>
            )}
          </div>

          {tab !== "received" && (
            <ReportTemplatesSection
              audience="CLUB"
              kind={templateKind}
              onUseTemplate={handleUseTemplate}
            />
          )}
        </div>
      ) : (
        <div className="space-y-10">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredReports.map((report) => (
              <ClubReportCard
                key={report.id}
                report={report}
                readOnly={readOnly}
                onView={(id) => router.push(`${CLUB_REPORTS_BASE}/${id}`)}
                onShare={readOnly ? undefined : handleShare}
                onEdit={readOnly ? undefined : (id) => router.push(`${CLUB_REPORTS_BASE}/${id}/edit`)}
                onDelete={
                  readOnly
                    ? undefined
                    : (id) => {
                        setReportToDelete(id)
                        setDeleteDialogOpen(true)
                      }
                }
              />
            ))}
          </div>

          {tab !== "received" && (
            <ReportTemplatesSection
              audience="CLUB"
              kind={templateKind}
              onUseTemplate={handleUseTemplate}
            />
          )}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce rapport ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
