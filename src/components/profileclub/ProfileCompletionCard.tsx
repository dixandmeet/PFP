"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  CheckCircle2,
  Circle,
  TrendingUp,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  calculateClubCompletion,
  type ClubCompletionData,
} from "@/lib/utils/club-completion"

interface ProfileCompletionCardProps {
  profile: ClubCompletionData
  onEditCover?: () => void
  className?: string
}

export function ProfileCompletionCard({
  profile,
  onEditCover,
  className,
}: ProfileCompletionCardProps) {
  const router = useRouter()
  const [loadingItem, setLoadingItem] = useState<string | null>(null)

  const { percentage, completedCount, fields } = calculateClubCompletion(profile)
  const incompleteItems = fields.filter((f) => !f.completed)

  const handleItemClick = (item: (typeof fields)[number]) => {
    setLoadingItem(item.id)
    if (item.action === "cover" && onEditCover) {
      onEditCover()
      setTimeout(() => setLoadingItem(null), 500)
    } else {
      router.push(item.action)
    }
  }

  if (percentage === 100) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-gradient-to-br from-pitch-50 to-pitch-100 rounded-2xl p-6 border border-pitch-200",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pitch-500 rounded-xl">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-pitch-800">Profil complet !</h3>
            <p className="text-sm text-pitch-600">
              Votre profil est entièrement renseigné. Bravo !
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="h-2 flex-1 bg-pitch-200 rounded-full overflow-hidden">
            <div className="h-full w-full bg-pitch-500 rounded-full" />
          </div>
          <span className="text-sm font-bold text-pitch-700">100%</span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-2xl p-6 border-2 border-stadium-100 shadow-lg",
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-stadium-900">Complétion du profil</h3>
        <span className="text-lg font-bold text-pitch-600">{percentage}%</span>
      </div>

      <p className="text-xs text-stadium-500 mb-4">
        Complétez votre profil pour améliorer votre visibilité et recevoir plus
        de candidatures.
      </p>

      <div className="relative h-2.5 bg-stadium-100 rounded-full overflow-hidden mb-5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            percentage < 50
              ? "bg-gradient-to-r from-victory-400 to-victory-500"
              : percentage < 80
                ? "bg-gradient-to-r from-gold-400 to-gold-500"
                : "bg-gradient-to-r from-pitch-400 to-pitch-500"
          )}
        />
      </div>

      <div className="space-y-2">
        {incompleteItems.map((item, index) => {
          const Icon = item.icon
          const isLoading = loadingItem === item.id
          return (
            <motion.button
              key={item.id}
              type="button"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleItemClick(item)}
              aria-label={`Compléter : ${item.label}`}
              disabled={isLoading}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl text-left",
                "bg-stadium-50 hover:bg-pitch-50",
                "transition-colors duration-200 group",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-500",
                isLoading && "opacity-70"
              )}
            >
              <div className="p-1.5 rounded-lg bg-stadium-200/60 text-stadium-500 group-hover:bg-pitch-100 group-hover:text-pitch-600 transition-colors duration-200">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span className="flex-1 text-sm font-medium text-stadium-700 group-hover:text-pitch-700 transition-colors duration-200">
                {item.label}
              </span>
              <Circle className="h-4 w-4 text-stadium-300 group-hover:text-pitch-400 transition-colors duration-200" />
            </motion.button>
          )
        })}
      </div>

      {completedCount > 0 && (
        <div className="mt-4 pt-3 border-t border-stadium-100">
          <p className="text-xs text-stadium-400 mb-2">
            {completedCount} élément{completedCount > 1 ? "s" : ""} complété
            {completedCount > 1 ? "s" : ""}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {fields
              .filter((item) => item.completed)
              .map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-pitch-50 rounded-md text-pitch-600"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="text-xs font-medium">{item.label}</span>
                </span>
              ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
