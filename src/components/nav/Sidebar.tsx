"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Search,
  Users,
  Bell,
  Settings,
  LogOut,
  Building2,
  Send,
  Target,
  Menu,
  X,
  Trophy,
  MessageCircle,
  Coins,
  Film,
  UserCircle,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { ProfileHeaderCard } from "./ProfileHeaderCard"
import { ProfileSwitcher } from "./ProfileSwitcher"
import { SidebarItem } from "./SidebarItem"
import { SidebarSectionTitle } from "./SidebarSectionTitle"


interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  badgeVariant?: "default" | "accent"
}

interface NavSection {
  title: string
  items: NavItem[]
}

interface SidebarProps {
  role: "PLAYER" | "AGENT" | "CLUB"
  /** Quand false ou non fourni, la section GESTION (Club) est masquée. */
  clubActive?: boolean
}

function getStaffSections(): NavSection[] {
  return [
    {
      title: "Activite",
      items: [
        { title: "Dashboard", href: "/club/staff/dashboard", icon: LayoutDashboard },
        { title: "Messages", href: "/club/messages", icon: MessageCircle },
      ],
    },
    {
      title: "Mon profil",
      items: [
        { title: "Mon profil", href: "/club/staff/profile", icon: UserCircle },
      ],
    },
    {
      title: "Administration",
      items: [
        { title: "Membres", href: "/club/staff/admin", icon: Users },
      ],
    },
  ]
}

function getClubSections(showGestion: boolean): NavSection[] {
  const activiteSection: NavSection = {
    title: "Activite",
    items: [
      { title: "Dashboard", href: "/club/dashboard", icon: LayoutDashboard },
      { title: "Reels", href: "/reels", icon: Film },
      { title: "Messages", href: "/club/messages", icon: MessageCircle },
      { title: "Recherche", href: "/search", icon: Search },
    ],
  }

  if (!showGestion) {
    return [activiteSection]
  }

  return [
    activiteSection,
    {
      title: "Gestion",
      items: [
        { title: "Profil Club", href: "/club/profile", icon: Building2 },
        { title: "Equipes & Staff", href: "/club/teams", icon: Users },
        { title: "Annonces", href: "/club/listings", icon: Target },
        { title: "Candidatures", href: "/club/applications", icon: FileText },
        { title: "Soumissions", href: "/club/submissions", icon: Send },
      ],
    },
  ]
}

function getSections(role: string, isStaffContext: boolean, clubActive?: boolean): NavSection[] {
  if (role === "PLAYER") {
    return [
      {
        title: "Activite",
        items: [
          { title: "Dashboard", href: "/player/dashboard", icon: LayoutDashboard },
          { title: "Reels", href: "/reels", icon: Film },
          { title: "Opportunites", href: "/player/opportunities", icon: Target },
          { title: "Messages", href: "/player/messages", icon: MessageCircle },
        ],
      },
      {
        title: "Carriere",
        items: [
          { title: "Parcours", href: "/player/career", icon: Trophy },
          { title: "Agents", href: "/player/agents", icon: Users },
          { title: "Rapports", href: "/player/reports", icon: FileText },
          { title: "Recherche", href: "/search", icon: Search },
        ],
      },
    ]
  }

  if (role === "AGENT") {
    return [
      {
        title: "Activite",
        items: [
          { title: "Dashboard", href: "/agent/dashboard", icon: LayoutDashboard },
          { title: "Reels", href: "/reels", icon: Film },
          { title: "Annonces Club", href: "/agent/opportunities", icon: Target },
          { title: "Messages", href: "/agent/messages", icon: MessageCircle },
        ],
      },
      {
        title: "Gestion",
        items: [
          { title: "Joueurs", href: "/agent/players", icon: Users },
          { title: "Soumissions", href: "/agent/submissions", icon: Send },
          { title: "Rapports", href: "/agent/reports", icon: FileText },
          { title: "Recherche", href: "/search", icon: Search },
        ],
      },
    ]
  }

  // CLUB role
  return isStaffContext ? getStaffSections() : getClubSections(clubActive ?? false)
}

