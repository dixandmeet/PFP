"use client"

import React, { CSSProperties } from "react"
import { cn } from "@/lib/utils"

export interface ShimmerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  className?: string
  children?: React.ReactNode
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "#4ade80",
      shimmerSize = "0.1em",
      shimmerDuration = "2.5s",
      borderRadius = "100px",
      background = "linear-gradient(to right, #16a34a, #22c55e)",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        style={
          {
            "--shimmer-color": shimmerColor,
            "--shimmer-size": shimmerSize,
            "--shimmer-duration": shimmerDuration,
            "--border-radius": borderRadius,
            "--bg": background,
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap px-8 py-4 text-white font-semibold",
          "[background:var(--bg)]",
          "[border-radius:var(--border-radius)]",
          "transform-gpu transition-all duration-300 ease-in-out",
          "hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(34,197,94,0.35)]",
          "active:scale-[0.98]",
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Shimmer effect */}
        <div
          className={cn(
            "absolute inset-0 overflow-hidden [border-radius:var(--border-radius)]"
          )}
        >
          <div
            className={cn(
              "absolute inset-[-100%] rotate-0 animate-shimmer-slide",
              "[background:linear-gradient(90deg,transparent_30%,var(--shimmer-color)_50%,transparent_70%)]",
              "opacity-40"
            )}
          />
        </div>

        {/* Spark container */}
        <div
          className={cn(
            "absolute -z-10 [border-radius:var(--border-radius)]",
            "inset-0",
            "overflow-hidden"
          )}
        >
          {/* Rotating spark */}
          <div className="absolute inset-0 animate-spin-around [animation-duration:3s]">
            <div
              className={cn(
                "absolute top-1/2 left-1/2 h-[200%] w-8 -translate-x-1/2 -translate-y-1/2",
                "[background:linear-gradient(var(--shimmer-color),var(--shimmer-color)_40%,transparent_40%)]",
                "opacity-20"
              )}
            />
          </div>
        </div>

        {/* Highlight */}
        <div
          className={cn(
            "absolute inset-0 [border-radius:var(--border-radius)]",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            "[background:radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.3),transparent_60%)]"
          )}
        />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </button>
    )
  }
)

ShimmerButton.displayName = "ShimmerButton"
