"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Eye,
  Share2,
  MoreVertical,
  Copy,
  Download,
  Edit,
  Trash2,
} from "lucide-react"

interface Report {
  id: string
  title: string
  version: number
  status: string
  authorType: string
  shareSlug?: string | null
  createdAt: string
  updatedAt: string
  author: {
    firstName: string
    lastName: string
  }
  subject: {
    firstName: string
    lastName: string
  }
}

interface ReportCardProps {
  report: Report
  onView: (id: string) => void
  onShare: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

const statusStyles: Record<string, { label: string; classes: string }> = {
  DRAFT: { label: "Brouillon", classes: "bg-stadium-100 text-stadium-700" },
  PENDING_APPROVAL: { label: "En attente", classes: "bg-amber-500/10 text-amber-700" },
  APPROVED: { label: "Approuvé", classes: "bg-green-600/10 text-green-700" },
  REJECTED: { label: "Refusé", classes: "bg-red-500/10 text-red-700" },
}

const authorTypeLabels: Record<string, string> = {
  PLAYER: "Joueur",
  AGENT: "Agent",
  SCOUT: "Recruteur",
  COACH: "Entraîneur",
}

export function ReportCard({ report, onView, onShare, onEdit, onDelete }: ReportCardProps) {
  const status = statusStyles[report.status] ?? statusStyles.DRAFT
  const roleLabel = authorTypeLabels[report.authorType] ?? report.authorType

  return (
    <div
      className="group bg-white ring-1 ring-stadium-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-[1px] transition-all duration-200 cursor-pointer"
      onClick={() => onView(report.id)}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-stadium-900 line-clamp-2 leading-snug">
            {report.title}
          </h3>
          <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.classes}`}>
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-stadium-500">
          <span className="font-medium">v{report.version}</span>
          <span>·</span>
          <span>{roleLabel}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-stadium-100 flex items-center justify-center text-stadium-600 text-[10px] font-bold shrink-0">
            {report.author.firstName[0]}{report.author.lastName[0]}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-stadium-700 truncate">
              {report.author.firstName} {report.author.lastName}
            </p>
            <p className="text-[11px] text-stadium-400">
              {new Date(report.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-2 border-t border-stadium-100" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs font-semibold border-stadium-200 hover:bg-stadium-50 rounded-xl"
            onClick={() => onView(report.id)}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            Voir
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-stadium-400 hover:text-stadium-600 hover:bg-stadium-50 rounded-xl"
            onClick={() => onShare(report.id)}
          >
            <Share2 className="h-3.5 w-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-stadium-400 hover:text-stadium-600 hover:bg-stadium-50 rounded-xl"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onView(report.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare(report.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Copier le lien
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Télécharger
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(report.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-700"
                onClick={() => onDelete(report.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
