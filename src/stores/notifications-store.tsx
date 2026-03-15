"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { AppNotification, NotificationEventType } from "@/types/interests"
import { mockNotifications } from "@/lib/mocks/interests-mock"

interface NotificationsContextValue {
  notifications: AppNotification[]
  unreadCount: number
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  addNotification: (event: {
    eventType: NotificationEventType
    title: string
    message: string
    relatedEntityId?: string
  }) => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] =
    useState<AppNotification[]>(mockNotifications)

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  )

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }, [])

  const addNotification = useCallback(
    (event: {
      eventType: NotificationEventType
      title: string
      message: string
      relatedEntityId?: string
    }) => {
      const newNotif: AppNotification = {
        id: `notif-${Date.now()}`,
        ...event,
        createdAt: new Date(),
        isRead: false,
      }
      setNotifications((prev) => [newNotif, ...prev])
    },
    []
  )

  const value = useMemo(
    () => ({ notifications, unreadCount, markAsRead, markAllAsRead, addNotification }),
    [notifications, unreadCount, markAsRead, markAllAsRead, addNotification]
  )

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationsProvider")
  }
  return ctx
}

export function useUnreadNotifications() {
  const { unreadCount } = useNotifications()
  return { unreadCount, hasUnread: unreadCount > 0 }
}
