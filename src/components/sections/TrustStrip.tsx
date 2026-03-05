"use client"

import { motion, useSpring, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { Users, Briefcase, Building2, Zap } from "lucide-react"

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [displayValue, setDisplayValue] = useState(0)
  
  const spring = useSpring(0, { stiffness: 50, damping: 20 })
  
  useEffect(() => {
    if (isInView) {
      spring.set(value)
    }
  }, [isInView, spring, value])
  
  useEffect(() => {
    return spring.on("change", (latest) => {
      setDisplayValue(Math.round(latest))
    })
  }, [spring])
  
  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}{suffix}
    </span>
  )
}

const stats = [
  { value: 500, suffix: "+", label: "Joueurs inscrits", icon: Users },
  { value: 120, suffix: "+", label: "Agents professionnels", icon: Briefcase },
  { value: 50, suffix: "+", label: "Clubs & académies", icon: Building2 },
  { value: 30, suffix: "+", label: "Centres de formation", icon: Zap },
]

export function TrustStrip() {
  return (
    <section className="relative py-20 md:py-24 overflow-hidden bg-white">
      {/* Subtle top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-base-content/[0.06] to-transparent" />
      
      <div className="container relative z-10 px-4 md:px-6">
        {/* Headline */}
        <motion.p 
          className="text-center text-[13px] md:text-sm text-base-content/40 font-medium tracking-wide uppercase mb-14 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Ils utilisent Profoot Profile pour structurer leurs opportunités
        </motion.p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="group text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div 
                className="w-12 h-12 rounded-2xl bg-base-content/[0.03] border border-base-content/[0.06] flex items-center justify-center mx-auto mb-4 transition-colors duration-300 group-hover:bg-primary/[0.06] group-hover:border-primary/[0.12]"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <stat.icon className="w-5 h-5 text-base-content/30 group-hover:text-primary transition-colors duration-300" />
              </motion.div>
              
              <div className="text-3xl md:text-4xl font-bold text-base-content tracking-tight mb-1.5">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              
              <div className="text-[13px] text-base-content/40 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Subtle bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-base-content/[0.06] to-transparent" />
    </section>
  )
}
