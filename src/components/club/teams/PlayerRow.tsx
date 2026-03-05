"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Trash2 } from "lucide-react"
import Image from "next/image"

export interface TeamPlayerData {
  id: string
  jerseyNumber?: number | null
  position?: string | null
  playerProfile: {
    id: string
    firstName: string
    lastName: string
    primaryPosition: string
    profilePicture?: string | null
  }
}

interface PlayerRowProps {
  player: TeamPlayerData
  onDelete: (player: TeamPlayerData) => void
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase()
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-pitch-100 text-pitch-700",
    "bg-blue-100 text-blue-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-violet-100 text-violet-700",
    "bg-emerald-100 text-emerald-700",
    "bg-cyan-100 text-cyan-700",
    "bg-orange-100 text-orange-700",
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getPositionBadgeStyle(position: string): string {
  switch (position) {
    case "GK":
      return "bg-amber-50 text-amber-700 border-amber-200"
    case "DF":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "MF":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "FW":
      return "bg-rose-50 text-rose-700 border-rose-200"
    default:
      return "bg-stadium-50 text-stadium-700 border-stadium-200"
  }
}

const POSITION_LABELS: Record<string, string> = {
  GK: "Gardien",
  DF: "Défenseur",
  MF: "Milieu",
  FW: "Attaquant",
}

export function PlayerRow({ player, onDelete }: PlayerRowProps) {
  const { playerProfile } = player
  const fullName = `${playerProfile.firstName} ${playerProfile.lastName}`
  const position = player.position || playerProfile.primaryPosition

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5",
        "transition-colors duration-150",
        "hover:bg-stadium-50/70",
        "focus-within:bg-stadium-50/70 focus-within:ring-1 focus-within:ring-pitch-200"
      )}
    >
      {/* Avatar */}
      <div className="relative h-9 w-9 shrink-0">
        {playerProfile.profilePicture ? (
          <Image
            src={playerProfile.profilePicture}
            alt={fullName}
            fill
            className="rounded-full object-cover"
            sizes="36px"
          />
        ) : (
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold",
              getAvatarColor(fullName)
            )}
            aria-hidden="true"
          >
            {getInitials(playerProfile.firstName, playerProfile.lastName)}
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-stadium-900 truncate">{fullName}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[11px] font-medium px-2 py-0 h-5 rounded-full border",
              getPositionBadgeStyle(position)
            )}
          >
            {POSITION_LABELS[position] || position}
          </Badge>
          {player.jerseyNumber && (
            <span className="text-[11px] text-stadium-400 font-medium">
              #{player.jerseyNumber}
            </span>
          )}
        </div>
      </div>

      {/* Actions menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 shrink-0 rounded-lg",
              "opacity-0 group-hover:opacity-100 focus:opacity-100",
              "transition-opacity duration-150"
            )}
            aria-label={`Actions pour ${fullName}`}
            animated={false}
          >
            <MoreHorizontal className="h-4 w-4 text-stadium-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
            onSelect={() => onDelete(player)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Retirer de l&apos;équipe</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
