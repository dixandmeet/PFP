"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Bug, Plus, CheckCheck, TrendingUp, X } from "lucide-react"
import { useNotifications } from "@/stores/notifications-store"
import type { InterestItem } from "@/types/interests"

interface InsightsDevPanelProps {
  onAddInterest: (interest: InterestItem) => void
  onIncrementViews: () => void
}

export function InsightsDevPanel({ onAddInterest, onIncrementViews }: InsightsDevPanelProps) {
  const [open, setOpen] = useState(false)
  const { markAllAsRead, addNotification } = useNotifications()

  if (process.env.NODE_ENV !== "development") return null

  const simulateInterest = () => {
    const id = `int-dev-${Date.now()}`
    const newInterest: InterestItem = {
      id,
      sourceType: "club",
      sourceId: `club-dev-${Date.now()}`,
      name: `Club Test ${Math.floor(Math.random() * 100)}`,
      type: "interest",
      createdAt: new Date(),
      isRead: false,
    }
    onAddInterest(newInterest)
    addNotification({
      eventType: "interest_received",
      title: "Nouvel intérêt",
      message: `${newInterest.name} a manifesté un intérêt`,
      relatedEntityId: newInterest.sourceId,
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 p-2.5 rounded-full bg-stadium-800 text-white shadow-lg hover:bg-stadium-700 transition-colors"
        aria-label="Ouvrir le panneau développeur"
      >
        <Bug className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-64 rounded-xl bg-stadium-900 text-white shadow-2xl border border-stadium-700 p-4 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-stadium-400">
          Dev Panel
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="p-1 rounded hover:bg-stadium-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={simulateInterest}
        className={cn(
          "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium",
          "bg-pitch-600 hover:bg-pitch-700 transition-colors"
        )}
      >
        <Plus className="h-4 w-4" />
        Simuler un intérêt
      </button>
      <button
        type="button"
        onClick={markAllAsRead}
        className={cn(
          "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium",
          "bg-stadium-700 hover:bg-stadium-600 transition-colors"
        )}
      >
        <CheckCheck className="h-4 w-4" />
        Tout marquer comme lu
      </button>
      <button
        type="button"
        onClick={onIncrementViews}
        className={cn(
          "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium",
          "bg-stadium-700 hover:bg-stadium-600 transition-colors"
        )}
      >
        <TrendingUp className="h-4 w-4" />
        +1 vue ce mois
      </button>
    </div>
  )
}
