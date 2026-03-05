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
import { useToast } from "@/components/ui/use-toast"
import { ApplicationDetailsDialog } from "@/components/club/ApplicationDetailsDialog"
import { 
  Loader2, 
  FileText,
  Eye,
  MapPin,
  Calendar,
  Target
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

const statusSteps = [
  { value: "SUBMITTED", label: "Nouvelle", color: "bg-blue-100 text-blue-700" },
  { value: "UNDER_REVIEW", label: "En cours", color: "bg-yellow-100 text-yellow-700" },
  { value: "SHORTLISTED", label: "Shortlisté", color: "bg-purple-100 text-purple-700" },
  { value: "TRIAL", label: "Essai", color: "bg-orange-100 text-orange-700" },
  { value: "ACCEPTED", label: "Accepté", color: "bg-green-100 text-green-700" },
  { value: "SIGNED", label: "Signé", color: "bg-green-600 text-white" },
  { value: "REJECTED", label: "Refusé", color: "bg-red-100 text-red-700" },
]

export default function ClubApplicationsPage() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Charger les candidatures
  useEffect(() => {
    async function loadApplications() {
      try {
        const response = await fetch("/api/applications")
        if (!response.ok) throw new Error("Erreur de chargement")

        const data = await response.json()
        setApplications(data.applications || [])
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les candidatures",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadApplications()
  }, [toast])

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application)
    setDialogOpen(true)
  }

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Erreur")

      const updatedAt = new Date().toISOString()

      setApplications(
        applications.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus, updatedAt } : app
        )
      )

      if (selectedApplication?.id === applicationId) {
        setSelectedApplication((prev) =>
          prev ? { ...prev, status: newStatus, updatedAt } : prev
        )
      }

      toast({
        title: "Statut mis à jour",
        description: `Candidature passée en "${statusSteps.find((s) => s.value === newStatus)?.label || newStatus}"`,
      })
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

  const formatAge = (dateOfBirth: string | null | undefined): string => {
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

  // Grouper par statut
  const applicationsByStatus = applications.reduce((acc, app) => {
    if (!acc[app.status]) acc[app.status] = []
    acc[app.status].push(app)
    return acc
  }, {} as Record<string, Application[]>)

  // Statuts du pipeline
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
        <h1 className="text-3xl font-bold">Candidatures</h1>
        <p className="text-gray-600 mt-1">
          Gérez le pipeline de recrutement ({applications.length} candidature(s))
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
              {applicationsByStatus.SUBMITTED?.length || 0}
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
              {applicationsByStatus.UNDER_REVIEW?.length || 0}
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
              {applicationsByStatus.SHORTLISTED?.length || 0}
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
              {applicationsByStatus.SIGNED?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">Aucune candidature</p>
            <p className="text-sm text-gray-500">
              Publiez des annonces pour recevoir des candidatures
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pipelineStatuses.map((status) => {
            const apps = applicationsByStatus[status]
            if (!apps || apps.length === 0) return null

            const statusInfo = statusSteps.find((s) => s.value === status)!

            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xl font-semibold">{statusInfo.label}</h2>
                  <Badge variant="outline">{apps.length}</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {apps.map((application) => (
                    <Card key={application.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {application.playerProfile.firstName}{" "}
                              {application.playerProfile.lastName}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {application.playerProfile.primaryPosition || "Poste non renseigné"} •{" "}
                              {formatAge(application.playerProfile.dateOfBirth)}
                            </CardDescription>
                          </div>
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            {application.playerProfile.nationality}
                          </div>

                          {application.playerProfile.currentClub && (
                            <p className="text-sm text-gray-600">
                              {application.playerProfile.currentClub}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Target className="h-4 w-4" />
                            {application.listing.title}
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            {new Date(application.createdAt).toLocaleDateString("fr-FR")}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-3"
                            onClick={() => handleViewDetails(application)}
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

          {/* Candidatures refusées */}
          {applicationsByStatus.REJECTED && applicationsByStatus.REJECTED.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xl font-semibold">Refusées</h2>
                <Badge variant="outline">{applicationsByStatus.REJECTED.length}</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {applicationsByStatus.REJECTED.map((application) => (
                  <Card key={application.id} className="opacity-60">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {application.playerProfile.firstName}{" "}
                        {application.playerProfile.lastName}
                      </CardTitle>
                      <CardDescription>
                        {application.playerProfile.primaryPosition}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ApplicationDetailsDialog
        application={selectedApplication}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onStatusUpdate={handleStatusUpdate}
        updatingStatus={updatingStatus}
      />
    </div>
  )
}
