"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ApplicationPipeline } from "./ApplicationPipeline"
import { HistoryTimeline, type HistoryEvent } from "./HistoryTimeline"
import {
  MapPin,
  Calendar,
  Target,
  User,
  ExternalLink,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Loader2,
  Eye,
  Save,
  Lock,
  ArrowRight,
  RotateCcw,
} from "lucide-react"

interface Application {
  id: string
  status: string
  coverLetter?: string
  createdAt: string
  updatedAt?: string
  playerProfile: {
    id: string
    firstName: string
    lastName: string
    primaryPosition: string
    nationality: string
    currentClub?: string
    dateOfBirth: string
  }
  listing: {
    id: string
    title: string
    position: string
  }
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  SUBMITTED: { label: "Nouvelle", color: "bg-blue-100 text-blue-700 border-blue-200" },
  UNDER_REVIEW: { label: "En cours", color: "bg-blue-100 text-blue-700 border-blue-200" },
  SHORTLISTED: { label: "Shortlisté", color: "bg-violet-100 text-violet-700 border-violet-200" },
  TRIAL: { label: "Essai", color: "bg-amber-100 text-amber-700 border-amber-200" },
  ACCEPTED: { label: "Accepté", color: "bg-green-100 text-green-700 border-green-200" },
  SIGNED: { label: "Signé", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Refusé", color: "bg-red-100 text-red-700 border-red-200" },
}

function getNextAction(status: string): { label: string; nextStatus: string } | null {
  switch (status) {
    case "SUBMITTED": return { label: "Passer en revue", nextStatus: "UNDER_REVIEW" }
    case "UNDER_REVIEW": return { label: "Shortlister", nextStatus: "SHORTLISTED" }
    case "SHORTLISTED": return { label: "Planifier essai", nextStatus: "TRIAL" }
    case "TRIAL": return { label: "Marquer comme accepté", nextStatus: "ACCEPTED" }
    case "ACCEPTED": return { label: "Marquer comme signé", nextStatus: "SIGNED" }
    default: return null
  }
}

function calculateAge(dateOfBirth: string | null | undefined): string {
  if (!dateOfBirth) return "Age non renseigné"
  const birth = new Date(dateOfBirth)
  if (isNaN(birth.getTime())) return "Age non renseigné"
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  if (isNaN(age) || age < 0 || age > 100) return "Age non renseigné"
  return `${age} ans`
}

interface ApplicationDetailsDialogProps {
  application: Application | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusUpdate: (applicationId: string, newStatus: string) => Promise<void>
  updatingStatus: boolean
}

export function ApplicationDetailsDialog({
  application,
  open,
  onOpenChange,
  onStatusUpdate,
  updatingStatus,
}: ApplicationDetailsDialogProps) {
  const [coverLetterExpanded, setCoverLetterExpanded] = useState(false)
  const [notes, setNotes] = useState("")
  const [notesSaved, setNotesSaved] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null)
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([])

  const storageKey = application ? `pfp_notes_${application.id}` : null

  useEffect(() => {
    if (application && storageKey) {
      const saved = localStorage.getItem(storageKey)
      setNotes(saved || "")
      setCoverLetterExpanded(false)
      setNotesSaved(false)

      const events: HistoryEvent[] = [
        {
          id: "created",
          label: "Candidature reçue",
          date: application.createdAt,
          type: "created",
        },
      ]
      if (application.updatedAt && application.updatedAt !== application.createdAt) {
        events.push({
          id: "updated",
          label: `Statut mis à jour: ${STATUS_CONFIG[application.status]?.label || application.status}`,
          date: application.updatedAt,
          type: "status_change",
        })
      }
      setHistoryEvents(events)
    }
  }, [application, storageKey])

