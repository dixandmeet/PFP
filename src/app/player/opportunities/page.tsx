"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  Search,
  MapPin,
  Building2,
  FileText,
  CheckCircle,
  Target,
  Calendar,
  Eye,
  Briefcase,
  AlertCircle,
  RefreshCw,
  XCircle,
  X,
  Send,
} from "lucide-react"

import { OpportunitiesHeader } from "./components/OpportunitiesHeader"
import { OpportunitiesFilters } from "./components/OpportunitiesFilters"
import { OpportunityCard } from "./components/OpportunityCard"
import { OpportunityPreview } from "./components/OpportunityPreview"
import { SkeletonOpportunityCard } from "./components/SkeletonOpportunityCard"

// ==================== TYPES ====================

import type { Listing } from "./types"

interface Application {
  id: string
  status: string
  coverLetter?: string
  createdAt: string
  updatedAt: string
  listing: {
    id: string
    title: string
    description: string
    position: string
    publishedAt: string
    clubProfile: {
      clubName: string
      country: string
      city?: string
      logo?: string
    }
  }
}

// ==================== CONSTANTS ====================

const statusConfig: Record<string, { label: string; color: string; description: string }> = {
  DRAFT: {
    label: "Brouillon",
    color: "bg-gray-100 text-gray-700",
    description: "Candidature en preparation",
  },
  SUBMITTED: {
    label: "Soumise",
    color: "bg-blue-100 text-blue-700",
    description: "Candidature envoyee au club",
  },
  UNDER_REVIEW: {
    label: "En cours",
    color: "bg-yellow-100 text-yellow-700",
    description: "Le club etudie votre profil",
  },
  SHORTLISTED: {
    label: "Shortliste",
    color: "bg-purple-100 text-purple-700",
    description: "Vous etes dans la liste restreinte",
  },
  TRIAL: {
    label: "Essai",
    color: "bg-orange-100 text-orange-700",
    description: "Periode d'essai en cours",
  },
  REJECTED: {
    label: "Refusee",
    color: "bg-red-100 text-red-700",
    description: "Candidature refusee",
  },
  ACCEPTED: {
    label: "Acceptee",
    color: "bg-green-100 text-green-700",
    description: "Offre acceptee",
  },
  SIGNED: {
    label: "Signe",
    color: "bg-green-600 text-white",
    description: "Contrat signe",
  },
}

const statusOrder = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "TRIAL",
  "ACCEPTED",
  "SIGNED",
  "REJECTED",
]

// ==================== MAIN COMPONENT ====================

export default function PlayerOpportunitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PlayerOpportunitiesContent />
    </Suspense>
  )
}

