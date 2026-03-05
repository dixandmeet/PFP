import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    // Redirect non-admin users to their respective dashboards
    const roleRedirects: Record<string, string> = {
      PLAYER: "/player/dashboard",
      AGENT: "/agent/dashboard",
      CLUB: "/club/dashboard",
    }
    redirect(roleRedirects[session.user.role] || "/")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Spacer pour le bouton hamburger sur mobile */}
        <div className="h-14 lg:hidden" />
        {children}
      </main>
    </div>
  )
}
