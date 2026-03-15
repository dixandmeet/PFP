"use client"

import { motion } from "framer-motion"
import { UserCircle2, Building2, Zap } from "lucide-react"
import Image from "next/image"

export function ConnectionDiagram() {
  return (
    <motion.div
      className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 w-full max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
    >
      {/* Node Joueur */}
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        whileHover={{ scale: 1.06, y: -4 }}
      >
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-cyan-400/50 bg-slate-800/90 shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] transition-shadow duration-300 animate-glow-cyan">
          <Image
            src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=200&auto=format&fit=crop"
            alt="Joueur"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <UserCircle2 className="h-8 w-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </div>
        </div>
        <span className="text-sm font-semibold text-cyan-400">Joueurs</span>
      </motion.div>

      {/* Ligne animée 1 */}
      <motion.div
        className="flex-1 h-0.5 min-w-[40px] rounded-full bg-gradient-to-r from-cyan-400/40 via-emerald-400/70 to-cyan-400/40 relative overflow-hidden origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="absolute inset-0 animate-shimmer-line bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </motion.div>

      {/* Node Plateforme */}
      <motion.div
        className="flex flex-col items-center gap-3 shrink-0"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        whileHover={{ scale: 1.06, y: -4 }}
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border-2 border-emerald-400/50 bg-slate-800/95 shadow-[0_0_30px_rgba(52,211,153,0.25)] hover:shadow-[0_0_40px_rgba(52,211,153,0.4)] transition-shadow duration-300 animate-glow-emerald">
          <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-400" />
        </div>
        <span className="text-sm font-semibold text-emerald-400">Profoot</span>
      </motion.div>

      {/* Ligne animée 2 */}
      <motion.div
        className="flex-1 h-0.5 min-w-[40px] rounded-full bg-gradient-to-r from-cyan-400/40 via-emerald-400/70 to-cyan-400/40 relative overflow-hidden origin-right"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <div className="absolute inset-0 animate-shimmer-line animation-delay-500 bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </motion.div>

      {/* Node Club */}
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55, duration: 0.5 }}
        whileHover={{ scale: 1.06, y: -4 }}
      >
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-cyan-400/50 bg-slate-800/90 shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] transition-shadow duration-300 animate-glow-cyan">
          <Image
            src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=200&auto=format&fit=crop"
            alt="Club"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </div>
        </div>
        <span className="text-sm font-semibold text-cyan-400">Clubs</span>
      </motion.div>
    </motion.div>
  )
}
