"use client"

import { cn } from "@/lib/utils"

export function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
        active
          ? "bg-pitch-600 text-white shadow-sm"
          : "bg-white text-stadium-600 ring-1 ring-stadium-200 hover:bg-pitch-50 hover:ring-pitch-200"
      )}
    >
      {children}
    </button>
  )
}
