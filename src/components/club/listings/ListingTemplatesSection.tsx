"use client"

import { ListingTemplateCard } from "@/components/club/listings/ListingTemplateCard"
import {
  LISTING_TEMPLATES,
  type ListingTemplate,
} from "@/lib/club/listing-templates"
import { LayoutTemplate } from "lucide-react"

interface ListingTemplatesSectionProps {
  hasTeams: boolean
  onUseTemplate: (template: ListingTemplate) => void
  className?: string
}

export function ListingTemplatesSection({
  hasTeams,
  onUseTemplate,
  className,
}: ListingTemplatesSectionProps) {
  return (
    <section className={className}>
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="h-5 w-5 text-pitch-600" />
          <h2 className="text-lg font-semibold text-stadium-900">
            Idées d&apos;annonces populaires
          </h2>
        </div>
        <p className="mt-1 text-sm text-stadium-500">
          Modèles rédigés pour le foot amateur et semi-pro : texte complet
          prérempli, modifiable avant publication.
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {LISTING_TEMPLATES.map((template) => (
          <ListingTemplateCard
            key={template.id}
            template={template}
            disabled={!hasTeams}
            onUse={onUseTemplate}
          />
        ))}
      </div>

      {!hasTeams && (
        <p className="mt-3 text-center text-xs text-stadium-500">
          Créez une équipe pour préremplir une annonce à partir d&apos;un modèle.
        </p>
      )}
    </section>
  )
}
