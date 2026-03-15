"use client"

import { useState } from "react"
import {
  Building2,
  MapPin,
  Euro,
  Calendar,
  Send,
  FileSearch,
  Lock,
  Coins,
  Loader2,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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

interface OpportunityPreviewProps {
  listing: Listing | null
  onSubmitPlayer: (listing: Listing) => void
  onConsult?: (listing: Listing) => Promise<boolean>
}

export function OpportunityPreview({
  listing,
  onSubmitPlayer,
  onConsult,
}: OpportunityPreviewProps) {
  const [consulting, setConsulting] = useState(false)
  const [consultError, setConsultError] = useState("")

  if (!listing) {
    return (
      <div className="bg-white ring-1 ring-slate-200 rounded-2xl shadow-sm flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <FileSearch className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-500">
          Selectionnez une annonce
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Cliquez sur une carte pour voir les details
        </p>
      </div>
    )
  }

  const isLocked = listing.consulted === false

  const handleConsult = async () => {
    if (!onConsult) return
    setConsulting(true)
    setConsultError("")
    try {
      const success = await onConsult(listing)
      if (!success) {
        setConsultError("Solde insuffisant. Rechargez vos credits.")
      }
    } catch {
      setConsultError("Erreur lors de la consultation")
    } finally {
      setConsulting(false)
    }
  }

  return (
    <div className="bg-white ring-1 ring-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 space-y-5">
        {isLocked ? (
          <>
            <div className="text-center space-y-3 pt-2">
              <h2 className="text-lg font-bold text-slate-900">
                {listing.position}
              </h2>
              {listing.clubProfile?.league && (
                <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 text-xs font-medium">
                  {listing.clubProfile.league}
                </Badge>
              )}
            </div>

            <div className="bg-amber-50 rounded-xl p-6 ring-1 ring-amber-200 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                <Lock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">Annonce verrouillee</p>
                <p className="text-xs text-amber-600 mt-1.5 leading-relaxed">
                  Le nom du club, la ville, le salaire, la description et tous les autres details sont accessibles apres consultation.
                </p>
              </div>

              <div className="space-y-2 py-2">
                {["Club", "Localisation", "Salaire", "Type de contrat", "Description"].map((field) => (
                  <div key={field} className="flex items-center gap-3 text-sm">
                    <span className="text-amber-500 w-28 text-right text-xs">{field}</span>
                    <div className="h-3 flex-1 bg-amber-200/50 rounded-sm max-w-[160px]" />
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-lg p-3 ring-1 ring-amber-200">
                <div className="flex items-center justify-center gap-2">
                  <Coins className="h-5 w-5 text-amber-600" />
                  <span className="text-lg font-bold text-amber-800">{listing.consultationCost}</span>
                  <span className="text-sm text-amber-600">credits</span>
                </div>
              </div>

              {consultError && (
                <div className="flex items-center justify-center gap-2 text-red-600 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {consultError}
                </div>
              )}

              <Button
                onClick={handleConsult}
                disabled={consulting}
                className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm h-11"
              >
                {consulting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Coins className="mr-2 h-4 w-4" />
                    Consulter pour {listing.consultationCost} credits
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                {listing.title}
              </h2>
              <div className="flex items-center gap-2">
                {listing.clubProfile?.logo ? (
                  <img
                    src={listing.clubProfile.logo}
                    alt={listing.clubProfile.clubName || ""}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                )}
                <span className="text-sm font-medium text-slate-600">
                  {listing.clubProfile?.clubName || "Club inconnu"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 text-xs font-medium">
                {listing.position}
              </Badge>
              {listing.clubProfile?.league && (
                <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 text-xs font-medium">
                  {listing.clubProfile.league}
                </Badge>
              )}
              {listing.contractType && (
                <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 text-xs font-medium">
                  {listing.contractType}
                </Badge>
              )}
              {listing.nationality?.map((nat, i) => (
                <Badge key={i} variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 text-xs font-medium">
                  {nat}
                </Badge>
              ))}
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-slate-400" />
                {listing.clubProfile?.city ? `${listing.clubProfile.city}, ` : ""}
                {listing.clubProfile?.country || "Localisation inconnue"}
              </div>
              {(listing.salaryMin || listing.salaryMax) && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Euro className="h-4 w-4 text-slate-400" />
                  <span className="font-medium text-slate-800">
                    {listing.salaryMin?.toLocaleString()} - {listing.salaryMax?.toLocaleString()} {listing.currency}
                  </span>
                </div>
              )}
              {listing.startDate && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  Debut : {new Date(listing.startDate).toLocaleDateString("fr-FR")}
                </div>
              )}
              {listing.minAge && listing.maxAge && (
                <div className="text-sm text-slate-500">
                  Age : {listing.minAge} - {listing.maxAge} ans
                </div>
              )}
              {listing.publishedAt && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  Publie le {new Date(listing.publishedAt).toLocaleDateString("fr-FR")}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            <div className="pt-2">
              <Button
                className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm"
                onClick={() => onSubmitPlayer(listing)}
              >
                <Send className="mr-2 h-4 w-4" />
                Soumettre un joueur
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
