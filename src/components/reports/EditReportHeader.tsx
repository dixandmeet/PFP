"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Loader2, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react"

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  DRAFT: {
    label: "Brouillon",
    className: "bg-slate-100 text-slate-600 border-slate-200",
    icon: Clock,
  },
  PENDING_APPROVAL: {
    label: "En attente",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: AlertCircle,
  },
  APPROVED: {
    label: "Approuvé",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Refusé",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
}

interface EditReportHeaderProps {
  status: string
  saving: boolean
  isDirty: boolean
  reportTitle?: string
  onBack: () => void
  onCancel: () => void
  onSave: () => void
}

export function EditReportHeader({
  status,
  saving,
  isDirty,
  reportTitle,
  onBack,
  onCancel,
  onSave,
}: EditReportHeaderProps) {
  const statusInfo = statusConfig[status] || statusConfig.DRAFT
  const StatusIcon = statusInfo.icon

  return (
    <header className="sticky top-0 z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 bg-white/95 backdrop-blur-md border-b border-stadium-200/60 shadow-sm">
      <div className="max-w-4xl mx-auto">
        {/* Top row: breadcrumb + status */}
        <div className="flex items-center gap-2 pt-3 pb-2">
          <button
            type="button"
            onClick={onBack}
            className="-ml-1 px-2 py-1 rounded-lg inline-flex items-center gap-1.5 text-sm text-stadium-500 hover:text-stadium-900 hover:bg-stadium-100 transition-colors"
            aria-label="Retour au rapport"
            suppressHydrationWarning
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Retour</span>
          </button>

          <span className="text-stadium-300 hidden sm:inline">/</span>

          <Badge className={`${statusInfo.className} border text-[11px] font-medium`}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {statusInfo.label}
          </Badge>

          {isDirty && (
            <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-amber-600 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="hidden sm:inline">Modifications non enregistrées</span>
              <span className="sm:hidden">Non enregistré</span>
            </span>
          )}
        </div>

        {/* Bottom row: title + actions */}
        <div className="flex items-center justify-between gap-3 pb-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-bold text-stadium-900 tracking-tight truncate">
              {reportTitle || "Modifier le rapport"}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-stadium-500 hover:text-stadium-700 hover:bg-stadium-100 rounded-xl h-9 px-3"
              suppressHydrationWarning
            >
              Annuler
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onSave}
              disabled={saving}
              className="rounded-xl h-9 px-4 font-medium shadow-sm bg-pitch-600 hover:bg-pitch-700 text-white"
              suppressHydrationWarning
            >
              {saving ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin shrink-0" />
                  Enregistrement…
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
