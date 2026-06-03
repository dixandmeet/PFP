"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { ReportHeader } from "@/components/reports/ReportHeader"
import { ReportContent } from "@/components/reports/ReportContent"
import { ReportAside } from "@/components/reports/ReportAside"
import {
  getReportSubjectLabel,
  CLUB_REPORTS_BASE,
} from "@/lib/reports/club-report-display"
import type { ClubReportListItem } from "@/lib/reports/club-report-display"

type ReportDetail = ClubReportListItem & {
  sections: Array<{ id: string; title: string; content: string; order: number }>
}

export default function ClubReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [report, setReport] = useState<ReportDetail | null>(null)
  const [canEdit, setCanEdit] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/club/reports/${params.id}`)
        if (!res.ok) throw new Error("Rapport non trouvé")
        const data = await res.json()
        setReport(data.report)
        setCanEdit(data.canEdit)
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
    }
    if (params.id) load()
  }, [params.id, router, toast])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pitch-500" />
      </div>
    )
  }

  if (!report) return null

  const subjectName = getReportSubjectLabel(report)

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <ReportHeader
        title={report.title}
        subjectName={subjectName}
        authorType={report.authorType}
        status={report.status}
        version={report.version}
        updatedAt={report.updatedAt}
        onBack={() => router.push(CLUB_REPORTS_BASE)}
        readOnly={!canEdit}
        onEdit={() => router.push(`${CLUB_REPORTS_BASE}/${report.id}/edit`)}
        onShare={() => {
          navigator.clipboard.writeText(
            `${window.location.origin}${CLUB_REPORTS_BASE}/${report.id}`
          )
          toast({ title: "Lien copié" })
        }}
        onDownload={() =>
          toast({ title: "Export PDF", description: "Bientôt disponible" })
        }
        onDelete={
          canEdit
            ? async () => {
                if (!confirm("Supprimer ce rapport ?")) return
                const res = await fetch(`/api/club/reports/${report.id}`, {
                  method: "DELETE",
                })
                if (res.ok) {
                  toast({ title: "Rapport supprimé" })
                  router.push(CLUB_REPORTS_BASE)
                }
              }
            : undefined
        }
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ReportContent
            sections={report.sections || []}
            readOnly
            onEdit={() => {}}
          />
        </div>
        <div className="lg:col-span-4">
          <ReportAside
            sections={report.sections || []}
            version={report.version}
            createdAt={report.createdAt}
            updatedAt={report.updatedAt}
          />
        </div>
      </div>
    </div>
  )
}
