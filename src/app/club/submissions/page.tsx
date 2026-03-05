"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { 
  Loader2, 
  Send,
  Eye,
  ArrowRight,
  User,
  Shield,
  Target,
  Calendar
} from "lucide-react"

interface Submission {
  id: string
  status: string
  message?: string
  createdAt: string
  playerData: {
    id: string
    firstName: string
    lastName: string
    primaryPosition: string
    nationality: string
    currentClub?: string
    careerEntries?: Array<{
      clubName: string
      season: string
      appearances?: number
      goals?: number
      assists?: number
    }>
  }
  agentProfile: {
    id: string
    firstName: string
    lastName: string
    agencyName?: string
    licenseNumber?: string
  }
  listing?: {
    id: string
    title: string
    position: string
  }
}

const statusSteps = [
  { value: "SUBMITTED", label: "Nouvelle", color: "bg-blue-100 text-blue-700" },
  { value: "UNDER_REVIEW", label: "En cours", color: "bg-yellow-100 text-yellow-700" },
  { value: "SHORTLISTED", label: "Shortlisté", color: "bg-purple-100 text-purple-700" },
  { value: "TRIAL", label: "Essai", color: "bg-orange-100 text-orange-700" },
  { value: "ACCEPTED", label: "Accepté", color: "bg-green-100 text-green-700" },
  { value: "SIGNED", label: "Signé", color: "bg-green-600 text-white" },
  { value: "REJECTED", label: "Refusé", color: "bg-red-100 text-red-700" },
]

