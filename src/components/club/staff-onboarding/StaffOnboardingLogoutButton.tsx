"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function StaffOnboardingLogoutButton() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="text-stadium-500 hover:text-stadium-700 hover:bg-transparent"
    >
      <LogOut className="w-4 h-4" />
      Déconnexion
    </Button>
  )
}
