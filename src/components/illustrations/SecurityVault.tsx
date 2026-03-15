"use client"

import { motion } from "framer-motion"
import { useMotionConfig } from "@/components/motion/MotionProvider"

export function SecurityVault() {
  const { shouldReduceMotion } = useMotionConfig()

  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="securityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0A84FF" />
          <stop offset="100%" stopColor="#0066CC" />
        </linearGradient>
        <linearGradient id="glassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.8" />
          <stop offset="100%" stopColor="white" stopOpacity="0.4" />
        </linearGradient>
        <filter id="securityGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background glow */}
      <motion.circle
        cx="200"
        cy="200"
        r="140"
        fill="url(#securityGradient)"
        opacity="0.08"
        animate={shouldReduceMotion ? {} : {
          scale: [1, 1.1, 1],
          opacity: [0.08, 0.12, 0.08],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Shield outline */}
      <motion.path
        d="M 200 80 
           L 280 120 
           L 280 200 
           Q 280 280, 200 320 
           Q 120 280, 120 200 
           L 120 120 
           Z"
        fill="url(#glassGradient)"
        stroke="url(#securityGradient)"
        strokeWidth="3"
        filter="url(#securityGlow)"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.6 }}
      />

      {/* Inner shield details */}
      <motion.path
        d="M 200 100 
           L 265 130 
           L 265 200 
           Q 265 265, 200 300 
           Q 135 265, 135 200 
           L 135 130 
           Z"
        fill="none"
        stroke="url(#securityGradient)"
        strokeWidth="2"
        opacity="0.3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0.01 : 2,
          delay: shouldReduceMotion ? 0 : 0.3,
          ease: "easeInOut",
        }}
      />

      {/* Center lock */}
      <motion.g
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.6, delay: shouldReduceMotion ? 0 : 0.4 }}
      >
        {/* Lock body */}
        <rect
          x="175"
          y="190"
          width="50"
          height="60"
          rx="8"
          fill="url(#securityGradient)"
          opacity="0.9"
        />
        
        {/* Lock shackle */}
        <path
          d="M 185 190 
             L 185 170 
             Q 185 150, 200 150 
             Q 215 150, 215 170 
             L 215 190"
          stroke="url(#securityGradient)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          opacity="0.9"
        />
        
        {/* Keyhole */}
        <circle cx="200" cy="215" r="6" fill="white" opacity="0.8" />
        <rect x="197" y="215" width="6" height="15" rx="2" fill="white" opacity="0.8" />
      </motion.g>

      {/* Checkmark badge */}
      <motion.g
        initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0.01 : 0.6,
          delay: shouldReduceMotion ? 0 : 0.8,
          type: "spring",
          stiffness: 200,
        }}
      >
        <circle cx="260" cy="150" r="25" fill="#2AC3A2" filter="url(#securityGlow)" />
        <motion.path
          d="M 250 150 L 257 157 L 270 143"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0.01 : 0.4,
            delay: shouldReduceMotion ? 0 : 1,
            ease: "easeOut",
          }}
        />
      </motion.g>

      {/* Scanning lines */}
      {!shouldReduceMotion && (
        <>
          <motion.line
            x1="140"
            y1="160"
            x2="260"
            y2="160"
            stroke="#0A84FF"
            strokeWidth="2"
            opacity="0.3"
            animate={{
              y1: [160, 240],
              y2: [160, 240],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.line
            x1="140"
            y1="180"
            x2="260"
            y2="180"
            stroke="#0A84FF"
            strokeWidth="1"
            opacity="0.2"
            animate={{
              y1: [180, 240],
              y2: [180, 240],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 3,
              delay: 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </>
      )}

      {/* Corner brackets (UI elements) */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.6, delay: shouldReduceMotion ? 0 : 0.6 }}
      >
        <path d="M 100 100 L 100 130 M 100 100 L 130 100" stroke="#0A84FF" strokeWidth="2" strokeLinecap="round" />
        <path d="M 300 100 L 300 130 M 300 100 L 270 100" stroke="#0A84FF" strokeWidth="2" strokeLinecap="round" />
        <path d="M 100 300 L 100 270 M 100 300 L 130 300" stroke="#0A84FF" strokeWidth="2" strokeLinecap="round" />
        <path d="M 300 300 L 300 270 M 300 300 L 270 300" stroke="#0A84FF" strokeWidth="2" strokeLinecap="round" />
      </motion.g>

      {/* Floating particles */}
      {!shouldReduceMotion && (
        <>
          <motion.circle
            cx="150"
            cy="150"
            r="3"
            fill="#0A84FF"
            opacity="0.5"
            animate={{
              y: [0, -10, 0],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.circle
            cx="250"
            cy="250"
            r="2"
            fill="#2AC3A2"
            opacity="0.5"
            animate={{
              y: [0, 10, 0],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
          <motion.circle
            cx="150"
            cy="250"
            r="2"
            fill="#0A84FF"
            opacity="0.5"
            animate={{
              x: [-5, 5, -5],
              opacity: [0.5, 0.8, 0.5],
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
