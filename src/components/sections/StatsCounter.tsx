"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView, useSpring, useTransform } from "framer-motion"
import { Users, Building2, FileCheck, Shield } from "lucide-react"

interface StatItemProps {
  value: number
  suffix?: string
  label: string
  icon: React.ElementType
  delay?: number
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  const spring = useSpring(0, { 
    mass: 0.8, 
    stiffness: 75, 
    damping: 15,
    restDelta: 0.001 
  })
  
  const display = useTransform(spring, (current) => 
    Math.floor(current).toLocaleString('fr-FR')
  )

  useEffect(() => {
    if (isInView) {
      spring.set(value)
    }
  }, [isInView, spring, value])

  return (
    <span ref={ref} className="counter-value">
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  )
}

function StatItem({ value, suffix, label, icon: Icon, delay = 0 }: StatItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      className="relative group"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="relative p-6 md:p-8 rounded-2xl bg-white border border-stadium-200 shadow-sm hover:shadow-lg hover:border-pitch-200 transition-all duration-300 group-hover:-translate-y-1">
        {/* Top accent line */}
        <div className="absolute top-0 left-6 right-6 h-1 rounded-full bg-gradient-to-r from-pitch-500 to-gold-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-pitch-500/10 to-gold-500/10 mb-4">
          <Icon className="w-6 h-6 text-pitch-600" />
        </div>
        
        {/* Value */}
        <div className="text-4xl md:text-5xl font-bold text-stadium-900 mb-2">
          <AnimatedCounter value={value} suffix={suffix} />
        </div>
        
        {/* Label */}
        <p className="text-stadium-500 font-medium">{label}</p>
      </div>
    </motion.div>
  )
}

export function StatsCounter() {
  const stats = [
    { value: 500, suffix: "+", label: "Joueurs inscrits", icon: Users },
    { value: 50, suffix: "+", label: "Clubs partenaires", icon: Building2 },
    { value: 200, suffix: "+", label: "Mandats actifs", icon: FileCheck },
    { value: 100, suffix: "%", label: "Profils vérifiés", icon: Shield },
  ]

  return (
    <section className="relative py-16 md:py-24 bg-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(34,197,94,0.05),transparent)]" />
      
      <div className="container relative z-10 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pitch-500/10 text-pitch-600 text-sm font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-pitch-500" />
              En pleine croissance
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-stadium-900">
              Une communauté qui{" "}
              <span className="text-gradient-pitch">grandit</span>
            </h2>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <StatItem
                key={index}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                icon={stat.icon}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
