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
    <header className="space-y-5">
      {/* Barre retour — zone de tap large */}
      <nav className="-mx-1 -my-1 px-1 py-1 rounded-lg hover:bg-stadium-50 transition-colors w-fit">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-stadium-600 hover:text-stadium-900 hover:bg-transparent font-medium"
          aria-label="Retour aux rapports"
          suppressHydrationWarning
        >
          <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
          Retour aux rapports
        </Button>
      </nav>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={`${statusInfo.className} border text-xs font-medium shrink-0`}
            >
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusInfo.label}
            </Badge>
            <Badge variant="outline" className="text-xs font-medium text-stadium-500 border-stadium-200 shrink-0">
              Version {version}
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-stadium-900 tracking-tight leading-tight capitalize">
            {title}
          </h1>

          <p className="text-sm text-stadium-500">
            {authorTypes[authorType] || authorType}
            <span className="mx-2 text-stadium-300">·</span>
            Modifié le {formattedDate}
          </p>
        </div>

        {/* Actions : empilées sur mobile, en ligne sur desktop */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:gap-2 shrink-0 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Button
              onClick={onEdit}
              size="sm"
              className="flex-1 sm:flex-initial bg-pitch-600 hover:bg-pitch-700 text-white shadow-sm"
              aria-label="Modifier le rapport"
              suppressHydrationWarning
            >
              <Edit className="mr-1.5 h-3.5 w-3.5 shrink-0" />
              Modifier
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              className="flex-1 sm:flex-initial border-stadium-200"
              aria-label="Partager le rapport"
              suppressHydrationWarning
            >
              <Share2 className="mr-1.5 h-3.5 w-3.5 shrink-0" />
              Partager
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0 border-stadium-200"
                  aria-label="Plus d'actions"
                  suppressHydrationWarning
                >
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
    </header>
  )
}
