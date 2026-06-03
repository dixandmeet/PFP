"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  STATUS_CONFIG,
  type ClubListing,
} from "@/lib/club/listings"
import { cn } from "@/lib/utils"
import {
  ArrowLeftRight,
  CheckCircle,
  ClipboardList,
  Edit,
} from "lucide-react"

interface ListingCardProps {
  listing: ClubListing
  onEdit: (listing: ClubListing) => void
  onPublish: (id: string) => void
  onClose: (id: string) => void
  className?: string
}

export function ListingCard({
  listing,
  onEdit,
  onPublish,
  onClose,
  className,
}: ListingCardProps) {
  const statusBadge = STATUS_CONFIG[listing.status] ?? STATUS_CONFIG.DRAFT
  const displayDate = listing.publishedAt || listing.createdAt || listing.closedAt

  return (
    <article
      className={cn(
        "rounded-2xl border border-stadium-200 bg-white p-5 shadow-sm",
        "transition-all duration-200 hover:border-pitch-200 hover:shadow-md",
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-stadium-900">
              {listing.title}
            </h3>
            <Badge variant="outline" className={statusBadge.color}>
              {statusBadge.label}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-stadium-500">
            {listing.position}
            {listing.team && <span> · {listing.team.name}</span>}
            {displayDate && (
              <span>
                {" "}
                ·{" "}
                {new Date(displayDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </p>
          <p className="mt-3 line-clamp-2 text-sm text-stadium-600">
            {listing.description}
          </p>

          {listing._count && (
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-stadium-600">
              <span className="inline-flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4 text-stadium-400" />
                {listing._count.applications} candidature
                {listing._count.applications !== 1 ? "s" : ""}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ArrowLeftRight className="h-4 w-4 text-stadium-400" />
                {listing._count.submissions} proposition
                {listing._count.submissions !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-end">
          <Button size="sm" variant="outline" onClick={() => onEdit(listing)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
          {listing.status === "DRAFT" && (
            <Button size="sm" onClick={() => onPublish(listing.id)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Publier
            </Button>
          )}
          {listing.status === "PUBLISHED" && (
            <Button
              size="sm"
              variant="outline"
              className="border-stadium-300 text-stadium-700 hover:bg-stadium-50"
              onClick={() => onClose(listing.id)}
            >
              Fermer
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
