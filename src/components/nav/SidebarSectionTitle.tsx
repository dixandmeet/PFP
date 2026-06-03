"use client"

import { cn } from "@/lib/utils"

interface SidebarSectionTitleProps {
  title: string
  className?: string
}

export function SidebarSectionTitle({ title, className }: SidebarSectionTitleProps) {
  return (
    <h4
      className={cn(
        "px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-stadium-400 select-none",
        className
      )}
      suppressHydrationWarning
    >
      {title}
    </h4>
  )
}
