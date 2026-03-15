"use client"

import { motion } from "framer-motion"
import { itemVariants, HERO_COPY } from "./constants"

export function HeroMetrics() {
  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center gap-8 sm:gap-12 pt-10 mt-10 border-t border-base-content/[0.06]"
    >
      {HERO_COPY.highlights.map((h, i) => (
        <motion.div
          key={h.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 + i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2"
        >
          <span className="text-lg">{h.emoji}</span>
          <span className="text-[14px] sm:text-[15px] font-medium text-base-content/50">
            {h.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  )
}
