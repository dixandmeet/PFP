"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type { Role } from "@prisma/client"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { OpportunityPreview as PlayerOpportunityPreview } from "@/app/player/opportunities/components/OpportunityPreview"
import { OpportunityPreview as AgentOpportunityPreview } from "@/app/agent/opportunities/components/AgentOpportunityPreview"
import type { Listing as PlayerListing } from "@/app/player/opportunities/types"
import { ListingOwnerLayout } from "@/components/listings/ListingOwnerLayout"
import { ListingApplicationsPanel } from "@/components/listings/ListingApplicationsPanel"

interface AgentListing {
  id: string
  title: string
  description: string | null
  position: string
  minAge?: number | null
  maxAge?: number | null
  nationality: string[]
  salaryMin?: number | null
  salaryMax?: number | null
  currency: string
  contractType?: string | null
  startDate?: string | null
  publishedAt: string
  clubProfile: {
    id: string
    clubName: string
    country: string
    city?: string
    logo?: string
    league?: string
  }
  consulted?: boolean
  consultationCost?: number
}

function normalizePlayerListing(raw: Record<string, unknown>): PlayerListing {
  const club = raw.clubProfile as Record<string, unknown> | undefined
  return {
    id: raw.id as string,
    title: (raw.title as string) ?? null,
    description: (raw.description as string | null) ?? null,
    position: raw.position as string,
    minAge: raw.minAge as number | null | undefined,
    maxAge: raw.maxAge as number | null | undefined,
    nationality: Array.isArray(raw.nationality) ? (raw.nationality as string[]) : [],
    salaryMin: raw.salaryMin as number | null | undefined,
    salaryMax: raw.salaryMax as number | null | undefined,
    currency: (raw.currency as string | null) ?? "EUR",
    contractType: raw.contractType as string | null | undefined,
    startDate: raw.startDate as string | null | undefined,
    publishedAt: (raw.publishedAt as string | null) ?? null,
    clubProfile: {
      id: (club?.id as string) ?? "",
      clubName: (club?.clubName as string | null) ?? null,
      country: (club?.country as string | null) ?? null,
      city: club?.city as string | null | undefined,
      logo: club?.logo as string | null | undefined,
      league: club?.league as string | null | undefined,
    },
    consulted: raw.consulted as boolean | undefined,
    consultationCost: raw.consultationCost as number | undefined,
  }
}

function toAgentListing(pl: PlayerListing): AgentListing {
  return {
    ...pl,
    title: pl.title ?? "",
    description: pl.description,
    position: pl.position,
    nationality: pl.nationality,
    currency: pl.currency ?? "EUR",
    publishedAt: pl.publishedAt ?? "",
    clubProfile: {
      id: pl.clubProfile.id,
      clubName: pl.clubProfile.clubName ?? "",
      country: pl.clubProfile.country ?? "",
      city: pl.clubProfile.city ?? undefined,
      logo: pl.clubProfile.logo ?? undefined,
      league: pl.clubProfile.league ?? undefined,
    },
  }
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/90">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</div>
    </div>
  )
}

