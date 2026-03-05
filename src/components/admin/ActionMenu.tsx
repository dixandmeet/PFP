"use client"

import { MoreHorizontal, Eye, Pencil, Trash2, Ban, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface ActionItem {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: () => void
  variant?: "default" | "destructive"
  disabled?: boolean
}

interface ActionMenuProps {
  actions: ActionItem[]
  label?: string
}

export function ActionMenu({ actions, label = "Actions" }: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <DropdownMenuItem
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={action.variant === "destructive" ? "text-red-600 focus:text-red-600" : ""}
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {action.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Pre-built action sets for common use cases
export const commonActions = {
  view: (onClick: () => void): ActionItem => ({
    label: "Voir",
    icon: Eye,
    onClick,
  }),
  edit: (onClick: () => void): ActionItem => ({
    label: "Modifier",
    icon: Pencil,
    onClick,
  }),
  delete: (onClick: () => void): ActionItem => ({
    label: "Supprimer",
    icon: Trash2,
    onClick,
    variant: "destructive",
  }),
  ban: (onClick: () => void): ActionItem => ({
    label: "Bannir",
    icon: Ban,
    onClick,
    variant: "destructive",
  }),
  approve: (onClick: () => void): ActionItem => ({
    label: "Approuver",
    icon: CheckCircle,
    onClick,
  }),
  reject: (onClick: () => void): ActionItem => ({
    label: "Rejeter",
    icon: XCircle,
    onClick,
    variant: "destructive",
  }),
}
