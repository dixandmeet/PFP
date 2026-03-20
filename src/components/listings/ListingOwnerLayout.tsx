"use client"

import type { ComponentType, ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Building2,
  Calendar,
  Euro,
  MapPin,
  Pencil,
  FileText,
  Target,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Listing as PlayerListing } from "@/app/player/opportunities/types"

const LISTING_STATUS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Brouillon", className: "bg-slate-100 text-slate-700 border-slate-200" },
  PUBLISHED: { label: "En ligne", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  CLOSED: { label: "Fermée", className: "bg-rose-50 text-rose-800 border-rose-200" },
}

function Fact({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <div className="text-sm font-semibold text-slate-900 leading-snug">{children}</div>
      </div>
    </div>
  )
}

export function ListingOwnerLayout({
  listing,
  listingStatus,
  requirements,
  viewer,
}: {
  listing: PlayerListing
  listingStatus: string | null
  requirements: string | null
  viewer: "owner" | "admin" | "visitor"
}) {
  const st = (listingStatus && LISTING_STATUS[listingStatus]) || LISTING_STATUS.PUBLISHED

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />
        <div className="relative px-5 py-7 sm:px-8 sm:py-9">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full px-2.5 font-medium bg-slate-50 text-slate-700 border-slate-200">
                  <Target className="h-3 w-3 mr-1" />
                  {listing.position}
                </Badge>
                <Badge variant="outline" className={`text-xs font-medium ${st.className}`}>
                  {st.label}
                </Badge>
                {viewer === "admin" && (
                  <Badge variant="outline" className="text-xs bg-violet-50 text-violet-800 border-violet-200">
                    Vue admin
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-[1.15]">
                {listing.title}
              </h1>
              <div className="flex items-center gap-3 pt-1">
                {listing.clubProfile?.logo ? (
                  <Image
                    src={listing.clubProfile.logo}
                    alt=""
                    width={40}
                    height={40}
                    unoptimized
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-md"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center ring-2 ring-white shadow">
                    <Building2 className="h-5 w-5 text-slate-400" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-800">{listing.clubProfile?.clubName}</p>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {listing.clubProfile?.city ? `${listing.clubProfile.city}, ` : ""}
                    {listing.clubProfile?.country}
                  </p>
                </div>
              </div>
            </div>

            {viewer === "owner" ? (
              <Button asChild className="shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-sm">
                <Link href="/club/listings">
                  <Pencil className="h-4 w-4 mr-2" />
                  Modifier l&apos;annonce
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-slate-900">Description</h2>
            </div>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-[15px]">
              {listing.description || "—"}
            </p>
            {requirements?.trim() ? (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Critères & exigences</h3>
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{requirements}</p>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
              Synthèse
            </h3>
            <div className="space-y-3">
              {(listing.salaryMin != null || listing.salaryMax != null) && (
                <Fact icon={Euro} label="Fourchette">
                  {listing.salaryMin?.toLocaleString("fr-FR")} – {listing.salaryMax?.toLocaleString("fr-FR")}{" "}
                  {listing.currency ?? "EUR"}
                </Fact>
              )}
              {listing.contractType ? (
                <Fact icon={Calendar} label="Contrat">
                  {listing.contractType}
                </Fact>
              ) : null}
              {listing.startDate ? (
                <Fact icon={Calendar} label="Début souhaité">
                  {new Date(listing.startDate).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Fact>
              ) : null}
              {listing.minAge != null && listing.maxAge != null ? (
                <Fact icon={Target} label="Tranche d&apos;âge">
                  {listing.minAge} – {listing.maxAge} ans
                </Fact>
              ) : null}
              {listing.publishedAt ? (
                <Fact icon={Calendar} label="Publié le">
                  {new Date(listing.publishedAt).toLocaleDateString("fr-FR")}
                </Fact>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {listing.clubProfile?.league && (
              <Badge variant="secondary" className="rounded-lg px-3 py-1">
                {listing.clubProfile.league}
              </Badge>
            )}
            {listing.nationality?.map((nat) => (
              <Badge key={nat} variant="outline" className="rounded-lg">
                {nat}
              </Badge>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
