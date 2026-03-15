"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface DashboardTopBarProps {
  title: string
  ctaLabel?: string
  ctaHref?: string
}

export function DashboardTopBar({ title, ctaLabel, ctaHref }: DashboardTopBarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-stadium-900 tracking-tight">
        {title}
      </h1>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref}>
          <Button
            variant="outline"
            className="border border-pitch-200 text-pitch-700 hover:bg-pitch-50 rounded-xl h-10 font-semibold"
          >
            {ctaLabel}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  )
}
