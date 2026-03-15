"use client"

import { cn } from "@/lib/utils"
import type { InterestType } from "@/types/interests"

const CONFIG: Record<InterestType, { label: string; className: string }> = {
  favorite: {
    label: "FAVORI",
    className: "bg-gold-100 text-gold-800 border-gold-200",
  },
  interest: {
    label: "INTÉRÊT",
    className: "bg-pitch-100 text-pitch-800 border-pitch-200",
  },
  contact_request: {
    label: "DEMANDE CONTACT",
    className: "bg-victory-100 text-victory-800 border-victory-200",
  },
}

interface BadgePillProps {
  type: InterestType
  className?: string
}

export function BadgePill({ type, className }: BadgePillProps) {
  const { label, className: pillClass } = CONFIG[type]

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border",
        pillClass,
        className
      )}
    >
      {label}
    </span>
  )
}
