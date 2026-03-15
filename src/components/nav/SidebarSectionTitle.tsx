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
        "px-4 pt-5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-stadium-400 select-none",
        className
      )}
    >
      {title}
    </h4>
  )
}
