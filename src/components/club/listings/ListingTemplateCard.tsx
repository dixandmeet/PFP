"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  LISTING_TEMPLATE_CATEGORY_STYLES,
  getListingPositionLabel,
  type ListingTemplate,
} from "@/lib/club/listing-templates"
import { cn } from "@/lib/utils"
import { ArrowRight, Star } from "lucide-react"

interface ListingTemplateCardProps {
  template: ListingTemplate
  disabled?: boolean
  onUse: (template: ListingTemplate) => void
}

export function ListingTemplateCard({
  template,
  disabled,
  onUse,
}: ListingTemplateCardProps) {
  const Icon = template.icon
  const styles = LISTING_TEMPLATE_CATEGORY_STYLES[template.category]

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-stadium-200 bg-white shadow-sm",
        "transition-all duration-200 hover:border-pitch-200 hover:shadow-md",
        disabled && "pointer-events-none opacity-60"
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
          {template.title}
        </h4>
        <p className="mt-1 text-xs font-medium text-pitch-600">
          {getListingPositionLabel(template.position)}
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
          variant={disabled ? "outline" : "default"}
          className={cn(
            "mt-5 w-full transition-all duration-200",
            !disabled &&
              "group-hover:bg-pitch-600 group-hover:shadow-sm"
          )}
          disabled={disabled}
          onClick={() => onUse(template)}
        >
          Utiliser ce modèle
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    </article>
  )
}
