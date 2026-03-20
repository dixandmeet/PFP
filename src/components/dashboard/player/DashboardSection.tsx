"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface DashboardSectionProps {
  id?: string
  title: string
  subtitle?: string
  rightSlot?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function DashboardSection({
  id,
  title,
  subtitle,
  rightSlot,
  children,
  className,
  contentClassName,
}: DashboardSectionProps) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 rounded-2xl border border-stadium-200 bg-white p-5 shadow-sm", className)}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-stadium-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-stadium-500">{subtitle}</p> : null}
        </div>
        {rightSlot}
      </div>
      <div className={contentClassName}>{children}</div>
    </section>
  )
}
