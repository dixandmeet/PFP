"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  ClipboardList,
  Activity,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Building2,
  KeyRound,
  Coins,
  Clock,
  BookOpen,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navigation: NavItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Utilisateurs", href: "/admin/users", icon: Users },
  { title: "Clubs", href: "/admin/clubs", icon: Building2 },
  { title: "Clubs à valider", href: "/admin/clubs/pending", icon: Clock },
  { title: "Récupérations", href: "/admin/recoveries", icon: KeyRound },
  { title: "Contenu", href: "/admin/content", icon: FileText },
  { title: "Listings", href: "/admin/listings", icon: Briefcase },
  { title: "Candidatures", href: "/admin/applications", icon: ClipboardList },
  { title: "Crédits", href: "/admin/credits", icon: Coins },
  { title: "Audit AI", href: "/admin/audit", icon: Activity },
  { title: "Rapports", href: "/admin/reports", icon: BarChart3 },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin"
    }
    if (href === "/admin/clubs") {
      return pathname.startsWith("/admin/clubs") && !pathname.startsWith("/admin/clubs/pending")
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Bouton hamburger mobile */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-slate-200 hover:bg-slate-50 transition-colors"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5 text-slate-600" />
      </button>

      {/* Overlay mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "flex h-screen w-60 flex-col border-r border-slate-200 bg-white",
        "fixed lg:relative inset-y-0 left-0 z-50",
        "transform transition-transform duration-200 ease-in-out",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-slate-700" />
            <span className="text-base font-semibold text-slate-900">Admin</span>
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-slate-100 transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-200 p-3">
          <Link
            href="/admin/settings"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors mb-1",
              pathname.includes("/settings")
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Settings className="h-4 w-4" />
            <span>Paramètres</span>
          </Link>

          <Link
            href="/admin/documentation"
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors mb-1",
              pathname.includes("/documentation")
                ? "bg-slate-100 text-slate-900"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <BookOpen className="h-4 w-4" />
            <span>Documentation</span>
          </Link>

          <Separator className="my-2" />
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-600 hover:bg-red-50 hover:text-red-600 font-medium text-sm"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </Button>
        </div>
      </div>
    </>
  )
}
