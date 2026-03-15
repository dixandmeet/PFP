"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  action?: ReactNode
  variant?: "default" | "compact"
}

export function PageHeader({ 
  title, 
  subtitle, 
  icon: Icon, 
  action,
  variant = "default" 
}: PageHeaderProps) {
  if (variant === "compact") {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-stadium-900 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-stadium-600 mt-1">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pitch-600 via-pitch-500 to-pitch-700 p-8 mb-8 shadow-2xl"
    >
      {/* Motif terrain de foot en arrière-plan */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 pitch-pattern" />
      </div>

      {/* Contenu */}
      <div className="relative z-10">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1">
            {Icon && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4 border border-white/30"
              >
                <Icon className="h-4 w-4 text-gold-300" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  {title.split(' ')[0]}
                </span>
              </motion.div>
            )}

            {/* Titre principal */}
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
              {title}
            </h1>
            
            {/* Sous-titre */}
            {subtitle && (
              <p className="text-pitch-100 text-lg">
                {subtitle}
              </p>
            )}
          </div>

          {/* Action optionnelle */}
          {action && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              {action}
            </motion.div>
          )}
        </div>
      </div>

      {/* Effet de lumière */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold-400/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-pitch-800/30 rounded-full blur-3xl" />
    </motion.div>
  )
}
