"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  Bell,
  Clock,
  Filter,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import type { EmailLogEntry, NotificationEntry } from "./types"

type ActivityType = "all" | "emails" | "notifications" | "actions"

interface AuditLogEntry {
  id: string
  action: string
  targetType: string | null
  targetId: string | null
  metadata: any
  createdAt: string
}

interface ActivityItem {
  id: string
  type: "email" | "notification" | "audit"
  title: string
  description?: string
  createdAt: string
  metadata?: any
}

const TEMPLATE_LABELS: Record<string, string> = {
  welcome: "Email de bienvenue",
  otp: "Code OTP",
  verification: "Verification email",
  club_submitted: "Club soumis",
  club_approved: "Club approuve",
  club_rejected: "Club rejete",
  password_reset: "Reset mot de passe",
  invitation: "Invitation",
}

function getActivityIcon(type: "email" | "notification" | "audit") {
  switch (type) {
    case "email":
      return <Mail className="h-3.5 w-3.5 text-blue-500" />
    case "notification":
      return <Bell className="h-3.5 w-3.5 text-amber-500" />
    case "audit":
      return <Clock className="h-3.5 w-3.5 text-slate-400" />
  }
}

function getActivityBadge(type: "email" | "notification" | "audit") {
  switch (type) {
    case "email":
      return <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0">Email</Badge>
    case "notification":
      return <Badge variant="secondary" className="bg-amber-50 text-amber-700 text-[10px] px-1.5 py-0">Notif</Badge>
    case "audit":
      return <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Action</Badge>
  }
}

interface UserActivitySectionProps {
  auditLogs: AuditLogEntry[]
  emailLogs: EmailLogEntry[]
  notifications: NotificationEntry[]
}

export function UserActivitySection({
  auditLogs,
  emailLogs,
  notifications,
}: UserActivitySectionProps) {
  const [filter, setFilter] = useState<ActivityType>("all")

  const allItems = useMemo(() => {
    const items: ActivityItem[] = []

    for (const log of auditLogs) {
      items.push({
        id: `audit-${log.id}`,
        type: "audit",
        title: log.action.replace(/_/g, " "),
        description: log.targetType
          ? `${log.targetType}${log.targetId ? ` #${log.targetId.slice(0, 8)}` : ""}`
          : undefined,
        createdAt: log.createdAt,
        metadata: log.metadata,
      })
    }

    for (const email of emailLogs) {
      items.push({
        id: `email-${email.id}`,
        type: "email",
        title: TEMPLATE_LABELS[email.template] || email.template,
        description: `${email.subject} → ${email.to}`,
        createdAt: email.createdAt,
      })
    }

    for (const notif of notifications) {
      items.push({
        id: `notif-${notif.id}`,
        type: "notification",
        title: notif.title,
        description: notif.message.length > 100 ? notif.message.slice(0, 100) + "..." : notif.message,
        createdAt: notif.createdAt,
      })
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return items
  }, [auditLogs, emailLogs, notifications])

  const filteredItems = useMemo(() => {
    if (filter === "all") return allItems
    if (filter === "emails") return allItems.filter((i) => i.type === "email")
    if (filter === "notifications") return allItems.filter((i) => i.type === "notification")
    if (filter === "actions") return allItems.filter((i) => i.type === "audit")
    return allItems
  }, [allItems, filter])

  const filters: { key: ActivityType; label: string; count: number }[] = [
    { key: "all", label: "Tout", count: allItems.length },
    { key: "emails", label: "Emails", count: emailLogs.length },
    { key: "notifications", label: "Notifs", count: notifications.length },
    { key: "actions", label: "Actions", count: auditLogs.length },
  ]

  return (
    <Card className="p-6">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-slate-400" />
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`
              px-3 py-1 rounded-full text-xs font-medium transition-colors
              ${filter === f.key
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }
            `}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-8">
          Aucune activite
        </p>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
          <div className="space-y-0">
            {filteredItems.map((item) => (
              <div key={item.id} className="relative pl-10 py-3">
                <div className="absolute left-2 top-4 h-5 w-5 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                  {getActivityIcon(item.type)}
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {item.title}
                      </p>
                      {getActivityBadge(item.type)}
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 ml-4">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