export function ListingDetailClient({
  listingId,
  userId,
  userRole,
  canViewApplications,
}: {
  listingId: string
  userId: string | null
  userRole: Role | null
  canViewApplications: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [listing, setListing] = useState<PlayerListing | null>(null)
  const [listingStatus, setListingStatus] = useState<string | null>(null)
  const [requirements, setRequirements] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [clubUserId, setClubUserId] = useState<string | null>(null)

  const loadListing = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    try {
      const res = await fetch(`/api/listings/${listingId}`)
      if (res.status === 404) {
        setListing(null)
        setClubUserId(null)
        setLoadError(true)
        return
      }
      if (!res.ok) throw new Error("fetch")
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const club = data.clubProfile as { userId?: string } | undefined
      setClubUserId(club?.userId ?? null)
      setListingStatus((data.status as string) ?? null)
      setRequirements(typeof data.requirements === "string" ? data.requirements : null)
      setListing(normalizePlayerListing(data as Record<string, unknown>))
    } catch {
      setLoadError(true)
      setListing(null)
      setClubUserId(null)
    } finally {
      setLoading(false)
    }
  }, [listingId])

  useEffect(() => {
    loadListing()
  }, [loadListing])

  useEffect(() => {
    if (!userId || userRole !== "PLAYER") {
      setHasApplied(false)
      return
    }
    ;(async () => {
      try {
        const res = await fetch("/api/applications")
        if (!res.ok) return
        const data = await res.json()
        const ids = new Set<string>(
          (data.applications as { listingId: string }[])?.map((a) => a.listingId) ?? []
        )
        setHasApplied(ids.has(listingId))
      } catch {
        /* ignore */
      }
    })()
  }, [userId, userRole, listingId])

  const handleConsult = async (l: PlayerListing): Promise<boolean> => {
    if (!userId) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
      return false
    }
    try {
      const res = await fetch(`/api/credits/listings/${l.id}/consult`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (res.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
        return false
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 402) {
          toast({
            title: "Solde insuffisant",
            description: `Il vous faut ${(data as { cost?: number }).cost ?? "?"} crédits pour consulter cette annonce.`,
            variant: "destructive",
          })
          return false
        }
        toast({
          title: "Erreur",
          description: (data as { error?: string }).error ?? "Impossible de consulter cette annonce",
          variant: "destructive",
        })
        return false
      }

      const data = await res.json()
      if (data.success || data.alreadyConsulted) {
        if (!data.alreadyConsulted) {
          toast({
            title: "Annonce consultée",
            description:
              typeof data.cost === "number" && data.cost > 0
                ? `${data.cost} crédits débités`
                : undefined,
          })
        }
        await loadListing()
        return true
      }
      return false
    } catch {
      toast({ title: "Erreur", description: "Erreur réseau", variant: "destructive" })
      return false
    }
  }

  const isOwner = !!userId && !!clubUserId && userId === clubUserId

  const handlePlayerApply = (l: PlayerListing) => {
    router.push("/player/opportunities")
    toast({
      title: "Candidature",
      description: `Retrouvez « ${l.title ?? "cette annonce"} » dans Opportunités pour postuler.`,
    })
  }

  const handleAgentSubmit = (l: AgentListing) => {
    router.push("/agent/opportunities")
    toast({
      title: "Soumission",
      description: `Retrouvez « ${l.title} » dans les opportunités agent pour soumettre un joueur.`,
    })
  }

  if (loading && !listing) {
    return (
      <PageShell>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-500">Chargement de l&apos;annonce…</p>
        </div>
      </PageShell>
    )
  }

  if (loadError || !listing) {
    return (
      <PageShell>
        <div className="mx-auto max-w-lg py-16 text-center space-y-4">
          <p className="text-lg font-semibold text-slate-900">Annonce introuvable</p>
          <p className="text-sm text-slate-600">
            Cette annonce n&apos;existe pas, n&apos;est plus publiée ou vous n&apos;y avez pas accès.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
        </div>
      </PageShell>
    )
  }

  const role = userRole
  const locked = listing.consulted === false
  const agentListing = toAgentListing(listing)

  const previewLocked =
    role === "AGENT" ? (
      <AgentOpportunityPreview
        listing={agentListing}
        onSubmitPlayer={handleAgentSubmit}
        onConsult={handleConsult}
      />
    ) : (
      <PlayerOpportunityPreview
        listing={listing}
        hasApplied={hasApplied}
        onApply={handlePlayerApply}
        onConsult={handleConsult}
      />
    )

  const previewPlayerAgent =
    role === "AGENT" ? (
      <AgentOpportunityPreview
        listing={agentListing}
        onSubmitPlayer={handleAgentSubmit}
        onConsult={handleConsult}
      />
    ) : (
      <PlayerOpportunityPreview
        listing={listing}
        hasApplied={hasApplied}
        onApply={handlePlayerApply}
        onConsult={handleConsult}
      />
    )

  const resolveViewer = (): "owner" | "admin" | "visitor" => {
    if (isOwner) return "owner"
    if (userRole === "ADMIN") return "admin"
    return "visitor"
  }

  const showManagementLayout =
    !locked && role !== "AGENT" && role !== "PLAYER"

  const showApplications = Boolean(
    canViewApplications && listing.consulted !== false
  )

  let mainContent: ReactNode

  if (locked) {
    mainContent = previewLocked
  } else if (role === "AGENT") {
    mainContent = previewPlayerAgent
  } else if (role === "PLAYER") {
    mainContent = previewPlayerAgent
  } else if (showManagementLayout) {
    mainContent = (
      <>
        <ListingOwnerLayout
          listing={listing}
          listingStatus={listingStatus}
          requirements={requirements}
          viewer={resolveViewer()}
        />
        {showApplications ? (
          <ListingApplicationsPanel
            listingId={listingId}
            listingTitle={listing.title}
            listingPosition={listing.position}
          />
        ) : null}
      </>
    )
  } else {
    mainContent = previewPlayerAgent
  }

  return (
    <PageShell>
      <nav className="mb-8 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-slate-600 hover:text-slate-900">
          <Link href="/">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Accueil
          </Link>
        </Button>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-medium text-slate-500 truncate">Annonce</span>
      </nav>

      {mainContent}
    </PageShell>
  )
}
