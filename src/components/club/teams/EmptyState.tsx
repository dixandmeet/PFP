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
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  compact = false,
}: EmptyStateProps) {
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
