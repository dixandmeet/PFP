"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, ChevronRight, ClipboardList, Coins, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { CountBadge } from "@/components/nav/CountBadge"

const STATIC_ACCOUNT_LINKS = [
  {
    label: "Crédits",
    href: "/club/credits",
    icon: Coins,
    description: "Solde et retraits",
  },
  {
    label: "Notifications",
    href: "/club/notifications",
    icon: Bell,
    description: "Alertes et messages",
    showNotifBadge: true,
  },
  {
    label: "Paramètres",
    href: "/club/settings",
    icon: Settings,
    description: "Compte et sécurité",
  },
] as const

function getOnboardingLink(role: string | null) {
  if (role === "CLUB") {
    return {
      label: "Onboarding club",
      href: "/club/onboarding",
      description: "Reprendre l'enregistrement",
    }
  }

  return {
    label: "Onboarding staff",
    href: "/club/staff-onboarding",
    description: "Reprendre l'inscription",
  }
}

export function StaffProfileAccountLinks() {
  const pathname = usePathname()
  const [notifCount, setNotifCount] = useState(0)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    async function loadUserRole() {
      try {
        const res = await fetch("/api/users/me")
        if (res.ok) {
          const data = await res.json()
          setUserRole(data.role ?? null)
        }
      } catch {
        // silently fail
      }
    }
    loadUserRole()
  }, [])

  useEffect(() => {
    async function loadNotifCount() {
      try {
        const res = await fetch("/api/notifications?unreadOnly=true&limit=1")
        if (res.ok) {
          const data = await res.json()
          setNotifCount(data.unreadCount ?? data.total ?? data.notifications?.length ?? 0)
        }
      } catch {
        // silently fail
      }
    }
    loadNotifCount()
    const interval = setInterval(loadNotifCount, 15000)
    return () => clearInterval(interval)
  }, [pathname])

  const onboardingLink = getOnboardingLink(userRole)
  const accountLinks = [
    {
      ...onboardingLink,
      icon: ClipboardList,
    },
    ...STATIC_ACCOUNT_LINKS,
  ]

  return (
    <div className="rounded-2xl border border-stadium-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-stadium-400">
        Raccourcis compte
      </h2>
      <nav className="space-y-1">
        {accountLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
          const badge =
            "showNotifBadge" in link && link.showNotifBadge && notifCount > 0
              ? notifCount
              : undefined

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                isActive
                  ? "bg-pitch-50 ring-1 ring-pitch-200"
                  : "hover:bg-stadium-50"
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                  isActive ? "bg-pitch-100 text-pitch-600" : "bg-stadium-100 text-stadium-500 group-hover:bg-stadium-200"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-sm font-medium leading-tight",
                    isActive ? "text-pitch-700" : "text-stadium-800"
                  )}
                >
                  {link.label}
                </span>
                <span className="block truncate text-xs text-stadium-400">{link.description}</span>
              </div>
              {badge !== undefined && <CountBadge count={badge} variant="accent" />}
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5",
                  isActive ? "text-pitch-400" : "text-stadium-300"
                )}
              />
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
