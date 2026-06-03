"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  type ClubRecruitmentItem,
  SOURCE_LABELS,
  getInitials,
  formatPosition,
} from "@/lib/club/recruitment"
import { cn } from "@/lib/utils"
import {
  Eye,
  Shield,
  Target,
  Calendar,
  MapPin,
  User,
  ArrowLeftRight,
} from "lucide-react"

interface RecruitmentCardProps {
  item: ClubRecruitmentItem
  statusInfo: { label: string; color: string }
  onViewDetails: () => void
  muted?: boolean
}

export function RecruitmentCard({
  item,
  statusInfo,
  onViewDetails,
  muted = false,
}: RecruitmentCardProps) {
  const { player, agent, listing } = item
  const isAgent = item.source === "submission"

  return (
    <article
      className={cn(
        "group flex flex-col rounded-2xl border border-stadium-200 bg-white p-4 shadow-sm transition-all duration-200",
        "hover:border-pitch-200 hover:shadow-md",
        muted && "opacity-70"
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-11 w-11 shrink-0 border border-stadium-100">
          <AvatarFallback
            className={cn(
              "text-sm font-semibold",
              isAgent ? "bg-violet-50 text-violet-700" : "bg-pitch-50 text-pitch-700"
            )}
          >
            {getInitials(player.firstName, player.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-stadium-900">
                {player.firstName} {player.lastName}
              </h3>
              <p className="text-sm text-stadium-500">
                {formatPosition(player.primaryPosition)}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  isAgent
                    ? "border-violet-200 text-violet-700"
                    : "border-pitch-200 text-pitch-700"
                )}
              >
                {isAgent ? (
                  <ArrowLeftRight className="mr-1 h-3 w-3 inline" />
                ) : (
                  <User className="mr-1 h-3 w-3 inline" />
                )}
                {SOURCE_LABELS[item.source]}
              </Badge>
              <Badge className={cn("border text-xs", statusInfo.color)}>
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-stadium-600">
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-stadium-400" />
          {player.nationality}
        </p>
        {agent && (
          <p className="flex items-center gap-2">
            <Shield className="h-4 w-4 shrink-0 text-stadium-400" />
            <span className="truncate">
              {agent.firstName} {agent.lastName}
              {agent.agencyName && (
                <span className="text-stadium-400"> · {agent.agencyName}</span>
              )}
            </span>
          </p>
        )}
        {listing && (
          <p className="flex items-center gap-2">
            <Target className="h-4 w-4 shrink-0 text-pitch-500" />
            <span className="truncate">{listing.title}</span>
          </p>
        )}
        <p className="flex items-center gap-2 text-stadium-400 text-xs">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(item.createdAt).toLocaleDateString("fr-FR")}
        </p>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="mt-4 w-full rounded-xl border-stadium-200 group-hover:border-pitch-300 group-hover:bg-pitch-50 group-hover:text-pitch-700"
        onClick={onViewDetails}
      >
        <Eye className="mr-2 h-4 w-4" />
        Voir les détails
      </Button>
    </article>
  )
}
