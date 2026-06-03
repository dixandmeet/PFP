"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LayoutTemplate, FileText, AlertTriangle, Trophy, User } from "lucide-react"
import {
  getReportTemplates,
  type ReportTemplate,
  type ReportTemplateAudience,
  type ReportTemplateKind,
  type ReportTemplateSection,
} from "@/lib/reports/templates"

interface ReportTemplatePickerProps {
  audience: ReportTemplateAudience
  kind?: ReportTemplateKind
  /** Vrai si le rapport contient déjà des sections (affiche un avertissement). */
  hasExistingSections: boolean
  /** Applique les sections du modèle (remplace les sections existantes). */
  onApply: (sections: ReportTemplateSection[]) => void
}

export function ReportTemplatePicker({
  audience,
  kind,
  hasExistingSections,
  onApply,
}: ReportTemplatePickerProps) {
  const [open, setOpen] = useState(false)
  const templates = getReportTemplates(audience, kind)

  if (templates.length === 0) return null

  const handleApply = (template: ReportTemplate) => {
    onApply(template.sections)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full sm:w-auto rounded-xl border-stadium-200 hover:bg-stadium-50"
        >
          <LayoutTemplate className="mr-1.5 h-4 w-4 shrink-0" />
          Partir d'un modèle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-3">
            <div className="rounded-lg bg-pitch-600 p-2">
              <LayoutTemplate className="h-4 w-4 text-white" />
            </div>
            <DialogTitle className="text-lg">Modèles de rapport</DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            Choisissez une trame prête à l'emploi. Vous pourrez ensuite modifier,
            réordonner ou supprimer chaque section.
          </DialogDescription>
        </DialogHeader>

        {hasExistingSections && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Appliquer un modèle <strong>remplacera</strong> les sections
              actuelles du rapport.
            </span>
          </div>
        )}

        <div className="space-y-3 pt-1">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleApply(template)}
              className="group w-full rounded-2xl border border-stadium-200 bg-white p-4 text-left transition-all hover:border-pitch-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-stadium-900">
                      {template.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-stadium-100 px-2 py-0.5 text-[10px] font-medium text-stadium-600">
                      {template.kind === "MATCH" ? (
                        <Trophy className="h-3 w-3" />
                      ) : (
                        <User className="h-3 w-3" />
                      )}
                      {template.kind === "MATCH" ? "Match" : "Joueur"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-stadium-500">
                    {template.description}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-pitch-50 px-2 py-0.5 text-[11px] font-semibold text-pitch-600">
                  <FileText className="h-3 w-3" />
                  {template.sections.length}
                </span>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
