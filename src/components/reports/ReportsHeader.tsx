"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface ReportsHeaderProps {
  onNewReport: () => void
}

export function ReportsHeader({ onNewReport }: ReportsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-stadium-900 tracking-tight">
          Mes Rapports
        </h1>
        <p className="text-sm text-stadium-500 mt-0.5">
          Créez, gérez et partagez vos rapports professionnels
        </p>
      </div>
      <Button
        onClick={onNewReport}
        className="bg-pitch-600 hover:bg-pitch-700 text-white rounded-xl shadow-sm font-semibold shrink-0"
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Nouveau rapport
      </Button>
    </div>
  )
}
