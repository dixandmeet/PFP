"use client"

import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  trend: string
}

export function StatCard({ icon: Icon, label, value, trend }: StatCardProps) {
  const positive = trend.trim().startsWith("+")

  return (
    <div className="rounded-2xl border border-stadium-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="rounded-lg bg-stadium-100 p-2 text-stadium-700">
          <Icon className="h-4 w-4" />
        </div>
        <span
          className={`text-xs font-semibold ${
            positive ? "text-pitch-700" : "text-red-600"
          }`}
        >
          {trend}
        </span>
      </div>
      <p className="text-2xl font-bold tracking-tight text-stadium-900">{value}</p>
      <p className="mt-1 text-xs text-stadium-500">{label}</p>
    </div>
  )
}
