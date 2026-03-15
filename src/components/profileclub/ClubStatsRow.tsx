"use client"

import { motion } from "framer-motion"
import { FileText, Users, Target, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface ClubStatsRowProps {
  stats: {
    postsCount: number
    followersCount: number
    followingCount: number
    viewsCount: number
  }
  onStatClick?: (statId: string) => void
  className?: string
}

const statConfig = [
  {
    id: "posts",
    label: "Publications",
    icon: FileText,
    color: "pitch" as const,
  },
  {
    id: "followers",
    label: "Suiveurs",
    icon: Users,
    color: "victory" as const,
  },
  {
    id: "following",
    label: "Abonnements",
    icon: Target,
    color: "gold" as const,
  },
  {
    id: "views",
    label: "Vues ce mois",
    icon: Eye,
    color: "stadium" as const,
  },
]

const colorMap = {
  pitch: {
    icon: "bg-pitch-100 text-pitch-600",
    value: "text-pitch-700",
  },
  victory: {
    icon: "bg-victory-100 text-victory-600",
    value: "text-victory-700",
  },
  gold: {
    icon: "bg-gold-100 text-gold-600",
    value: "text-gold-700",
  },
  stadium: {
    icon: "bg-stadium-100 text-stadium-600",
    value: "text-stadium-700",
  },
}

export function ClubStatsRow({
  stats,
  onStatClick,
  className,
}: ClubStatsRowProps) {
  const values: Record<string, number> = {
    posts: stats.postsCount,
    followers: stats.followersCount,
    following: stats.followingCount,
    views: stats.viewsCount,
  }

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3", className)}>
      {statConfig.map((stat, index) => {
        const Icon = stat.icon
        const colors = colorMap[stat.color]
        const clickable = !!onStatClick
        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            aria-label={`${stat.label}: ${values[stat.id]}`}
            onClick={() => onStatClick?.(stat.id)}
            onKeyDown={(e) => {
              if (clickable && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault()
                onStatClick?.(stat.id)
              }
            }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl bg-white border border-stadium-100",
              "transition-all duration-200",
              clickable &&
                "cursor-pointer hover:shadow-md hover:border-pitch-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-500"
            )}
          >
            <div className={cn("p-2 rounded-lg", colors.icon)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className={cn("text-lg font-bold leading-tight", colors.value)}>
                {values[stat.id].toLocaleString("fr-FR")}
              </p>
              <p className="text-xs text-stadium-500 font-medium">{stat.label}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
