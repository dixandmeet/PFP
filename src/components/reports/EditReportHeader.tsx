"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Loader2, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react"

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  DRAFT: {
    label: "Brouillon",
    className: "bg-stadium-100 text-stadium-600 border-stadium-200",
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
  onBack: () => void
  onCancel: () => void
  onSave: () => void
}

export function EditReportHeader({
  status,
  saving,
  isDirty,
  onBack,
  onCancel,
  onSave,
}: EditReportHeaderProps) {
  const statusInfo = statusConfig[status] || statusConfig.DRAFT
  const StatusIcon = statusInfo.icon

  return (
    <div className="sticky top-0 z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-4 bg-white/80 backdrop-blur-md border-b border-stadium-200/60 shadow-sm">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-1">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 text-sm text-stadium-500 hover:text-stadium-700 transition-colors duration-150"
                aria-label="Retour au rapport"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Retour au rapport</span>
              </button>
              <Badge className={`${statusInfo.className} border text-[11px] font-medium`}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {statusInfo.label}
              </Badge>
            </div>
            <h1 className="text-xl font-semibold text-stadium-900 tracking-tight">
              Modifier le rapport
            </h1>
            <p className="text-sm text-stadium-500 mt-0.5">
              Modifiez les informations et organisez les sections
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isDirty && (
              <span className="hidden md:inline text-xs text-amber-600 font-medium">
                Modifications non enregistrées
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              animated={false}
              className="text-stadium-600"
            >
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={saving}
              className="bg-pitch-500 hover:bg-pitch-600 text-white shadow-sm hover:shadow-md transition-all duration-150"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Enregistrement…
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
