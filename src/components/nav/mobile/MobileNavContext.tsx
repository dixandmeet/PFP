"use client"

import { createContext, useContext, useState } from "react"

interface MobileNavContextType {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const MobileNavContext = createContext<MobileNavContextType>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
})

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <MobileNavContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </MobileNavContext.Provider>
  )
}

export function useMobileNav() {
  return useContext(MobileNavContext)
}