function PlayerOpportunitiesContent() {
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const initialView =
    searchParams.get("view") === "applications" ? "applications" : "opportunities"
  const [activeView, setActiveView] = useState<"opportunities" | "applications">(initialView)

  // Opportunities state
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [applying, setApplying] = useState(false)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [applyDialogOpen, setApplyDialogOpen] = useState(false)
  const [playerProfileId, setPlayerProfileId] = useState<string | null>(null)
  const [myApplications, setMyApplications] = useState<Set<string>>(new Set())

  // Preview selection (for desktop panel)
  const [previewListing, setPreviewListing] = useState<Listing | null>(null)
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false)

  // Applications state
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  // Filters
  const [position, setPosition] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("")

  const { register, handleSubmit, reset } = useForm<{
    coverLetter: string
  }>()

  // ==================== DATA LOADING ====================

  const loadAll = async () => {
    setLoading(true)
    setError(false)
    try {
      const userResponse = await fetch("/api/users/me")
      if (!userResponse.ok) throw new Error("Erreur de chargement")

      const userData = await userResponse.json()
      setPlayerProfileId(userData.playerProfile?.id || null)

      const appsResponse = await fetch("/api/applications")
      if (appsResponse.ok) {
        const appsData = await appsResponse.json()
        setApplications(appsData.applications || [])
        const appliedListingIds = new Set<string>(
          appsData.applications?.map((app: any) => app.listingId) || []
        )
        setMyApplications(appliedListingIds)
      }

      await loadListings()
    } catch (err) {
      setError(true)
      toast({
        title: "Erreur",
        description: "Impossible de charger les donnees",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const loadListings = async () => {
    try {
      const params = new URLSearchParams()
      params.append("status", "PUBLISHED")
      if (position) params.append("position", position)

      const response = await fetch(`/api/listings?${params.toString()}`)
      if (!response.ok) throw new Error("Erreur de chargement")

      const data = await response.json()
      setListings(data.listings || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (!loading) {
      loadListings()
    }
  }, [position])

  // Auto-select first listing for preview + update preview after refresh
  useEffect(() => {
    if (filteredListings.length > 0 && !previewListing) {
      setPreviewListing(filteredListings[0])
    } else if (previewListing) {
      const updated = filteredListings.find((l) => l.id === previewListing.id)
      if (updated) setPreviewListing(updated)
    }
  }, [listings])

  // ==================== HANDLERS ====================

  const handleApply = (listing: Listing) => {
    if (!playerProfileId) {
      toast({
        title: "Profil manquant",
        description: "Veuillez d'abord creer votre profil",
        variant: "destructive",
      })
      return
    }

    if (myApplications.has(listing.id)) {
      toast({
        title: "Deja postule",
        description: "Vous avez deja postule a cette annonce",
      })
      return
    }

    setSelectedListing(listing)
    setApplyDialogOpen(true)
  }

  const onSubmitApplication = async (data: { coverLetter: string }) => {
    if (!selectedListing || !playerProfileId) return

    setApplying(true)
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: selectedListing.id,
          clubProfileId: selectedListing.clubProfile?.id,
          coverLetter: data.coverLetter,
          attachments: [],
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la candidature")
      }

      toast({
        title: "Candidature envoyee",
        description: "Votre candidature a ete envoyee avec succes",
      })

      setMyApplications(new Set([...myApplications, selectedListing.id]))

      const appsResponse = await fetch("/api/applications")
      if (appsResponse.ok) {
        const appsData = await appsResponse.json()
        setApplications(appsData.applications || [])
      }

      reset()
      setApplyDialogOpen(false)
      setSelectedListing(null)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setApplying(false)
    }
  }

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application)
    setDetailDialogOpen(true)
  }

  const handleCancelApplication = async () => {
    if (!selectedApplication) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/applications/${selectedApplication.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erreur lors de l'annulation")
      }
      toast({
        title: "Candidature annulee",
        description: "Votre candidature a ete supprimee avec succes",
      })
      // Retirer de la liste locale
      setApplications((prev) => prev.filter((a) => a.id !== selectedApplication.id))
      setMyApplications((prev) => {
        const next = new Set(prev)
        next.delete(selectedApplication.listing.id)
        return next
      })
      setCancelDialogOpen(false)
      setDetailDialogOpen(false)
      setSelectedApplication(null)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setCancelling(false)
    }
  }

  const handleResetFilters = () => {
    setPosition("")
    setSearchQuery("")
    setSortBy("")
  }

  const handleConsult = async (listing: Listing): Promise<boolean> => {
    try {
      const res = await fetch(`/api/credits/listings/${listing.id}/consult`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!res.ok) {
        const data = await res.json()
        if (res.status === 402) {
          toast({
            title: "Solde insuffisant",
            description: `Il vous faut ${data.cost} credits pour consulter cette annonce`,
            variant: "destructive",
          })
          return false
        }
        toast({
          title: "Erreur",
          description: data.error || "Impossible de consulter cette annonce",
          variant: "destructive",
        })
        return false
      }

      const data = await res.json()
      if (data.success || data.alreadyConsulted) {
        await loadListings()
        if (!data.alreadyConsulted) {
          toast({
            title: "Annonce consultee",
            description: `${data.cost} credits debites`,
          })
        }
        return true
      }
      return false
    } catch {
      toast({
        title: "Erreur",
        description: "Erreur reseau",
        variant: "destructive",
      })
      return false
    }
  }

  // ==================== COMPUTED ====================

  let filteredListings = searchQuery
    ? listings.filter(
        (listing) =>
          (listing.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (listing.clubProfile.clubName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (listing.description || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : listings

  if (sortBy === "recent") {
    filteredListings = [...filteredListings].sort(
      (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
    )
  } else if (sortBy === "salary") {
    filteredListings = [...filteredListings].sort(
      (a, b) => (b.salaryMax || 0) - (a.salaryMax || 0)
    )
  }

  const applicationsByStatus = applications.reduce((acc, app) => {
    if (!acc[app.status]) {
      acc[app.status] = []
    }
    acc[app.status].push(app)
    return acc
  }, {} as Record<string, Application[]>)

  const hasActiveFilters = !!position || !!searchQuery || !!sortBy

  // ==================== RENDER ====================

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
      <OpportunitiesHeader
        activeView={activeView}
        setActiveView={setActiveView}
        listingsCount={filteredListings.length}
        applicationsCount={applications.length}
      />

      <AnimatePresence mode="wait">
        {activeView === "opportunities" ? (
          <motion.div
            key="opportunities"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <OpportunitiesFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              position={position}
              setPosition={setPosition}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onReset={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-7 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <SkeletonOpportunityCard key={i} />
                  ))}
                </div>
                <div className="hidden lg:block lg:col-span-5">
                  <div className="bg-white ring-1 ring-slate-200 rounded-2xl shadow-sm p-6 animate-pulse">
                    <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
                    <div className="h-4 bg-slate-100 rounded w-1/2 mb-6" />
                    <div className="space-y-3">
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-3 bg-slate-100 rounded w-full" />
                      <div className="h-3 bg-slate-100 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="bg-white ring-1 ring-red-200 rounded-2xl shadow-sm p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                </div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Impossible de charger les opportunites
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  Verifiez votre connexion et reessayez
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadAll}
                  className="rounded-xl border-slate-200 text-slate-600 hover:border-slate-300"
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Reessayer
                </Button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && filteredListings.length === 0 && (
              <div className="bg-white ring-1 ring-slate-200 rounded-2xl shadow-sm p-12 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  Aucune opportunite trouvee
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  Essayez de modifier vos filtres ou revenez plus tard
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                    className="rounded-xl border-slate-200 text-slate-600 hover:border-slate-300"
                  >
                    Reinitialiser les filtres
                  </Button>
                )}
              </div>
            )}

            {/* Results: 2-column layout */}
            {!loading && !error && filteredListings.length > 0 && (
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-7 space-y-4">
                  {filteredListings.map((listing) => {
                    const hasApplied = myApplications.has(listing.id)
                    return (
                      <OpportunityCard
                        key={listing.id}
                        listing={listing}
                        hasApplied={hasApplied}
                        isSelected={previewListing?.id === listing.id}
                        onSelect={(l) => {
                          const matchingApp = applications.find(
                            (app) => app.listing.id === l.id
                          )
                          if (matchingApp) {
                            handleViewDetails(matchingApp)
                          } else {
                            setPreviewListing(l)
                            setMobilePreviewOpen(true)
                          }
                        }}
                        onApply={handleApply}
                      />
                    )
                  })}
                </div>

                <div className="hidden lg:block lg:col-span-5">
                  <div className="sticky top-6 h-fit">
                    <OpportunityPreview
                      listing={previewListing}
                      hasApplied={previewListing ? myApplications.has(previewListing.id) : false}
                      onApply={handleApply}
                      onConsult={handleConsult}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mobile popup */}
            <Dialog open={mobilePreviewOpen} onOpenChange={setMobilePreviewOpen}>
              <DialogContent className="lg:hidden p-0 max-w-lg w-full max-h-[85dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
                <DialogTitle className="sr-only">{previewListing?.title || "Détails de l'annonce"}</DialogTitle>
                <OpportunityPreview
                  listing={previewListing}
                  hasApplied={previewListing ? myApplications.has(previewListing.id) : false}
                  onApply={(l) => { handleApply(l); setMobilePreviewOpen(false) }}
                  onConsult={handleConsult}
                />
              </DialogContent>
            </Dialog>
          </motion.div>
        ) : (
          <motion.div
            key="applications"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Stats cards */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <div className="relative overflow-hidden bg-white ring-1 ring-slate-200 rounded-2xl shadow-sm p-4 group hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 w-16 h-16 bg-slate-100 rounded-full -translate-y-1/3 translate-x-1/3 opacity-60" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center">
                      <FileText className="h-3.5 w-3.5 text-slate-600" />
                    </div>
                    <p className="text-xs font-medium text-slate-500">Total</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{applications.length}</p>
                </div>
              </div>
              <div className="relative overflow-hidden bg-white ring-1 ring-blue-100 rounded-2xl shadow-sm p-4 group hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-full -translate-y-1/3 translate-x-1/3 opacity-80" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Loader2 className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <p className="text-xs font-medium text-blue-600">En cours</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    {(applicationsByStatus.SUBMITTED?.length || 0) +
                      (applicationsByStatus.UNDER_REVIEW?.length || 0)}
                  </p>
                </div>
              </div>
              <div className="relative overflow-hidden bg-white ring-1 ring-purple-100 rounded-2xl shadow-sm p-4 group hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-full -translate-y-1/3 translate-x-1/3 opacity-80" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Target className="h-3.5 w-3.5 text-purple-600" />
                    </div>
                    <p className="text-xs font-medium text-purple-600">Shortliste</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">
                    {applicationsByStatus.SHORTLISTED?.length || 0}
                  </p>
                </div>
              </div>
              <div className="relative overflow-hidden bg-white ring-1 ring-green-100 rounded-2xl shadow-sm p-4 group hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-full -translate-y-1/3 translate-x-1/3 opacity-80" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 rounded-lg bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    <p className="text-xs font-medium text-green-600">Signees</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    {applicationsByStatus.SIGNED?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Applications list */}
            {applications.length === 0 ? (
              <div className="bg-white ring-1 ring-slate-200 rounded-2xl shadow-sm p-12 text-center">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-4 ring-1 ring-slate-200">
                  <FileText className="h-7 w-7 text-slate-400" />
                </div>
                <p className="text-base font-semibold text-slate-700 mb-1">Aucune candidature</p>
                <p className="text-sm text-slate-500 mb-5 max-w-xs mx-auto">
                  Parcourez les opportunites disponibles et postulez pour commencer
                </p>
                <Button
                  size="sm"
                  onClick={() => setActiveView("opportunities")}
                  className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm"
                >
                  <Target className="mr-1.5 h-3.5 w-3.5" />
                  Voir les opportunites
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {statusOrder.map((status) => {
                  const apps = applicationsByStatus[status]
                  if (!apps || apps.length === 0) return null

                  const config = statusConfig[status]
                  const progressSteps = [
                    "SUBMITTED",
                    "UNDER_REVIEW",
                    "SHORTLISTED",
                    "TRIAL",
                    "ACCEPTED",
                    "SIGNED",
                  ]

                  return (
                    <div key={status}>
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className={`h-2 w-2 rounded-full ${
                          status === "REJECTED" ? "bg-red-400" :
                          status === "SIGNED" ? "bg-green-500" :
                          status === "ACCEPTED" ? "bg-green-400" :
                          "bg-blue-400"
                        }`} />
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{config.label}</h2>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs font-semibold">
                          {apps.length}
                        </span>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {apps.map((application) => {
                          const stepIndex = progressSteps.indexOf(application.status)
                          const isRejected = application.status === "REJECTED"
                          const progressPercent = isRejected ? 0 : ((stepIndex + 1) / progressSteps.length) * 100

                          return (
                            <div
                              key={application.id}
                              onClick={() => handleViewDetails(application)}
                              className="group bg-white ring-1 ring-slate-200 rounded-2xl shadow-sm overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:ring-slate-300"
                            >
                              {/* Mini progress bar at top */}
                              <div className="h-1 bg-slate-100 w-full">
                                <div
                                  className={`h-full rounded-r-full transition-all duration-700 ${
                                    isRejected
                                      ? "bg-red-400"
                                      : "bg-gradient-to-r from-green-400 to-green-500"
                                  }`}
                                  style={{ width: isRejected ? "100%" : `${progressPercent}%` }}
                                />
                              </div>

                              <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
                                      <Building2 className="h-4 w-4 text-slate-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-green-700 transition-colors">
                                        {application.listing.title}
                                      </h3>
                                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                                        {application.listing.clubProfile?.clubName || "Club inconnu"}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge className={`${config.color} text-[10px] shrink-0 ml-2 font-semibold`}>
                                    {config.label}
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {application.listing.clubProfile?.city
                                      ? `${application.listing.clubProfile.city}, `
                                      : ""}
                                    {application.listing.clubProfile?.country || "N/A"}
                                  </span>
                                  <span className="text-slate-200">|</span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(application.createdAt).toLocaleDateString("fr-FR")}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                  <p className="text-[11px] text-slate-400">{config.description}</p>
                                  <span className="text-xs font-medium text-green-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    Details
                                    <Eye className="h-3 w-3" />
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Apply Dialog */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="max-w-2xl ring-1 ring-slate-200 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Postuler a l'annonce
            </DialogTitle>
            <DialogDescription className="text-sm">
              <span className="font-medium text-slate-700">{selectedListing?.title}</span>
              {" · "}
              <span className="text-slate-500">
                {selectedListing?.clubProfile?.clubName || "Club"}
              </span>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitApplication)} className="space-y-5 mt-2">
            <div>
              <Label htmlFor="coverLetter" className="text-sm font-medium text-slate-700">
                Lettre de motivation
              </Label>
              <p className="text-xs text-slate-500 mb-2">
                Expliquez pourquoi vous etes le candidat ideal
              </p>
              <Textarea
                id="coverLetter"
                {...register("coverLetter")}
                placeholder="Cher recruteur,&#10;&#10;Je suis tres interesse par cette opportunite..."
                rows={10}
                className="border-slate-200 focus:ring-2 focus:ring-green-600/30 resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setApplyDialogOpen(false)}
                className="rounded-xl border-slate-200 text-slate-600"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={applying}
                className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm"
              >
                {applying ? (
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

      {/* Application Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 gap-0 ring-1 ring-slate-200 rounded-2xl [&>button:last-child]:hidden">
          <DialogTitle className="sr-only">
            {selectedApplication?.listing.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Details de votre candidature
          </DialogDescription>

          {selectedApplication && (() => {
            const config = statusConfig[selectedApplication.status]
            const steps = [
              { key: "SUBMITTED", label: "Soumise" },
              { key: "UNDER_REVIEW", label: "En revue" },
              { key: "SHORTLISTED", label: "Shortliste" },
              { key: "TRIAL", label: "Essai" },
              { key: "ACCEPTED", label: "Acceptee" },
              { key: "SIGNED", label: "Signee" },
            ]
            const currentStepIndex = steps.findIndex(s => s.key === selectedApplication.status)
            const isRejected = selectedApplication.status === "REJECTED"

            return (
              <>
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 pt-6 pb-5">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjZykiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-50" />
                  <DialogClose className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                    <X className="h-4 w-4" />
                  </DialogClose>
                  <div className="relative">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-white/80" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-white">
                          {selectedApplication.listing.title}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-white/60">
                            {selectedApplication.listing.clubProfile?.clubName || "Club inconnu"}
                          </span>
                          {(selectedApplication.listing.clubProfile?.city || selectedApplication.listing.clubProfile?.country) && (
                            <>
                              <span className="text-white/30">·</span>
                              <span className="inline-flex items-center gap-1 text-sm text-white/50">
                                <MapPin className="h-3 w-3" />
                                {selectedApplication.listing.clubProfile?.city
                                  ? `${selectedApplication.listing.clubProfile.city}, ${selectedApplication.listing.clubProfile?.country || ""}`
                                  : selectedApplication.listing.clubProfile?.country}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center gap-3">
                      {isRejected ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 ring-1 ring-red-500/30">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                          Refusee
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 ring-1 ring-green-500/30">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                          {config.label}
                        </span>
                      )}
                      <span className="text-xs text-white/40">
                        {config.description}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress stepper */}
                {!isRejected && (
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-1">
                      {steps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex
                        const isCurrent = index === currentStepIndex
                        return (
                          <div key={step.key} className="flex-1 flex flex-col items-center gap-1.5">
                            <div className="w-full flex items-center">
                              <div
                                className={`h-2 w-full rounded-full transition-all duration-500 ${
                                  isCompleted
                                    ? isCurrent
                                      ? "bg-green-500 shadow-sm shadow-green-500/30"
                                      : "bg-green-400"
                                    : "bg-slate-200"
                                }`}
                              />
                            </div>
                            <span className={`text-[10px] font-medium leading-none ${
                              isCompleted ? "text-green-700" : "text-slate-400"
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Body */}
                <div className="overflow-y-auto max-h-[calc(90vh-220px)] px-6 py-5 space-y-5">
                  {/* Chronologie */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Chronologie
                    </h3>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                          <Send className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700">Candidature envoyee</p>
                          <p className="text-xs text-slate-400">
                            {new Date(selectedApplication.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      {selectedApplication.updatedAt !== selectedApplication.createdAt && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100">
                          <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                            <RefreshCw className="h-4 w-4 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700">Derniere mise a jour</p>
                            <p className="text-xs text-slate-400">
                              {new Date(selectedApplication.updatedAt).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description de l'annonce */}
                  {selectedApplication.listing.description && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Description de l'annonce
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {selectedApplication.listing.description}
                      </p>
                    </div>
                  )}

                  {/* Position + infos */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Informations
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100">
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Position</p>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-semibold text-slate-800">{selectedApplication.listing.position}</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 ring-1 ring-slate-100">
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Localisation</p>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-semibold text-slate-800">
                            {selectedApplication.listing.clubProfile?.city
                              ? `${selectedApplication.listing.clubProfile.city}, `
                              : ""}
                            {selectedApplication.listing.clubProfile?.country || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lettre de motivation */}
                  {selectedApplication.coverLetter && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Votre lettre de motivation
                      </h3>
                      <div className="relative p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white ring-1 ring-slate-200">
                        <div className="absolute top-3 left-3 text-slate-200">
                          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983z" />
                          </svg>
                        </div>
                        <p className="text-sm whitespace-pre-wrap text-slate-700 leading-relaxed pl-4 pt-4">
                          {selectedApplication.coverLetter}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer with cancel button */}
                {selectedApplication.status !== "SIGNED" && (
                  <div className="sticky bottom-0 border-t border-slate-100 bg-white px-6 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 font-medium rounded-xl"
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Annuler ma candidature
                    </Button>
                  </div>
                )}
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Cancel application confirmation */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler cette candidature ?</AlertDialogTitle>
            <AlertDialogDescription>
              Votre candidature pour &quot;{selectedApplication?.listing.title}&quot; sera
              definitivement supprimee. Le club sera notifie de votre retrait.
              Cette action est irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>
              Retour
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelApplication}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {cancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Annulation...
                </>
              ) : (
                "Confirmer l'annulation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
