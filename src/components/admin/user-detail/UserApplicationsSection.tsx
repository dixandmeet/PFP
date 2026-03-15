"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  FileCheck,
  Handshake,
  Send,
  Building2,
  User,
  Calendar,
  Clock,
  ArrowRight,
  ListChecks,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import type {
  ApplicationEntry,
  MandateEntry,
  SubmissionEntry,
  ListingEntry,
} from "./types"
import { isClubRole } from "@/lib/utils/role-helpers"

interface UserApplicationsSectionProps {
  role: "PLAYER" | "AGENT" | "CLUB" | "CLUB_STAFF" | "ADMIN"
  applications?: ApplicationEntry[]
  mandates?: MandateEntry[]
  submissions?: SubmissionEntry[]
  listings?: ListingEntry[]
}

const applicationStatusLabels: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Brouillon", color: "bg-slate-100 text-slate-600" },
  SUBMITTED: { label: "Soumise", color: "bg-blue-100 text-blue-700" },
  UNDER_REVIEW: { label: "En revue", color: "bg-amber-100 text-amber-700" },
  SHORTLISTED: { label: "Preselectionnee", color: "bg-purple-100 text-purple-700" },
  TRIAL: { label: "Essai", color: "bg-indigo-100 text-indigo-700" },
  REJECTED: { label: "Refusee", color: "bg-red-100 text-red-700" },
  ACCEPTED: { label: "Acceptee", color: "bg-emerald-100 text-emerald-700" },
  SIGNED: { label: "Signee", color: "bg-green-100 text-green-800" },
}

const mandateStatusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "En attente", color: "bg-amber-100 text-amber-700" },
  ACTIVE: { label: "Actif", color: "bg-emerald-100 text-emerald-700" },
  EXPIRED: { label: "Expire", color: "bg-slate-100 text-slate-600" },
  TERMINATED: { label: "Resilie", color: "bg-red-100 text-red-700" },
  REJECTED: { label: "Refuse", color: "bg-red-100 text-red-700" },
}

const listingStatusLabels: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Brouillon", color: "bg-slate-100 text-slate-600" },
  PUBLISHED: { label: "Publiee", color: "bg-emerald-100 text-emerald-700" },
  CLOSED: { label: "Fermee", color: "bg-red-100 text-red-700" },
}

function StatusBadge({ status, map }: { status: string; map: Record<string, { label: string; color: string }> }) {
  const config = map[status] || { label: status, color: "bg-slate-100 text-slate-600" }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  )
}

export function UserApplicationsSection({
  role,
  applications = [],
  mandates = [],
  submissions = [],
  listings = [],
}: UserApplicationsSectionProps) {
  return (
    <div className="space-y-6">
      {/* Player: Applications */}
      {role === "PLAYER" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-slate-500" />
            <h3 className="text-lg font-semibold text-slate-900">
              Candidatures ({applications.length})
            </h3>
          </div>

          {applications.length === 0 ? (
            <Card className="p-8 text-center">
              <FileCheck className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Aucune candidature</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {applications.map((app) => (
                <Card key={app.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-slate-900">
                          {app.listing.title}
                        </h4>
                        <StatusBadge status={app.status} map={applicationStatusLabels} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {app.listing.clubProfile.clubName}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {app.listing.position}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(app.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      </div>
                      {app.coverLetter && (
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                          {app.coverLetter}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Player: Mandates (from player perspective) */}
      {role === "PLAYER" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Handshake className="h-5 w-5 text-slate-500" />
            <h3 className="text-lg font-semibold text-slate-900">
              Mandats ({mandates.length})
            </h3>
          </div>

          {mandates.length === 0 ? (
            <Card className="p-8 text-center">
              <Handshake className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Aucun mandat</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {mandates.map((mandate) => (
                <Card key={mandate.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-slate-900">
                          {mandate.agentProfile
                            ? `${mandate.agentProfile.firstName} ${mandate.agentProfile.lastName}`
                            : "Agent inconnu"}
                          {mandate.agentProfile?.agencyName && (
                            <span className="text-slate-500 font-normal">
                              {" "}
                              ({mandate.agentProfile.agencyName})
                            </span>
                          )}
                        </h4>
                        <StatusBadge status={mandate.status} map={mandateStatusLabels} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(mandate.startDate), "dd MMM yyyy", { locale: fr })}
                          <ArrowRight className="h-3 w-3" />
                          {format(new Date(mandate.endDate), "dd MMM yyyy", { locale: fr })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Agent: Mandates */}
      {role === "AGENT" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Handshake className="h-5 w-5 text-slate-500" />
            <h3 className="text-lg font-semibold text-slate-900">
              Mandats ({mandates.length})
            </h3>
          </div>

          {mandates.length === 0 ? (
            <Card className="p-8 text-center">
              <Handshake className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Aucun mandat</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {mandates.map((mandate) => (
                <Card key={mandate.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-slate-900">
                          {mandate.playerProfile
                            ? `${mandate.playerProfile.firstName} ${mandate.playerProfile.lastName}`
                            : "Joueur inconnu"}
                          {mandate.playerProfile?.primaryPosition && (
                            <span className="text-slate-500 font-normal">
                              {" "}
                              - {mandate.playerProfile.primaryPosition}
                            </span>
                          )}
                        </h4>
                        <StatusBadge status={mandate.status} map={mandateStatusLabels} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(mandate.startDate), "dd MMM yyyy", { locale: fr })}
                          <ArrowRight className="h-3 w-3" />
                          {format(new Date(mandate.endDate), "dd MMM yyyy", { locale: fr })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Agent: Submissions */}
      {role === "AGENT" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-slate-500" />
            <h3 className="text-lg font-semibold text-slate-900">
              Soumissions ({submissions.length})
            </h3>
          </div>

          {submissions.length === 0 ? (
            <Card className="p-8 text-center">
              <Send className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Aucune soumission</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {submissions.map((sub) => (
                <Card key={sub.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-slate-900">
                          {sub.listing?.title || "Soumission directe"}
                        </h4>
                        <StatusBadge status={sub.status} map={applicationStatusLabels} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {sub.clubProfile.clubName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(sub.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      </div>
                      {sub.message && (
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                          {sub.message}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Club: Listings */}
      {isClubRole(role) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-slate-500" />
            <h3 className="text-lg font-semibold text-slate-900">
              Annonces ({listings.length})
            </h3>
          </div>

          {listings.length === 0 ? (
            <Card className="p-8 text-center">
              <ListChecks className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Aucune annonce</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {listings.map((listing) => (
                <Card key={listing.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-slate-900">
                          {listing.title}
                        </h4>
                        <StatusBadge status={listing.status} map={listingStatusLabels} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {listing.position}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileCheck className="h-3 w-3" />
                          {listing._count.applications} candidatures
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(listing.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fallback for ADMIN role */}
      {role === "ADMIN" && (
        <Card className="p-8 text-center">
          <p className="text-sm text-slate-500">
            Les administrateurs n&apos;ont pas de candidatures, mandats ou annonces.
          </p>
        </Card>
      )}
    </div>
  )
}
