"use client"

import { createContext, useContext, ReactNode } from "react"
import { useReducedMotion } from "framer-motion"

interface MotionContextType {
  shouldReduceMotion: boolean
}

const MotionContext = createContext<MotionContextType>({
  shouldReduceMotion: false,
})

export const useMotionConfig = () => useContext(MotionContext)

export function MotionProvider({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion() || false

  return (
    <MotionContext.Provider value={{ shouldReduceMotion }}>
      {children}
    </MotionContext.Provider>
  )
}
