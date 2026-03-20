"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

interface OpportunityCardProps {
  icon: LucideIcon
  title: string
  description: string
  ctaLabel: string
  href: string
}

export function OpportunityCard({
  icon: Icon,
  title,
  description,
  ctaLabel,
  href,
}: OpportunityCardProps) {
  return (
    <div className="rounded-xl border border-stadium-200 bg-white p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-pitch-100 text-pitch-700">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm font-semibold text-stadium-900">{title}</p>
      <p className="mt-1 text-xs text-stadium-500">{description}</p>
      <Link href={href} className="mt-3 inline-block">
        <Button variant="outline" size="sm" className="h-8 rounded-lg border-pitch-200 text-pitch-700">
          {ctaLabel}
        </Button>
      </Link>
    </div>
  )
}
