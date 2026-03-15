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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stadium-900">
          Sections
          <span className="ml-2 text-sm font-normal text-stadium-400">
            ({sections.length})
          </span>
        </h2>
        {!readOnly && sections.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onEdit} className="text-stadium-500">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Ajouter
          </Button>
        )}
      </div>

      {sections.length === 0 ? (
        readOnly ? (
          <div className="rounded-xl border border-dashed border-stadium-200 bg-white p-10">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-stadium-100 mb-4">
                <FileText className="h-6 w-6 text-stadium-400" />
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
    </div>
  )
}

function EmptyState({ onEdit }: { onEdit: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-stadium-200 bg-white p-10">
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-stadium-100 mb-4">
          <FileText className="h-6 w-6 text-stadium-400" />
        </div>
        <h3 className="text-base font-semibold text-stadium-800 mb-1">
          Ce rapport est vide
        </h3>
        <p className="text-sm text-stadium-500 mb-6 max-w-xs">
          Ajoutez une première section : technique, mental, physique...
        </p>
        <div className="flex items-center gap-3">
          <Button onClick={onEdit} size="sm" aria-label="Ajouter une section">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Ajouter une section
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            aria-label="Importer un modèle"
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
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
    <div className="space-y-3">
      {sorted.map((section) => (
        <div
          key={section.id}
          className="group rounded-lg border border-stadium-150 bg-white p-5 transition-shadow duration-150 hover:shadow-apple-sm"
        >
          <div className={`flex items-start ${readOnly ? "" : "gap-3"}`}>
            {!readOnly && (
              <div className="pt-0.5 opacity-0 group-hover:opacity-40 transition-opacity cursor-grab">
                <GripVertical className="h-4 w-4 text-stadium-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-stadium-800">
                  {section.title}
                </h3>
                {!readOnly && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={onEdit}
                      aria-label={`Modifier ${section.title}`}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-600"
                      aria-label={`Supprimer ${section.title}`}
                      disabled
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-sm text-stadium-600 leading-relaxed whitespace-pre-wrap line-clamp-4">
                {section.content}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
