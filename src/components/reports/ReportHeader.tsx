"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowLeft,
  Edit,
  Share2,
  Download,
  MoreVertical,
  XCircle,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  DRAFT: {
    label: "Brouillon",
    className: "bg-stadium-100 text-stadium-600 border-stadium-200",
    icon: Clock,
  },
  PENDING_APPROVAL: {
    label: "En attente",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: AlertCircle,
  },
  APPROVED: {
    label: "Approuvé",
    className: "bg-pitch-50 text-pitch-700 border-pitch-200",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Refusé",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
}

const authorTypes: Record<string, string> = {
  PLAYER: "Joueur",
  AGENT: "Agent",
  SCOUT: "Recruteur",
  COACH: "Entraîneur",
}

interface ReportHeaderProps {
  title: string
  subjectName: string
  authorType: string
  status: string
  version: number
  updatedAt: string
  onBack: () => void
  onEdit: () => void
  onShare: () => void
  onDownload: () => void
  onDelete?: () => void
}

export function ReportHeader({
  title,
  subjectName,
  authorType,
  status,
  version,
  updatedAt,
  onBack,
  onEdit,
  onShare,
  onDownload,
  onDelete,
}: ReportHeaderProps) {
  const statusInfo = statusConfig[status] || statusConfig.DRAFT
  const StatusIcon = statusInfo.icon

  const formattedDate = new Date(updatedAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="text-stadium-500 hover:text-stadium-700 -ml-2"
        aria-label="Retour aux rapports"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Retour aux rapports
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={`${statusInfo.className} border text-xs font-medium`}
            >
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusInfo.label}
            </Badge>
            <Badge variant="outline" className="text-xs font-medium text-stadium-500 border-stadium-200">
              Version {version}
            </Badge>
          </div>

          <h1 className="text-2xl font-semibold text-stadium-900 tracking-tight">
            {title}
          </h1>

          <p className="text-sm text-stadium-500">
            {authorTypes[authorType] || authorType}
            <span className="mx-2 text-stadium-300">·</span>
            Modifié le {formattedDate}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={onEdit}
            size="sm"
            className="shadow-sm"
            aria-label="Modifier le rapport"
          >
            <Edit className="mr-1.5 h-3.5 w-3.5" />
            Modifier
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            aria-label="Partager le rapport"
          >
            <Share2 className="mr-1.5 h-3.5 w-3.5" />
            Partager
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Plus d'actions">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDownload}>
                <Download className="mr-2 h-4 w-4" />
                Télécharger PDF
              </DropdownMenuItem>
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-700"
                    onClick={onDelete}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
