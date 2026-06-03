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
  ClipboardList,
  Target,
  X,
  Trophy,
  MessageCircle,
  Coins,
  Film,
  Eye,
  Rss,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { FootballIcon } from "@/components/auth/icons"
import { ProfileHeaderCard } from "./ProfileHeaderCard"
import { SidebarItem } from "./SidebarItem"
import { SidebarSectionTitle } from "./SidebarSectionTitle"
import { isClubRole } from "@/lib/utils/role-helpers"
import { useMobileNav } from "./mobile/MobileNavContext"


interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  badgeVariant?: "default" | "accent"
  danger?: boolean
  action?: "logout"
}

interface NavSection {
  title: string
  items: NavItem[]
}

type ClubMemberRole = "OWNER" | "ADMIN" | "STAFF" | "VIEWER"

interface SidebarProps {
  role: "PLAYER" | "AGENT" | "CLUB" | "CLUB_STAFF"
  /** Quand false ou non fourni, la section GESTION (Club) est masquée. */
  clubActive?: boolean
  clubMemberRole?: ClubMemberRole
}

function canManageMembers(role?: ClubMemberRole): boolean {
  return role === "OWNER" || role === "ADMIN"
}

const CLUB_ACCOUNT_PATHS = [
  "/club/staff/profile",
  "/club/credits",
  "/club/notifications",
  "/club/settings",
]

const CLUB_ACCOUNT_HUB_HREF = "/club/staff/profile"

function getUnifiedClubSections(
  clubActive: boolean,
  memberRole?: ClubMemberRole
): NavSection[] {
  const sections: NavSection[] = [
    {
      title: "Activité",
      items: [
        { title: "Dashboard", href: "/club/dashboard", icon: LayoutDashboard },
        { title: "Fil d'actualité", href: "/club/feed", icon: Rss },
        { title: "Reels", href: "/reels", icon: Film },
        { title: "Messages", href: "/club/messages", icon: MessageCircle },
        { title: "Recherche", href: "/search", icon: Search },
      ],
    },
  ]

  if (clubActive) {
    sections.push({
      title: "Gestion",
      items: [
        { title: "Profil Club", href: "/club/profile", icon: Building2 },
        { title: "Équipes & Staff", href: "/club/teams", icon: Users },
        { title: "Annonces", href: "/club/listings", icon: Target },
        { title: "Recrutement", href: "/club/recruitment", icon: ClipboardList },
        { title: "Rapports", href: "/club/reports", icon: FileText },
      ],
    })
  }

  sections.push({
    title: "Compte",
    items: [{ title: "Paramètres", href: CLUB_ACCOUNT_HUB_HREF, icon: Settings }],
  })

  if (canManageMembers(memberRole)) {
    sections.push({
      title: "Administration",
      items: [{ title: "Membres", href: "/club/staff/admin", icon: Users }],
    })
  }

  return sections
}

function getSections(
  role: string,
  clubActive?: boolean,
  clubMemberRole?: ClubMemberRole
): NavSection[] {
  if (role === "PLAYER") {
    return [
      {
        title: "Activité",
        items: [
          { title: "Dashboard", href: "/player/dashboard", icon: LayoutDashboard },
          { title: "Reels", href: "/reels", icon: Film },
          { title: "Opportunités", href: "/player/opportunities", icon: Target },
          { title: "Messages", href: "/player/messages", icon: MessageCircle },
        ],
      },
      {
        title: "Carrière",
        items: [
          { title: "Parcours", href: "/player/career", icon: Trophy },
          { title: "Agents", href: "/player/agents", icon: Users },
          { title: "Rapports", href: "/player/reports", icon: FileText },
          { title: "Consultations", href: "/player/profile-views", icon: Eye },
          { title: "Recherche", href: "/search", icon: Search },
        ],
      },
    ]
  }

  if (role === "AGENT") {
    return [
      {
        title: "Activité",
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
          { title: "Consultations", href: "/agent/profile-views", icon: Eye },
          { title: "Recherche", href: "/search", icon: Search },
        ],
      },
    ]
  }

  if (isClubRole(role)) {
    return getUnifiedClubSections(clubActive ?? false, clubMemberRole)
  }

  return []
}

