"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Crown, Sparkles, Check, ArrowRight, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface PremiumUpsellCardProps {
  isPremium: boolean
  hasCreatedListing: boolean
  profileComplete: boolean
  className?: string
}

export function PremiumUpsellCard({
  isPremium,
  hasCreatedListing,
  profileComplete,
  className,
}: PremiumUpsellCardProps) {
  const router = useRouter()

  if (isPremium) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-gradient-to-br from-pitch-50 to-pitch-100 rounded-2xl p-5 border border-pitch-200",
          className
        )}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 bg-pitch-500 rounded-xl">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-pitch-800">Vous etes Premium</h3>
            <p className="text-xs text-pitch-600">Toutes les fonctionnalites sont actives</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push("/club/premium")}
          aria-label="Gerer mon abonnement Premium"
          className={cn(
            "w-full inline-flex items-center justify-center gap-2 px-4 py-2",
            "text-sm font-medium text-pitch-700",
            "border border-pitch-300 bg-white hover:bg-pitch-50",
            "rounded-xl transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-500"
          )}
        >
          <Settings className="h-4 w-4" />
          Gerer mon abonnement
        </button>
      </motion.div>
    )
  }

  const showFullVersion = hasCreatedListing || profileComplete

  if (!showFullVersion) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-white rounded-2xl p-5 border border-stadium-200",
          className
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <Crown className="h-4 w-4 text-gold-500" />
          <h3 className="font-semibold text-stadium-800 text-sm">
            Boostez vos annonces
          </h3>
        </div>
        <ul className="space-y-1.5 mb-3">
          {["Badge verifie", "Analytics avances", "Annonces illimitees"].map(
            (item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-xs text-stadium-600"
              >
                <Sparkles className="h-3 w-3 text-gold-400 flex-shrink-0" />
                {item}
              </li>
            )
          )}
        </ul>
        <button
          type="button"
          onClick={() => router.push("/club/premium")}
          aria-label="Decouvrir Premium"
          className={cn(
            "w-full inline-flex items-center justify-center gap-2 px-4 py-2",
            "text-sm font-medium text-gold-700",
            "border border-gold-300 hover:bg-gold-50",
            "rounded-xl transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          )}
        >
          Decouvrir Premium
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl overflow-hidden border-0 shadow-lg",
        className
      )}
    >
      <div className="relative bg-gradient-to-br from-gold-400 via-victory-500 to-gold-500 p-5 text-white">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-5 w-5" />
            <span className="font-bold text-base">Premium</span>
          </div>
          <p className="text-sm text-white/90 mb-3">
            Debloquez toutes les fonctionnalites et boostez votre visibilite
          </p>
          <ul className="space-y-1.5 text-sm mb-4">
            {["Badge verifie", "Analytics avances", "Annonces illimitees"].map(
              (item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-gold-200" />
                  {item}
                </li>
              )
            )}
          </ul>
          <button
            type="button"
            onClick={() => router.push("/club/premium")}
            aria-label="Decouvrir Premium"
            className={cn(
              "w-full py-2.5 bg-white text-victory-600 font-bold rounded-xl",
              "hover:bg-gold-50 transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            )}
          >
            Decouvrir Premium
          </button>
        </div>
      </div>
    </motion.div>
  )
}
