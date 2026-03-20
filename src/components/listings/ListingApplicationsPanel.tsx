"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Users,
  Loader2,
  ChevronRight,
  FileText,
  ExternalLink,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ApplicationDetailsDialog } from "@/components/club/ApplicationDetailsDialog"

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Brouillon", className: "bg-slate-100 text-slate-700 border-slate-200" },
  SUBMITTED: { label: "Nouvelle", className: "bg-sky-50 text-sky-800 border-sky-200" },
  UNDER_REVIEW: { label: "En cours", className: "bg-amber-50 text-amber-900 border-amber-200" },
  SHORTLISTED: { label: "Shortlist", className: "bg-violet-50 text-violet-800 border-violet-200" },
  TRIAL: { label: "Essai", className: "bg-orange-50 text-orange-900 border-orange-200" },
  REJECTED: { label: "Refusé", className: "bg-red-50 text-red-800 border-red-200" },
  ACCEPTED: { label: "Accepté", className: "bg-emerald-50 text-emerald-900 border-emerald-200" },
  SIGNED: { label: "Signé", className: "bg-green-600 text-white border-green-700" },
}

type ApplicationRow = {
  id: string
  status: string
  coverLetter?: string | null
  createdAt: string
  updatedAt?: string
  playerProfile: {
    id: string
    userId: string
    firstName: string
    lastName: string
    displayName?: string | null
    profilePicture?: string | null
    primaryPosition: string
    nationality: string
    dateOfBirth: string
    currentClub?: string | null
  }
}

type DialogApplication = {
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
  listing: { id: string; title: string; position: string }
}

export function ListingApplicationsPanel({
  listingId,
  listingTitle,
  listingPosition,
}: {
  listingId: string
  listingTitle: string | null
  listingPosition: string
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<ApplicationRow[]>([])
  const [error, setError] = useState(false)
  const [selected, setSelected] = useState<ApplicationRow | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/listings/${listingId}/applications`)
      if (!res.ok) {
        setError(true)
        return
      }
      const data = await res.json()
      setApplications(data.applications ?? [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [listingId])

  useEffect(() => {
    load()
  }, [load])

  const toDialogApplication = (app: ApplicationRow): DialogApplication => ({
    id: app.id,
    status: app.status,
    coverLetter: app.coverLetter ?? undefined,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
    playerProfile: {
      id: app.playerProfile.id,
      firstName: app.playerProfile.firstName,
      lastName: app.playerProfile.lastName,
      primaryPosition: app.playerProfile.primaryPosition,
      nationality: app.playerProfile.nationality,
      currentClub: app.playerProfile.currentClub ?? undefined,
      dateOfBirth: app.playerProfile.dateOfBirth,
    },
    listing: {
      id: listingId,
      title: listingTitle ?? "—",
      position: listingPosition,
    },
  })

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? "Mise à jour impossible")
      }
      const updatedAt = new Date().toISOString()
      setApplications((prev) =>
        prev.map((a) =>
          a.id === applicationId ? { ...a, status: newStatus, updatedAt } : a
        )
      )
      setSelected((prev) =>
        prev?.id === applicationId ? { ...prev, status: newStatus, updatedAt } : prev
      )
      toast({ title: "Statut mis à jour" })
    } catch (e: unknown) {
      toast({
        title: "Erreur",
        description: e instanceof Error ? e.message : "Action impossible",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const openDetail = (app: ApplicationRow) => {
    setSelected(app)
    setDialogOpen(true)
  }

  return (
    <section className="mt-10 scroll-mt-8" id="candidatures">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-600" />
            Candidatures
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Joueurs ayant postulé à cette annonce ({applications.length})
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="shrink-0">
          <Link href="/club/applications">
            Toutes les candidatures
            <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
          </Link>
        </Button>
      </div>

      <Card className="border-slate-200/80 shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/80 py-4">
          <CardTitle className="text-base font-semibold text-slate-800">Liste</CardTitle>
          <CardDescription className="text-xs">
            Ouvrez une candidature pour la traiter ou mettre à jour le statut.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-500 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Chargement…
            </div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-red-600">
              Impossible de charger les candidatures.
            </div>
          ) : applications.length === 0 ? (
            <div className="py-14 px-6 text-center">
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">Aucune candidature pour le moment</p>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Les candidatures reçues apparaîtront ici dès qu&apos;un joueur postulera.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {applications.map((app) => {
                const p = app.playerProfile
                const name =
                  p.displayName?.trim() ||
                  [p.firstName, p.lastName].filter(Boolean).join(" ") ||
                  "Joueur"
                const initials =
                  `${p.firstName?.[0] ?? ""}${p.lastName?.[0] ?? ""}`.toUpperCase() || "?"
                const st = STATUS_LABEL[app.status] ?? STATUS_LABEL.SUBMITTED

                return (
                  <li key={app.id}>
                    <button
                      type="button"
                      onClick={() => openDetail(app)}
                      className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-slate-50/80 transition-colors group"
                    >
                      <Avatar className="h-11 w-11 border border-slate-200">
                        {p.profilePicture ? (
                          <AvatarImage src={p.profilePicture} alt="" />
                        ) : null}
                        <AvatarFallback className="bg-emerald-100 text-emerald-800 text-sm font-medium">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-900 truncate">{name}</span>
                          <Badge variant="outline" className={`text-[10px] font-medium ${st.className}`}>
                            {st.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 truncate">
                          {p.primaryPosition}
                          {p.currentClub ? ` · ${p.currentClub}` : ""}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatDistanceToNow(new Date(app.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-600 shrink-0" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <ApplicationDetailsDialog
        application={selected ? toDialogApplication(selected) : null}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) {
            setSelected(null)
            load()
          }
        }}
        onStatusUpdate={handleStatusUpdate}
        updatingStatus={updatingStatus}
      />
    </section>
  )
}
