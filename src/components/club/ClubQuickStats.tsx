"use client"

import { motion } from "framer-motion"
import { 
  Users, 
  Target, 
  FileText, 
  Eye,
  TrendingUp,
  Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickStat {
  id: string
  label: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    isPositive: boolean
  }
  color: "pitch" | "victory" | "gold" | "stadium"
}

interface ClubQuickStatsProps {
  stats: {
    postsCount: number
    followersCount: number
    followingCount: number
    listingsCount?: number
    viewsCount?: number
  }
  className?: string
}

const colorClasses = {
  pitch: {
    bg: "bg-pitch-50",
    icon: "bg-pitch-100 text-pitch-600",
    value: "text-pitch-700",
    trend: "text-pitch-500"
  },
  victory: {
    bg: "bg-victory-50",
    icon: "bg-victory-100 text-victory-600",
    value: "text-victory-700",
    trend: "text-victory-500"
  },
  gold: {
    bg: "bg-gold-50",
    icon: "bg-gold-100 text-gold-600",
    value: "text-gold-700",
    trend: "text-gold-500"
  },
  stadium: {
    bg: "bg-stadium-50",
    icon: "bg-stadium-200 text-stadium-600",
    value: "text-stadium-700",
    trend: "text-stadium-500"
  }
}

export function ClubQuickStats({ stats, className }: ClubQuickStatsProps) {
  const quickStats: QuickStat[] = [
    {
      id: "posts",
      label: "Publications",
      value: stats.postsCount,
      icon: FileText,
      color: "pitch"
    },
    {
      id: "followers",
      label: "Abonnés",
      value: stats.followersCount,
      icon: Users,
      color: "victory"
    },
    {
      id: "following",
      label: "Abonnements",
      value: stats.followingCount,
      icon: Target,
      color: "gold"
    },
    {
      id: "views",
      label: "Vues ce mois",
      value: stats.viewsCount || 0,
      icon: Eye,
      color: "stadium"
    }
  ]

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {quickStats.map((stat, index) => {
        const Icon = stat.icon
        const colors = colorClasses[stat.color]
        
        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "relative p-4 rounded-2xl border border-stadium-100 bg-white",
              "hover:shadow-lg hover:border-pitch-200 transition-all duration-300",
              "group cursor-default"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                "p-2.5 rounded-xl transition-transform group-hover:scale-110",
                colors.icon
              )}>
                <Icon className="h-5 w-5" />
              </div>
              {stat.trend && (
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  stat.trend.isPositive ? "text-pitch-600" : "text-red-500"
                )}>
                  <TrendingUp className={cn(
                    "h-3 w-3",
                    !stat.trend.isPositive && "rotate-180"
                  )} />
                  {stat.trend.value}%
                </div>
              )}
            </div>
            
            <div>
              <p className={cn("text-xl font-bold", colors.value)}>
                {typeof stat.value === "number" 
                  ? stat.value.toLocaleString("fr-FR")
                  : stat.value
                }
              </p>
              <p className="text-sm text-stadium-500 font-medium">
                {stat.label}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
