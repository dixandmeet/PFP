"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"
import { itemVariants, shimmerVariants, HERO_COPY } from "./constants"

export function HeroActions() {
  return (
    <motion.div variants={itemVariants} className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Link href="/register" className="w-full sm:w-auto">
          <motion.button
            className="group relative inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 text-[15px] font-semibold rounded-2xl bg-base-content text-base-100 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-base-content focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
            whileHover={{ y: -2, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.25)" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            aria-label={HERO_COPY.ctaPrimary}
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
            />
            <span className="relative z-10 flex items-center gap-2.5">
              {HERO_COPY.ctaPrimary}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </motion.button>
        </Link>
        <motion.button
          onClick={() => {
            document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
          }}
          className="group inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 text-[15px] font-semibold rounded-2xl bg-base-content/[0.04] border border-base-content/[0.08] text-base-content hover:bg-base-content/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-base-content focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 transition-colors duration-300"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          aria-label={HERO_COPY.ctaSecondary}
        >
          <Play className="w-4 h-4" />
          {HERO_COPY.ctaSecondary}
        </motion.button>
      </div>

      <motion.p
        className="text-[13px] text-base-content/40 font-medium tracking-wide"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        {HERO_COPY.microcopy}
      </motion.p>
    </motion.div>
  )
}