  const handleSaveNotes = useCallback(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, notes)
      setNotesSaved(true)
      setTimeout(() => setNotesSaved(false), 2000)
    }
  }, [storageKey, notes])

  const handleStatusChange = async (newStatus: string) => {
    if (!application) return
    if (newStatus === "REJECTED") {
      setRejectDialogOpen(true)
      return
    }
    setLoadingStatus(newStatus)
    await onStatusUpdate(application.id, newStatus)
    setLoadingStatus(null)
  }

  const handleConfirmReject = async () => {
    if (!application) return
    setRejectDialogOpen(false)
    setLoadingStatus("REJECTED")
    await onStatusUpdate(application.id, "REJECTED")
    setLoadingStatus(null)
  }

  if (!application) return null

  const player = application.playerProfile
  const statusInfo = STATUS_CONFIG[application.status] || { label: application.status, color: "bg-gray-100 text-gray-700" }
  const nextAction = getNextAction(application.status)
  const initials = `${player.firstName?.[0] || ""}${player.lastName?.[0] || ""}`.toUpperCase()
  const coverLetter = application.coverLetter?.trim() || ""
  const shouldTruncate = coverLetter.length > 400

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[860px] max-h-[90vh] overflow-hidden p-0 gap-0 md:rounded-xl">
          <DialogTitle className="sr-only">
            Détail candidature - {player.firstName} {player.lastName}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Détails et actions pour la candidature de {player.firstName} {player.lastName}
          </DialogDescription>
          {/* Header sticky */}
          <div className="sticky top-0 z-10 bg-white border-b px-6 py-5">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-green-400 to-green-600 text-white font-semibold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 truncate">
                  {player.firstName} {player.lastName}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {player.primaryPosition || "Poste non renseigné"}
                  {" · "}
                  {calculateAge(player.dateOfBirth)}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {player.nationality && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {player.nationality}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(application.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                  <Badge className={`text-xs ${statusInfo.color}`}>
                    {statusInfo.label}
                  </Badge>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  animated={false}
                  onClick={() => window.open(`/player/${player.id}`, "_blank")}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Voir profil
                </Button>
                <Button
                  size="sm"
                  animated={false}
                  onClick={() => window.open(`/messages?to=${player.id}`, "_blank")}
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                  Contacter
                </Button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto max-h-[calc(90vh-130px)]">
            {/* Mobile actions */}
            <div className="sm:hidden px-6 pt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                animated={false}
                onClick={() => window.open(`/player/${player.id}`, "_blank")}
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                Profil
              </Button>
              <Button
                size="sm"
                className="flex-1"
                animated={false}
                onClick={() => window.open(`/messages?to=${player.id}`, "_blank")}
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                Contacter
              </Button>
            </div>

            <div className="flex flex-col md:flex-row">
              {/* Mobile: Pipeline + Actions first */}
              <div className="md:hidden px-6 pt-5 space-y-5">
                <ApplicationPipeline
                  currentStatus={application.status}
                  onStatusChange={handleStatusChange}
                  loading={updatingStatus}
                  loadingStatus={loadingStatus}
                />
                {nextAction && (
                  <Button
                    className="w-full"
                    animated={false}
                    onClick={() => handleStatusChange(nextAction.nextStatus)}
                    disabled={updatingStatus}
                  >
                    {updatingStatus && loadingStatus === nextAction.nextStatus ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    {nextAction.label}
                  </Button>
                )}
                {application.status !== "REJECTED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    animated={false}
                    onClick={() => handleStatusChange("REJECTED")}
                    disabled={updatingStatus}
                  >
                    Refuser la candidature
                  </Button>
                )}
                {application.status === "REJECTED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    animated={false}
                    onClick={() => handleStatusChange("UNDER_REVIEW")}
                    disabled={updatingStatus}
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                    Réactiver
                  </Button>
                )}
                <Separator />
              </div>

              {/* Left column (main) */}
              <div className="flex-1 px-6 py-5 space-y-6 min-w-0">
                {/* Player info */}
                <div className="space-y-2">
                  {player.currentClub && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-4 w-4 text-gray-400" />
                      {player.currentClub}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="h-4 w-4 text-gray-400" />
                    {application.listing.title}
                  </div>
                </div>

                <Separator />

                {/* Cover letter */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Lettre de motivation
                  </h3>
                  {coverLetter ? (
                    <Card className="bg-gray-50/50 border-gray-100">
                      <CardContent className="p-4">
                        <div
                          className={`text-sm text-gray-700 leading-relaxed whitespace-pre-wrap ${
                            !coverLetterExpanded && shouldTruncate ? "line-clamp-4" : ""
                          }`}
                        >
                          {coverLetter}
                        </div>
                        {shouldTruncate && (
                          <button
                            onClick={() => setCoverLetterExpanded(!coverLetterExpanded)}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            {coverLetterExpanded ? (
                              <>Voir moins <ChevronUp className="h-3.5 w-3.5" /></>
                            ) : (
                              <>Voir plus <ChevronDown className="h-3.5 w-3.5" /></>
                            )}
                          </button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="rounded-lg border border-dashed border-gray-200 py-8 text-center">
                      <p className="text-sm text-gray-400">
                        Aucune lettre de motivation fournie.
                      </p>
                    </div>
                  )}
                </div>

                {/* Mobile: Notes internes */}
                <div className="md:hidden space-y-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Notes internes
                  </h3>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Ajouter des notes sur ce candidat..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="min-h-[80px] resize-none text-sm"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Visible uniquement par le club
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        animated={false}
                        onClick={handleSaveNotes}
                      >
                        {notesSaved ? "Enregistré !" : (
                          <><Save className="h-3.5 w-3.5 mr-1" />Enregistrer</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* History */}
                <HistoryTimeline events={historyEvents} />
              </div>

              {/* Right column (sidebar) - desktop only */}
              <div className="hidden md:block w-[280px] shrink-0 border-l bg-gray-50/30 px-5 py-5 space-y-6">
                {/* Pipeline */}
                <ApplicationPipeline
                  currentStatus={application.status}
                  onStatusChange={handleStatusChange}
                  loading={updatingStatus}
                  loadingStatus={loadingStatus}
                />

                <Separator />

                {/* Quick actions */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </h3>
                  <div className="space-y-2">
                    {nextAction && (
                      <Button
                        className="w-full justify-start"
                        size="sm"
                        animated={false}
                        onClick={() => handleStatusChange(nextAction.nextStatus)}
                        disabled={updatingStatus}
                      >
                        {updatingStatus && loadingStatus === nextAction.nextStatus ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <ArrowRight className="h-4 w-4 mr-2" />
                        )}
                        {nextAction.label}
                      </Button>
                    )}
                    {application.status !== "REJECTED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                        animated={false}
                        onClick={() => handleStatusChange("REJECTED")}
                        disabled={updatingStatus}
                      >
                        Refuser
                      </Button>
                    )}
                    {application.status === "REJECTED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                        animated={false}
                        onClick={() => handleStatusChange("UNDER_REVIEW")}
                        disabled={updatingStatus}
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                        Réactiver
                      </Button>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Notes internes */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Notes internes
                  </h3>
                  <Textarea
                    placeholder="Ajouter des notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px] resize-none text-sm bg-white"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Club uniquement
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      animated={false}
                      onClick={handleSaveNotes}
                      className="h-7 text-xs"
                    >
                      {notesSaved ? "Fait !" : (
                        <><Save className="h-3 w-3 mr-1" />Sauver</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation de refus */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Refuser cette candidature ?</AlertDialogTitle>
            <AlertDialogDescription>
              La candidature de {player.firstName} {player.lastName} sera marquée comme refusée.
              Vous pourrez la réactiver ultérieurement si nécessaire.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReject}
              className="bg-red-500 hover:bg-red-600"
            >
              Confirmer le refus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
