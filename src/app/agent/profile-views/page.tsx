"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  Eye,
  Users,
  Briefcase,
  Building2,
  Shield,
  MessageCircle,
  Crown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface ProfileView {
  id: string
  viewerRole: string
  createdAt: string
  viewer?: {
    id: string
    name?: string
    role: string
    image?: string
    playerProfile?: {
      firstName: string
      lastName: string
      profilePicture?: string
    }
    agentProfile?: {
      firstName: string
      lastName: string
      profilePicture?: string
    }
    clubProfile?: {
      clubName: string
      logo?: string
    }
  }
}

const ROLE_ICONS: Record<string, any> = {
  PLAYER: Users,
  AGENT: Briefcase,
  CLUB: Building2,
  CLUB_STAFF: Shield,
}

const ROLE_LABELS: Record<string, string> = {
  PLAYER: "Joueur",
  AGENT: "Agent",
  CLUB: "Club",
  CLUB_STAFF: "Staff",
}

function getViewerDisplayName(view: ProfileView): string {
  if (!view.viewer) return `Un ${ROLE_LABELS[view.viewerRole]?.toLowerCase() || "utilisateur"}`

  const { viewer } = view
  if (viewer.playerProfile) {
    return `${viewer.playerProfile.firstName} ${viewer.playerProfile.lastName}`
  }
  if (viewer.agentProfile) {
    return `${viewer.agentProfile.firstName} ${viewer.agentProfile.lastName}`
  }
  if (viewer.clubProfile) {
    return viewer.clubProfile.clubName
  }
  return viewer.name || "Utilisateur"
}

function getViewerPhoto(view: ProfileView): string | null {
  if (!view.viewer) return null
  const { viewer } = view
  if (viewer.playerProfile?.profilePicture) return viewer.playerProfile.profilePicture
  if (viewer.agentProfile?.profilePicture) return viewer.agentProfile.profilePicture
  if (viewer.clubProfile?.logo) return viewer.clubProfile.logo
  return viewer.image || null
}

export default function AgentProfileViewsPage() {
  const { toast } = useToast()
  const [views, setViews] = useState<ProfileView[]>([])
  const [loading, setLoading] = useState(true)
  const [canReveal, setCanReveal] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 20

  useEffect(() => {
    async function loadViews() {
      setLoading(true)
      try {
        const response = await fetch(`/api/profile-views?page=${page}&limit=${limit}`)
        if (!response.ok) throw new Error("Erreur")

        const data = await response.json()
        setViews(data.views || [])
        setTotal(data.total || 0)
        setCanReveal(data.canReveal || false)
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de charger les consultations",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadViews()
  }, [page, toast])

  const totalPages = Math.ceil(total / limit)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Consultations de profil</h1>
          <p className="text-gray-600 mt-1">
            {total > 0
              ? `${total} consultation${total > 1 ? "s" : ""} au total`
              : "Aucune consultation pour le moment"}
          </p>
        </div>
      </div>

      {/* Bannière upgrade si pas de reveal */}
      {!canReveal && views.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardContent className="flex items-center gap-4 py-4">
            <Crown className="h-8 w-8 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900">
                Qui consulte votre profil ?
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Passez au plan Growth pour voir l&apos;identit&eacute; des visiteurs et les contacter directement.
              </p>
            </div>
            <Link href="/pricing">
              <Button className="bg-amber-500 hover:bg-amber-600 text-white shrink-0">
                Voir les plans
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {views.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Eye className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">Aucune consultation de profil</p>
            <p className="text-sm text-gray-400 mt-1">
              Les consultations de votre profil apparaitront ici
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {views.map((view) => {
            const RoleIcon = ROLE_ICONS[view.viewerRole] || Users
            const displayName = getViewerDisplayName(view)
            const photo = getViewerPhoto(view)
            const roleLabel = ROLE_LABELS[view.viewerRole] || "Utilisateur"

            return (
              <Card key={view.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {canReveal && photo ? (
                        <div className="relative h-10 w-10 rounded-full overflow-hidden">
                          <Image
                            src={photo}
                            alt={displayName}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <RoleIcon className="h-5 w-5 text-gray-500" />
                        </div>
                      )}

                      <div>
                        <CardTitle className="text-base">
                          {canReveal ? displayName : `Un ${roleLabel.toLowerCase()}`}
                        </CardTitle>
                        <CardDescription className="mt-0.5">
                          <Badge variant="outline" className="text-xs">
                            {roleLabel}
                          </Badge>
                          <span className="ml-2 text-xs text-gray-500">
                            {new Date(view.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {canReveal && view.viewer?.id && (
                        <>
                          <Link href={`/profile/${view.viewer.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="mr-2 h-4 w-4" />
                              Profil
                            </Button>
                          </Link>
                          <Link href={`/agent/messages?contact=${view.viewer.id}`}>
                            <Button size="sm">
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Contacter
                            </Button>
                          </Link>
                        </>
                      )}
                      {!canReveal && (
                        <Link href="/pricing">
                          <Button size="sm" variant="ghost" className="text-amber-600">
                            <Crown className="mr-2 h-4 w-4" />
                            Voir qui
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
