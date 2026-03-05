"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface AnimatedGradientTextProps {
  children: ReactNode
  className?: string
}

export function AnimatedGradientText({
  children,
  className,
}: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        "inline-flex animate-text-gradient bg-gradient-to-r from-pitch-600 via-gold-500 to-pitch-600 bg-[200%_auto] bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </span>
  )
}

interface AnimatedShinyTextProps {
  children: ReactNode
  className?: string
  shimmerWidth?: number
}

export function AnimatedShinyText({
  children,
  className,
  shimmerWidth = 100,
}: AnimatedShinyTextProps) {
  return (
    <span
      style={
        {
          "--shimmer-width": `${shimmerWidth}px`,
        } as React.CSSProperties
      }
      className={cn(
        "inline-flex animate-shiny-text bg-clip-text text-transparent",
        "bg-[linear-gradient(110deg,transparent_25%,rgba(34,197,94,0.5)_35%,rgba(34,197,94,0.8)_50%,rgba(34,197,94,0.5)_65%,transparent_75%)]",
        "bg-[length:250%_100%] bg-no-repeat",
        className
      )}
    >
      {children}
    </span>
  )
}

interface GlowingTextProps {
  children: ReactNode
  className?: string
  glowColor?: string
}

export function GlowingText({
  children,
  className,
  glowColor = "rgba(34, 197, 94, 0.5)",
}: GlowingTextProps) {
  return (
    <span
      className={cn("relative inline-block", className)}
      style={
        {
          "--glow-color": glowColor,
        } as React.CSSProperties
      }
    >
      <span className="relative z-10">{children}</span>
      <span
        className="absolute inset-0 blur-lg opacity-50 animate-pulse-soft"
        style={{ color: "var(--glow-color)" }}
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  )
}
