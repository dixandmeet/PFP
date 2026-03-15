"use client"

import { User, Target, Calendar } from "lucide-react"

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

  const items = [
    { icon: User, label: "Auteur", value: authorName },
    { icon: Target, label: "Sujet", value: subjectName },
    { icon: Calendar, label: "Créé le", value: formattedDate },
  ]

  return (
    <div className="rounded-xl bg-stadium-50/60 px-5 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:divide-x sm:divide-stadium-200">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2.5 sm:px-4 first:sm:pl-0 last:sm:pr-0"
          >
            <item.icon className="h-4 w-4 text-stadium-400 shrink-0" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-stadium-500 font-medium">{item.label}</span>
              <span className="text-sm text-stadium-800 font-semibold">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
      {authorIsSubject && (
        <p className="mt-2 text-xs text-stadium-400 italic">
          Auteur et sujet identiques
        </p>
      )}
    </div>
  )
}
