"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  Send,
  Plus,
  Building2,
  Calendar,
  Target,
  Clock,
  CheckCircle2,
  Star,
  XCircle,
  Users,
  AlertTriangle,
  RefreshCw,
  FileText,
} from "lucide-react"

const submissionSchema = z.object({
  playerProfileId: z.string().min(1, "Sélectionnez un joueur"),
  clubProfileId: z.string().min(1, "Sélectionnez un club"),
  listingId: z.string().optional(),
  message: z.string().optional(),
})

type SubmissionFormData = z.infer<typeof submissionSchema>

interface Submission {
  id: string
  status: string
  message?: string
  createdAt: string
  playerData: {
    firstName: string
    lastName: string
    primaryPosition: string
  }
  clubProfile: {
    clubName: string
    country: string
  }
  listing?: {
    title: string
    position: string
  }
}

interface Player {
  id: string
  firstName: string
  lastName: string
  primaryPosition: string
}

interface Club {
  id: string
  clubName: string
  country: string
  activeListingsCount: number
}

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: typeof Clock }> = {
  SUBMITTED: { label: "Envoyée", bg: "bg-blue-50", text: "text-blue-700", icon: Send },
  UNDER_REVIEW: { label: "En cours", bg: "bg-amber-50", text: "text-amber-700", icon: Clock },
  SHORTLISTED: { label: "Shortlisté", bg: "bg-purple-50", text: "text-purple-700", icon: Star },
  TRIAL: { label: "Essai", bg: "bg-orange-50", text: "text-orange-700", icon: Target },
  REJECTED: { label: "Refusée", bg: "bg-red-50", text: "text-red-600", icon: XCircle },
  ACCEPTED: { label: "Acceptée", bg: "bg-green-50", text: "text-green-700", icon: CheckCircle2 },
  SIGNED: { label: "Signé", bg: "bg-green-600", text: "text-white", icon: CheckCircle2 },
}

const statusOrder = ["SUBMITTED", "UNDER_REVIEW", "SHORTLISTED", "TRIAL", "ACCEPTED", "SIGNED", "REJECTED"]

