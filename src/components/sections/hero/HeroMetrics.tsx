"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { itemVariants, HERO_COPY } from "./constants"

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const duration = 2000
    const step = Math.ceil(value / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= value) {
        start = value
        clearInterval(timer)
      }
      setDisplay(start)
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, value])

  return (
    <span ref={ref} className="tabular-nums">
      {display.toLocaleString("fr-FR")}
      {suffix}
    </span>
  )
}

export function HeroMetrics() {
  return (
    <motion.div
      variants={itemVariants}
      className="flex items-center gap-8 sm:gap-12 pt-10 mt-10 border-t border-base-content/[0.06]"
    >
      {HERO_COPY.metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 + i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-2xl sm:text-3xl font-bold text-base-content tracking-tight">
            <AnimatedNumber value={m.value} suffix={m.suffix} />
          </div>
          <div className="text-[13px] text-base-content/40 mt-1.5 font-medium">
            {m.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
