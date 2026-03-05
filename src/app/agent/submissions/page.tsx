"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Eye,
  Building2,
  User,
  Calendar,
  Target
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

const statusConfig: Record<string, { label: string; color: string }> = {
  SUBMITTED: { label: "Envoyée", color: "bg-blue-100 text-blue-700" },
  UNDER_REVIEW: { label: "En cours", color: "bg-yellow-100 text-yellow-700" },
  SHORTLISTED: { label: "Shortlisté", color: "bg-purple-100 text-purple-700" },
  TRIAL: { label: "Essai", color: "bg-orange-100 text-orange-700" },
  REJECTED: { label: "Refusée", color: "bg-red-100 text-red-700" },
  ACCEPTED: { label: "Acceptée", color: "bg-green-100 text-green-700" },
  SIGNED: { label: "Signé", color: "bg-green-600 text-white" },
}

export default function AgentSubmissionsPage() {
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [myPlayers, setMyPlayers] = useState<Player[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

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

  // Charger les données
  useEffect(() => {
    async function loadData() {
      try {
        // Charger les soumissions
        const submissionsResponse = await fetch("/api/submissions")
        if (submissionsResponse.ok) {
          const submissionsData = await submissionsResponse.json()
          setSubmissions(submissionsData.submissions || [])
        }

        // Charger mes joueurs (avec mandats actifs)
        const mandatesResponse = await fetch("/api/mandates?status=ACTIVE")
        if (mandatesResponse.ok) {
          const mandatesData = await mandatesResponse.json()
          const players = mandatesData.mandates?.map((m: any) => ({
            id: m.playerProfile.id,
            firstName: m.playerProfile.firstName,
            lastName: m.playerProfile.lastName,
            primaryPosition: m.playerProfile.primaryPosition,
          })) || []
          setMyPlayers(players)
        }

        // Charger les clubs
        const clubsResponse = await fetch("/api/clubs?limit=50")
        if (clubsResponse.ok) {
          const clubsData = await clubsResponse.json()
          setClubs(clubsData.clubs || [])
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

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
        const error = await response.json()
        throw new Error(error.error || "Erreur")
      }

      const newSubmission = await response.json()
      setSubmissions([newSubmission, ...submissions])

      toast({
        title: "Succès",
        description: "Soumission envoyée au club",
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

  const submissionsByStatus = submissions.reduce((acc, sub) => {
    if (!acc[sub.status]) acc[sub.status] = []
    acc[sub.status].push(sub)
    return acc
  }, {} as Record<string, Submission[]>)

  const statusOrder = ["SUBMITTED", "UNDER_REVIEW", "SHORTLISTED", "TRIAL", "ACCEPTED", "SIGNED"]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mes Soumissions</h1>
          <p className="text-gray-600 mt-1">
            Proposez vos joueurs aux clubs ({submissions.length} soumission(s))
          </p>
        </div>

        <Button onClick={() => setDialogOpen(true)} disabled={myPlayers.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle soumission
        </Button>
      </div>

      {myPlayers.length === 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">Aucun joueur sous mandat</CardTitle>
            <CardDescription className="text-orange-700">
              Vous devez avoir un mandat actif avec un joueur pour créer une soumission
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
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
              {(submissionsByStatus.SUBMITTED?.length || 0) +
                (submissionsByStatus.UNDER_REVIEW?.length || 0)}
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

      {/* Liste des soumissions */}
      {submissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Send className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">Aucune soumission</p>
            {myPlayers.length > 0 && (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Créer votre première soumission
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {statusOrder.map((status) => {
            const subs = submissionsByStatus[status]
            if (!subs || subs.length === 0) return null

            const config = statusConfig[status]

            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xl font-semibold">{config.label}</h2>
                  <Badge variant="outline">{subs.length}</Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {subs.map((submission) => (
                    <Card key={submission.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {submission.playerData.firstName}{" "}
                              {submission.playerData.lastName}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {submission.playerData.primaryPosition}
                            </CardDescription>
                          </div>
                          <Badge className={config.color}>
                            {config.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">
                              {submission.clubProfile.clubName}
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
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Dialog création soumission */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle soumission</DialogTitle>
            <DialogDescription>
              Proposez un joueur à un club
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="playerProfileId">Joueur sous mandat *</Label>
              <Select
                onValueChange={(value) => setValue("playerProfileId", value)}
                defaultValue={watch("playerProfileId")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {myPlayers.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.firstName} {player.lastName} - {player.primaryPosition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.playerProfileId && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.playerProfileId.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="clubProfileId">Club ciblé *</Label>
              <Select
                onValueChange={(value) => setValue("clubProfileId", value)}
                defaultValue={watch("clubProfileId")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id}>
                      {club.clubName} ({club.country})
                      {club.activeListingsCount > 0 &&
                        ` - ${club.activeListingsCount} annonce(s)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clubProfileId && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.clubProfileId.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="message">Message de présentation</Label>
              <Textarea
                id="message"
                {...register("message")}
                placeholder="Présentez votre joueur, ses points forts, pourquoi il correspond au club..."
                rows={5}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                Un snapshot du profil du joueur sera joint automatiquement
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={saving}>
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
