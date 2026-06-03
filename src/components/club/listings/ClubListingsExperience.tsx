"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { KPIStatCard } from "@/components/club/teams/KPIStatCard"
import { ListingCard } from "@/components/club/listings/ListingCard"
import {
  ListingFormDialog,
  type ListingFormData,
} from "@/components/club/listings/ListingFormDialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  listingTemplateToFormSeed,
  type ListingTemplate,
} from "@/lib/club/listing-templates"
import { ListingTemplatesSection } from "@/components/club/listings/ListingTemplatesSection"
import {
  buildRecruitmentSteps,
  computeListingKpis,
  LISTING_KPI_CONFIG,
  recruitmentProgressPercent,
  type ClubListing,
  type ClubProfileSetupSnapshot,
} from "@/lib/club/listings"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  Check,
  Circle,
  ClipboardList,
  ContactRound,
  Loader2,
  Megaphone,
  PersonStanding,
  Plus,
  Settings2,
  Target,
  Users,
} from "lucide-react"

interface ClubTeam {
  id: string
  name: string
  level: string
}

function RecruitmentIllustration({
  variant = "hero",
}: {
  variant?: "hero" | "empty"
}) {
  const isEmpty = variant === "empty"
  const cellClass = isEmpty ? "h-9 w-9 rounded-lg" : "h-10 w-10 rounded-xl"
  const iconClass = isEmpty ? "h-4 w-4" : "h-5 w-5"

  return (
    <div
      className={cn(
        "relative mx-auto shrink-0",
        isEmpty ? "h-[7.25rem] w-[7.25rem]" : "h-32 w-32 sm:h-36 sm:w-36"
      )}
      aria-hidden
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pitch-100 to-pitch-50" />
      <div className="absolute inset-2 rounded-full border border-pitch-200/60" />
      <div
        className={cn(
          "relative grid h-full w-full grid-cols-2 place-items-center",
          isEmpty ? "gap-1.5 p-3" : "gap-2 p-4"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center bg-white shadow-sm",
            cellClass
          )}
        >
          <Target className={cn(iconClass, "text-pitch-600")} />
        </div>
        <div
          className={cn(
            "flex items-center justify-center bg-white shadow-sm",
            cellClass
          )}
        >
          <PersonStanding className={cn(iconClass, "text-pitch-600")} />
        </div>
        <div
          className={cn(
            "flex items-center justify-center bg-white shadow-sm",
            cellClass
          )}
        >
          <ContactRound className={cn(iconClass, "text-blue-600")} />
        </div>
        <div
          className={cn(
            "flex items-center justify-center bg-white shadow-sm",
            cellClass
          )}
        >
          <Users className={cn(iconClass, "text-violet-600")} />
        </div>
      </div>
    </div>
  )
}

