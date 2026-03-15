"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  tilt?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = true, tilt = false, children, onDrag, onDragStart, onDragEnd, onAnimationStart, ...props }, ref) => {
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const mouseXSpring = useSpring(x)
    const mouseYSpring = useSpring(y)

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["2.5deg", "-2.5deg"])
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-2.5deg", "2.5deg"])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!tilt) return
      
      const rect = e.currentTarget.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const xPct = mouseX / width - 0.5
      const yPct = mouseY / height - 0.5
      x.set(xPct)
      y.set(yPct)
    }

    const handleMouseLeave = () => {
      if (!tilt) return
      x.set(0)
      y.set(0)
    }

    if (!hover && !tilt) {
      return (
        <div
          ref={ref}
          className={cn(
            "rounded-2xl bg-white border border-stadium-200 shadow-md",
            className
          )}
          {...props}
        >
          {children}
        </div>
      )
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-2xl bg-white border border-stadium-200 shadow-md transition-shadow duration-300",
          hover && "hover:shadow-lg hover:border-pitch-200",
          className
        )}
        style={tilt ? { rotateX, rotateY } : undefined}
        whileHover={hover ? { y: -4 } : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight text-stadium-900", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-stadium-500", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
