"use client"

import { cn } from "@/lib/utils"
import { Circle, ArrowRightLeft, Inbox } from "lucide-react"

interface HistoryEvent {
  id: string
  label: string
  date: string
  type: "created" | "status_change" | "note"
}

interface HistoryTimelineProps {
  events: HistoryEvent[]
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "A l'instant"
  if (diffMins < 60) return `il y a ${diffMins} min`
  if (diffHours < 24) return `il y a ${diffHours} h`
  if (diffDays < 7) return `il y a ${diffDays} j`
  if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} sem`
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function HistoryTimeline({ events }: HistoryTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Historique
        </h3>
        <div className="flex flex-col items-center justify-center py-6 text-gray-400">
          <Inbox className="h-8 w-8 mb-2" />
          <p className="text-sm">Aucun historique pour le moment.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        Historique
      </h3>
      <div className="relative space-y-0">
        {events.map((event, index) => {
          const isLast = index === events.length - 1
          return (
            <div key={event.id} className="relative flex gap-3 pb-4">
              {!isLast && (
                <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-200" />
              )}
              <div className="relative z-10 mt-0.5">
                {event.type === "created" ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                    <Circle className="h-3 w-3 text-blue-500 fill-blue-500" />
                  </div>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                    <ArrowRightLeft className="h-3 w-3 text-gray-500" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">{event.label}</p>
                <p
                  className="text-xs text-gray-400 mt-0.5"
                  title={formatFullDate(event.date)}
                >
                  {formatRelativeDate(event.date)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export type { HistoryEvent }