function ProgressCard({
  steps,
  percent,
  className,
}: {
  steps: ReturnType<typeof buildRecruitmentSteps>
  percent: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-stadium-200 bg-white p-5 shadow-sm",
        "animate-in fade-in duration-200",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stadium-500">
            Configuration Recrutement
          </p>
          <p className="mt-0.5 text-2xl font-bold text-pitch-600">{percent}%</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pitch-50">
          <Settings2 className="h-5 w-5 text-pitch-600" />
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-stadium-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pitch-500 to-pitch-600 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="mt-4 space-y-2">
        {steps.map((step) => (
          <li key={step.id} className="flex items-center gap-2 text-sm">
            {step.done ? (
              <Check className="h-4 w-4 shrink-0 text-pitch-600" />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-stadium-300" />
            )}
            <span
              className={cn(
                step.done ? "text-stadium-700" : "text-stadium-500"
              )}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ListingsSidebar({
  steps,
  progressPercent,
  showOnboardingAssistant,
  onCreateTeam,
}: {
  steps: ReturnType<typeof buildRecruitmentSteps>
  progressPercent: number
  showOnboardingAssistant: boolean
  onCreateTeam: () => void
}) {
  return (
    <aside className="order-1 space-y-4 lg:order-2 lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:self-start">
      <ProgressCard steps={steps} percent={progressPercent} />
      {showOnboardingAssistant && (
        <OnboardingAssistantCard onCreateTeam={onCreateTeam} />
      )}
    </aside>
  )
}

function OnboardingAssistantCard({ onCreateTeam }: { onCreateTeam: () => void }) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-stadium-200 bg-white shadow-sm",
        "animate-in fade-in slide-in-from-bottom-2 duration-200"
      )}
    >
      <div className="flex flex-col gap-5 p-5">
        <RecruitmentIllustration variant="empty" />
        <div className="w-full min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-pitch-50 px-3 py-1 text-xs font-semibold text-pitch-700">
            <Megaphone className="h-3.5 w-3.5" />
            Lancez votre recrutement
          </div>
          <h2 className="text-lg font-bold text-stadium-900">
            Avant de publier une annonce, créez au moins une équipe
          </h2>
          <p className="mt-2 text-sm text-stadium-600">
            Une fois votre équipe créée, vous pourrez :
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-stadium-700">
            {[
              "Rechercher des joueurs",
              "Recruter du staff",
              "Publier des annonces",
              "Recevoir des candidatures",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-pitch-500" />
                {item}
              </li>
            ))}
          </ul>
          <Button size="lg" className="mt-5 w-full" onClick={onCreateTeam}>
            Créer ma première équipe
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}

function ListingsEmptyState({
  hasTeams,
  showPrimaryCta,
  onPrimaryAction,
}: {
  hasTeams: boolean
  showPrimaryCta: boolean
  onPrimaryAction: () => void
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-stadium-200 bg-white px-6 py-12 shadow-sm",
        "animate-in fade-in duration-200"
      )}
    >
      <RecruitmentIllustration variant="empty" />
      <h3 className="mt-6 text-lg font-semibold text-stadium-900">
        Aucune annonce publiée
      </h3>
      <p className="mt-2 max-w-md text-center text-sm text-stadium-500">
        {hasTeams
          ? "Publiez votre première annonce pour attirer les meilleurs talents sur votre club."
          : "Commencez par créer une équipe puis publiez votre première annonce pour attirer les meilleurs talents."}
      </p>
      <div className="mt-6 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
        {showPrimaryCta &&
          (hasTeams ? (
            <Button size="lg" onClick={onPrimaryAction}>
              <Plus className="mr-2 h-4 w-4" />
              Créer ma première annonce
            </Button>
          ) : (
            <Button size="lg" onClick={onPrimaryAction}>
              Créer une équipe
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ))}
        <Button size="lg" variant="outline" asChild>
          <Link href="/club/recruitment">Découvrir le recrutement</Link>
        </Button>
      </div>
    </div>
  )
}

function FloatingNewListingButton({
  disabled,
  onClick,
}: {
  disabled: boolean
  onClick: () => void
}) {
  return (
    <div className="fixed bottom-6 right-4 z-40 sm:right-8">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={
          disabled
            ? "Créez une équipe pour publier une annonce."
            : "Nouvelle annonce"
        }
        className={cn(
          "group flex items-center gap-2 rounded-full bg-pitch-500 px-5 py-3.5 text-sm font-semibold text-white",
          "shadow-[0_8px_24px_rgba(34,197,94,0.45)] transition-all duration-200",
          "hover:bg-pitch-600 hover:shadow-[0_12px_28px_rgba(34,197,94,0.5)] hover:scale-[1.02]",
          "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-md disabled:hover:scale-100"
        )}
      >
        <Plus className="h-5 w-5" />
        <span className="hidden sm:inline">Nouvelle annonce</span>
      </button>
    </div>
  )
}

