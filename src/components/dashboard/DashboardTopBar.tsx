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
    <div className="rounded-2xl border border-stadium-200 bg-white/90 p-4 shadow-sm sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-[2rem] leading-[1.05] sm:text-3xl font-bold text-stadium-900 tracking-tight">
        {title}
      </h1>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="w-full sm:w-auto">
          <Button
            variant="outline"
            className="w-full sm:w-auto border border-pitch-200 text-pitch-700 hover:bg-pitch-50 rounded-xl h-11 px-4 font-semibold justify-between sm:justify-center"
          >
            {ctaLabel}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
      )}
      </div>
    </div>
  )
}
