import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function SharedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-pitch-50 via-white to-pitch-50/30">
      {children}
    </main>
  )
}
