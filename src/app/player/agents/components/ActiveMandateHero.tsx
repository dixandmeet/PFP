"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  Clock,
  Calendar,
  Eye,
  MessageSquare,
  Search,
  Users,
} from "lucide-react"

interface ActiveMandateHeroProps {
  activeMandate: {
    id: string
    status: string
    startDate: string
    endDate: string
    agentProfile: {
      firstName: string
      lastName: string
      agencyName?: string
      profilePicture?: string
    }
  } | null
  onViewProfile?: () => void
  onContact?: () => void
  onFindAgent?: () => void
}

export function ActiveMandateHero({
  activeMandate,
  onViewProfile,
  onContact,
  onFindAgent,
}: ActiveMandateHeroProps) {
  if (!activeMandate) {
    return (
      <div className="mb-8 rounded-2xl border border-dashed border-stadium-200 bg-stadium-50/50 px-6 py-10 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stadium-100">
          <Users className="h-5 w-5 text-stadium-400" />
        </div>
        <p className="text-base font-semibold text-stadium-700 mb-1">
          Aucun mandat actif
        </p>
        <p className="text-sm text-stadium-500 mb-4">
          Recherchez un agent pour commencer votre collaboration
        </p>
        <Button
          onClick={onFindAgent}
          className="bg-pitch-600 hover:bg-pitch-700 text-white font-semibold rounded-xl px-5 h-10 shadow-sm transition-all duration-200 active:scale-[0.97]"
          aria-label="Trouver un agent"
        >
          <Search className="mr-2 h-4 w-4" />
          Trouver un agent
        </Button>
      </div>
    )
  }

  const isActive = activeMandate.status === "ACTIVE"
  const StatusIcon = isActive ? CheckCircle : Clock

  return (
    <div className="mb-8 rounded-2xl border border-pitch-200/60 bg-gradient-to-r from-pitch-50/80 to-white px-6 py-5 shadow-sm">
      <div className="flex items-center gap-5 flex-wrap">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-pitch-600 text-white font-bold text-lg shadow-sm">
            {activeMandate.agentProfile.firstName[0]}
            {activeMandate.agentProfile.lastName[0]}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <Badge
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  isActive
                    ? "bg-pitch-100 text-pitch-700 border-pitch-200"
                    : "bg-yellow-100 text-yellow-700 border-yellow-200"
                }`}
              >
                <StatusIcon className="h-3 w-3 mr-1" />
                {isActive ? "Mandat actif" : "En attente"}
              </Badge>
            </div>
            <p className="text-base font-bold text-stadium-900 truncate">
              {activeMandate.agentProfile.firstName} {activeMandate.agentProfile.lastName}
              {activeMandate.agentProfile.agencyName && (
                <span className="font-normal text-stadium-500"> · {activeMandate.agentProfile.agencyName}</span>
              )}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-stadium-400 mt-0.5">
              <Calendar className="h-3 w-3" />
              Du {new Date(activeMandate.startDate).toLocaleDateString("fr-FR")} au{" "}
              {new Date(activeMandate.endDate).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewProfile}
            className="rounded-xl border-stadium-200 text-stadium-700 hover:border-pitch-300 hover:text-pitch-700 font-medium transition-all duration-200 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-pitch-500"
            aria-label="Voir profil de l'agent"
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            Voir profil
          </Button>
          <Button
            size="sm"
            onClick={onContact}
            className="rounded-xl bg-pitch-600 hover:bg-pitch-700 text-white font-medium shadow-sm transition-all duration-200 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-pitch-500"
            aria-label="Contacter l'agent"
          >
            <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
            Contacter
          </Button>
        </div>
      </div>
    </div>
  )
}
