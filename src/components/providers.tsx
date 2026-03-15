"use client"

import { SessionProvider } from "next-auth/react"
import { NotificationsProvider } from "@/stores/notifications-store"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider
      refetchInterval={0}
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
    >
      <NotificationsProvider>
        {children}
      </NotificationsProvider>
    </SessionProvider>
  )
}
