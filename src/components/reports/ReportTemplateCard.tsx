"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  REPORT_TEMPLATE_CATEGORY_STYLES,
  type ReportTemplate,
} from "@/lib/reports/templates"
import { cn } from "@/lib/utils"
import { ArrowRight, Star } from "lucide-react"

interface ReportTemplateCardProps {
  template: ReportTemplate
  onUse: (template: ReportTemplate) => void
}

export function ReportTemplateCard({ template, onUse }: ReportTemplateCardProps) {
  const Icon = template.icon
  const styles = REPORT_TEMPLATE_CATEGORY_STYLES[template.category]

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-stadium-200 bg-white shadow-sm",
        "transition-all duration-200 hover:border-pitch-200 hover:shadow-md"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b",
          styles.accent
        )}
      />

      <div className="relative flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              template.iconClassName
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex flex-wrap justify-end gap-1.5">
            {template.popular && (
              <Badge
                variant="outline"
                className="border-amber-200 bg-amber-50 text-[10px] font-semibold uppercase tracking-wide text-amber-700"
              >
                <Star className="mr-0.5 h-3 w-3 fill-amber-400 text-amber-500" />
                Populaire
              </Badge>
            )}
            <Badge variant="outline" className={cn("text-[10px]", styles.badge)}>
              {template.categoryLabel}
            </Badge>
          </div>
        </div>

        <h4 className="mt-4 text-base font-semibold text-stadium-900">
          {template.name}
        </h4>
        <p className="mt-1 text-xs font-medium text-pitch-600">
          {template.sections.length} section{template.sections.length !== 1 ? "s" : ""}
        </p>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-stadium-600">
          {template.summary}
        </p>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {template.highlights.map((tag) => (
            <li
              key={tag}
              className="rounded-md bg-stadium-50 px-2 py-0.5 text-[11px] font-medium text-stadium-600"
            >
              {tag}
            </li>
          ))}
        </ul>

        <Button
          size="sm"
          className="mt-5 w-full transition-all duration-200 group-hover:bg-pitch-600 group-hover:shadow-sm"
          onClick={() => onUse(template)}
        >
          Utiliser ce modèle
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    </article>
  )
}
