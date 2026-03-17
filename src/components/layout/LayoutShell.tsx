"use client"

import { MobileNavProvider } from "@/components/nav/mobile/MobileNavContext"
import { MobileHeader } from "@/components/nav/mobile/MobileHeader"
import { MobileBottomNav } from "@/components/nav/mobile/MobileBottomNav"
import { Sidebar } from "@/components/nav/Sidebar"
import { GlobalSearch } from "@/components/nav/GlobalSearch"

type Role = "PLAYER" | "AGENT" | "CLUB" | "CLUB_STAFF"

interface LayoutShellProps {
  role: Role
  clubActive?: boolean
  mainClassName: string
  searchBorderColor?: string
  children: React.ReactNode
}

export function LayoutShell({
  role,
  clubActive,
  mainClassName,
  searchBorderColor = "border-slate-200",
  children,
}: LayoutShellProps) {
  return (
    <MobileNavProvider>
      <div className="flex h-screen overflow-hidden w-full">
        <Sidebar role={role} clubActive={clubActive} />
        <main className={mainClassName} style={{ WebkitOverflowScrolling: "touch" }}>
          {/* Header mobile fixe (hamburger + logo + notif + search) */}
          <MobileHeader role={role} />

          {/* Spacer pour compenser le header fixe mobile */}
          <div className="h-14 lg:hidden" />

          {/* Barre de recherche desktop */}
          <div className={`sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b ${searchBorderColor} px-4 py-3 hidden lg:block`}>
            <div className="max-w-6xl mx-auto">
              <GlobalSearch />
            </div>
          </div>

          {/* Contenu — padding bas pour ne pas être caché par la bottom nav mobile */}
          <div className="pb-20 lg:pb-0">
            {children}
          </div>

          {/* Bottom navigation mobile */}
          <MobileBottomNav role={role} />
        </main>
      </div>
    </MobileNavProvider>
  )
}
