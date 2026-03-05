"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { BadgePill } from "@/components/player/insights/BadgePill"
import { Building2, UserCircle, Eye, MessageCircle, ChevronRight, Sparkles } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import type { InterestItem } from "@/types/interests"

interface InterestsPanelProps {
  interests: InterestItem[]
  onMarkAsRead?: (interestId: string) => void
  className?: string
}

const MAX_VISIBLE = 3

export function InterestsPanel({ interests, onMarkAsRead, className }: InterestsPanelProps) {
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
      <div className={cn("rounded-xl border border-slate-200 bg-white p-10", className)}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-50">
            <Sparkles className="h-7 w-7 text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-600">Aucun intérêt reçu</p>
          <p className="text-xs text-slate-400 max-w-xs">
            Complète ton profil et ajoute des médias pour augmenter ta visibilité.
          </p>
          <button
            type="button"
            onClick={() => document.getElementById("profile-completion")?.scrollIntoView({ behavior: "smooth" })}
            className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-pitch-600 hover:bg-pitch-700 transition-colors focus-visible:ring-2 focus-visible:ring-pitch-500 focus-visible:ring-offset-2"
          >
            Améliorer mon profil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white", className)}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-800">Intérêts reçus</h3>
          <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-xs font-bold rounded-full bg-slate-100 text-slate-600">
            {interests.length}
          </span>
        </div>
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
      <div className="divide-y divide-slate-50">
        {visible.map((item) => (
          <InterestRowPremium
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

function InterestRowPremium({
  item,
  onView,
  onContact,
}: {
  item: InterestItem
  onView: (item: InterestItem) => void
  onContact: (item: InterestItem) => void
}) {
  const SourceIcon = item.sourceType === "club" ? Building2 : UserCircle
  const relativeDate = formatDistanceToNow(item.createdAt, { addSuffix: true, locale: fr })
  const initials = item.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={cn(
        "group flex items-center gap-4 px-5 py-4 transition-colors duration-150",
        "hover:bg-slate-50",
        !item.isRead && "bg-pitch-50/30"
      )}
    >
      {!item.isRead && (
        <div className="w-0.5 h-10 rounded-full bg-pitch-500 flex-shrink-0 -ml-2 mr-0" />
      )}

      <div className="relative flex-shrink-0">
        {item.avatarUrl ? (
          <Image
            src={item.avatarUrl}
            alt={item.name}
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 border border-slate-200">
            <span className="text-sm font-bold text-slate-500">{initials}</span>
          </div>
        )}
        {!item.isRead && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-pitch-500 rounded-full border-2 border-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-800 truncate">{item.name}</span>
          <BadgePill type={item.type} />
        </div>
        <p className="text-xs text-slate-400 mt-0.5">{relativeDate}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          type="button"
          onClick={() => onView(item)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-pitch-500"
          aria-label={`Voir ${item.name}`}
        >
          <Eye className="h-3.5 w-3.5" />
          Voir
        </button>
        <button
          type="button"
          onClick={() => onContact(item)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-pitch-600 hover:bg-pitch-700 transition-colors focus-visible:ring-2 focus-visible:ring-pitch-500 focus-visible:ring-offset-2"
          aria-label={`Contacter ${item.name}`}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Contacter
        </button>
      </div>
    </div>
  )
}
