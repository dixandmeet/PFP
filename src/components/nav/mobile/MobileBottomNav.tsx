"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  MessageCircle,
  Target,
  Search,
  Menu,
  Users,
  ClipboardList,
} from "lucide-react"
import { useMobileNav } from "./MobileNavContext"

type Role = "PLAYER" | "AGENT" | "CLUB" | "CLUB_STAFF"
type ClubMemberRole = "OWNER" | "ADMIN" | "STAFF" | "VIEWER"

interface BottomNavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  isMessage?: boolean
}

function canManageMembers(role?: ClubMemberRole): boolean {
  return role === "OWNER" || role === "ADMIN"
}

function getNavItems(role: Role, clubMemberRole?: ClubMemberRole): BottomNavItem[] {
  if (role === "PLAYER") {
    return [
      { href: "/player/dashboard", icon: LayoutDashboard, label: "Accueil" },
      { href: "/player/messages", icon: MessageCircle, label: "Messages", isMessage: true },
      { href: "/player/opportunities", icon: Target, label: "Annonces" },
      { href: "/search", icon: Search, label: "Recherche" },
    ]
  }
  if (role === "AGENT") {
    return [
      { href: "/agent/dashboard", icon: LayoutDashboard, label: "Accueil" },
      { href: "/agent/messages", icon: MessageCircle, label: "Messages", isMessage: true },
      { href: "/agent/players", icon: Users, label: "Joueurs" },
      { href: "/search", icon: Search, label: "Recherche" },
    ]
  }
  if (role === "CLUB") {
    return [
      { href: "/club/dashboard", icon: LayoutDashboard, label: "Accueil" },
      { href: "/club/messages", icon: MessageCircle, label: "Messages", isMessage: true },
      { href: "/club/recruitment", icon: ClipboardList, label: "Recrutement" },
      { href: "/search", icon: Search, label: "Recherche" },
    ]
  }
  // CLUB_STAFF — aligné sur le menu unifié
  const items: BottomNavItem[] = [
    { href: "/club/dashboard", icon: LayoutDashboard, label: "Accueil" },
    { href: "/club/messages", icon: MessageCircle, label: "Messages", isMessage: true },
  ]
  if (canManageMembers(clubMemberRole)) {
    items.push({ href: "/club/staff/admin", icon: Users, label: "Membres" })
  } else {
    items.push({ href: "/club/recruitment", icon: ClipboardList, label: "Recrutement" })
  }
  items.push({ href: "/search", icon: Search, label: "Recherche" })
  return items
}

export function MobileBottomNav({
  role,
  clubMemberRole,
}: {
  role: Role
  clubMemberRole?: ClubMemberRole
}) {
  const pathname = usePathname()
  const { setSidebarOpen } = useMobileNav()
  const [messageCount, setMessageCount] = useState(0)
  const items = getNavItems(role, clubMemberRole)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/messages/conversations?unreadOnly=true&limit=1")
        if (res.ok) {
          const data = await res.json()
          setMessageCount(data.total ?? data.conversations?.length ?? 0)
        }
      } catch {}
    }
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [])

  const isActive = (href: string) => {
    if (href === "/search") return pathname === href || pathname.startsWith("/search")
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white border-t border-stadium-200 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
      <div className="flex h-full items-stretch justify-around">
        {items.map((item) => {
          const active = isActive(item.href)
          const badge = item.isMessage ? messageCount : 0

          return (
            <Link
              key={item.href}
              href={item.href}
              suppressHydrationWarning
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 relative transition-colors",
                active ? "text-pitch-600" : "text-stadium-400 hover:text-stadium-600"
              )}
            >
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-pitch-600 rounded-b-full" />
              )}
              <div className="relative">
                <item.icon className="h-[22px] w-[22px]" />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-0.5 text-[9px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] leading-none",
                  active ? "font-semibold" : "font-medium"
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}

        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          suppressHydrationWarning
          className="flex flex-col items-center justify-center gap-1 flex-1 text-stadium-400 hover:text-stadium-600 transition-colors"
        >
          <Menu className="h-[22px] w-[22px]" />
          <span className="text-[10px] font-medium leading-none">Plus</span>
        </button>
      </div>
    </div>
  )
}
