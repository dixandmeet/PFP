"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, Bell, Search } from "lucide-react"
import { FootballIcon } from "@/components/auth/icons"
import { useMobileNav } from "./MobileNavContext"

type Role = "PLAYER" | "AGENT" | "CLUB" | "CLUB_STAFF"

export function MobileHeader({ role }: { role: Role }) {
  const { setSidebarOpen } = useMobileNav()
  const [notifCount, setNotifCount] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/notifications?unreadOnly=true&limit=1")
        if (res.ok) {
          const data = await res.json()
          setNotifCount(data.unreadCount ?? data.total ?? data.notifications?.length ?? 0)
        }
      } catch {}
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [pathname])

  const notifHref = `/${role.toLowerCase()}/notifications`

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-3 bg-white border-b border-stadium-200 shadow-sm">
      {/* Hamburger */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="p-2 rounded-xl hover:bg-stadium-50 transition-colors"
        aria-label="Ouvrir le menu"
        suppressHydrationWarning
      >
        <Menu className="h-5 w-5 text-stadium-700" />
      </button>

      {/* Logo centré */}
      <Link href="/" className="flex items-center gap-2" suppressHydrationWarning>
        <FootballIcon className="w-6 h-6 rounded-md" variant="dark" />
        <span className="text-[14px] font-bold text-stadium-900 tracking-tight">
          Profoot Profile
        </span>
      </Link>

      {/* Actions droite */}
      <div className="flex items-center gap-0.5">
        <Link
          href="/search"
          className="p-2 rounded-xl hover:bg-stadium-50 transition-colors"
          aria-label="Recherche"
          suppressHydrationWarning
        >
          <Search className="h-5 w-5 text-stadium-600" />
        </Link>
        <Link
          href={notifHref}
          className="relative p-2 rounded-xl hover:bg-stadium-50 transition-colors"
          aria-label="Notifications"
          suppressHydrationWarning
        >
          <Bell className="h-5 w-5 text-stadium-600" />
          {notifCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </Link>
      </div>
    </div>
  )
}
