"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthAwareCTAProps {
  variant?: "hero" | "final"
  className?: string
}

export function AuthAwareCTA({ variant = "hero", className }: AuthAwareCTAProps) {
  const { data: session, status } = useSession()
  
  const dashboardUrl = session?.user 
    ? `/${session.user.role?.toLowerCase() || 'player'}/dashboard`
    : null

  if (status === "loading") {
    return (
      <div className={cn("flex flex-col sm:flex-row gap-4", className)}>
        <div className="h-12 w-40 bg-apple-text/5 rounded-apple animate-pulse" />
        <div className="h-12 w-48 bg-apple-text/5 rounded-apple animate-pulse" />
      </div>
    )
  }

  if (session?.user && dashboardUrl) {
    return (
      <div className={cn("flex flex-col sm:flex-row gap-4", variant === "final" && "justify-center items-center", className)}>
        <Link href={dashboardUrl}>
          <Button size="xl" className="w-full sm:w-auto group">
            Accéder à mon espace
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    )
  }

  // Non authentifié
  if (variant === "final") {
    return (
      <div className={cn("flex flex-col sm:flex-row gap-4 justify-center items-center", className)}>
        <Link href="/register">
          <Button size="xl" className="w-full sm:w-auto group bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-stadium-950 border-0">
            Demander un accès
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
        <Link href="/contact">
          <Button size="xl" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 hover:border-white/30">
            Contacter l&apos;équipe
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col sm:flex-row gap-4", className)}>
      <Link href="/register">
        <Button size="xl" className="w-full sm:w-auto bg-gradient-to-r from-pitch-500 to-pitch-600 hover:from-pitch-600 hover:to-pitch-700 text-white border-0 shadow-lg shadow-pitch-500/25">
          Demander un accès
        </Button>
      </Link>
      <Link href="/login">
        <Button size="xl" variant="outline" className="w-full sm:w-auto border-stadium-300 text-stadium-700 hover:bg-stadium-100 hover:border-stadium-400">
          Se connecter
        </Button>
      </Link>
    </div>
  )
}
