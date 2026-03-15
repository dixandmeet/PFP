"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { ReportHeader } from "@/components/reports/ReportHeader"
import { ReportMeta } from "@/components/reports/ReportMeta"
import { ReportContent } from "@/components/reports/ReportContent"
import { ReportAside } from "@/components/reports/ReportAside"

interface ReportSection {
  id: string
  title: string
  content: string
  order: number
}

interface Report {
  id: string
  title: string
  version: number
  status: string
  authorType: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    firstName: string
    lastName: string
  }
  subject: {
    id: string
    firstName: string
    lastName: string
  }
  sections: ReportSection[]
}

export default function AgentReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReport() {
      try {
        const response = await fetch(`/api/reports/${params.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Rapport non trouvé")
          }
          throw new Error("Erreur lors du chargement")
        }

        const data = await response.json()
        setReport(data)
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
  }, [params.id, toast, router])

  const handleShareReport = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)

      toast({
        title: "Lien copié",
        description: "Le lien du rapport a été copié dans le presse-papiers",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      })
    }
  }

  const handleDownload = () => {
    toast({
      title: "Téléchargement",
      description: "Fonctionnalité en cours de développement",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin text-stadium-400 mx-auto mb-3" />
          <p className="text-sm text-stadium-500">Chargement du rapport...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return null
  }

  const authorName = `${report.author.firstName} ${report.author.lastName}`
  const subjectName = `${report.subject.firstName} ${report.subject.lastName}`
  const authorIsSubject = report.author.id === report.subject.id

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <ReportHeader
        title={report.title}
        subjectName={subjectName}
        authorType={report.authorType}
        status={report.status}
        version={report.version}
        updatedAt={report.updatedAt}
        onBack={() => router.push("/agent/reports")}
        onEdit={() => router.push(`/agent/reports/${report.id}/edit`)}
        onShare={handleShareReport}
        onDownload={handleDownload}
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6 min-w-0">
          <ReportMeta
            authorName={authorName}
            subjectName={subjectName}
            createdAt={report.createdAt}
            authorIsSubject={authorIsSubject}
          />
          <ReportContent
            sections={report.sections || []}
            onEdit={() => router.push(`/agent/reports/${report.id}/edit`)}
          />
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <ReportAside
            sections={report.sections || []}
            version={report.version}
            createdAt={report.createdAt}
            updatedAt={report.updatedAt}
          />
        </aside>
      </div>
    </div>
  )
}
