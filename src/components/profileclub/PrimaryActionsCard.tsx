"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Megaphone, Edit, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface PrimaryActionsCardProps {
  userId: string
  className?: string
}

export function PrimaryActionsCard({ userId, className }: PrimaryActionsCardProps) {
  const router = useRouter()

  const actions = [
    {
      id: "create-listing",
      label: "Creer une annonce",
      description: "Publiez une opportunite pour attirer des talents",
      icon: Megaphone,
      variant: "primary" as const,
      href: "/club/listings",
    },
    {
      id: "edit-profile",
      label: "Modifier le profil",
      description: "Mettez a jour vos informations",
      icon: Edit,
      variant: "secondary" as const,
      href: "/club/profile/edit",
    },
    {
      id: "view-public",
      label: "Voir la page publique",
      description: "Decouvrez comment les autres vous voient",
      icon: Eye,
      variant: "ghost" as const,
      href: `/profile/${userId}`,
    },
  ]

  return (
    <div className={cn("flex flex-col sm:flex-row gap-3", className)}>
      {actions.map((action, index) => {
        const Icon = action.icon
        return (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => router.push(action.href)}
            aria-label={action.label}
            className={cn(
              "group relative flex items-center gap-3 px-4 py-3 rounded-xl text-left",
              "transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-500 focus-visible:ring-offset-2",
              action.variant === "primary" && [
                "flex-1 bg-pitch-600 hover:bg-pitch-700 text-white shadow-md hover:shadow-lg",
              ],
              action.variant === "secondary" && [
                "flex-1 border-2 border-stadium-200 hover:border-pitch-300 bg-white hover:bg-pitch-50 text-stadium-800",
              ],
              action.variant === "ghost" && [
                "flex-1 bg-stadium-50 hover:bg-stadium-100 text-stadium-600 hover:text-stadium-800",
              ]
            )}
          >
            <div
              className={cn(
                "p-2 rounded-lg transition-transform duration-200 group-hover:scale-110",
                action.variant === "primary" && "bg-white/20",
                action.variant === "secondary" && "bg-pitch-50 text-pitch-600",
                action.variant === "ghost" && "bg-stadium-200/60 text-stadium-500"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">{action.label}</p>
              <p
                className={cn(
                  "text-xs mt-0.5 hidden sm:block",
                  action.variant === "primary" && "text-pitch-100",
                  action.variant === "secondary" && "text-stadium-400",
                  action.variant === "ghost" && "text-stadium-400"
                )}
              >
                {action.description}
              </p>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
