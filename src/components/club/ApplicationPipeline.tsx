"use client"

import { cn } from "@/lib/utils"
import { Check, X, Loader2 } from "lucide-react"

const PIPELINE_STEPS = [
  { value: "SUBMITTED", label: "Nouvelle" },
  { value: "UNDER_REVIEW", label: "En cours" },
  { value: "SHORTLISTED", label: "Shortlisté" },
  { value: "TRIAL", label: "Essai" },
  { value: "ACCEPTED", label: "Accepté" },
  { value: "SIGNED", label: "Signé" },
] as const

const STEP_COLORS: Record<string, { active: string; completed: string; dot: string }> = {
  SUBMITTED: { active: "bg-blue-500", completed: "bg-blue-500", dot: "border-blue-500" },
  UNDER_REVIEW: { active: "bg-blue-500", completed: "bg-blue-500", dot: "border-blue-500" },
  SHORTLISTED: { active: "bg-violet-500", completed: "bg-violet-500", dot: "border-violet-500" },
  TRIAL: { active: "bg-amber-500", completed: "bg-amber-500", dot: "border-amber-500" },
  ACCEPTED: { active: "bg-green-500", completed: "bg-green-500", dot: "border-green-500" },
  SIGNED: { active: "bg-emerald-600", completed: "bg-emerald-600", dot: "border-emerald-600" },
}

interface ApplicationPipelineProps {
  currentStatus: string
  onStatusChange: (status: string) => void
  loading: boolean
  loadingStatus?: string | null
}

export function ApplicationPipeline({
  currentStatus,
  onStatusChange,
  loading,
  loadingStatus,
}: ApplicationPipelineProps) {
  const isRejected = currentStatus === "REJECTED"
  const currentIndex = PIPELINE_STEPS.findIndex((s) => s.value === currentStatus)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        Pipeline
      </h3>

      {isRejected ? (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500">
            <X className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-red-700">Candidature refusée</p>
            <p className="text-xs text-red-500">Cette candidature a été rejetée</p>
          </div>
        </div>
      ) : (
        <div className="space-y-0">
          {PIPELINE_STEPS.map((step, index) => {
            const isCompleted = index < currentIndex
            const isActive = step.value === currentStatus
            const isFuture = index > currentIndex
            const isLoading = loading && loadingStatus === step.value
            const colors = STEP_COLORS[step.value]

            return (
              <button
                key={step.value}
                onClick={() => {
                  if (!loading && !isActive) onStatusChange(step.value)
                }}
                disabled={loading || isActive}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400",
                  isActive && "bg-gray-100",
                  !isActive && !loading && "hover:bg-gray-50 cursor-pointer",
                  loading && "cursor-not-allowed"
                )}
              >
                <div className="relative flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                      isCompleted && `${colors.completed} border-transparent`,
                      isActive && `${colors.dot} bg-white`,
                      isFuture && "border-gray-200 bg-white"
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-500" />
                    ) : isCompleted ? (
                      <Check className="h-3.5 w-3.5 text-white" />
                    ) : isActive ? (
                      <div className={cn("h-2.5 w-2.5 rounded-full", colors.active)} />
                    ) : null}
                  </div>
                  {index < PIPELINE_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "w-0.5 h-3 mt-0.5",
                        isCompleted ? colors.completed : "bg-gray-200"
                      )}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium -mt-1.5",
                    isCompleted && "text-gray-700",
                    isActive && "text-gray-900",
                    isFuture && "text-gray-400"
                  )}
                >
                  {step.label}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
