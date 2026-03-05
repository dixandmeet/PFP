"use client"

import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { InterestRow } from "./InterestRow"
import { Sparkles, ChevronRight } from "lucide-react"
import type { InterestItem } from "@/types/interests"

interface InterestsPreviewListProps {
  interests: InterestItem[]
  onMarkAsRead?: (interestId: string) => void
  className?: string
}

const MAX_VISIBLE = 3

export function InterestsPreviewList({
  interests,
  onMarkAsRead,
  className,
}: InterestsPreviewListProps) {
  const router = useRouter()
  const visible = interests.slice(0, MAX_VISIBLE)
  const hasMore = interests.length > MAX_VISIBLE

  const handleView = (item: InterestItem) => {
    onMarkAsRead?.(item.id)
    const prefix = item.sourceType === "club" ? "/club" : "/agent"
    router.push(`${prefix}/${item.sourceId}`)
  }

  const handleContact = (item: InterestItem) => {
    onMarkAsRead?.(item.id)
    if (item.threadId) {
      router.push(`/player/messages?thread=${item.threadId}`)
    } else {
      router.push(`/player/messages?new=${item.sourceId}`)
    }
  }

  if (interests.length === 0) {
    return (
      <div className={cn("rounded-2xl border border-stadium-200 bg-white p-8", className)}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-stadium-50">
            <Sparkles className="h-7 w-7 text-stadium-300" />
          </div>
          <p className="text-sm font-semibold text-stadium-600">
            Aucun intérêt reçu
          </p>
          <p className="text-xs text-stadium-400 max-w-xs">
            Complète ton profil et ajoute des médias pour augmenter ta visibilité.
          </p>
          <button
            type="button"
            onClick={() => {
              document
                .getElementById("profile-completion")
                ?.scrollIntoView({ behavior: "smooth" })
            }}
            className={cn(
              "mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold",
              "text-white bg-pitch-600 hover:bg-pitch-700 transition-colors",
              "focus-visible:ring-2 focus-visible:ring-pitch-500 focus-visible:ring-offset-2"
            )}
          >
            Rendre mon profil plus visible
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("rounded-2xl border border-stadium-200 bg-white", className)}>
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <h3 className="text-base font-bold text-stadium-800">Intérêts reçus</h3>
        {hasMore && (
          <button
            type="button"
            onClick={() => router.push("/player/interests")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-pitch-600 hover:text-pitch-700 transition-colors"
          >
            Tout voir
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="px-2 pb-3 space-y-1">
        {visible.map((item) => (
          <InterestRow
            key={item.id}
            item={item}
            onView={handleView}
            onContact={handleContact}
          />
        ))}
      </div>
    </div>
  )
}
