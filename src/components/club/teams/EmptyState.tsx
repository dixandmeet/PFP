"use client"

import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
  compact?: boolean
  /** Ligne dashed compacte pour sections internes (joueurs/staff). */
  inline?: boolean
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  compact = false,
  inline = false,
}: EmptyStateProps) {
  if (inline) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border border-dashed border-stadium-200 bg-stadium-50/50 px-3 py-2.5",
          className
        )}
      >
        <Icon className="h-4 w-4 shrink-0 text-stadium-400" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-stadium-600">{title}</p>
          {description && (
            <p className="text-[11px] text-stadium-400 truncate">{description}</p>
          )}
        </div>
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            size="sm"
            variant="ghost"
            className="h-7 shrink-0 px-2 text-xs text-pitch-600 hover:text-pitch-700 hover:bg-pitch-50"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-6" : "py-16",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl bg-stadium-50",
          compact ? "h-12 w-12 mb-3" : "h-16 w-16 mb-4"
        )}
      >
        <Icon className={cn("text-stadium-400", compact ? "h-6 w-6" : "h-8 w-8")} />
      </div>
      <p
        className={cn(
          "font-semibold text-stadium-700",
          compact ? "text-sm" : "text-base"
        )}
      >
        {title}
      </p>
      {description && (
        <p className={cn("mt-1 text-stadium-500", compact ? "text-xs" : "text-sm")}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size={compact ? "sm" : "default"}
          className="mt-4"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
