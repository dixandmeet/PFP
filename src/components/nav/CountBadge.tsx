"use client"

import { cn } from "@/lib/utils"

interface CountBadgeProps {
  count: number
  variant?: "default" | "accent"
  className?: string
}

export function CountBadge({ count, variant = "default", className }: CountBadgeProps) {
  if (count <= 0) return null

  const display = count > 99 ? "99+" : String(count)

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-xs font-bold rounded-full leading-none",
        variant === "accent"
          ? "bg-pitch-600 text-white"
          : "bg-stadium-100 text-stadium-700",
        className
      )}
    >
      {display}
    </span>
  )
}
