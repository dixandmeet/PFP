"use client"

import { useState } from "react"
import {
  UseFormRegister,
  FieldErrors,
  FieldArrayWithId,
  Control,
  useWatch,
} from "react-hook-form"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Trash2,
  GripVertical,
  FileText,
  LayoutList,
} from "lucide-react"

interface ReportSectionsEditorProps {
  fields: FieldArrayWithId[]
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  control: Control<any>
  onAdd: () => void
  onRemove: (index: number) => void
  onMove: (from: number, to: number) => void
}

export function ReportSectionsEditor({
  fields,
  register,
  errors,
  control,
  onAdd,
  onRemove,
  onMove,
}: ReportSectionsEditorProps) {
  const hasSections = fields.length > 0
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = fields.findIndex((f) => f.id === active.id)
    const newIndex = fields.findIndex((f) => f.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) {
      onMove(oldIndex, newIndex)
    }
  }

  const activeIndex = activeId ? fields.findIndex((f) => f.id === activeId) : -1

  return (
    <section className="space-y-4" aria-labelledby="sections-editor-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stadium-100">
            <LayoutList className="h-4 w-4 text-stadium-600" aria-hidden />
          </div>
          <div>
            <h2 id="sections-editor-heading" className="text-sm font-semibold text-stadium-900">
              Sections du rapport
              {hasSections && (
                <span className="ml-2 text-xs font-normal text-stadium-400">
                  {fields.length} section{fields.length > 1 ? "s" : ""}
                </span>
              )}
            </h2>
            <p className="text-xs text-stadium-500">
              {hasSections
                ? "Glissez pour réordonner · Remplissez chaque section"
                : "Organisez le contenu de votre rapport"}
            </p>
          </div>
        </div>

        {hasSections && (
          <Button
            type="button"
            size="sm"
            onClick={onAdd}
            className="w-full sm:w-auto bg-pitch-600 hover:bg-pitch-700 text-white rounded-xl"
          >
            <Plus className="mr-1.5 h-4 w-4 shrink-0" />
            Ajouter une section
          </Button>
        )}
      </div>

      {!hasSections ? (
        <EmptyState onAdd={onAdd} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <SortableSectionCard
                  key={field.id}
                  id={field.id}
                  index={index}
                  register={register}
                  errors={errors}
                  control={control}
                  onRemove={onRemove}
                  totalSections={fields.length}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeIndex >= 0 ? (
              <div className="bg-white rounded-2xl border-2 border-pitch-300 shadow-xl p-5 opacity-95">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-pitch-400" />
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-pitch-50 text-pitch-600 text-xs font-medium">
                    Section {activeIndex + 1}
                  </span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </section>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-stadium-200 bg-stadium-50/50 p-8 sm:p-10">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-stadium-200 shadow-sm mb-4">
          <FileText className="h-6 w-6 text-stadium-400" aria-hidden />
        </div>
        <h3 className="text-sm font-semibold text-stadium-800 mb-1.5">
          Aucune section pour le moment
        </h3>
        <p className="text-xs text-stadium-500 mb-6 max-w-xs leading-relaxed">
          Ajoutez des sections pour structurer votre rapport : technique, mental, physique…
        </p>
        <Button
          type="button"
          onClick={onAdd}
          size="default"
          className="bg-pitch-600 hover:bg-pitch-700 text-white rounded-xl w-full sm:w-auto"
        >
          <Plus className="mr-1.5 h-4 w-4 shrink-0" />
          Ajouter la première section
        </Button>
      </div>
    </div>
  )
}

function SortableSectionCard({
  id,
  index,
  register,
  errors,
  control,
  onRemove,
  totalSections,
}: {
  id: string
  index: number
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  control: Control<any>
  onRemove: (index: number) => void
  totalSections: number
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const contentValue = useWatch({ control, name: `sections.${index}.content` }) ?? ""
  const charCount = typeof contentValue === "string" ? contentValue.length : 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white rounded-2xl border shadow-sm overflow-hidden transition-shadow duration-150 ${
        isDragging
          ? "border-pitch-400 shadow-lg opacity-80 z-50"
          : "border-stadium-200 hover:shadow-md"
      }`}
    >
      {/* Card header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-stadium-100 bg-stadium-50/40">
        <button
          type="button"
          className="text-stadium-300 hover:text-stadium-500 cursor-grab active:cursor-grabbing touch-none transition-colors p-1 -ml-1 rounded-lg hover:bg-stadium-100"
          aria-label={`Réordonner la section ${index + 1}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-pitch-50 border border-pitch-100 text-pitch-600 text-[11px] font-semibold shrink-0">
          {index + 1} / {totalSections}
        </span>
        <div className="flex-1 min-w-0" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg h-7 w-7 p-0 shrink-0"
          aria-label={`Supprimer la section ${index + 1}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Card body */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor={`sections.${index}.title`}
            className="text-xs font-medium text-stadium-500 uppercase tracking-wide"
          >
            Titre <span className="text-red-400">*</span>
          </Label>
          <Input
            {...register(`sections.${index}.title`)}
            placeholder="Ex: Défense, Attaque, Déplacement…"
            className="rounded-xl border-stadium-200 focus:border-pitch-400 focus:ring-2 focus:ring-pitch-400/20 transition-colors text-sm"
          />
          {(errors as any).sections?.[index]?.title && (
            <p className="text-xs text-red-500 mt-1">
              {(errors as any).sections[index]?.title?.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`sections.${index}.content`}
              className="text-xs font-medium text-stadium-500 uppercase tracking-wide"
            >
              Contenu <span className="text-red-400">*</span>
            </Label>
            {charCount > 0 && (
              <span className="text-[10px] tabular-nums text-stadium-400">
                {charCount.toLocaleString("fr-FR")} car.
              </span>
            )}
          </div>
          <Textarea
            {...register(`sections.${index}.content`)}
            placeholder="Décrivez vos observations sur cette section…"
            className="min-h-[120px] sm:min-h-[140px] rounded-xl border-stadium-200 focus:border-pitch-400 focus:ring-2 focus:ring-pitch-400/20 transition-colors resize-none text-sm leading-relaxed"
          />
          {(errors as any).sections?.[index]?.content && (
            <p className="text-xs text-red-500 mt-1">
              {(errors as any).sections[index]?.content?.message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
