"use client"

import { cn } from "@/lib/utils"
import { useMotionConfig } from "@/components/motion/MotionProvider"

interface MarqueeProps {
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
  children?: React.ReactNode
  vertical?: boolean
  repeat?: number
  duration?: number
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  duration = 40,
}: MarqueeProps) {
  const { shouldReduceMotion } = useMotionConfig()

  if (shouldReduceMotion) {
    return (
      <div className={cn("flex gap-8 overflow-hidden", className)}>
        {children}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group flex overflow-hidden [--gap:1.5rem] gap-[var(--gap)]",
        vertical ? "flex-col" : "flex-row",
        className
      )}
      style={
        {
          "--duration": `${duration}s`,
        } as React.CSSProperties
      }
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex shrink-0 justify-around gap-[var(--gap)]",
            vertical ? "flex-col animate-marquee-vertical" : "animate-marquee",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]"
          )}
        >
          {children}
        </div>
      ))}
    </div>
  )
}
