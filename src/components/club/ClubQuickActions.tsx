"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  Edit, 
  Eye, 
  Plus, 
  Users,
  Megaphone,
  Settings,
  Crown
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QuickAction {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  variant: "primary" | "secondary" | "premium"
}

interface ClubQuickActionsProps {
  userId: string
  className?: string
}

export function ClubQuickActions({ userId, className }: ClubQuickActionsProps) {
  const router = useRouter()

  const quickActions: QuickAction[] = [
    {
      id: "edit",
      label: "Modifier le profil",
      description: "Mettre à jour vos informations",
      icon: Edit,
      href: "/club/profile/edit",
      variant: "primary"
    },
    {
      id: "public",
      label: "Voir la page publique",
      description: "Aperçu de votre profil",
      icon: Eye,
      href: `/profile/${userId}`,
      variant: "secondary"
    },
    {
      id: "listing",
      label: "Créer une annonce",
      description: "Publier une opportunité",
      icon: Megaphone,
      href: "/club/listings",
      variant: "secondary"
    },
    {
      id: "premium",
      label: "Passer Premium",
      description: "Débloquer plus de fonctionnalités",
      icon: Crown,
      href: "/club/premium",
      variant: "premium"
    }
  ]

  const variantStyles = {
    primary: {
      card: "bg-gradient-to-br from-pitch-500 to-pitch-600 border-pitch-400 text-white hover:from-pitch-600 hover:to-pitch-700",
      icon: "bg-white/20 text-white",
      label: "text-white",
      description: "text-pitch-100"
    },
    secondary: {
      card: "bg-white border-stadium-200 hover:border-pitch-300 hover:bg-pitch-50",
      icon: "bg-stadium-100 text-stadium-600 group-hover:bg-pitch-100 group-hover:text-pitch-600",
      label: "text-stadium-800 group-hover:text-pitch-700",
      description: "text-stadium-500"
    },
    premium: {
      card: "bg-gradient-to-br from-gold-400 to-victory-500 border-gold-300 text-white hover:from-gold-500 hover:to-victory-600",
      icon: "bg-white/20 text-white",
      label: "text-white",
      description: "text-gold-100"
    }
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", className)}>
      {quickActions.map((action, index) => {
        const Icon = action.icon
        const styles = variantStyles[action.variant]
        
        return (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => router.push(action.href)}
            className={cn(
              "relative p-4 rounded-2xl border-2 text-left",
              "transition-all duration-300 group",
              "hover:shadow-lg hover:-translate-y-0.5",
              styles.card
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-xl transition-colors",
                styles.icon
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("font-bold", styles.label)}>
                  {action.label}
                </p>
                <p className={cn("text-sm mt-0.5", styles.description)}>
                  {action.description}
                </p>
              </div>
            </div>
            
            {action.variant === "premium" && (
              <div className="absolute top-2 right-2">
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold text-white">
                  PRO
                </span>
              </div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
