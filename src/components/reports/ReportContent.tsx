"use client"

import { Button } from "@/components/ui/button"
import { FileText, Plus, Upload, Edit, Trash2, GripVertical } from "lucide-react"

interface ReportSection {
  id: string
  title: string
  content: string
  order: number
}

interface ReportContentProps {
  sections: ReportSection[]
  onEdit: () => void
  readOnly?: boolean
}

export function ReportContent({ sections, onEdit, readOnly = false }: ReportContentProps) {
  return (
    <section className="space-y-4" aria-labelledby="report-sections-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="report-sections-heading" className="text-lg font-bold text-stadium-900">
          Sections
          <span className="ml-2 text-sm font-normal text-stadium-500">
            ({sections.length})
          </span>
        </h2>
        {!readOnly && sections.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="w-full sm:w-auto border-pitch-200 text-pitch-700 hover:bg-pitch-50 hover:border-pitch-300"
          >
            <Plus className="mr-1.5 h-4 w-4 shrink-0" />
            Ajouter une section
          </Button>
        )}
      </div>

      {sections.length === 0 ? (
        readOnly ? (
          <div className="rounded-2xl border border-dashed border-stadium-200 bg-stadium-50/30 p-8 sm:p-10">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-stadium-100 mb-4">
                <FileText className="h-6 w-6 text-stadium-500" aria-hidden />
              </div>
              <h3 className="text-base font-semibold text-stadium-800 mb-1">
                Ce rapport est vide
              </h3>
              <p className="text-sm text-stadium-500 max-w-xs">
                Aucune section n&apos;a encore été ajoutée.
              </p>
            </div>
          </div>
        ) : (
          <EmptyState onEdit={onEdit} />
        )
      ) : (
        <SectionList sections={sections} onEdit={onEdit} readOnly={readOnly} />
      )}
    </section>
  )
}

function EmptyState({ onEdit }: { onEdit: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-stadium-200 bg-stadium-50/30 p-8 sm:p-10">
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-stadium-100 mb-4">
          <FileText className="h-6 w-6 text-stadium-500" aria-hidden />
        </div>
        <h3 className="text-base font-semibold text-stadium-800 mb-1">
          Ce rapport est vide
        </h3>
        <p className="text-sm text-stadium-500 mb-6 max-w-xs">
          Ajoutez une première section : technique, mental, physique...
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={onEdit}
            size="sm"
            className="bg-pitch-600 hover:bg-pitch-700"
            aria-label="Ajouter une section"
          >
            <Plus className="mr-1.5 h-4 w-4 shrink-0" />
            Ajouter une section
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="border-stadium-200"
            aria-label="Importer un modèle"
          >
            <Upload className="mr-1.5 h-4 w-4 shrink-0" />
            Importer un modèle
          </Button>
        </div>
      </div>
    </div>
  )
}

function SectionList({
  sections,
  onEdit,
  readOnly = false,
}: {
  sections: ReportSection[]
  onEdit: () => void
  readOnly?: boolean
}) {
  const sorted = [...sections].sort((a, b) => a.order - b.order)

  return (
    <ul className="space-y-3 list-none p-0 m-0">
      {sorted.map((section) => (
        <li key={section.id}>
          <article
            className="group rounded-2xl border border-stadium-100 bg-white p-4 sm:p-5 transition-shadow duration-150 hover:shadow-md hover:border-stadium-150 pl-4 sm:pl-5 border-l-4 border-l-pitch-500"
            aria-labelledby={`section-${section.id}-title`}
          >
            <div className={`flex items-start ${readOnly ? "" : "gap-3"}`}>
              {!readOnly && (
                <div className="pt-0.5 opacity-0 group-hover:opacity-50 transition-opacity cursor-grab touch-none">
                  <GripVertical className="h-4 w-4 text-stadium-400" aria-hidden />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3
                    id={`section-${section.id}-title`}
                    className="text-base font-semibold text-stadium-900"
                  >
                    {section.title}
                  </h3>
                  {!readOnly && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={onEdit}
                        aria-label={`Modifier ${section.title}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
                        aria-label={`Supprimer ${section.title}`}
                        disabled
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-stadium-600 leading-relaxed whitespace-pre-wrap">
                  {section.content || (
                    <span className="italic text-stadium-400">Aucun contenu</span>
                  )}
                </p>
              </div>
            </div>
          </article>
        </li>
      ))}
    </ul>
  )
}