export function ClubListingsExperience() {
  const router = useRouter()
  const { toast } = useToast()
  const [listings, setListings] = useState<ClubListing[]>([])
  const [teams, setTeams] = useState<ClubTeam[]>([])
  const [viewsCount, setViewsCount] = useState(0)
  const [clubSetup, setClubSetup] = useState<ClubProfileSetupSnapshot | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingListing, setEditingListing] = useState<ClubListing | null>(null)
  const [formSeed, setFormSeed] = useState<Partial<ListingFormData> | null>(null)

  const hasTeams = teams.length > 0
  const hasListings = listings.length > 0

  const recruitmentActivityCount = useMemo(() => {
    let applications = 0
    let submissions = 0
    for (const listing of listings) {
      applications += listing._count?.applications ?? 0
      submissions += listing._count?.submissions ?? 0
    }
    return applications + submissions
  }, [listings])

  const hasPublishedListing = useMemo(
    () => listings.some((l) => l.status === "PUBLISHED"),
    [listings]
  )

  const steps = useMemo(
    () =>
      buildRecruitmentSteps({
        club: clubSetup ?? {},
        hasTeams,
        hasPublishedListing,
        hasRecruitmentActivity: recruitmentActivityCount > 0,
      }),
    [clubSetup, hasTeams, hasPublishedListing, recruitmentActivityCount]
  )

  const progressPercent = recruitmentProgressPercent(steps)
  const kpis = useMemo(
    () => computeListingKpis(listings, viewsCount),
    [listings, viewsCount]
  )

  const loadData = useCallback(async () => {
    try {
      const userResponse = await fetch("/api/users/me")
      if (!userResponse.ok) throw new Error("Erreur utilisateur")
      const userData = await userResponse.json()

      if (!userData.clubProfile) {
        setLoading(false)
        return
      }

      const club = userData.clubProfile
      const clubProfileId = club.id

      setClubSetup({
        status: club.status,
        clubName: club.clubName,
        country: club.country,
        city: club.city,
        clubType: club.clubType,
        foundedYear: club.foundedYear,
        officialEmail: club.officialEmail,
        officialPhone: club.officialPhone,
        address: club.address,
      })

      const [listingsRes, teamsRes] = await Promise.all([
        fetch("/api/listings?mine=1&limit=100"),
        fetch(`/api/clubs/${clubProfileId}/teams`),
      ])

      if (listingsRes.ok) {
        const listingsData = await listingsRes.json()
        setListings(listingsData.listings || [])
        setViewsCount(listingsData.meta?.viewsCount ?? 0)
      }

      if (teamsRes.ok) {
        const teamsData = await teamsRes.json()
        setTeams(teamsData.teams || [])
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const openNewListing = (seed?: Partial<ListingFormData>) => {
    if (!hasTeams) return
    setEditingListing(null)
    setFormSeed(seed ?? null)
    setDialogOpen(true)
  }

  const handleEdit = (listing: ClubListing) => {
    setFormSeed(null)
    setEditingListing(listing)
    setDialogOpen(true)
  }

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingListing(null)
      setFormSeed(null)
    }
  }

  const onSubmit = async (data: ListingFormData) => {
    setSaving(true)
    try {
      const payload = {
        ...data,
        minAge: data.minAge ? parseInt(data.minAge) : null,
        maxAge: data.maxAge ? parseInt(data.maxAge) : null,
        salaryMin: data.salaryMin ? parseInt(data.salaryMin) : null,
        salaryMax: data.salaryMax ? parseInt(data.salaryMax) : null,
        nationality: data.nationality || [],
        teamId: data.teamId || null,
      }

      const url = editingListing
        ? `/api/listings/${editingListing.id}`
        : `/api/listings`
      const method = editingListing ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const err = await response.json()
        const message =
          err.details?.length > 0
            ? `${err.error}: ${err.details.map((d: { path: string[]; message: string }) => `${d.path.join(".")} ${d.message}`).join("; ")}`
            : err.error || "Erreur lors de la sauvegarde"
        throw new Error(message)
      }

      const savedListing = await response.json()

      if (editingListing) {
        setListings((prev) =>
          prev.map((l) => (l.id === savedListing.id ? savedListing : l))
        )
        toast({ title: "Succès", description: "Annonce mise à jour" })
      } else {
        setListings((prev) => [savedListing, ...prev])
        toast({ title: "Succès", description: "Annonce créée" })
      }

      handleDialogChange(false)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur inconnue"
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async (listingId: string) => {
    try {
      const response = await fetch(`/api/listings/${listingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      })
      if (!response.ok) throw new Error("Erreur")

      setListings((prev) =>
        prev.map((l) =>
          l.id === listingId
            ? { ...l, status: "PUBLISHED", publishedAt: new Date().toISOString() }
            : l
        )
      )
      toast({ title: "Succès", description: "Annonce publiée" })
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de publier l'annonce",
        variant: "destructive",
      })
    }
  }

  const handleClose = async (listingId: string) => {
    try {
      const response = await fetch(`/api/listings/${listingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CLOSED" }),
      })
      if (!response.ok) throw new Error("Erreur")

      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: "CLOSED" } : l))
      )
      toast({ title: "Succès", description: "Annonce fermée" })
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de fermer l'annonce",
        variant: "destructive",
      })
    }
  }

  const handleUseTemplate = (template: ListingTemplate) => {
    if (!hasTeams) return
    openNewListing(listingTemplateToFormSeed(template))
  }

  const goToCreateTeam = () => router.push("/club/teams/new")

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pitch-500" />
      </div>
    )
  }

  const showOnboardingAssistant = !hasTeams
  const showEmptyState = !hasListings

  return (
    <div className="container mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 sm:py-8">
      <header className="mb-8 animate-in fade-in duration-200">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pitch-500 to-pitch-600 text-white shadow-sm">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stadium-900 sm:text-3xl">
              Mes Annonces
            </h1>
            <p className="mt-1 max-w-xl text-sm text-stadium-500">
              Publiez vos besoins de recrutement et recevez des candidatures
              qualifiées.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] lg:items-start">
        <div className="order-2 min-w-0 space-y-8 lg:order-1 lg:col-start-1">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-2 xl:grid-cols-4">
            {LISTING_KPI_CONFIG.map((config, index) => {
              const Icon = config.icon
              const value = kpis[config.key]
              return (
                <div
                  key={config.key}
                  className="animate-in fade-in duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <KPIStatCard
                    label={config.label}
                    value={value}
                    icon={Icon}
                    iconClassName={config.iconClassName}
                  />
                </div>
              )
            })}
          </div>

          {showEmptyState ? (
            <div className="space-y-10">
              <ListingsEmptyState
                hasTeams={hasTeams}
                showPrimaryCta={hasTeams}
                onPrimaryAction={() => openNewListing()}
              />

              <ListingTemplatesSection
                className="animate-in fade-in duration-200"
                hasTeams={hasTeams}
                onUseTemplate={handleUseTemplate}
              />
            </div>
          ) : (
            <section className="space-y-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-stadium-900">
                  Vos annonces
                </h2>
                <Badge
                  variant="outline"
                  className="border-stadium-200 text-stadium-600"
                >
                  {listings.length} annonce{listings.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onEdit={handleEdit}
                  onPublish={handlePublish}
                  onClose={handleClose}
                  className="animate-in fade-in duration-200"
                />
              ))}

              <ListingTemplatesSection
                className="mt-10"
                hasTeams={hasTeams}
                onUseTemplate={handleUseTemplate}
              />
            </section>
          )}
        </div>

        <ListingsSidebar
          steps={steps}
          progressPercent={progressPercent}
          showOnboardingAssistant={showOnboardingAssistant}
          onCreateTeam={goToCreateTeam}
        />
      </div>

      <ListingFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogChange}
        teams={teams}
        editingListing={editingListing}
        saving={saving}
        onSubmit={onSubmit}
        seed={formSeed}
      />

      <FloatingNewListingButton
        disabled={!hasTeams}
        onClick={() => openNewListing()}
      />
    </div>
  )
}
