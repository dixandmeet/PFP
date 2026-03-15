"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StaffRow } from "./StaffRow"
import { PlayerRow, type TeamPlayerData } from "./PlayerRow"
import { EmptyState } from "./EmptyState"
import {
  UserPlus,
  Users,
  Shield,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Trash2,
  Pause,
  UserRoundPlus,
} from "lucide-react"
import { TEAM_LEVEL_LABELS, type TeamLevelValue } from "@/lib/constants/team-options"

interface StaffMember {
  id: string
  name: string
  role: string
  email?: string
}

interface Team {
  id: string
  name: string
  level: string
  division?: string | null
  category?: string | null
  competitionName?: string | null
  staffMembers: StaffMember[]
  teamPlayers: TeamPlayerData[]
}

interface TeamCardProps {
  team: Team
  onAddStaff: (team: Team) => void
  onAddPlayer: (team: Team) => void
  onDeleteStaff: (member: StaffMember) => void
  onDeletePlayer: (player: TeamPlayerData) => void
  onDeleteTeam: (team: Team) => void
}

/** Nombre de membres affichés par défaut avant "Voir tout". */
const DEFAULT_VISIBLE = 4

/** Retourne un label lisible pour le détail d'une équipe. */
function getTeamDetail(team: Team): string {
  const parts: string[] = []
  if (team.division) parts.push(team.division)
  if (team.category) parts.push(team.category)
  if (team.competitionName) parts.push(team.competitionName)
  return parts.join(" · ")
}

/** Style du badge de niveau. */
function getLevelBadgeStyle(level: string): string {
  switch (level) {
    case "PRO":
      return "bg-amber-50 text-amber-700 border-amber-200"
    case "AMATEUR":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "ACADEMY":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    default:
      return "bg-stadium-50 text-stadium-700 border-stadium-200"
  }
}

export function TeamCard({ team, onAddStaff, onAddPlayer, onDeleteStaff, onDeletePlayer, onDeleteTeam }: TeamCardProps) {
  const [showAllStaff, setShowAllStaff] = useState(false)
  const [showAllPlayers, setShowAllPlayers] = useState(false)

  const levelLabel = TEAM_LEVEL_LABELS[team.level as TeamLevelValue] || team.level
  const detail = getTeamDetail(team)
  const staffCount = team.staffMembers.length
  const playerCount = team.teamPlayers.length
  const hasMoreStaff = staffCount > DEFAULT_VISIBLE
  const hasMorePlayers = playerCount > DEFAULT_VISIBLE
  const visibleStaff = showAllStaff ? team.staffMembers : team.staffMembers.slice(0, DEFAULT_VISIBLE)
  const visiblePlayers = showAllPlayers ? team.teamPlayers : team.teamPlayers.slice(0, DEFAULT_VISIBLE)
  const hiddenStaffCount = staffCount - DEFAULT_VISIBLE
  const hiddenPlayerCount = playerCount - DEFAULT_VISIBLE

  return (
    <Card hover={false} className="overflow-hidden">
      {/* En-tête */}
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-stadium-900 truncate">{team.name}</h3>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-medium px-2.5 py-0.5 rounded-full border",
                  getLevelBadgeStyle(team.level)
                )}
              >
                {levelLabel}
              </Badge>
              {detail && (
                <span className="text-xs text-stadium-500">{detail}</span>
              )}
            </div>
            {/* Mini stats */}
            <div className="mt-2.5 flex items-center gap-3">
              <span className="inline-flex items-center gap-1 text-xs text-stadium-500">
                <Users className="h-3.5 w-3.5" />
                {playerCount} joueur{playerCount !== 1 ? "s" : ""}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-stadium-500">
                <Shield className="h-3.5 w-3.5" />
                {staffCount} staff
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddPlayer(team)}
              className="gap-1.5"
            >
              <UserRoundPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ajouter joueur</span>
              <span className="sm:hidden">Joueur</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddStaff(team)}
              className="gap-1.5"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ajouter staff</span>
              <span className="sm:hidden">Staff</span>
            </Button>

            {/* Menu kebab équipe */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-lg"
                  aria-label={`Actions pour l'équipe ${team.name}`}
                  animated={false}
                >
                  <MoreVertical className="h-4 w-4 text-stadium-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem disabled className="gap-2 text-stadium-500">
                  <Pause className="h-3.5 w-3.5" />
                  <span>Suspendre</span>
                  <span className="ml-auto text-[10px] text-stadium-400">bientôt</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                  onSelect={() => onDeleteTeam(team)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Supprimer l&apos;équipe</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Section Joueurs */}
        <div className="border-t border-stadium-100 pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stadium-400">
            Joueurs
          </p>

          {playerCount === 0 ? (
            <EmptyState
              icon={Users}
              title="Aucun joueur"
              description="Ajoutez votre premier joueur pour cette équipe."
              actionLabel="Ajouter joueur"
              onAction={() => onAddPlayer(team)}
              compact
            />
          ) : (
            <div className="space-y-0.5">
              {visiblePlayers.map((player) => (
                <PlayerRow
                  key={player.id}
                  player={player}
                  onDelete={onDeletePlayer}
                />
              ))}

              {hasMorePlayers && (
                <button
                  type="button"
                  onClick={() => setShowAllPlayers(!showAllPlayers)}
                  className={cn(
                    "flex w-full items-center justify-center gap-1.5 rounded-xl py-2 mt-1",
                    "text-xs font-medium text-pitch-600",
                    "hover:bg-pitch-50/60 transition-colors duration-150",
                    "focus:outline-none focus:ring-2 focus:ring-pitch-200 focus:ring-offset-1"
                  )}
                >
                  {showAllPlayers ? (
                    <>
                      Réduire
                      <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      Voir tous les joueurs (+{hiddenPlayerCount})
                      <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Section Staff */}
        <div className="border-t border-stadium-100 pt-3 mt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stadium-400">
            Staff
          </p>

          {staffCount === 0 ? (
            <EmptyState
              icon={Shield}
              title="Aucun membre du staff"
              description="Ajoutez votre premier membre du staff pour cette équipe."
              actionLabel="Ajouter staff"
              onAction={() => onAddStaff(team)}
              compact
            />
          ) : (
            <div className="space-y-0.5">
              {visibleStaff.map((member) => (
                <StaffRow
                  key={member.id}
                  member={member}
                  onDelete={onDeleteStaff}
                />
              ))}

              {hasMoreStaff && (
                <button
                  type="button"
                  onClick={() => setShowAllStaff(!showAllStaff)}
                  className={cn(
                    "flex w-full items-center justify-center gap-1.5 rounded-xl py-2 mt-1",
                    "text-xs font-medium text-pitch-600",
                    "hover:bg-pitch-50/60 transition-colors duration-150",
                    "focus:outline-none focus:ring-2 focus:ring-pitch-200 focus:ring-offset-1"
                  )}
                >
                  {showAllStaff ? (
                    <>
                      Réduire
                      <ChevronUp className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      Voir tout le staff (+{hiddenStaffCount})
                      <ChevronDown className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
