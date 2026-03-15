import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

type Role = "PLAYER" | "AGENT" | "CLUB" | "CLUB_STAFF" | "ADMIN"

interface UserBadgeProps {
  role: Role
  className?: string
}

const roleConfig: Record<Role, { label: string; className: string }> = {
  PLAYER: {
    label: "Joueur",
    className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
  },
  AGENT: {
    label: "Agent",
    className: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
  },
  CLUB: {
    label: "Club",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  },
  CLUB_STAFF: {
    label: "Staff Club",
    className: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100",
  },
  ADMIN: {
    label: "Admin",
    className: "bg-slate-800 text-white border-slate-800 hover:bg-slate-700",
  },
}

export function UserBadge({ role, className }: UserBadgeProps) {
  const config = roleConfig[role]
  
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  )
}

// Status badges for various entities
type Status = "active" | "pending" | "inactive" | "banned" | "verified"

interface StatusBadgeProps {
  status: Status
  className?: string
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  active: {
    label: "Actif",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  pending: {
    label: "En attente",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  inactive: {
    label: "Inactif",
    className: "bg-slate-50 text-slate-600 border-slate-200",
  },
  banned: {
    label: "Banni",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  verified: {
    label: "Vérifié",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  )
}
