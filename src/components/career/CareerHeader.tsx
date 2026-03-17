"use client"

import { ReactNode } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CareerHeaderProps {
  experienceCount: number
  onAddExperience: () => void
}

export function CareerHeader({ experienceCount, onAddExperience }: CareerHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 pb-2">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-stadium-900 tracking-tight">Parcours</h1>
            <Badge
              variant="secondary"
              className="bg-stadium-100 text-stadium-600 border-0 font-medium text-xs"
            >
              {experienceCount} expérience{experienceCount !== 1 ? "s" : ""}
            </Badge>
          </div>
          <p className="text-sm text-stadium-500 mt-0.5">
            Gérez votre historique de carrière et vos statistiques
          </p>
        </div>
      </div>
      <Button
        onClick={onAddExperience}
        className="bg-green-600 hover:bg-green-700 text-white rounded-xl gap-2 shadow-sm shrink-0"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Ajouter une expérience</span>
        <span className="sm:hidden">Ajouter</span>
      </Button>
    </div>
  )
}