export function Sidebar({ role, clubActive }: SidebarProps) {
  const pathname = usePathname()
  const isStaffContext = role === "CLUB" && pathname.startsWith("/club/staff")
  const sections = getSections(role, isStaffContext, clubActive)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const [messageCount, setMessageCount] = useState(0)

  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileOpen])

  useEffect(() => {
    async function loadCounts() {
      try {
        const [notifRes, msgRes] = await Promise.all([
          fetch("/api/notifications?unreadOnly=true&limit=1"),
          fetch("/api/messages/conversations?unreadOnly=true&limit=1"),
        ])
        if (notifRes.ok) {
          const data = await notifRes.json()
          setNotifCount(data.unreadCount ?? data.total ?? data.notifications?.length ?? 0)
        }
        if (msgRes.ok) {
          const data = await msgRes.json()
          setMessageCount(data.total ?? data.conversations?.length ?? 0)
        }
      } catch {
        // silently fail
      }
    }
    loadCounts()
    const interval = setInterval(loadCounts, 15000)
    return () => clearInterval(interval)
  }, [pathname])

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  const isActive = (href: string) => {
    if (href === "/search") return pathname === href || pathname.startsWith("/search")
    return pathname === href || pathname.startsWith(href + "/")
  }

  const addBadges = (item: NavItem): NavItem => {
    if (item.href.includes("/messages")) {
      if (messageCount > 0) {
        return { ...item, badge: messageCount, badgeVariant: "accent" as const }
      }
    }
    return item
  }

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-stadium-200 hover:bg-stadium-50 transition-colors"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5 text-stadium-700" />
      </button>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/35 z-40 transition-opacity duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "flex h-screen w-[304px] flex-col bg-white border-r border-stadium-200",
          "shadow-[4px_0_24px_0_rgba(0,0,0,0.06),1px_0_4px_0_rgba(0,0,0,0.03)]",
          "fixed lg:relative inset-y-0 left-0 z-50",
          "transform transition-transform ease-[cubic-bezier(0.33,1,0.68,1)]",
          isMobileOpen
            ? "translate-x-0 duration-280"
            : "-translate-x-full lg:translate-x-0 duration-200"
        )}
      >
        <div className="flex h-14 items-center justify-between px-5 border-b border-stadium-100 bg-gradient-to-r from-pitch-600 to-pitch-500">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-white font-black text-sm">P</span>
            </div>
            <span className="text-[15px] font-bold text-white tracking-tight">
              Profoot Profile
            </span>
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <ProfileHeaderCard
          role={role}
          messageCount={messageCount}
          opportunityCount={0}
          staffContext={isStaffContext}
        />

        {role === "CLUB" && <ProfileSwitcher />}

        <nav className="flex-1 overflow-y-auto pb-2 scrollbar-thin">
          {sections.map((section, sIdx) => (
            <div key={section.title}>
              <SidebarSectionTitle title={section.title} />
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const enriched = addBadges(item)
                  return (
                    <SidebarItem
                      key={enriched.href}
                      href={enriched.href}
                      icon={enriched.icon}
                      label={enriched.title}
                      isActive={isActive(enriched.href)}
                      badge={enriched.badge}
                      badgeVariant={enriched.badgeVariant}
                    />
                  )
                })}
              </div>
              {sIdx < sections.length - 1 && (
                <div className="mx-4 my-1 border-b border-stadium-100" />
              )}
            </div>
          ))}
        </nav>

        <div className="border-t border-stadium-100 py-2">
          <SidebarSectionTitle title="Compte" className="pt-2 pb-1" />

          <SidebarItem
            href={`/${role.toLowerCase()}/credits`}
            icon={Coins}
            label="Credits"
            isActive={isActive(`/${role.toLowerCase()}/credits`)}
          />

          <SidebarItem
            href={`/${role.toLowerCase()}/notifications`}
            icon={Bell}
            label="Notifications"
            isActive={isActive(`/${role.toLowerCase()}/notifications`)}
            badge={notifCount > 0 ? notifCount : undefined}
            badgeVariant="accent"
          />

          <SidebarItem
            href={`/${role.toLowerCase()}/settings`}
            icon={Settings}
            label="Parametres"
            isActive={isActive(`/${role.toLowerCase()}/settings`)}
          />

          <div className="mx-4 my-1.5 border-b border-stadium-100" />

          <SidebarItem
            href="#"
            icon={LogOut}
            label="Deconnexion"
            danger
            onClick={handleLogout}
          />

          <div className="px-5 py-2">
            <p className="text-[10px] text-stadium-300 font-medium">
              Profoot Profile v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
