"use client"

import { useEffect, useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
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
import { Loader2, FileText, Plus, AlertTriangle, RotateCcw } from "lucide-react"
import { Trash2 } from "lucide-react"

import { ReportsHeader } from "@/components/reports/ReportsHeader"
import { ReportsStats } from "@/components/reports/ReportsStats"
import { ReportsToolbar } from "@/components/reports/ReportsToolbar"
import { ReportCard } from "@/components/reports/ReportCard"
import { SkeletonReportCard } from "@/components/reports/SkeletonReportCard"

const reportSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  authorType: z.string().min(1, "Le type d'auteur est requis"),
  subjectId: z.string().min(1, "Veuillez sélectionner un joueur"),
})

type ReportFormData = z.infer<typeof reportSchema>

interface Report {
  id: string
  title: string
  version: number
  status: string
  authorType: string
  createdAt: string
  updatedAt: string
  author: {
    firstName: string
    lastName: string
  }
  subject: {
    firstName: string
    lastName: string
  }
}

interface ManagedPlayer {
  id: string
  firstName: string
  lastName: string
}

const authorTypes = [
  { value: "PLAYER", label: "Joueur" },
  { value: "AGENT", label: "Agent" },
  { value: "SCOUT", label: "Recruteur" },
  { value: "COACH", label: "Entraîneur" },
]

