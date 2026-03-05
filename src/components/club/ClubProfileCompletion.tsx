"use client"

import { motion } from "framer-motion"
import { 
  CheckCircle2, 
  Circle, 
  Camera, 
  FileText, 
  MapPin, 
  Trophy,
  Users,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CompletionItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  completed: boolean
  priority: "high" | "medium" | "low"
}

interface ClubProfile {
  clubName: string
  shortName?: string
  logo?: string
  coverPhoto?: string
  country?: string
  city?: string
  league?: string
  bio?: string
  foundedYear?: number
}

interface ClubProfileCompletionProps {
  profile: ClubProfile
  className?: string
}

export function ClubProfileCompletion({ profile, className }: ClubProfileCompletionProps) {
  const completionItems: CompletionItem[] = [
    {
      id: "logo",
      label: "Logo du club",
      icon: Camera,
      completed: !!profile.logo,
      priority: "high"
    },
    {
      id: "coverPhoto",
      label: "Photo de couverture",
      icon: Camera,
      completed: !!profile.coverPhoto,
      priority: "medium"
    },
    {
      id: "location",
      label: "Ville et pays",
      icon: MapPin,
      completed: !!(profile.city && profile.country),
      priority: "high"
    },
    {
      id: "league",
      label: "Championnat",
      icon: Trophy,
      completed: !!profile.league,
      priority: "high"
    },
    {
      id: "bio",
      label: "Description du club",
      icon: FileText,
      completed: !!profile.bio && profile.bio.length >= 50,
      priority: "medium"
    },
    {
      id: "shortName",
      label: "Nom court (ex: OGC)",
      icon: Users,
      completed: !!profile.shortName,
      priority: "low"
    },
  ]

  const completedCount = completionItems.filter(item => item.completed).length
  const totalCount = completionItems.length
  const percentage = Math.round((completedCount / totalCount) * 100)

  const incompleteItems = completionItems.filter(item => !item.completed)
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  incompleteItems.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

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
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-pitch-800">Profil complet !</h3>
            <p className="text-sm text-pitch-600">
              Votre profil est entièrement renseigné
            </p>
          </div>
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-stadium-900">Complétion du profil</h3>
          <p className="text-sm text-stadium-500">
            {incompleteItems.length} élément{incompleteItems.length > 1 ? "s" : ""} manquant{incompleteItems.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-pitch-600">{percentage}%</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-stadium-100 rounded-full overflow-hidden mb-6">
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

      {/* Items à compléter */}
      <div className="space-y-3">
        {incompleteItems.slice(0, 3).map((item, index) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 bg-stadium-50 rounded-xl hover:bg-pitch-50 transition-colors cursor-pointer group"
            >
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                item.priority === "high" 
                  ? "bg-victory-100 text-victory-600 group-hover:bg-victory-200"
                  : item.priority === "medium"
                    ? "bg-gold-100 text-gold-600 group-hover:bg-gold-200"
                    : "bg-stadium-200 text-stadium-500 group-hover:bg-stadium-300"
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-stadium-700 group-hover:text-pitch-700 transition-colors">
                  {item.label}
                </p>
                {item.priority === "high" && (
                  <span className="text-xs text-victory-600">Recommandé</span>
                )}
              </div>
              <Circle className="h-5 w-5 text-stadium-300" />
            </motion.div>
          )
        })}
      </div>

      {/* Items complétés (collapsible) */}
      {completedCount > 0 && (
        <div className="mt-4 pt-4 border-t border-stadium-100">
          <p className="text-xs text-stadium-400 mb-2">
            {completedCount} élément{completedCount > 1 ? "s" : ""} complété{completedCount > 1 ? "s" : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {completionItems.filter(item => item.completed).map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-1.5 px-2 py-1 bg-pitch-50 rounded-lg text-pitch-600"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}
