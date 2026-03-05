"use client"

import { Target, Briefcase } from "lucide-react"

interface OpportunitiesHeaderProps {
  activeView: "opportunities" | "applications"
  setActiveView: (view: "opportunities" | "applications") => void
  listingsCount: number
  applicationsCount: number
}

export function OpportunitiesHeader({
  activeView,
  setActiveView,
  listingsCount,
  applicationsCount,
}: OpportunitiesHeaderProps) {
  const subtitle =
    activeView === "opportunities"
      ? `${listingsCount} opportunite${listingsCount > 1 ? "s" : ""} trouvee${listingsCount > 1 ? "s" : ""}`
      : `${applicationsCount} candidature${applicationsCount > 1 ? "s" : ""}`

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {activeView === "opportunities" ? "Opportunites" : "Mes Candidatures"}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveView("opportunities")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeView === "opportunities"
              ? "bg-green-600/10 text-green-700 ring-1 ring-green-600/20"
              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          }`}
        >
          <Target className="h-4 w-4" />
          Opportunites
          {listingsCount > 0 && (
            <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
              activeView === "opportunities"
                ? "bg-green-600/10 text-green-700"
                : "bg-slate-100 text-slate-600"
            }`}>
              {listingsCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveView("applications")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeView === "applications"
              ? "bg-green-600/10 text-green-700 ring-1 ring-green-600/20"
              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          Candidatures
          {applicationsCount > 0 && (
            <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
              activeView === "applications"
                ? "bg-green-600/10 text-green-700"
                : "bg-slate-100 text-slate-600"
            }`}>
              {applicationsCount}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
