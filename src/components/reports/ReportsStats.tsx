"use client"

import {
  BarChart3,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react"

interface ReportsStatsProps {
  stats: {
    total: number
    draft: number
    pending: number
    approved: number
    rejected: number
  }
}

const statItems = [
  {
    key: "total" as const,
    label: "Total",
    icon: BarChart3,
    dotColor: "bg-stadium-400",
    iconColor: "text-stadium-400",
  },
  {
    key: "draft" as const,
    label: "Brouillons",
    icon: Clock,
    dotColor: "bg-stadium-300",
    iconColor: "text-stadium-400",
  },
  {
    key: "pending" as const,
    label: "En attente",
    icon: AlertCircle,
    dotColor: "bg-amber-500",
    iconColor: "text-amber-500",
  },
  {
    key: "approved" as const,
    label: "Approuvés",
    icon: CheckCircle2,
    dotColor: "bg-green-600",
    iconColor: "text-green-600",
  },
  {
    key: "rejected" as const,
    label: "Refusés",
    icon: XCircle,
    dotColor: "bg-red-500",
    iconColor: "text-red-500",
  },
]

export function ReportsStats({ stats }: ReportsStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {statItems.map((item) => (
        <div
          key={item.key}
          className="relative bg-white ring-1 ring-stadium-200 shadow-sm rounded-2xl p-4 flex items-center gap-3 overflow-hidden"
        >
          <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${item.dotColor}`} />
          <div className="pl-2 flex-1 min-w-0">
            <p className="text-xs font-medium text-stadium-500 truncate">{item.label}</p>
            <p className="text-2xl font-bold text-stadium-900 leading-tight mt-0.5">
              {stats[item.key]}
            </p>
          </div>
          <item.icon className={`h-5 w-5 ${item.iconColor} opacity-40 shrink-0`} />
        </div>
      ))}
    </div>
  )
}
