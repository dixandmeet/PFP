"use client"

import { User, Target, Calendar, FileEdit } from "lucide-react"

interface ReportMetaProps {
  authorName: string
  subjectName: string
  createdAt: string
  authorIsSubject?: boolean
}

export function ReportMeta({
  authorName,
  subjectName,
  createdAt,
  authorIsSubject,
}: ReportMetaProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  if (authorIsSubject) {
    return (
      <div className="rounded-2xl border border-stadium-100 bg-stadium-50/50 px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2.5">
            <FileEdit className="h-4 w-4 text-stadium-500 shrink-0" aria-hidden />
            <span className="text-sm text-stadium-700">
              <span className="font-medium">Auto-évaluation</span>
              <span className="text-stadium-500 font-normal"> par {authorName}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-stadium-500">
            <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="text-sm">Créé le {formattedDate}</span>
          </div>
        </div>
      </div>
    )
  }

  const items = [
    { icon: User, label: "Auteur", value: authorName },
    { icon: Target, label: "Sujet", value: subjectName },
    { icon: Calendar, label: "Créé le", value: formattedDate },
  ]

  return (
    <div className="rounded-2xl border border-stadium-100 bg-stadium-50/50 px-4 py-3.5 sm:px-5 sm:py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0 sm:divide-x sm:divide-stadium-200">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2.5 sm:px-4 first:sm:pl-0 last:sm:pr-0"
          >
            <item.icon className="h-4 w-4 text-stadium-500 shrink-0" aria-hidden />
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-stadium-500 font-medium">{item.label}</span>
              <span className="text-sm text-stadium-800 font-semibold">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
