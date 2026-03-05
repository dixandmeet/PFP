"use client"

import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

interface KPIStatCardProps {
  label: string
  value: number
  icon: LucideIcon
  iconClassName?: string
}

export function KPIStatCard({ label, value, icon: Icon, iconClassName }: KPIStatCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-stadium-200 bg-white px-5 py-4",
        "shadow-sm hover:shadow-md transition-shadow duration-200"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          iconClassName ?? "bg-pitch-50 text-pitch-600"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none text-stadium-900">{value}</p>
        <p className="mt-1 text-xs font-medium text-stadium-500 truncate">{label}</p>
      </div>
    </div>
  )
}