export default function AgentReportsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<string | null>(null)
  const [managedPlayers, setManagedPlayers] = useState<ManagedPlayer[]>([])

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [authorTypeFilter, setAuthorTypeFilter] = useState<string>("ALL")
  const [sortBy, setSortBy] = useState<"recent" | "title" | "status">("recent")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      authorType: "AGENT",
    },
  })

  const stats = useMemo(() => {
    return {
      total: reports.length,
      draft: reports.filter(r => r.status === "DRAFT").length,
      pending: reports.filter(r => r.status === "PENDING_APPROVAL").length,
      approved: reports.filter(r => r.status === "APPROVED").length,
      rejected: reports.filter(r => r.status === "REJECTED").length,
    }
  }, [reports])

  const filteredReports = useMemo(() => {
    let filtered = reports

    if (searchQuery) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${report.author.firstName} ${report.author.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(report => report.status === statusFilter)
    }

    if (authorTypeFilter !== "ALL") {
      filtered = filtered.filter(report => report.authorType === authorTypeFilter)
    }

    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "status":
          return a.status.localeCompare(b.status)
        case "recent":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return filtered
  }, [reports, searchQuery, statusFilter, authorTypeFilter, sortBy])

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "ALL" || authorTypeFilter !== "ALL"

  const loadReports = async () => {
    setLoading(true)
    setError(false)
    try {
      const response = await fetch("/api/reports")
      if (!response.ok) throw new Error("Erreur")

      const data = await response.json()
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
  }

  useEffect(() => {
    loadReports()
    loadManagedPlayers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadManagedPlayers = async () => {
    try {
      const response = await fetch("/api/mandates")
      if (!response.ok) return
      const data = await response.json()
      const activeMandates = (data.mandates || []).filter(
        (m: any) => m.status === "ACTIVE"
      )
      const players = activeMandates.map((m: any) => ({
        id: m.playerProfile.id,
        firstName: m.playerProfile.firstName,
        lastName: m.playerProfile.lastName,
      }))
      setManagedPlayers(players)
    } catch {}
  }

  const onSubmit = async (data: ReportFormData) => {
    setSaving(true)
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Erreur")
      }

      const newReport = await response.json()
      setReports([newReport, ...reports])

      toast({
        title: "Succès",
        description: "Rapport créé avec succès",
      })

      reset()
      setDialogOpen(false)
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteReport = async () => {
    if (!reportToDelete) return

    try {
      const response = await fetch(`/api/reports/${reportToDelete}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression")
      }

      setReports(reports.filter(r => r.id !== reportToDelete))

      toast({
        title: "Succès",
        description: "Rapport supprimé avec succès",
      })
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setReportToDelete(null)
    }
  }

  const handleShareReport = async (reportId: string) => {
    try {
      const url = `${window.location.origin}/reports/${reportId}`
      await navigator.clipboard.writeText(url)

      toast({
        title: "Lien copié",
        description: "Le lien du rapport a été copié dans le presse-papiers",
      })
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      })
    }
  }

  const handleViewReport = (reportId: string) => {
    router.push(`/agent/reports/${reportId}`)
  }

  const handleEditReport = (reportId: string) => {
    router.push(`/agent/reports/${reportId}/edit`)
  }

  const confirmDelete = (reportId: string) => {
    setReportToDelete(reportId)
    setDeleteDialogOpen(true)
  }

  const resetFilters = () => {
    setSearchQuery("")
    setStatusFilter("ALL")
    setAuthorTypeFilter("ALL")
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-7 w-40 bg-stadium-100 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-stadium-100 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-40 bg-stadium-100 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-white ring-1 ring-stadium-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-12 bg-white ring-1 ring-stadium-200 rounded-2xl animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonReportCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error && reports.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <ReportsHeader onNewReport={() => setDialogOpen(true)} />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="inline-flex p-4 bg-red-50 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-stadium-900 mb-1">
            Impossible de charger les rapports
          </h3>
          <p className="text-sm text-stadium-500 mb-5 max-w-sm">
            Une erreur est survenue. Veuillez réessayer.
          </p>
          <Button
            onClick={loadReports}
            variant="outline"
            className="border-stadium-200 hover:bg-stadium-50 rounded-xl font-semibold"
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Réessayer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
      <ReportsHeader onNewReport={() => setDialogOpen(true)} />

      {reports.length > 0 && <ReportsStats stats={stats} />}

      {reports.length > 0 && (
        <ReportsToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          authorTypeFilter={authorTypeFilter}
          onAuthorTypeChange={setAuthorTypeFilter}
          sortBy={sortBy}
          onSortChange={(v) => setSortBy(v as "recent" | "title" | "status")}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="inline-flex p-5 bg-stadium-50 rounded-full mb-5">
            <FileText className="h-10 w-10 text-stadium-300" />
          </div>
          <h3 className="text-lg font-semibold text-stadium-900 mb-1">
            Aucun rapport pour le moment
          </h3>
          <p className="text-sm text-stadium-500 mb-5 max-w-sm">
            Commencez par créer votre premier rapport professionnel
          </p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-pitch-600 hover:bg-pitch-700 text-white rounded-xl font-semibold"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Créer un rapport
          </Button>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-stadium-500 mb-3">
            Aucun rapport ne correspond à vos critères
          </p>
          <button
            onClick={resetFilters}
            className="text-sm text-pitch-600 hover:text-pitch-700 font-medium"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onView={handleViewReport}
              onShare={handleShareReport}
              onEdit={handleEditReport}
              onDelete={confirmDelete}
            />
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-pitch-600 rounded-lg">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <DialogTitle className="text-lg">Créer un nouveau rapport</DialogTitle>
            </div>
            <DialogDescription className="text-sm">
              Remplissez les informations pour créer votre rapport
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="title" className="text-stadium-700 text-sm font-medium">
                Titre du rapport *
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Ex: Rapport de performance T1 2026"
                className="mt-1 border-stadium-200 focus:ring-2 focus:ring-pitch-600/30 rounded-xl"
              />
              {errors.title && (
                <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="authorType" className="text-stadium-700 text-sm font-medium">
                Type d'auteur
              </Label>
              <select
                id="authorType"
                {...register("authorType")}
                className="w-full px-3 py-2 border border-stadium-200 focus:ring-2 focus:ring-pitch-600/30 rounded-xl mt-1 text-sm bg-white"
              >
                {authorTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="subjectId" className="text-stadium-700 text-sm font-medium">
                Joueur concerné *
              </Label>
              <select
                id="subjectId"
                {...register("subjectId")}
                className="w-full px-3 py-2 border border-stadium-200 focus:ring-2 focus:ring-pitch-600/30 rounded-xl mt-1 text-sm bg-white"
              >
                <option value="">Sélectionner un joueur</option>
                {managedPlayers.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.firstName} {player.lastName}
                  </option>
                ))}
              </select>
              {errors.subjectId && (
                <p className="text-xs text-red-600 mt-1">{errors.subjectId.message}</p>
              )}
            </div>

            <DialogFooter className="pt-3 border-t border-stadium-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-stadium-200 hover:bg-stadium-50 rounded-xl text-sm font-medium"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-pitch-600 hover:bg-pitch-700 text-white rounded-xl text-sm font-semibold"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer le rapport"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="h-4 w-4 text-red-600" />
              </div>
              <AlertDialogTitle className="text-lg">Êtes-vous sûr ?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm">
              Cette action est irréversible. Le rapport sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-3 border-t border-stadium-100">
            <AlertDialogCancel className="border-stadium-200 hover:bg-stadium-50 rounded-xl text-sm font-medium">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReport}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
