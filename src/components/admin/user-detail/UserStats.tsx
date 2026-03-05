"use client"

import { Card } from "@/components/ui/card"
import {
  FileText,
  MessageCircle,
  Heart,
  Users,
  UserPlus,
} from "lucide-react"

interface UserStatsProps {
  counts: {
    posts: number
    comments: number
    likes: number
    followedBy: number
    following: number
  }
  onStatClick: (tab: string) => void
}

const statItems = [
  { key: "posts", label: "Posts", icon: FileText, tab: "posts" },
  { key: "comments", label: "Commentaires", icon: MessageCircle, tab: "posts" },
  { key: "likes", label: "Likes", icon: Heart, tab: "posts" },
  { key: "followedBy", label: "Abonnes", icon: Users, tab: "profile" },
  { key: "following", label: "Abonnements", icon: UserPlus, tab: "profile" },
] as const

export function UserStats({ counts, onStatClick }: UserStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {statItems.map((item) => {
        const Icon = item.icon
        const value = counts[item.key]
        return (
          <Card
            key={item.key}
            className="p-4 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all group"
            onClick={() => onStatClick(item.tab)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-slate-100 transition-colors">
                <Icon className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <p className="text-xl font-semibold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
