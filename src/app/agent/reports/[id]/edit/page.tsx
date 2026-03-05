"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { EditReportHeader } from "@/components/reports/EditReportHeader"
import { GeneralInfoForm } from "@/components/reports/GeneralInfoForm"
import { ReportSectionsEditor } from "@/components/reports/ReportSectionsEditor"

const sectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Le titre est requis"),
  content: z.string().min(1, "Le contenu est requis"),
  order: z.number(),
})

const editReportSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  authorType: z.string().min(1, "Le type d'auteur est requis"),
  status: z.string().min(1, "Le statut est requis"),
  sections: z.array(sectionSchema),
})

type EditReportFormData = z.infer<typeof editReportSchema>

interface Report {
  id: string
  title: string
  version: number
  status: string
  authorType: string
  sections: {
    id: string
    title: string
    content: string
    order: number
  }[]
}

const authorTypes = [
  { value: "PLAYER", label: "Joueur" },
  { value: "AGENT", label: "Agent" },
  { value: "SCOUT", label: "Recruteur" },
  { value: "COACH", label: "Entraîneur" },
]

const statuses = [
  { value: "DRAFT", label: "Brouillon" },
  { value: "PENDING_APPROVAL", label: "En attente d'approbation" },
  { value: "APPROVED", label: "Approuvé" },
  { value: "REJECTED", label: "Refusé" },
]

export default function AgentEditReportPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [report, setReport] = useState<Report | null>(null)

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<EditReportFormData>({
    resolver: zodResolver(editReportSchema),
    defaultValues: {
      sections: [],
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "sections",
  })

  const watchStatus = watch("status")
  const watchAuthorType = watch("authorType")

  useEffect(() => {
    async function loadReport() {
      try {
        const response = await fetch(`/api/reports/${params.id}`)
        if (!response.ok) {
          throw new Error("Rapport non trouvé")
        }

        const data = await response.json()
        setReport(data)

        reset({
          title: data.title,
          authorType: data.authorType,
          status: data.status,
          sections: data.sections || [],
        })
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        })
        router.push("/agent/reports")
      } finally {
        setLoading(false)
      }
    }

    loadReport()
  }, [params.id, reset, toast, router])

  const onSubmit = async (data: EditReportFormData) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/reports/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la mise à jour")
      }

      toast({
        title: "Succès",
        description: "Rapport mis à jour avec succès",
      })

      router.push(`/agent/reports/${params.id}`)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addSection = () => {
    append({
      title: "",
      content: "",
      order: fields.length,
    })
  }

  const goBack = () => router.push(`/agent/reports/${params.id}`)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-flex p-4 bg-stadium-100 rounded-full mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-stadium-500" />
          </div>
          <p className="text-stadium-600 font-medium">Chargement du rapport...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return null
  }

  return (
    <div className="min-h-screen">
      <EditReportHeader
        status={watchStatus || report.status}
        saving={saving}
        isDirty={isDirty}
        onBack={goBack}
        onCancel={goBack}
        onSave={handleSubmit(onSubmit)}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <GeneralInfoForm
          register={register}
          errors={errors}
          watchAuthorType={watchAuthorType}
          watchStatus={watchStatus}
          authorTypes={authorTypes}
          statuses={statuses}
        />

        <ReportSectionsEditor
          fields={fields}
          register={register}
          errors={errors}
          onAdd={addSection}
          onRemove={remove}
          onMove={move}
        />
      </form>
    </div>
  )
}
