"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { CheckCircle, TrendingUp, Zap, Star, MessageSquare } from "lucide-react"
import { pulseScaleVariants } from "./constants"

export function HeroVisualStack() {
  return (
    <div className="relative w-full max-w-[480px] mx-auto lg:mx-0 py-8">
      {/* Subtle ambient glow */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(34,197,94,0.08),transparent_60%)] -z-10 scale-150"
        variants={pulseScaleVariants}
        initial="initial"
        animate="animate"
      />

      {/* Main player card */}
      <motion.div
        className="relative z-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Notification badge – top left */}
          <motion.div
            className="absolute -top-5 -left-3 z-30"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white shadow-xl shadow-black/[0.08] border border-black/[0.04]">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-base-content">3 clubs intéressés</div>
                  <div className="text-[10px] text-base-content/40">Il y a 2h</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Rating badge – top right */}
          <motion.div
            className="absolute -top-3 -right-4 z-30"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white shadow-xl shadow-black/[0.08] border border-black/[0.04]">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-base-content">4.9</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Main card */}
          <div className="rounded-3xl bg-white shadow-2xl shadow-black/[0.08] border border-black/[0.04] overflow-hidden">
            <div className="p-1.5">
              <div className="relative w-full h-48 rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500&h=350&fit=crop"
                  alt="Joueur de football en action"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 90vw, 480px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <motion.div
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                </motion.div>
              </div>
            </div>

            <div className="px-5 pb-5 pt-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-base-content to-base-content/80 flex items-center justify-center text-white text-sm font-bold">
                  JD
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-bold text-base-content">Jules Dubois</div>
                  <div className="text-[13px] text-base-content/50">Milieu offensif &bull; 24 ans</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1.5 text-[12px] font-semibold rounded-lg bg-base-content/[0.04] text-base-content/70">
                  Ligue 2
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-lg bg-emerald-50 text-emerald-600">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  Disponible
                </span>
              </div>
            </div>
          </div>

          {/* Stats card – bottom right overlap */}
          <motion.div
            className="absolute -bottom-8 -right-4 z-20"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            >
              <div className="w-52 rounded-2xl bg-white shadow-xl shadow-black/[0.08] border border-black/[0.04] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-[12px] font-semibold text-base-content">Cette saison</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "12", label: "Buts", bg: "bg-primary/[0.06]", color: "text-primary" },
                    { value: "8", label: "Passes D.", bg: "bg-amber-500/[0.06]", color: "text-amber-600" },
                    { value: "32", label: "Matchs", bg: "bg-blue-500/[0.06]", color: "text-blue-600" },
                  ].map((s) => (
                    <div key={s.label} className={`text-center p-2 rounded-xl ${s.bg}`}>
                      <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-[9px] text-base-content/40 font-medium">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Message notification – bottom left */}
          <motion.div
            className="absolute -bottom-3 -left-6 z-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.8, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white shadow-xl shadow-black/[0.08] border border-black/[0.04]">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-[12px] font-semibold text-base-content">Nouveau message</div>
                  <div className="text-[10px] text-base-content/40">AS Monaco</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
