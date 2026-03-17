"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { History, Layers, CheckCircle2 } from "lucide-react"

interface ReportSection {
  id: string
  title: string
  content: string
  order: number
}

interface ReportAsideProps {
  sections: ReportSection[]
  version: number
  createdAt: string
  updatedAt: string
}

export function ReportAside({
  sections,
  version,
  createdAt,
  updatedAt,
}: ReportAsideProps) {
  const filledSections = sections.filter((s) => s.content && s.content.trim().length > 0)
  const completeness =
    sections.length === 0
      ? 0
      : Math.min(100, Math.round((filledSections.length / sections.length) * 100))

  return (
    <div className="space-y-4 lg:space-y-5">
      <CompletenessCard completeness={completeness} total={sections.length} filled={filledSections.length} />
      <HistoryCard createdAt={createdAt} updatedAt={updatedAt} />
      <VersionsCard version={version} />
    </div>
  )
}

function CompletenessCard({
  completeness,
  total,
  filled,
}: {
  completeness: number
  total: number
  filled: number
}) {
  return (
    <div className="rounded-2xl border border-stadium-100 bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <CheckCircle2 className="h-4 w-4 text-stadium-500" aria-hidden />
        <h3 className="text-sm font-semibold text-stadium-800">Complétude</h3>
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold text-stadium-900">{completeness}%</span>
          <span className="text-xs text-stadium-400">
            {filled}/{total} sections
          </span>
        </div>
        <Progress value={completeness} className="h-1.5" />
        {completeness === 0 && (
          <p className="text-xs text-stadium-400 mt-1">
            Ajoutez des sections pour commencer
          </p>
        )}
        {completeness === 100 && (
          <p className="text-xs text-pitch-600 font-medium mt-1">
            Rapport complet
          </p>
        )}
      </div>
    </div>
  )
}

function HistoryCard({ createdAt, updatedAt }: { createdAt: string; updatedAt: string }) {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const events = [
    { label: "Dernière modification", date: formatDate(updatedAt) },
    { label: "Création", date: formatDate(createdAt) },
  ]

  return (
    <div className="rounded-2xl border border-stadium-100 bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <History className="h-4 w-4 text-stadium-500" aria-hidden />
        <h3 className="text-sm font-semibold text-stadium-800">Historique</h3>
      </div>
      <div className="relative space-y-4">
        <div className="absolute left-[5px] top-2 bottom-2 w-px bg-stadium-100" />
        {events.map((event) => (
          <div key={event.label} className="flex items-start gap-3 relative">
            <div className="h-[10px] w-[10px] rounded-full bg-stadium-200 border-2 border-white shrink-0 mt-1 z-10" />
            <div>
              <p className="text-xs font-medium text-stadium-600">{event.label}</p>
              <p className="text-xs text-stadium-400">{event.date}</p>
            </div>
          </div>
        ))}
      </div>
      {/* TODO: Afficher l'historique complet quand les données seront disponibles */}
    </div>
  )
}

function VersionsCard({ version }: { version: number }) {
  return (
    <div className="rounded-2xl border border-stadium-100 bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Layers className="h-4 w-4 text-stadium-500" aria-hidden />
        <h3 className="text-sm font-semibold text-stadium-800">Versions</h3>
      </div>
      <div className="space-y-2">
        {Array.from({ length: version }, (_, i) => version - i).map((v) => (
          <div
            key={v}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
          >
            <span className={`font-medium ${v === version ? "text-stadium-800" : "text-stadium-500"}`}>
              Version {v}
            </span>
            {v === version && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-pitch-600 border-pitch-200">
                Actuelle
              </Badge>
            )}
          </div>
        ))}
      </div>
      {/* TODO: Ajouter actions (voir, restaurer) quand l'API sera disponible */}
    </div>
  )
}
