"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Megaphone,
  UserPlus,
  FileCheck,
  User,
  Clock,
  ArrowRight,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityItem {
  id: string
  type: "profile_created" | "listing_published" | "new_follower" | "application_received"
  label: string
  date?: string
}

interface RecentActivityCardProps {
  activities?: ActivityItem[]
  postsCount: number
  className?: string
}

const typeConfig = {
  profile_created: { icon: User, color: "text-pitch-600 bg-pitch-100" },
  listing_published: { icon: Megaphone, color: "text-victory-600 bg-victory-100" },
  new_follower: { icon: UserPlus, color: "text-gold-600 bg-gold-100" },
  application_received: { icon: FileCheck, color: "text-pitch-600 bg-pitch-100" },
}

export function RecentActivityCard({
  activities = [],
  postsCount,
  className,
}: RecentActivityCardProps) {
  const router = useRouter()
  const hasActivity = activities.length > 0 || postsCount > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-2xl p-6 border-2 border-stadium-100 shadow-lg",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-stadium-800">Activite recente</h3>
        {activities.length > 3 && (
          <button
            type="button"
            aria-label="Voir toute l'activite"
            className="inline-flex items-center gap-1 text-sm font-medium text-pitch-600 hover:text-pitch-700 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-500 rounded"
          >
            Voir tout
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {!hasActivity ? (
        <div className="text-center py-8">
          <div className="inline-flex p-4 bg-stadium-50 rounded-2xl mb-3">
            <MessageSquare className="h-8 w-8 text-stadium-300" />
          </div>
          <p className="text-stadium-500 font-medium">
            Aucune activite pour le moment
          </p>
          <p className="text-sm text-stadium-400 mt-1 mb-4">
            Commencez par publier votre premiere annonce
          </p>
          <button
            type="button"
            onClick={() => router.push("/club/listings")}
            aria-label="Publier votre premiere annonce"
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5",
              "bg-pitch-600 hover:bg-pitch-700 text-white",
              "rounded-xl font-medium text-sm",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-500 focus-visible:ring-offset-2"
            )}
          >
            <Megaphone className="h-4 w-4" />
            Publier votre premiere annonce
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.length > 0 ? (
            activities.slice(0, 3).map((activity, index) => {
              const config = typeConfig[activity.type]
              const Icon = config.icon
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-stadium-50"
                >
                  <div className={cn("p-2 rounded-lg", config.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stadium-700">
                      {activity.label}
                    </p>
                    {activity.date && (
                      <p className="text-xs text-stadium-400 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {activity.date}
                      </p>
                    )}
                  </div>
                </motion.div>
              )
            })
          ) : (
            <div className="text-center py-4">
              <p className="text-stadium-600">
                <span className="font-bold text-pitch-600">{postsCount}</span>{" "}
                publication{postsCount > 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
