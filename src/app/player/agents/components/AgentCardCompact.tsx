"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Building2,
  Award,
  MapPin,
  Eye,
  UserPlus,
  Phone,
  Globe,
  ChevronDown,
} from "lucide-react"

interface Agent {
  id: string
  userId: string
  firstName: string
  lastName: string
  agencyName?: string
  licenseNumber?: string
  licenseCountry?: string
  bio?: string
  specialties: string[]
  phoneNumber?: string
  website?: string
  profilePicture?: string
  isVerified: boolean
  activeMandatesCount: number
}

interface AgentCardCompactProps {
  agent: Agent
  hasActiveMandate: boolean
  onViewDetails: (agent: Agent) => void
  onProposeMandate: (agent: Agent) => void
  viewMode: "grid" | "list"
}

const MAX_VISIBLE_TAGS = 3

export function AgentCardCompact({
  agent,
  hasActiveMandate,
  onViewDetails,
  onProposeMandate,
  viewMode,
}: AgentCardCompactProps) {
  const [expanded, setExpanded] = useState(false)

  const visibleTags = agent.specialties.slice(0, MAX_VISIBLE_TAGS)
  const hiddenCount = agent.specialties.length - MAX_VISIBLE_TAGS
  const hasExtra = agent.phoneNumber || agent.website

  if (viewMode === "list") {
    return (
      <div className="group bg-white border border-stadium-200/60 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 transition-all duration-200 hover:shadow-md hover:border-pitch-200 hover:-translate-y-0.5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-pitch-600 text-white font-bold text-sm shadow-sm">
            {agent.firstName[0]}{agent.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-stadium-900 text-sm">
                {agent.firstName} {agent.lastName}
              </span>
              {agent.isVerified && (
                <Badge className="bg-pitch-50 text-pitch-700 border border-pitch-200 text-[10px] px-1.5 py-0 font-semibold rounded-md">
                  <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                  Verifie
                </Badge>
              )}
              {agent.agencyName && (
                <span className="text-xs text-stadium-400 hidden sm:flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {agent.agencyName}
                </span>
              )}
            </div>
            {agent.licenseNumber && (
              <p className="text-xs text-stadium-400 mt-0.5 hidden sm:block">
                Licence {agent.licenseNumber}
                {agent.licenseCountry && ` · ${agent.licenseCountry}`}
              </p>
            )}
          </div>
          {/* Boutons : icône seule sur mobile, avec texte sur sm+ */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(agent)}
              className="rounded-xl border-stadium-200 text-stadium-600 hover:border-pitch-300 hover:text-pitch-700 font-medium text-xs h-8 transition-all duration-200 active:scale-[0.97] px-2 sm:px-3"
              aria-label={`Voir profil de ${agent.firstName} ${agent.lastName}`}
            >
              <Eye className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Voir profil</span>
            </Button>
            <Button
              size="sm"
              onClick={() => onProposeMandate(agent)}
              disabled={hasActiveMandate}
              className="rounded-xl bg-pitch-600 hover:bg-pitch-700 text-white font-medium text-xs h-8 shadow-sm transition-all duration-200 active:scale-[0.97] px-2 sm:px-3"
              aria-label={hasActiveMandate ? "Mandat existant" : `Contacter ${agent.firstName} ${agent.lastName}`}
            >
              {hasActiveMandate ? (
                <>
                  <CheckCircle className="h-3.5 w-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Mandat existant</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Contacter</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group bg-white border border-stadium-200/60 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md hover:border-pitch-200 hover:-translate-y-0.5">
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pitch-600 text-white font-bold text-sm shadow-sm">
            {agent.firstName[0]}{agent.lastName[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-stadium-900 text-[15px]">
                {agent.firstName} {agent.lastName}
              </span>
              {agent.isVerified && (
                <Badge className="bg-pitch-50 text-pitch-700 border border-pitch-200 text-[10px] px-1.5 py-0 font-semibold rounded-md">
                  <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                  Verifie
                </Badge>
              )}
            </div>
            {agent.agencyName && (
              <p className="text-xs text-stadium-400 flex items-center gap-1 mt-0.5">
                <Building2 className="h-3 w-3" />
                {agent.agencyName}
              </p>
            )}
          </div>
        </div>

        {agent.licenseNumber && (
          <p className="text-xs text-stadium-500 flex items-center gap-1.5">
            <Award className="h-3 w-3 text-pitch-600" />
            Licence {agent.licenseNumber}
            {agent.licenseCountry && (
              <>
                <span className="text-stadium-300 mx-0.5">·</span>
                <MapPin className="h-3 w-3" />
                {agent.licenseCountry}
              </>
            )}
          </p>
        )}

        {agent.bio && (
          <p className="text-sm text-stadium-500 line-clamp-2 leading-relaxed">
            {agent.bio}
          </p>
        )}

        {visibleTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleTags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-block bg-stadium-50 text-stadium-600 border border-stadium-200/60 rounded-lg px-2.5 py-0.5 text-[11px] font-medium"
              >
                {tag}
              </span>
            ))}
            {hiddenCount > 0 && (
              <span className="inline-block bg-stadium-100 text-stadium-500 rounded-lg px-2 py-0.5 text-[11px] font-medium">
                +{hiddenCount}
              </span>
            )}
          </div>
        )}

        {hasExtra && (
          <>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-stadium-400 hover:text-pitch-600 transition-colors font-medium"
              aria-expanded={expanded}
              aria-label="Voir plus d'informations"
            >
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              />
              {expanded ? "Moins" : "Plus d'infos"}
            </button>
            <div
              className={`overflow-hidden transition-all duration-250 ease-out ${
                expanded ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="space-y-1 pt-1">
                {agent.phoneNumber && (
                  <p className="flex items-center gap-2 text-xs text-stadium-500">
                    <Phone className="h-3 w-3 text-pitch-600" />
                    {agent.phoneNumber}
                  </p>
                )}
                {agent.website && (
                  <p className="flex items-center gap-2 text-xs">
                    <Globe className="h-3 w-3 text-pitch-600" />
                    <a
                      href={agent.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pitch-600 hover:text-pitch-700 hover:underline"
                    >
                      Visiter le site
                    </a>
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(agent)}
            className="flex-1 rounded-xl border-stadium-200 text-stadium-600 hover:border-pitch-300 hover:text-pitch-700 font-medium text-xs h-9 transition-all duration-200 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-pitch-500"
            aria-label={`Voir profil de ${agent.firstName} ${agent.lastName}`}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            Voir profil
          </Button>
          <Button
            size="sm"
            onClick={() => onProposeMandate(agent)}
            disabled={hasActiveMandate}
            className="flex-1 rounded-xl bg-pitch-600 hover:bg-pitch-700 text-white font-medium text-xs h-9 shadow-sm transition-all duration-200 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-pitch-500"
            aria-label={hasActiveMandate ? "Mandat existant" : `Contacter ${agent.firstName} ${agent.lastName}`}
          >
            {hasActiveMandate ? (
              <>
                <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                Mandat existant
              </>
            ) : (
              <>
                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                Contacter
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
