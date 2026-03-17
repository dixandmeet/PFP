"use client"

import { Users, FileText } from "lucide-react"

interface AgentsTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  agentsCount: number
  mandatesCount: number
}

export function AgentsTabs({
  activeTab,
  onTabChange,
  agentsCount,
  mandatesCount,
}: AgentsTabsProps) {
  const tabs = [
    { id: "agents", label: "Recherche Agents", count: agentsCount, icon: Users },
    { id: "mandates", label: "Mes Mandats", count: mandatesCount, icon: FileText },
  ]

  return (
    <div className="mb-8" role="tablist" aria-label="Navigation agents">
      <div className="flex items-center bg-stadium-100 rounded-2xl p-1 gap-1">
        {tabs.map(({ id, label, count, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${id}`}
              onClick={() => onTabChange(id)}
              className={`
                flex-1 relative flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5 rounded-xl text-sm font-semibold
                transition-all duration-200 ease-out
                focus-visible:ring-2 focus-visible:ring-pitch-500 focus-visible:ring-offset-2
                ${isActive
                  ? "bg-pitch-600 text-white shadow-sm"
                  : "text-stadium-600 hover:text-stadium-900 hover:bg-white/60"
                }
              `}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
              <span
                className={`
                  inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold shrink-0
                  ${isActive ? "bg-white/20 text-white" : "bg-stadium-200 text-stadium-600"}
                `}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
