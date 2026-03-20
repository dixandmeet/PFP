"use client"

import { Progress } from "@/components/ui/progress"
import type { LucideIcon } from "lucide-react"

interface MissionItemProps {
  icon: LucideIcon
  label: string
  points: number
  completed: boolean
}

export function MissionItem({ icon: Icon, label, points, completed }: MissionItemProps) {
  return (
    <div className="rounded-xl border border-stadium-200 bg-white p-3">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <div className="rounded-md bg-stadium-100 p-1.5 text-stadium-700">
            <Icon className="h-3.5 w-3.5" />
          </div>
          <p className="truncate text-sm font-medium text-stadium-800">{label}</p>
        </div>
        <span className="text-xs font-semibold text-pitch-700">+{points} pts</span>
      </div>
      <Progress
        value={completed ? 100 : 0}
        className="mt-2 h-1.5 bg-stadium-100 [&>div]:bg-pitch-600"
      />
    </div>
  )
}
