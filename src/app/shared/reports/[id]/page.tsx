"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, ClipboardList, Eye } from "lucide-react"
import { ReportMeta } from "@/components/reports/ReportMeta"
import { ReportContent } from "@/components/reports/ReportContent"
import { ReportAside } from "@/components/reports/ReportAside"
import { Badge } from "@/components/ui/badge"

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

const statusConfig: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: "Brouillon",
    className: "bg-stadium-100 text-stadium-600 border-stadium-200",
  },
  PENDING_APPROVAL: {
    label: "En attente",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  APPROVED: {
    label: "Approuve",
    className: "bg-pitch-50 text-pitch-700 border-pitch-200",
  },
  REJECTED: {
    label: "Refuse",
    className: "bg-red-50 text-red-700 border-red-200",
  },
}

const authorTypes: Record<string, string> = {
  PLAYER: "Joueur",
  AGENT: "Agent",
  SCOUT: "Recruteur",
  COACH: "Entraineur",
}

export default function SharedReportPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReport() {
      try {
        const response = await fetch(`/api/reports/shared/${params.id}`)
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("Vous n'avez pas acces a ce rapport")
          }
          if (response.status === 404) {
            throw new Error("Rapport non trouve")
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
      } finally {
        setLoading(false)
      }
    }

    loadReport()
  }, [params.id, toast])

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
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <ClipboardList className="h-12 w-12 text-stadium-300 mx-auto mb-3" />
          <p className="text-lg font-semibold text-stadium-700">Rapport inaccessible</p>
          <p className="text-sm text-stadium-500 mt-1">
            Ce rapport n&apos;existe pas ou vous n&apos;y avez pas acces.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-sm text-pitch-600 hover:text-pitch-700 font-medium"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  const authorName = `${report.author.firstName} ${report.author.lastName}`
  const subjectName = `${report.subject.firstName} ${report.subject.lastName}`
  const authorIsSubject = report.author.id === report.subject.id
  const statusInfo = statusConfig[report.status] || statusConfig.DRAFT

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header simplifie (lecture seule) */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-stadium-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-stadium-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-stadium-900">{report.title}</h1>
              <Badge variant="outline" className={statusInfo.className}>
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-sm text-stadium-500 mt-1">
              {subjectName} &middot; {authorTypes[report.authorType] || report.authorType} &middot; v{report.version}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-stadium-50 text-stadium-600 border-stadium-200">
            <Eye className="mr-1 h-3 w-3" />
            Lecture seule
          </Badge>
        </div>
      </div>

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
            onEdit={() => {}}
            readOnly
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
