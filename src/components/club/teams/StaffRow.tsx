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
import { MoreHorizontal, Pencil, Trash2, Mail } from "lucide-react"

interface StaffMember {
  id: string
  name: string
  role: string
  email?: string
}

interface StaffRowProps {
  member: StaffMember
  onDelete: (member: StaffMember) => void
}

/** Génère les initiales à partir du nom (max 2 lettres). */
function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

/** Couleur d'avatar déterministe basée sur le nom. */
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

/** Couleur de badge déterministe basée sur le rôle. */
function getRoleBadgeStyle(role: string): string {
  const lower = role.toLowerCase()
  if (lower.includes("coach") || lower.includes("entraîneur") || lower.includes("entraineur")) {
    return "bg-pitch-50 text-pitch-700 border-pitch-200"
  }
  if (lower.includes("scout")) {
    return "bg-blue-50 text-blue-700 border-blue-200"
  }
  if (lower.includes("directeur") || lower.includes("director")) {
    return "bg-amber-50 text-amber-700 border-amber-200"
  }
  if (lower.includes("fitness") || lower.includes("prépar")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200"
  }
  return "bg-stadium-50 text-stadium-700 border-stadium-200"
}

export function StaffRow({ member, onDelete }: StaffRowProps) {
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
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          getAvatarColor(member.name)
        )}
        aria-hidden="true"
      >
        {getInitials(member.name)}
      </div>

      {/* Infos */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-stadium-900 truncate">{member.name}</p>
        <div className="mt-0.5 flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[11px] font-medium px-2 py-0 h-5 rounded-full border",
              getRoleBadgeStyle(member.role)
            )}
          >
            {member.role}
          </Badge>
          {member.email && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-stadium-400 truncate">
              <Mail className="h-3 w-3 shrink-0" />
              {member.email}
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
            aria-label={`Actions pour ${member.name}`}
            animated={false}
          >
            <MoreHorizontal className="h-4 w-4 text-stadium-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {/* Modifier — disabled pour l'instant */}
          <DropdownMenuItem disabled className="gap-2 text-stadium-500">
            <Pencil className="h-3.5 w-3.5" />
            <span>Modifier</span>
            <span className="ml-auto text-[10px] text-stadium-400">bientôt</span>
          </DropdownMenuItem>
          {/* Supprimer */}
          <DropdownMenuItem
            className="gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
            onSelect={() => onDelete(member)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Supprimer</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
