"use client"

import { useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
import type { ClubTeam, StaffMember } from "@/lib/club/teams"
import {
  UserPlus,
  Users,
  Shield,
  ChevronDown,
  MoreVertical,
  Trash2,
  Pause,
  UserRoundPlus,
} from "lucide-react"
import { TEAM_LEVEL_LABELS, type TeamLevelValue } from "@/lib/constants/team-options"

export type { TeamPlayerData, StaffMember, ClubTeam }

interface TeamCardProps {
  team: ClubTeam
  onAddStaff: (team: ClubTeam) => void
  onAddPlayer: (team: ClubTeam) => void
  onDeleteStaff: (member: StaffMember) => void
  onDeletePlayer: (player: TeamPlayerData) => void
  onDeleteTeam: (team: ClubTeam) => void
}

const DEFAULT_VISIBLE = 4

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

function TeamActions({
  team,
  onAddPlayer,
  onAddStaff,
  onDeleteTeam,
}: Pick<TeamCardProps, "team" | "onAddPlayer" | "onAddStaff" | "onDeleteTeam">) {
  return (
    <div
      className="flex items-center gap-1.5 shrink-0"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddPlayer(team)}
        className="gap-1.5 h-8"
      >
        <UserRoundPlus className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Joueur</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAddStaff(team)}
        className="gap-1.5 h-8"
      >
        <UserPlus className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Staff</span>
      </Button>
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
  )
}

function MemberSection<T>({
  title,
  icon: Icon,
  items,
  visibleItems,
  showAll,
  onToggleShowAll,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  renderRow,
}: {
  title: string
  icon: typeof Users
  items: T[]
  visibleItems: T[]
  showAll: boolean
  onToggleShowAll: () => void
  emptyTitle: string
  emptyDescription: string
  emptyActionLabel: string
  onEmptyAction: () => void
  renderRow: (item: T) => ReactNode
}) {
  const count = items.length
  const hiddenCount = count - DEFAULT_VISIBLE
  const hasMore = count > DEFAULT_VISIBLE

  return (
    <div>
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stadium-400">
        <Icon className="h-3.5 w-3.5" />
        {title}
        {count > 0 && (
          <span className="font-normal normal-case text-stadium-400">({count})</span>
        )}
      </p>

      {count === 0 ? (
        <EmptyState
          icon={Icon}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
          inline
        />
      ) : (
        <div className="space-y-0.5">
          {visibleItems.map(renderRow)}
          {hasMore && (
            <button
              type="button"
              onClick={onToggleShowAll}
              className={cn(
                "flex w-full items-center justify-center gap-1.5 rounded-xl py-1.5 mt-1",
                "text-xs font-medium text-pitch-600",
                "hover:bg-pitch-50/60 transition-colors duration-150"
              )}
            >
              {showAll ? "Réduire" : `Voir tout (+${hiddenCount})`}
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform", showAll && "rotate-180")}
              />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function TeamCard({
  team,
  onAddStaff,
  onAddPlayer,
  onDeleteStaff,
  onDeletePlayer,
  onDeleteTeam,
}: TeamCardProps) {
  const [showAllStaff, setShowAllStaff] = useState(false)
  const [showAllPlayers, setShowAllPlayers] = useState(false)

  const levelLabel = TEAM_LEVEL_LABELS[team.level as TeamLevelValue] || team.level
  const staffCount = team.staffMembers.length
  const playerCount = team.teamPlayers.length
  const visibleStaff = showAllStaff
    ? team.staffMembers
    : team.staffMembers.slice(0, DEFAULT_VISIBLE)
  const visiblePlayers = showAllPlayers
    ? team.teamPlayers
    : team.teamPlayers.slice(0, DEFAULT_VISIBLE)

  return (
    <AccordionItem
      value={team.id}
      className="overflow-hidden rounded-2xl border border-stadium-200 bg-white shadow-sm border-b-0"
    >
      <div className="px-4 pt-4 pb-0 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <AccordionTrigger className="group flex-1 py-0 hover:no-underline [&>svg:last-child]:hidden">
            <div className="flex min-w-0 flex-1 items-start gap-2 text-left">
              <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-stadium-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-stadium-900 truncate sm:text-lg">
                  {team.name}
                </h3>
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
                  {team.category && (
                    <Badge
                      variant="outline"
                      className="text-xs font-medium px-2.5 py-0.5 rounded-full border bg-stadium-50 text-stadium-600 border-stadium-200"
                    >
                      {team.category}
                    </Badge>
                  )}
                  {team.division && (
                    <Badge
                      variant="outline"
                      className="text-xs font-medium px-2.5 py-0.5 rounded-full border bg-stadium-50 text-stadium-700 border-stadium-200"
                    >
                      {team.division}
                    </Badge>
                  )}
                  {team.competitionName && (
                    <span className="text-xs text-stadium-500 truncate max-w-[200px]">
                      {team.competitionName}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-3">
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
            </div>
          </AccordionTrigger>

          <TeamActions
            team={team}
            onAddPlayer={onAddPlayer}
            onAddStaff={onAddStaff}
            onDeleteTeam={onDeleteTeam}
          />
        </div>
      </div>

      <AccordionContent className="px-4 pb-4 sm:px-5">
        <div className="mt-3 grid gap-4 border-t border-stadium-100 pt-4 md:grid-cols-2">
          <MemberSection
            title="Joueurs"
            icon={Users}
            items={team.teamPlayers}
            visibleItems={visiblePlayers}
            showAll={showAllPlayers}
            onToggleShowAll={() => setShowAllPlayers(!showAllPlayers)}
            emptyTitle="Aucun joueur"
            emptyDescription="Ajoutez votre premier joueur"
            emptyActionLabel="Ajouter"
            onEmptyAction={() => onAddPlayer(team)}
            renderRow={(player) => (
              <PlayerRow
                key={player.id}
                player={player}
                onDelete={onDeletePlayer}
              />
            )}
          />
          <MemberSection
            title="Staff"
            icon={Shield}
            items={team.staffMembers}
            visibleItems={visibleStaff}
            showAll={showAllStaff}
            onToggleShowAll={() => setShowAllStaff(!showAllStaff)}
            emptyTitle="Aucun staff"
            emptyDescription="Ajoutez un membre du staff"
            emptyActionLabel="Ajouter"
            onEmptyAction={() => onAddStaff(team)}
            renderRow={(member) => (
              <StaffRow
                key={member.id}
                member={member}
                onDelete={onDeleteStaff}
              />
            )}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
