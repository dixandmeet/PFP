"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditReportHeader } from "@/components/reports/EditReportHeader"
import { GeneralInfoForm } from "@/components/reports/GeneralInfoForm"
import { ReportSectionsEditor } from "@/components/reports/ReportSectionsEditor"
import { ReportTemplatePicker } from "@/components/reports/ReportTemplatePicker"
import { CLUB_REPORTS_BASE } from "@/lib/reports/club-report-display"
import type { ReportTemplateSection } from "@/lib/reports/templates"

const sectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Le titre est requis"),
  content: z.string().min(1, "Le contenu est requis"),
  order: z.number(),
})

const editReportSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  authorType: z.string().min(1),
  status: z.string().min(1),
  sections: z.array(sectionSchema),
})

type EditReportFormData = z.infer<typeof editReportSchema>

const authorTypes = [
  { value: "SCOUT", label: "Recruteur" },
  { value: "COACH", label: "Entraîneur" },
]

const statuses = [
  { value: "DRAFT", label: "Brouillon" },
  { value: "PENDING_APPROVAL", label: "En attente d'approbation" },
  { value: "APPROVED", label: "Approuvé" },
  { value: "REJECTED", label: "Refusé" },
]

export default function ClubEditReportPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reportKind, setReportKind] = useState<"PLAYER" | "MATCH">("PLAYER")

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<EditReportFormData>({
    resolver: zodResolver(editReportSchema),
    defaultValues: { sections: [] },
  })

  const { fields, append, remove, move, replace } = useFieldArray({ control, name: "sections" })

  const addSection = () => {
    append({ title: "", content: "", order: fields.length })
  }

  const applyTemplate = (sections: ReportTemplateSection[]) => {
    replace(sections.map((s, i) => ({ title: s.title, content: s.content, order: i })))
  }

  const watchStatus = watch("status")
  const watchAuthorType = watch("authorType")
  const watchTitle = watch("title")

  const loadReport = useCallback(async () => {
    try {
      const res = await fetch(`/api/club/reports/${params.id}`)
      if (!res.ok) throw new Error("Rapport non trouvé")
      const data = await res.json()
      if (!data.canEdit) {
        toast({ title: "Lecture seule", variant: "destructive" })
        router.push(`${CLUB_REPORTS_BASE}/${params.id}`)
        return
      }
      const report = data.report
      setReportKind(report.reportKind === "MATCH" ? "MATCH" : "PLAYER")
      reset({
        title: report.title,
        authorType: report.authorType,
        status: report.status,
        sections: report.sections || [],
      })
    } catch (err: unknown) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Chargement impossible",
        variant: "destructive",
      })
      router.push(CLUB_REPORTS_BASE)
    } finally {
      setLoading(false)
    }
  }, [params.id, reset, router, toast])

  useEffect(() => {
    loadReport()
  }, [loadReport])

  const onSubmit = async (data: EditReportFormData) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/club/reports/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          status: data.status,
          authorType: data.authorType,
          sections: data.sections.map((s, i) => ({
            title: s.title,
            content: s.content,
            order: s.order ?? i,
          })),
        }),
      })
      if (!res.ok) throw new Error("Erreur sauvegarde")
      toast({ title: "Rapport enregistré" })
      router.push(`${CLUB_REPORTS_BASE}/${params.id}`)
    } catch (err: unknown) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Sauvegarde impossible",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pitch-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <EditReportHeader
          status={watchStatus}
          saving={saving}
          isDirty={isDirty}
          reportTitle={watchTitle}
          onBack={() => router.push(`${CLUB_REPORTS_BASE}/${params.id}`)}
          onCancel={() => router.push(`${CLUB_REPORTS_BASE}/${params.id}`)}
          onSave={handleSubmit(onSubmit)}
        />

        <GeneralInfoForm
          register={register}
          errors={errors}
          control={control}
          authorTypes={authorTypes}
          statuses={statuses}
          watchStatus={watchStatus}
          watchAuthorType={watchAuthorType}
        />

        <ReportSectionsEditor
          fields={fields}
          register={register}
          errors={errors}
          control={control}
          onAdd={addSection}
          onRemove={remove}
          onMove={move}
          templateSlot={
            <ReportTemplatePicker
              audience="CLUB"
              kind={reportKind}
              hasExistingSections={fields.length > 0}
              onApply={applyTemplate}
            />
          }
        />

        <div className="flex justify-end pb-8">
          <Button
            type="submit"
            disabled={saving}
            className="bg-pitch-600 hover:bg-pitch-700"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Enregistrer
          </Button>
        </div>
      </form>
    </div>
  )
}
