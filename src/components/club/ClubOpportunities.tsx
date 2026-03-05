"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Briefcase, MapPin, Calendar, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Listing {
  id: string
  title: string
  position: string
  publishedAt: string | null
  contractType?: string
  salaryMin?: number
  salaryMax?: number
  currency?: string
}

interface ClubOpportunitiesProps {
  listings: Listing[]
  clubId: string
}

export function ClubOpportunities({ listings, clubId }: ClubOpportunitiesProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Récemment"
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", { 
      day: "numeric", 
      month: "short",
      year: "numeric"
    })
  }

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return null
    const curr = currency || "EUR"
    const formatter = new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: curr,
      maximumFractionDigits: 0,
    })
    
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`
    }
    if (min) return `À partir de ${formatter.format(min)}`
    if (max) return `Jusqu'à ${formatter.format(max)}`
    return null
  }

  if (listings.length === 0) {
    return (
      <div className="card-stadium overflow-hidden">
        <div className="p-3 bg-gradient-to-r from-victory-50 to-victory-100/50 border-b border-victory-200">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-victory-600" />
            <h3 className="font-bold text-victory-800 text-sm">Opportunités</h3>
          </div>
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-stadium-500">Aucune opportunité disponible</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-stadium overflow-hidden">
      <div className="p-3 bg-gradient-to-r from-victory-50 to-victory-100/50 border-b border-victory-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-victory-600" />
            <h3 className="font-bold text-victory-800 text-sm">Opportunités</h3>
          </div>
          <span className="text-xs text-stadium-500">{listings.length} poste{listings.length > 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="divide-y divide-pitch-50">
        {listings.slice(0, 5).map((listing, index) => (
          <motion.div
            key={listing.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-3 hover:bg-pitch-50/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-stadium-800 truncate mb-1">
                  {listing.title}
                </h4>
                
                <div className="flex items-center gap-2 flex-wrap text-xs text-stadium-500">
                  <span className="inline-flex items-center gap-1 bg-pitch-100 text-pitch-700 px-2 py-0.5 rounded-full font-medium">
                    {listing.position}
                  </span>
                  
                  {listing.contractType && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {listing.contractType}
                    </span>
                  )}
                </div>

                {formatSalary(listing.salaryMin, listing.salaryMax, listing.currency) && (
                  <p className="text-xs text-victory-600 font-medium mt-1">
                    {formatSalary(listing.salaryMin, listing.salaryMax, listing.currency)}
                  </p>
                )}

                <div className="flex items-center gap-1 text-xs text-stadium-400 mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>Publié le {formatDate(listing.publishedAt)}</span>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-stadium-400 flex-shrink-0 mt-1" />
            </div>
          </motion.div>
        ))}
      </div>

      {listings.length > 5 && (
        <div className="p-3 border-t border-pitch-100">
          <Link href={`/opportunities?club=${clubId}`}>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs border-pitch-300 hover:bg-pitch-50"
            >
              Voir toutes les opportunités ({listings.length})
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
