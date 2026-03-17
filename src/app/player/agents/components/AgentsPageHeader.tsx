"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Search, Users } from "lucide-react"

interface AgentsPageHeaderProps {
  activeMandatesCount: number
  pendingCount: number
  agentsCount: number
  searchInputRef: React.RefObject<HTMLInputElement | null>
}

export function AgentsPageHeader({
  activeMandatesCount,
  pendingCount,
  agentsCount,
  searchInputRef,
}: AgentsPageHeaderProps) {
  const handleFindAgent = () => {
    searchInputRef.current?.focus()
    searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-black text-stadium-900 tracking-tight leading-none">
          Mes Agents
        </h1>
        <Button
          onClick={handleFindAgent}
          className="shrink-0 bg-pitch-600 hover:bg-pitch-700 text-white font-semibold rounded-xl h-10 shadow-sm transition-all duration-200 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-pitch-500 focus-visible:ring-offset-2 px-3 sm:px-5"
          aria-label="Trouver un agent"
        >
          <Search className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Trouver un agent</span>
        </Button>
      </div>
      <p className="text-sm text-stadium-500 font-medium mt-1.5">
        {activeMandatesCount} mandat(s) actif(s)
        <span className="mx-1.5 text-stadium-300">·</span>
        {pendingCount} en attente
        <span className="mx-1.5 text-stadium-300">·</span>
        {agentsCount} agent(s) disponible(s)
      </p>
    </div>
  )
}
