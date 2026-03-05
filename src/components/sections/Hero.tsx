"use client"

import { motion } from "framer-motion"
import { Users, Shield, Building2, Sparkles } from "lucide-react"
import { containerVariants, itemVariants, glowVariants, HERO_COPY } from "./hero/constants"
import { HeroBadge } from "./hero/HeroBadge"
import { HeroActions } from "./hero/HeroActions"
import { HeroMetrics } from "./hero/HeroMetrics"
import { HeroVisualStack } from "./hero/HeroVisualStack"

const iconMap = { Users, Shield, Building2, Sparkles } as const

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#fafafa]">
      {/* Subtle mesh gradient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,197,94,0.07),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_80%,rgba(34,197,94,0.04),transparent_40%)]" />
      </div>

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 z-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Main content – 2 columns */}
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 sm:px-10 lg:px-16 pt-32 sm:pt-28 pb-24 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">

          {/* Left – copy & CTA */}
          <motion.div
            className="max-w-[540px]"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <HeroBadge />

            {/* H1 */}
            <motion.h1
              variants={itemVariants}
              className="text-[2.75rem] sm:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] font-bold text-base-content leading-[1.08] tracking-[-0.03em] mb-7"
            >
              {HERO_COPY.title.before}{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-primary via-emerald-500 to-primary bg-clip-text text-transparent">
                  {HERO_COPY.title.accent}
                </span>
                <motion.span
                  className="absolute -inset-1 bg-gradient-to-r from-primary/15 to-emerald-500/15 blur-2xl -z-10"
                  variants={glowVariants}
                  initial="initial"
                  animate="animate"
                />
              </span>
              <br />
              {HERO_COPY.title.after}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-[16px] sm:text-[17px] text-base-content/55 leading-[1.7] mb-10 max-w-[500px]"
            >
              {HERO_COPY.subtitle}
            </motion.p>

            <HeroActions />

            {/* Feature pills */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-2 mt-10"
            >
              {HERO_COPY.features.map((feature, index) => {
                const Icon = iconMap[feature.icon]
                return (
                  <motion.div
                    key={index}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-base-content/[0.03] border border-base-content/[0.06]"
                    whileHover={{ scale: 1.04, backgroundColor: "rgba(34,197,94,0.05)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-[13px] font-medium text-base-content/60">{feature.label}</span>
                  </motion.div>
                )
              })}
            </motion.div>

            <HeroMetrics />
          </motion.div>

          {/* Right – visual stack */}
          <div className="flex justify-center lg:justify-end order-last lg:order-last">
            <HeroVisualStack />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-5 h-9 rounded-full border-[1.5px] border-base-content/15 flex items-start justify-center p-1.5">
            <motion.div
              className="w-1 h-2 bg-base-content/25 rounded-full"
              animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#fafafa] to-transparent z-10 pointer-events-none" />
    </section>
  )
}
