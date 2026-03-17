"use client"

import { MobileNavProvider } from "@/components/nav/mobile/MobileNavContext"
import { MobileHeader } from "@/components/nav/mobile/MobileHeader"
import { MobileBottomNav } from "@/components/nav/mobile/MobileBottomNav"

type Role = "PLAYER" | "AGENT" | "CLUB" | "CLUB_STAFF"

export function SearchShell({ role, children }: { role: Role; children: React.ReactNode }) {
  return (
    <MobileNavProvider>
      {/* Header mobile fixe */}
      <MobileHeader role={role} />

      {/* Spacer pour compenser le header fixe sur mobile */}
      <div className="h-14 lg:hidden" />

      {/* Contenu avec padding bas pour la bottom nav sur mobile */}
      <div className="pb-16 lg:pb-0">
        {children}
      </div>

      {/* Bottom nav mobile */}
      <MobileBottomNav role={role} />
    </MobileNavProvider>
  )
}
