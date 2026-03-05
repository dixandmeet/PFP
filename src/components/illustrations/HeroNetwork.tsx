"use client"

import { motion } from "framer-motion"
import { useMotionConfig } from "@/components/motion/MotionProvider"

export function HeroNetwork() {
  const { shouldReduceMotion } = useMotionConfig()

  return (
    <svg
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#2AC3A2" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0A84FF" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#2AC3A2" stopOpacity="0.2" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Connection lines */}
      <motion.path
        d="M150 150 L300 300"
        stroke="url(#gradient2)"
        strokeWidth="2"
        strokeDasharray="8 8"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0.01 : 2,
          ease: "easeInOut",
          repeat: shouldReduceMotion ? 0 : Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.path
        d="M450 150 L300 300"
        stroke="url(#gradient2)"
        strokeWidth="2"
        strokeDasharray="8 8"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0.01 : 2,
          delay: shouldReduceMotion ? 0 : 0.3,
          ease: "easeInOut",
          repeat: shouldReduceMotion ? 0 : Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.path
        d="M300 300 L300 450"
        stroke="url(#gradient2)"
        strokeWidth="2"
        strokeDasharray="8 8"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0.01 : 2,
          delay: shouldReduceMotion ? 0 : 0.6,
          ease: "easeInOut",
          repeat: shouldReduceMotion ? 0 : Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Node 1 - Player (top left) */}
      <motion.g
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.6, delay: shouldReduceMotion ? 0 : 0.2 }}
      >
        <motion.rect
          x="100"
          y="100"
          width="100"
          height="100"
          rx="20"
          fill="white"
          stroke="url(#gradient1)"
          strokeWidth="2"
          filter="url(#glow)"
          animate={shouldReduceMotion ? {} : {
            y: [0, -8, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <circle cx="150" cy="135" r="15" fill="url(#gradient1)" opacity="0.3" />
        <rect x="120" y="160" width="60" height="6" rx="3" fill="#0A84FF" opacity="0.2" />
        <rect x="120" y="172" width="45" height="6" rx="3" fill="#0A84FF" opacity="0.15" />
      </motion.g>

      {/* Node 2 - Agent (top right) */}
      <motion.g
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.6, delay: shouldReduceMotion ? 0 : 0.4 }}
      >
        <motion.rect
          x="400"
          y="100"
          width="100"
          height="100"
          rx="20"
          fill="white"
          stroke="url(#gradient1)"
          strokeWidth="2"
          filter="url(#glow)"
          animate={shouldReduceMotion ? {} : {
            y: [0, -10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <circle cx="450" cy="135" r="15" fill="url(#gradient1)" opacity="0.3" />
        <rect x="420" y="160" width="60" height="6" rx="3" fill="#2AC3A2" opacity="0.2" />
        <rect x="420" y="172" width="50" height="6" rx="3" fill="#2AC3A2" opacity="0.15" />
      </motion.g>

      {/* Central Hub */}
      <motion.g
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.6, delay: shouldReduceMotion ? 0 : 0.6 }}
      >
        <motion.circle
          cx="300"
          cy="300"
          r="60"
          fill="url(#gradient1)"
          opacity="0.1"
          animate={shouldReduceMotion ? {} : {
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <circle
          cx="300"
          cy="300"
          r="40"
          fill="white"
          stroke="url(#gradient1)"
          strokeWidth="3"
          filter="url(#glow)"
        />
        <circle cx="300" cy="300" r="20" fill="url(#gradient1)" opacity="0.3" />
      </motion.g>

      {/* Node 3 - Club (bottom) */}
      <motion.g
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.6, delay: shouldReduceMotion ? 0 : 0.8 }}
      >
        <motion.rect
          x="250"
          y="400"
          width="100"
          height="100"
          rx="20"
          fill="white"
          stroke="url(#gradient1)"
          strokeWidth="2"
          filter="url(#glow)"
          animate={shouldReduceMotion ? {} : {
            y: [0, -6, 0],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <rect x="270" y="425" width="60" height="30" rx="10" fill="url(#gradient1)" opacity="0.2" />
        <rect x="270" y="465" width="60" height="6" rx="3" fill="#0A84FF" opacity="0.2" />
        <rect x="270" y="477" width="45" height="6" rx="3" fill="#0A84FF" opacity="0.15" />
      </motion.g>

      {/* Floating particles */}
      {!shouldReduceMotion && (
        <>
          <motion.circle
            cx="200"
            cy="250"
            r="3"
            fill="#0A84FF"
            opacity="0.4"
            animate={{
              y: [-10, 10, -10],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.circle
            cx="400"
            cy="300"
            r="4"
            fill="#2AC3A2"
            opacity="0.4"
            animate={{
              y: [10, -10, 10],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
          <motion.circle
            cx="350"
            cy="200"
            r="3"
            fill="#0A84FF"
            opacity="0.4"
            animate={{
              x: [-5, 5, -5],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </>
      )}
    </svg>
  )
}
