"use client"

import { ReportTemplateCard } from "@/components/reports/ReportTemplateCard"
import {
  getReportTemplates,
  type ReportTemplate,
  type ReportTemplateAudience,
  type ReportTemplateKind,
} from "@/lib/reports/templates"
import { LayoutTemplate } from "lucide-react"

interface ReportTemplatesSectionProps {
  audience: ReportTemplateAudience
  kind?: ReportTemplateKind
  onUseTemplate: (template: ReportTemplate) => void
  className?: string
}

export function ReportTemplatesSection({
  audience,
  kind,
  onUseTemplate,
  className,
}: ReportTemplatesSectionProps) {
  const templates = getReportTemplates(audience, kind)

  if (templates.length === 0) return null

  return (
    <section className={className}>
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="h-5 w-5 text-pitch-600" />
          <h2 className="text-lg font-semibold text-stadium-900">
            Idées de rapports populaires
          </h2>
        </div>
        <p className="mt-1 text-sm text-stadium-500">
          Modèles rédigés pour le foot amateur et semi-pro : sections préremplies,
          modifiables avant envoi ou partage.
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {templates.map((template) => (
          <ReportTemplateCard
            key={template.id}
            template={template}
            onUse={onUseTemplate}
          />
        ))}
      </div>
    </section>
  )
}
