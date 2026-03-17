"use client"

import { useState } from "react"
import { Building2, MapPin, Euro, Calendar, ChevronRight, Lock, Coins, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

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

interface AgentOpportunityCardProps {
  listing: Listing
  isSelected: boolean
  onSelect: (listing: Listing) => void
  onSubmitPlayer: (listing: Listing) => void
  onConsult?: (listing: Listing) => Promise<boolean>
}

const MAX_BADGES = 3

export function AgentOpportunityCard({
  listing,
  isSelected,
  onSelect,
  onSubmitPlayer,
  onConsult,
}: AgentOpportunityCardProps) {
  const [consulting, setConsulting] = useState(false)
  const isLocked = listing.consulted === false

  const handleConsult = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onConsult || consulting) return
    setConsulting(true)
    try {
      await onConsult(listing)
    } finally {
      setConsulting(false)
    }
  }

  if (isLocked) {
    return (
      <div
        onClick={() => onSelect(listing)}
        className={`group relative bg-white ring-1 rounded-2xl shadow-sm p-5 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] ${
          isSelected
            ? "ring-amber-400/60 shadow-md"
            : "ring-slate-200 hover:ring-amber-300"
        }`}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Lock className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full ring-1 ring-amber-200">
              {listing.consultationCost} crédits
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
        </div>

        <div className="space-y-2 mb-4">
          <h3 className="text-base font-bold text-slate-900">
            {listing.position}
          </h3>
          {listing.clubProfile?.league && (
            <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
              {listing.clubProfile.league}
            </span>
          )}
        </div>

        <div className="space-y-1.5 mb-4">
          {["Club", "Ville", "Salaire", "Description"].map((field) => (
            <div key={field} className="flex items-center gap-2">
              <div className="h-3 w-16 bg-slate-100 rounded-sm" />
              <div className="h-3 flex-1 bg-slate-100 rounded-sm max-w-[120px]" />
            </div>
          ))}
        </div>

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs h-9 shadow-sm"
            disabled={consulting}
            onClick={handleConsult}
          >
            {consulting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Coins className="mr-1.5 h-3.5 w-3.5" />
                Consulter ({listing.consultationCost} crédits)
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  const badges: string[] = []
  if (listing.position) badges.push(listing.position)
  if (listing.clubProfile?.league) badges.push(listing.clubProfile.league)
  if (listing.contractType) badges.push(listing.contractType)
  if (listing.nationality?.length) badges.push(...listing.nationality)

  const visibleBadges = badges.slice(0, MAX_BADGES)
  const extraCount = badges.length - MAX_BADGES

  return (
    <div
      onClick={() => onSelect(listing)}
      className={`group relative bg-white ring-1 rounded-2xl shadow-sm p-5 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] ${
        isSelected
          ? "ring-green-600/40 shadow-md"
          : "ring-slate-200 hover:ring-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-semibold text-slate-900 leading-snug">
          {listing.title}
        </h3>
        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
      </div>

      <div className="flex items-center gap-2 mb-3">
        {listing.clubProfile?.logo ? (
          <img
            src={listing.clubProfile.logo}
            alt={listing.clubProfile.clubName || ""}
            className="h-5 w-5 rounded-full object-cover"
          />
        ) : (
          <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center">
            <Building2 className="h-3 w-3 text-slate-400" />
          </div>
        )}
        <span className="text-sm text-slate-600 font-medium">
          {listing.clubProfile?.clubName || "Club inconnu"}
        </span>
      </div>

      <p
        className="text-sm text-slate-500 mb-3 leading-relaxed"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {listing.description}
      </p>

      {visibleBadges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {visibleBadges.map((badge, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-xs font-medium"
            >
              {badge}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md text-xs font-medium">
              +{extraCount}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm mb-4">
        <div className="flex items-center gap-1.5 text-slate-500">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          <span className="truncate">
            {listing.clubProfile?.city ? `${listing.clubProfile.city}, ` : ""}
            {listing.clubProfile?.country || "N/A"}
          </span>
        </div>
        {(listing.salaryMin || listing.salaryMax) && (
          <div className="flex items-center gap-1.5 text-slate-500">
            <Euro className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium text-slate-700">
              {listing.salaryMin?.toLocaleString()} - {listing.salaryMax?.toLocaleString()} {listing.currency}
            </span>
          </div>
        )}
        {listing.publishedAt && (
          <div className="flex items-center gap-1.5 text-slate-400 text-xs col-span-2">
            <Calendar className="h-3 w-3" />
            Publie le {new Date(listing.publishedAt).toLocaleDateString("fr-FR")}
          </div>
        )}
      </div>

      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <Button
          size="sm"
          className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium text-xs h-9 shadow-sm"
          onClick={() => onSubmitPlayer(listing)}
        >
          <Send className="mr-1.5 h-3.5 w-3.5" />
          Soumettre un joueur
        </Button>
      </div>
    </div>
  )
}