export default function AgentSubmissionsPage() {
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [myPlayers, setMyPlayers] = useState<Player[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("ALL")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
  })

  const loadData = async () => {
    setLoading(true)
    setError(false)
    try {
      const [submRes, mandatesRes, clubsRes] = await Promise.all([
        fetch("/api/submissions"),
        fetch("/api/mandates?status=ACTIVE"),
        fetch("/api/clubs?limit=50"),
      ])

      if (submRes.ok) {
        const data = await submRes.json()
        setSubmissions(data.submissions || [])
      }

      if (mandatesRes.ok) {
        const data = await mandatesRes.json()
        setMyPlayers(
          data.mandates?.map((m: any) => ({
            id: m.playerProfile.id,
            firstName: m.playerProfile.firstName,
            lastName: m.playerProfile.lastName,
            primaryPosition: m.playerProfile.primaryPosition,
          })) || []
        )
      }

      if (clubsRes.ok) {
        const data = await clubsRes.json()
        setClubs(data.clubs || [])
      }
    } catch {
      setError(true)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const onSubmit = async (data: SubmissionFormData) => {
    setSaving(true)
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          reportIds: [],
          attachments: [],
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Erreur")
      }

      const newSubmission = await response.json()
      setSubmissions([newSubmission, ...submissions])

      toast({
        title: "Soumission envoyée",
        description: "Le club a été notifié",
      })

      reset()
      setDialogOpen(false)
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

  // Stats
  const totalActive = submissions.filter((s) => !["REJECTED", "SIGNED"].includes(s.status)).length
  const totalShortlisted = submissions.filter((s) => ["SHORTLISTED", "TRIAL", "ACCEPTED"].includes(s.status)).length
  const totalSigned = submissions.filter((s) => s.status === "SIGNED").length

  // Filtered list
  const filteredSubmissions = filterStatus === "ALL"
    ? submissions
    : submissions.filter((s) => s.status === filterStatus)

  // Group by status
  const submissionsByStatus = filteredSubmissions.reduce((acc, sub) => {
    if (!acc[sub.status]) acc[sub.status] = []
    acc[sub.status].push(sub)
    return acc
  }, {} as Record<string, Submission[]>)

  // Loading state
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-6">
          <div className="h-8 bg-slate-200 rounded-lg w-48 animate-pulse" />
          <div className="h-4 bg-slate-100 rounded w-64 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-white ring-1 ring-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-white ring-1 ring-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Mes Soumissions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Suivez vos propositions de joueurs aux clubs
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          disabled={myPlayers.length === 0}
          className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm self-start sm:self-auto"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Nouvelle soumission
        </Button>
      </div>

      {/* Warning: no players */}
      {myPlayers.length === 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 ring-1 ring-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Aucun joueur sous mandat</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Vous devez avoir un mandat actif avec un joueur pour créer une soumission.
            </p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white ring-1 ring-slate-200 rounded-xl p-4">
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Total</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{submissions.length}</p>
        </div>
        <div className="bg-white ring-1 ring-slate-200 rounded-xl p-4">
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">En cours</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalActive}</p>
        </div>
        <div className="bg-white ring-1 ring-slate-200 rounded-xl p-4">
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Shortlistés</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{totalShortlisted}</p>
        </div>
        <div className="bg-white ring-1 ring-slate-200 rounded-xl p-4">
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Signés</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{totalSigned}</p>
        </div>
      </div>

      {/* Filter tabs */}
      {submissions.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              filterStatus === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Toutes ({submissions.length})
          </button>
          {statusOrder.map((status) => {
            const count = submissions.filter((s) => s.status === status).length
            if (count === 0) return null
            const config = statusConfig[status]
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  filterStatus === status
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {config.label} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-white ring-1 ring-red-200 rounded-xl p-8 text-center">
          <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
            <XCircle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-sm font-medium text-slate-700 mb-1">Erreur de chargement</p>
          <p className="text-xs text-slate-500 mb-4">Vérifiez votre connexion et réessayez</p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="rounded-xl border-slate-200 text-slate-600"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Réessayer
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!error && submissions.length === 0 && (
        <div className="bg-white ring-1 ring-slate-200 rounded-xl p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Send className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700 mb-1">Aucune soumission</p>
          <p className="text-xs text-slate-500 mb-5">
            Proposez vos joueurs aux clubs pour démarrer
          </p>
          {myPlayers.length > 0 && (
            <Button
              onClick={() => setDialogOpen(true)}
              className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Créer votre première soumission
            </Button>
          )}
        </div>
      )}

      {/* Filtered empty */}
      {!error && submissions.length > 0 && filteredSubmissions.length === 0 && (
        <div className="bg-white ring-1 ring-slate-200 rounded-xl p-8 text-center">
          <p className="text-sm text-slate-500">Aucune soumission avec ce statut</p>
          <button
            onClick={() => setFilterStatus("ALL")}
            className="text-xs font-medium text-green-600 hover:text-green-700 mt-2"
          >
            Voir toutes les soumissions
          </button>
        </div>
      )}

      {/* Submissions list */}
      {!error && filteredSubmissions.length > 0 && (
        <div className="space-y-6">
          {statusOrder.map((status) => {
            const subs = submissionsByStatus[status]
            if (!subs || subs.length === 0) return null
            const config = statusConfig[status]
            const StatusIcon = config.icon

            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <StatusIcon className={`h-4 w-4 ${config.text}`} />
                  <h2 className="text-sm font-semibold text-slate-900">{config.label}</h2>
                  <span className="text-xs text-slate-400">{subs.length}</span>
                </div>

                <div className="space-y-2">
                  {subs.map((submission) => (
                    <SubmissionCard key={submission.id} submission={submission} />
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* New submission dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg ring-1 ring-slate-200 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Nouvelle soumission
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Proposez un joueur à un club
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Joueur sous mandat *
              </Label>
              <Select
                onValueChange={(value) => setValue("playerProfileId", value)}
                defaultValue={watch("playerProfileId")}
              >
                <SelectTrigger className="border-slate-200 focus:ring-2 focus:ring-green-600/30">
                  <SelectValue placeholder="Sélectionner un joueur..." />
                </SelectTrigger>
                <SelectContent>
                  {myPlayers.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.firstName} {player.lastName} — {player.primaryPosition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.playerProfileId && (
                <p className="text-xs text-red-600 mt-1.5">{errors.playerProfileId.message}</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Club ciblé *
              </Label>
              <Select
                onValueChange={(value) => setValue("clubProfileId", value)}
                defaultValue={watch("clubProfileId")}
              >
                <SelectTrigger className="border-slate-200 focus:ring-2 focus:ring-green-600/30">
                  <SelectValue placeholder="Sélectionner un club..." />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id}>
                      {club.clubName} ({club.country})
                      {club.activeListingsCount > 0 && ` · ${club.activeListingsCount} annonce(s)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clubProfileId && (
                <p className="text-xs text-red-600 mt-1.5">{errors.clubProfileId.message}</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-slate-700">
                Message de présentation
              </Label>
              <p className="text-xs text-slate-500 mb-2">
                Présentez votre joueur et ses points forts
              </p>
              <Textarea
                {...register("message")}
                placeholder="Je vous recommande ce joueur pour ce poste car..."
                rows={4}
                className="border-slate-200 focus:ring-2 focus:ring-green-600/30 resize-none"
              />
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 ring-1 ring-blue-100">
              <FileText className="h-4 w-4 text-blue-500 shrink-0" />
              <p className="text-xs text-blue-700">
                Un snapshot du profil du joueur sera joint automatiquement
              </p>
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
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer
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

// ==================== SUBMISSION CARD ====================

function SubmissionCard({ submission }: { submission: Submission }) {
  const config = statusConfig[submission.status] || statusConfig.SUBMITTED
  const playerInitials = `${submission.playerData.firstName.charAt(0)}${submission.playerData.lastName.charAt(0)}`

  return (
    <div className="bg-white ring-1 ring-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        {/* Player avatar */}
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-slate-600">{playerInitials}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {submission.playerData.firstName} {submission.playerData.lastName}
              </p>
              <p className="text-xs text-slate-500">{submission.playerData.primaryPosition}</p>
            </div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0 ${config.bg} ${config.text}`}>
              {config.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Building2 className="h-3 w-3 text-slate-400" />
              {submission.clubProfile.clubName}
            </div>
            {submission.listing && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Target className="h-3 w-3 text-slate-400" />
                {submission.listing.title}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="h-3 w-3" />
              {new Date(submission.createdAt).toLocaleDateString("fr-FR")}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
