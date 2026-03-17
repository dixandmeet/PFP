"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"
import { CountBadge } from "./CountBadge"

interface SidebarItemProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  isActive?: boolean
  badge?: number
  badgeVariant?: "default" | "accent"
  danger?: boolean
  onClick?: () => void
}

export function SidebarItem({
  href,
  icon: Icon,
  label,
  isActive = false,
  badge,
  badgeVariant = "default",
  danger = false,
  onClick,
}: SidebarItemProps) {
  const content = (
    <>
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-pitch-600 rounded-r-full" />
      )}
      <Icon
        className={cn(
          "h-5 w-5 flex-shrink-0 transition-colors",
          isActive
            ? "text-pitch-600"
            : danger
              ? "text-red-400"
              : "text-stadium-400"
        )}
      />
      <span
        className={cn(
          "flex-1 text-[14px] font-medium transition-colors",
          isActive
            ? "text-pitch-700 font-semibold"
            : danger
              ? "text-red-600"
              : "text-stadium-700"
        )}
      >
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <CountBadge count={badge} variant={badgeVariant} />
      )}
      {!badge && !danger && (
        <ChevronRight
          className={cn(
            "h-4 w-4 flex-shrink-0 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0",
            isActive ? "text-pitch-400" : "text-stadium-300"
          )}
        />
      )}
    </>
  )

  const className = cn(
    "group relative flex items-center gap-3 h-11 px-3.5 mx-2 rounded-xl transition-all duration-150 outline-none",
    "focus-visible:ring-2 focus-visible:ring-pitch-500 focus-visible:ring-offset-1",
    isActive
      ? "bg-pitch-50/80"
      : danger
        ? "hover:bg-red-50/60"
        : "hover:bg-stadium-50",
    "active:scale-[0.99] active:bg-stadium-100/60"
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(className, "w-full text-left cursor-pointer")} suppressHydrationWarning>
        {content}
      </button>
    )
  }

  return (
    <Link href={href} className={className} suppressHydrationWarning>
      {content}
    </Link>
  )
}
