"use client"

import { motion } from "framer-motion"
import { useMotionConfig } from "@/components/motion/MotionProvider"

export function AICopilot() {
  const { shouldReduceMotion } = useMotionConfig()

  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0A84FF" />
          <stop offset="50%" stopColor="#2AC3A2" />
          <stop offset="100%" stopColor="#0A84FF" />
        </linearGradient>
        <radialGradient id="glowGradient" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#2AC3A2" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0A84FF" stopOpacity="0" />
        </radialGradient>
        <filter id="aiGlow">
          <feGaussianBlur stdDeviation="8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer glow rings */}
      <motion.circle
        cx="200"
        cy="200"
        r="150"
        fill="url(#glowGradient)"
        animate={shouldReduceMotion ? {} : {
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.circle
        cx="200"
        cy="200"
        r="120"
        stroke="url(#aiGradient)"
        strokeWidth="1"
        opacity="0.3"
        animate={shouldReduceMotion ? {} : {
          scale: [1, 1.05, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Central orb */}
      <motion.circle
        cx="200"
        cy="200"
        r="80"
        fill="url(#aiGradient)"
        opacity="0.15"
        filter="url(#aiGlow)"
        animate={shouldReduceMotion ? {} : {
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.circle
        cx="200"
        cy="200"
        r="60"
        fill="white"
        stroke="url(#aiGradient)"
        strokeWidth="2"
        filter="url(#aiGlow)"
        animate={shouldReduceMotion ? {} : {
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
      />

      {/* Inner core */}
      <motion.circle
        cx="200"
        cy="200"
        r="30"
        fill="url(#aiGradient)"
        opacity="0.4"
        animate={shouldReduceMotion ? {} : {
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Rotating data particles */}
      {!shouldReduceMotion && (
        <>
          <motion.g
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ originX: "200px", originY: "200px" }}
          >
            <circle cx="200" cy="120" r="4" fill="#0A84FF" opacity="0.6" />
            <circle cx="280" cy="200" r="4" fill="#2AC3A2" opacity="0.6" />
            <circle cx="200" cy="280" r="4" fill="#0A84FF" opacity="0.6" />
            <circle cx="120" cy="200" r="4" fill="#2AC3A2" opacity="0.6" />
          </motion.g>

          <motion.g
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ originX: "200px", originY: "200px" }}
          >
            <circle cx="240" cy="140" r="3" fill="#2AC3A2" opacity="0.5" />
            <circle cx="260" cy="240" r="3" fill="#0A84FF" opacity="0.5" />
            <circle cx="140" cy="240" r="3" fill="#2AC3A2" opacity="0.5" />
            <circle cx="160" cy="140" r="3" fill="#0A84FF" opacity="0.5" />
          </motion.g>
        </>
      )}

      {/* Data flow curves */}
      <motion.path
        d="M 100 150 Q 150 100, 200 120"
        stroke="url(#aiGradient)"
        strokeWidth="2"
        strokeDasharray="6 6"
        opacity="0.4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0.01 : 2,
          repeat: shouldReduceMotion ? 0 : Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.path
        d="M 300 150 Q 250 100, 200 120"
        stroke="url(#aiGradient)"
        strokeWidth="2"
        strokeDasharray="6 6"
        opacity="0.4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0.01 : 2,
          delay: shouldReduceMotion ? 0 : 0.5,
          repeat: shouldReduceMotion ? 0 : Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.path
        d="M 100 250 Q 150 300, 200 280"
        stroke="url(#aiGradient)"
        strokeWidth="2"
        strokeDasharray="6 6"
        opacity="0.4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0.01 : 2,
          delay: shouldReduceMotion ? 0 : 1,
          repeat: shouldReduceMotion ? 0 : Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.path
        d="M 300 250 Q 250 300, 200 280"
        stroke="url(#aiGradient)"
        strokeWidth="2"
        strokeDasharray="6 6"
        opacity="0.4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0.01 : 2,
          delay: shouldReduceMotion ? 0 : 1.5,
          repeat: shouldReduceMotion ? 0 : Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Sparkle effects */}
      {!shouldReduceMotion && (
        <>
          <motion.circle
            cx="180"
            cy="180"
            r="2"
            fill="#0A84FF"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
          <motion.circle
            cx="220"
            cy="220"
            r="2"
            fill="#2AC3A2"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
              delay: 0.5,
            }}
          />
          <motion.circle
            cx="220"
            cy="180"
            r="2"
            fill="#0A84FF"
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
              delay: 1,
            }}
          />
        </>
      )}
    </svg>
  )
}