export function Sidebar({ role, clubActive, clubMemberRole }: SidebarProps) {
  const pathname = usePathname()
  const sections = getSections(role, clubActive, clubMemberRole)
  const { sidebarOpen: isMobileOpen, setSidebarOpen: setIsMobileOpen } = useMobileNav()
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

  // Les rôles club (CLUB et CLUB_STAFF) partagent les pages sous /club.
  // On évite ainsi des liens cassés du type /club_staff/credits.
  const accountBase = isClubRole(role) ? "club" : role.toLowerCase()

  const isClubAccountHubActive = CLUB_ACCOUNT_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  )

  const isActive = (href: string) => {
    if (href === "/search") return pathname === href || pathname.startsWith("/search")
    if (href === CLUB_ACCOUNT_HUB_HREF) return isClubAccountHubActive
    return pathname === href || pathname.startsWith(href + "/")
  }

  const addBadges = (item: NavItem): NavItem => {
    if (item.href.includes("/messages") && messageCount > 0) {
      return { ...item, badge: messageCount, badgeVariant: "accent" as const }
    }
    if (
      (item.href.includes("/notifications") || item.href === CLUB_ACCOUNT_HUB_HREF) &&
      notifCount > 0
    ) {
      return { ...item, badge: notifCount, badgeVariant: "accent" as const }
    }
    return item
  }

  const showAccountFooter = !isClubRole(role)
  const showClubLogoutFooter = isClubRole(role)

  return (
    <>
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/35 z-40 transition-opacity duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "flex h-screen w-[280px] flex-col bg-white border-r border-stadium-200",
          "shadow-[4px_0_24px_0_rgba(0,0,0,0.06),1px_0_4px_0_rgba(0,0,0,0.03)]",
          "fixed lg:relative inset-y-0 left-0 z-50",
          "transform transition-transform ease-[cubic-bezier(0.33,1,0.68,1)]",
          isMobileOpen
            ? "translate-x-0 duration-280"
            : "-translate-x-full lg:translate-x-0 duration-200"
        )}
      >
        <div className="flex h-11 shrink-0 items-center justify-between px-4 border-b border-stadium-100 bg-gradient-to-r from-pitch-600 to-pitch-500">
          <Link href="/" className="flex items-center gap-2" suppressHydrationWarning>
            <FootballIcon className="w-7 h-7 rounded-lg" variant="light" />
            <span className="text-[15px] font-bold text-white tracking-tight">
              Profoot Profile
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Fermer le menu"
            suppressHydrationWarning
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <ProfileHeaderCard role={role} />

          <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-1 scrollbar-thin">
            {sections.map((section, sIdx) => (
              <div key={section.title}>
                <SidebarSectionTitle title={section.title} />
                <div>
                  {section.items.map((item) => {
                    const enriched = addBadges(item)
                    const itemKey =
                      enriched.action === "logout"
                        ? "logout"
                        : `${section.title}-${enriched.href}`
                    return (
                      <SidebarItem
                        key={itemKey}
                        href={enriched.href}
                        icon={enriched.icon}
                        label={enriched.title}
                        isActive={
                          enriched.action === "logout" ? false : isActive(enriched.href)
                        }
                        badge={enriched.badge}
                        badgeVariant={enriched.badgeVariant}
                        danger={enriched.danger}
                        onClick={
                          enriched.action === "logout" ? handleLogout : undefined
                        }
                      />
                    )
                  })}
                </div>
                {sIdx < sections.length - 1 && (
                  <div className="mx-3 my-0.5 border-b border-stadium-100" />
                )}
              </div>
            ))}
          </nav>

          {showAccountFooter && (
            <div className="shrink-0 border-t border-stadium-100">
              <SidebarSectionTitle title="Compte" className="pt-1.5 pb-0" />

              <SidebarItem
                href={`/${accountBase}/credits`}
                icon={Coins}
                label="Crédits"
                isActive={isActive(`/${accountBase}/credits`)}
                compact
              />

              <SidebarItem
                href={`/${accountBase}/notifications`}
                icon={Bell}
                label="Notifications"
                isActive={isActive(`/${accountBase}/notifications`)}
                badge={notifCount > 0 ? notifCount : undefined}
                badgeVariant="accent"
                compact
              />

              <SidebarItem
                href={`/${accountBase}/settings`}
                icon={Settings}
                label="Paramètres"
                isActive={isActive(`/${accountBase}/settings`)}
                compact
              />

              <SidebarItem
                href="#"
                icon={LogOut}
                label="Déconnexion"
                danger
                compact
                onClick={handleLogout}
              />
            </div>
          )}

          {showClubLogoutFooter && (
            <div className="shrink-0 border-t border-stadium-100 pb-1">
              <SidebarItem
                href="#"
                icon={LogOut}
                label="Déconnexion"
                danger
                compact
                onClick={handleLogout}
              />
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
