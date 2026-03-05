"use client"

import { useState } from "react"
import {
  UseFormRegister,
  FieldErrors,
  FieldArrayWithId,
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
  onAdd: () => void
  onRemove: (index: number) => void
  onMove: (from: number, to: number) => void
}

export function ReportSectionsEditor({
  fields,
  register,
  errors,
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stadium-100">
            <LayoutList className="h-4.5 w-4.5 text-stadium-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stadium-900">
              Sections du rapport
              {hasSections && (
                <span className="ml-2 text-sm font-normal text-stadium-400">
                  ({fields.length})
                </span>
              )}
            </h2>
            <p className="text-sm text-stadium-500">Organisez le contenu de votre rapport</p>
          </div>
        </div>

        {hasSections && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAdd}
            className="border-stadium-200 hover:border-stadium-300 text-stadium-700 transition-all duration-150"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
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
            <div className="space-y-4">
              {fields.map((field, index) => (
                <SortableSectionCard
                  key={field.id}
                  id={field.id}
                  index={index}
                  register={register}
                  errors={errors}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeIndex >= 0 ? (
              <div className="bg-white rounded-2xl border-2 border-pitch-300 shadow-xl p-6 opacity-95">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-pitch-400" />
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-pitch-50 text-pitch-600 text-xs font-medium">
                    Section {activeIndex + 1}
                  </span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-stadium-200 shadow-sm p-10">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stadium-50 mb-5">
          <FileText className="h-8 w-8 text-stadium-400" />
        </div>
        <h3 className="text-base font-semibold text-stadium-800 mb-1.5">
          Aucune section pour le moment
        </h3>
        <p className="text-sm text-stadium-500 mb-6 max-w-sm leading-relaxed">
          Commencez par ajouter une première section : technique, mental, physique…
        </p>
        <Button
          type="button"
          onClick={onAdd}
          size="default"
          className="bg-pitch-500 hover:bg-pitch-600 text-white shadow-sm hover:shadow-md transition-all duration-150"
        >
          <Plus className="mr-1.5 h-4 w-4" />
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
  onRemove,
}: {
  id: string
  index: number
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  onRemove: (index: number) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white rounded-2xl border shadow-sm p-6 transition-shadow duration-150 ${
        isDragging
          ? "border-pitch-300 shadow-lg opacity-50 z-50"
          : "border-stadium-200 hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          className="text-stadium-300 hover:text-stadium-500 cursor-grab active:cursor-grabbing touch-none transition-colors duration-150"
          aria-label={`Réordonner la section ${index + 1}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-stadium-100 text-stadium-600 text-xs font-medium">
          Section {index + 1}
        </span>
        <div className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-red-500 hover:text-red-600 hover:bg-red-50"
          aria-label={`Supprimer la section ${index + 1}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label
            htmlFor={`sections.${index}.title`}
            className="text-sm text-stadium-600 font-medium"
          >
            Titre de la section <span className="text-red-400">*</span>
          </Label>
          <Input
            {...register(`sections.${index}.title`)}
            placeholder="Ex: Performance technique"
            className="mt-1.5 border-stadium-200 focus:border-pitch-400 focus:ring-pitch-400/20 transition-colors duration-150"
          />
          {(errors as any).sections?.[index]?.title && (
            <p className="text-sm text-red-500 mt-1">
              {(errors as any).sections[index]?.title?.message}
            </p>
          )}
        </div>

        <div>
          <Label
            htmlFor={`sections.${index}.content`}
            className="text-sm text-stadium-600 font-medium"
          >
            Contenu <span className="text-red-400">*</span>
          </Label>
          <Textarea
            {...register(`sections.${index}.content`)}
            placeholder="Décrivez le contenu de cette section..."
            className="mt-1.5 min-h-[140px] border-stadium-200 focus:border-pitch-400 focus:ring-pitch-400/20 transition-colors duration-150 resize-none"
          />
          {(errors as any).sections?.[index]?.content && (
            <p className="text-sm text-red-500 mt-1">
              {(errors as any).sections[index]?.content?.message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
