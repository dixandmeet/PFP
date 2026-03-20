"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

interface ActionItemProps {
  icon: LucideIcon
  label: string
  description: string
  ctaLabel: string
  href: string
  done?: boolean
}

export function ActionItem({
  icon: Icon,
  label,
  description,
  ctaLabel,
  href,
  done = false,
}: ActionItemProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-stadium-200 bg-white p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            done ? "bg-pitch-100 text-pitch-700" : "bg-stadium-100 text-stadium-700"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-stadium-900">{label}</p>
          <p className="truncate text-xs text-stadium-500">{description}</p>
        </div>
      </div>

      {done ? (
        <span className="rounded-full bg-pitch-100 px-2 py-1 text-xs font-semibold text-pitch-700">
          Fait
        </span>
      ) : (
        <Link href={href}>
          <Button size="sm" className="h-8 rounded-lg bg-pitch-600 hover:bg-pitch-700">
            {ctaLabel}
          </Button>
        </Link>
      )}
    </div>
  )
}
