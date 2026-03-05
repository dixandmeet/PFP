"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  Search,
  Target,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react"

import { AgentOpportunitiesHeader } from "./components/AgentOpportunitiesHeader"
import { OpportunitiesFilters } from "@/app/player/opportunities/components/OpportunitiesFilters"
import { OpportunityPreview } from "./components/AgentOpportunityPreview"
import { AgentOpportunityCard } from "./components/AgentOpportunityCard"
import { SkeletonOpportunityCard } from "@/app/player/opportunities/components/SkeletonOpportunityCard"

// ==================== TYPES ====================

interface Listing {
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

interface ManagedPlayer {
  id: string
  firstName: string
  lastName: string
  primaryPosition: string
}

// ==================== MAIN COMPONENT ====================

export default function AgentOpportunitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AgentOpportunitiesContent />
    </Suspense>
  )
}

function AgentOpportunitiesContent() {
  const { toast } = useToast()

  // Listings state
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Preview selection
  const [previewListing, setPreviewListing] = useState<Listing | null>(null)

  // Filters
  const [position, setPosition] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("")

  // Submit player dialog
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [managedPlayers, setManagedPlayers] = useState<ManagedPlayer[]>([])
  const [selectedPlayerId, setSelectedPlayerId] = useState("")
  const [submitMessage, setSubmitMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [loadingPlayers, setLoadingPlayers] = useState(false)

  // ==================== DATA LOADING ====================

  const loadAll = async () => {
    setLoading(true)
    setError(false)
    try {
      await loadListings()
    } catch {
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
      throw err
    }
  }

  useEffect(() => {
    if (!loading) {
      loadListings().catch(() => {})
    }
  }, [position])

  // Auto-select first listing for preview
  useEffect(() => {
    if (listings.length > 0 && !previewListing) {
      setPreviewListing(listings[0])
    } else if (previewListing) {
      const updated = listings.find((l) => l.id === previewListing.id)
      if (updated) setPreviewListing(updated)
    }
  }, [listings])

  const loadManagedPlayers = async () => {
    setLoadingPlayers(true)
    try {
      const res = await fetch("/api/mandates?status=ACTIVE")
      if (res.ok) {
        const data = await res.json()
        const players = data.mandates?.map((m: any) => ({
          id: m.playerProfile.id,
          firstName: m.playerProfile.firstName,
          lastName: m.playerProfile.lastName,
          primaryPosition: m.playerProfile.primaryPosition,
        })) || []
        setManagedPlayers(players)
      }
    } catch {
      // silently fail
    } finally {
      setLoadingPlayers(false)
    }
  }

  // ==================== HANDLERS ====================

  const handleSubmitPlayer = (listing: Listing) => {
    setSelectedListing(listing)
    setSelectedPlayerId("")
    setSubmitMessage("")
    setSubmitDialogOpen(true)
    loadManagedPlayers()
  }

  const onSubmit = async () => {
    if (!selectedListing || !selectedPlayerId) {
      toast({
        title: "Champs requis",
        description: "Veuillez selectionner un joueur",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerProfileId: selectedPlayerId,
          clubProfileId: selectedListing.clubProfile?.id,
          listingId: selectedListing.id,
          message: submitMessage || undefined,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Erreur lors de la soumission")
      }

      toast({
        title: "Joueur soumis",
        description: "Votre soumission a ete envoyee au club avec succes",
      })

      setSubmitDialogOpen(false)
      setSelectedListing(null)
      setSelectedPlayerId("")
      setSubmitMessage("")
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
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
          listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.clubProfile.clubName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (listing.description || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : listings

  if (sortBy === "recent") {
    filteredListings = [...filteredListings].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
  } else if (sortBy === "salary") {
    filteredListings = [...filteredListings].sort(
      (a, b) => (b.salaryMax || 0) - (a.salaryMax || 0)
    )
  }

  const hasActiveFilters = !!position || !!searchQuery || !!sortBy

  // ==================== RENDER ====================

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
      <AgentOpportunitiesHeader listingsCount={filteredListings.length} />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
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
              Impossible de charger les annonces
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
              Aucune annonce trouvee
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
              {filteredListings.map((listing) => (
                <AgentOpportunityCard
                  key={listing.id}
                  listing={listing}
                  isSelected={previewListing?.id === listing.id}
                  onSelect={(l) => setPreviewListing(l)}
                  onSubmitPlayer={handleSubmitPlayer}
                />
              ))}
            </div>

            <div className="hidden lg:block lg:col-span-5">
              <div className="sticky top-6 h-fit">
                <OpportunityPreview
                  listing={previewListing}
                  onSubmitPlayer={handleSubmitPlayer}
                  onConsult={handleConsult}
                />
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Submit Player Dialog */}
      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="max-w-lg ring-1 ring-slate-200 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Soumettre un joueur
            </DialogTitle>
            <DialogDescription className="text-sm">
              <span className="font-medium text-slate-700">{selectedListing?.title}</span>
              {" · "}
              <span className="text-slate-500">
                {selectedListing?.clubProfile?.clubName || "Club"}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-2">
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                Selectionnez un joueur
              </Label>
              {loadingPlayers ? (
                <div className="flex items-center gap-2 p-3 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement des joueurs...
                </div>
              ) : managedPlayers.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <Users className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 font-medium">Aucun joueur</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Vous devez d'abord ajouter des joueurs a votre portefeuille
                  </p>
                </div>
              ) : (
                <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                  <SelectTrigger className="border-slate-200 focus:ring-2 focus:ring-green-600/30">
                    <SelectValue placeholder="Choisir un joueur..." />
                  </SelectTrigger>
                  <SelectContent>
                    {managedPlayers.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.firstName} {player.lastName} — {player.primaryPosition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label htmlFor="submitMessage" className="text-sm font-medium text-slate-700">
                Message (optionnel)
              </Label>
              <p className="text-xs text-slate-500 mb-2">
                Ajoutez un message pour accompagner votre soumission
              </p>
              <Textarea
                id="submitMessage"
                value={submitMessage}
                onChange={(e) => setSubmitMessage(e.target.value)}
                placeholder="Je vous recommande ce joueur pour ce poste car..."
                rows={5}
                className="border-slate-200 focus:ring-2 focus:ring-green-600/30 resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSubmitDialogOpen(false)}
                className="rounded-xl border-slate-200 text-slate-600"
              >
                Annuler
              </Button>
              <Button
                onClick={onSubmit}
                disabled={submitting || !selectedPlayerId}
                className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Soumettre le joueur
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
