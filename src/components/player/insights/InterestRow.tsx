"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { BadgePill } from "./BadgePill"
import { Building2, UserCircle, Eye, MessageCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import type { InterestItem } from "@/types/interests"

interface InterestRowProps {
  item: InterestItem
  onView: (item: InterestItem) => void
  onContact: (item: InterestItem) => void
}

export function InterestRow({ item, onView, onContact }: InterestRowProps) {
  const SourceIcon = item.sourceType === "club" ? Building2 : UserCircle
  const relativeDate = formatDistanceToNow(item.createdAt, {
    addSuffix: true,
    locale: fr,
  })

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150",
        "hover:bg-stadium-50",
        !item.isRead && "bg-pitch-50/40 border border-pitch-100"
      )}
    >
      <div className="relative flex-shrink-0">
        {item.avatarUrl ? (
          <Image
            src={item.avatarUrl}
            alt={item.name}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-stadium-100">
            <SourceIcon className="h-5 w-5 text-stadium-500" />
          </div>
        )}
        {!item.isRead && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-pitch-500 rounded-full border-2 border-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-stadium-800 truncate">
            {item.name}
          </span>
          <BadgePill type={item.type} />
        </div>
        <p className="text-xs text-stadium-400 mt-0.5">{relativeDate}</p>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => onView(item)}
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium",
            "text-stadium-600 hover:bg-stadium-100 transition-colors",
            "focus-visible:ring-2 focus-visible:ring-pitch-500"
          )}
          aria-label={`Voir ${item.name}`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Voir</span>
        </button>
        <button
          type="button"
          onClick={() => onContact(item)}
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium",
            "text-white bg-pitch-600 hover:bg-pitch-700 transition-colors",
            "focus-visible:ring-2 focus-visible:ring-pitch-500 focus-visible:ring-offset-2"
          )}
          aria-label={`Contacter ${item.name}`}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Contacter</span>
        </button>
      </div>
    </div>
  )
}