export default function ClubSubmissionsPage() {
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Charger les soumissions
  useEffect(() => {
    async function loadSubmissions() {
      try {
        const response = await fetch("/api/submissions")
        if (!response.ok) throw new Error("Erreur")

        const data = await response.json()
        setSubmissions(data.submissions || [])
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les soumissions",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadSubmissions()
  }, [toast])

  const handleViewDetails = (submission: Submission) => {
    setSelectedSubmission(submission)
    setDialogOpen(true)
  }

  const handleStatusUpdate = async (submissionId: string, newStatus: string) => {
    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/submissions/${submissionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Erreur")

      setSubmissions(
        submissions.map((sub) =>
          sub.id === submissionId ? { ...sub, status: newStatus } : sub
        )
      )

      toast({
        title: "Succès",
        description: "Statut mis à jour",
      })

      setDialogOpen(false)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const submissionsByStatus = submissions.reduce((acc, sub) => {
    if (!acc[sub.status]) acc[sub.status] = []
    acc[sub.status].push(sub)
    return acc
  }, {} as Record<string, Submission[]>)

  const pipelineStatuses = ["SUBMITTED", "UNDER_REVIEW", "SHORTLISTED", "TRIAL", "ACCEPTED", "SIGNED"]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Soumissions Agents</h1>
        <p className="text-gray-600 mt-1">
          Joueurs proposés par les agents ({submissions.length} soumission(s))
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Nouvelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissionsByStatus.SUBMITTED?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              En cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissionsByStatus.UNDER_REVIEW?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Shortlistés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissionsByStatus.SHORTLISTED?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Signés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissionsByStatus.SIGNED?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste */}
      {submissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Send className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">Aucune soumission reçue</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pipelineStatuses.map((status) => {
            const subs = submissionsByStatus[status]
            if (!subs || subs.length === 0) return null

            const statusInfo = statusSteps.find((s) => s.value === status)!

            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xl font-semibold">{statusInfo.label}</h2>
                  <Badge variant="outline">{subs.length}</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {subs.map((submission) => (
                    <Card key={submission.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {submission.playerData.firstName}{" "}
                              {submission.playerData.lastName}
                            </CardTitle>
                            <CardDescription>
                              {submission.playerData.primaryPosition}
                            </CardDescription>
                          </div>
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Shield className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">
                              {submission.agentProfile.firstName}{" "}
                              {submission.agentProfile.lastName}
                            </span>
                          </div>

                          {submission.listing && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Target className="h-4 w-4" />
                              {submission.listing.title}
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {new Date(submission.createdAt).toLocaleDateString("fr-FR")}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-3"
                            onClick={() => handleViewDetails(submission)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Voir les détails
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Soumissions refusées */}
          {submissionsByStatus.REJECTED && submissionsByStatus.REJECTED.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xl font-semibold">Refusées</h2>
                <Badge variant="outline">{submissionsByStatus.REJECTED.length}</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {submissionsByStatus.REJECTED.map((submission) => (
                  <Card key={submission.id} className="opacity-60">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {submission.playerData.firstName}{" "}
                        {submission.playerData.lastName}
                      </CardTitle>
                      <CardDescription>
                        Par {submission.agentProfile.firstName}{" "}
                        {submission.agentProfile.lastName}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dialog détails */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSubmission?.playerData.firstName}{" "}
              {selectedSubmission?.playerData.lastName}
            </DialogTitle>
            <DialogDescription>
              Proposé par {selectedSubmission?.agentProfile.firstName}{" "}
              {selectedSubmission?.agentProfile.lastName}
              {selectedSubmission?.agentProfile.agencyName &&
                ` (${selectedSubmission.agentProfile.agencyName})`}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              {/* Infos joueur */}
              <div>
                <h3 className="font-semibold mb-2">Profil joueur</h3>
                <div className="bg-gray-50 p-4 rounded-md space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Position : </span>
                    <span className="font-medium">
                      {selectedSubmission.playerData.primaryPosition}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Nationalité : </span>
                    <span className="font-medium">
                      {selectedSubmission.playerData.nationality}
                    </span>
                  </div>
                  {selectedSubmission.playerData.currentClub && (
                    <div>
                      <span className="text-gray-600">Club actuel : </span>
                      <span className="font-medium">
                        {selectedSubmission.playerData.currentClub}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Parcours */}
              {selectedSubmission.playerData.careerEntries &&
                selectedSubmission.playerData.careerEntries.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Parcours récent</h3>
                    <div className="space-y-2">
                      {selectedSubmission.playerData.careerEntries
                        .slice(0, 3)
                        .map((entry, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 p-3 rounded-md text-sm"
                          >
                            <div className="font-medium">{entry.clubName}</div>
                            <div className="text-gray-600">
                              {entry.season}
                              {entry.appearances && ` • ${entry.appearances} matchs`}
                              {entry.goals !== null &&
                                entry.goals !== undefined &&
                                ` • ${entry.goals} buts`}
                              {entry.assists !== null &&
                                entry.assists !== undefined &&
                                ` • ${entry.assists} passes D.`}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {/* Message agent */}
              {selectedSubmission.message && (
                <div>
                  <h3 className="font-semibold mb-2">Message de l'agent</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedSubmission.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Info agent */}
              <div>
                <h3 className="font-semibold mb-2">Agent</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm">
                    {selectedSubmission.agentProfile.firstName}{" "}
                    {selectedSubmission.agentProfile.lastName}
                  </p>
                  {selectedSubmission.agentProfile.agencyName && (
                    <p className="text-sm text-gray-600">
                      {selectedSubmission.agentProfile.agencyName}
                    </p>
                  )}
                  {selectedSubmission.agentProfile.licenseNumber && (
                    <p className="text-xs text-gray-500 mt-1">
                      Licence : {selectedSubmission.agentProfile.licenseNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="font-semibold mb-2">Changer le statut</h3>
                <div className="flex flex-wrap gap-2">
                  {statusSteps
                    .filter((s) => s.value !== selectedSubmission.status)
                    .map((status) => (
                      <Button
                        key={status.value}
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleStatusUpdate(selectedSubmission.id, status.value)
                        }
                        disabled={updatingStatus}
                      >
                        {updatingStatus ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            {status.label}
                          </>
                        )}
                      </Button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
