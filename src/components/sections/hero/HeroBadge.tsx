"use client"

import { motion } from "framer-motion"
import { itemVariants, HERO_COPY } from "./constants"

export function HeroBadge() {
  return (
    <motion.div variants={itemVariants}>
      <motion.div
        className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-base-content/[0.04] border border-base-content/[0.08] backdrop-blur-sm mb-8"
        whileHover={{ scale: 1.03, backgroundColor: "rgba(34,197,94,0.06)" }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        <span className="text-[13px] font-medium text-base-content/70 tracking-wide">{HERO_COPY.badge}</span>
      </motion.div>
    </motion.div>
  )
}
