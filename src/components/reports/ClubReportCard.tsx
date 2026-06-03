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
  Eye,
  Share2,
  MoreVertical,
  Edit,
  Trash2,
  User,
  Trophy,
  Inbox,
} from "lucide-react"
import {
  type ClubReportListItem,
  getReportSubjectLabel,
  getReportAuthorLabel,
} from "@/lib/reports/club-report-display"
import { cn } from "@/lib/utils"

const statusStyles: Record<string, { label: string; classes: string }> = {
  DRAFT: { label: "Brouillon", classes: "bg-stadium-100 text-stadium-700" },
  PENDING_APPROVAL: { label: "En attente", classes: "bg-amber-500/10 text-amber-700" },
  APPROVED: { label: "Approuvé", classes: "bg-green-600/10 text-green-700" },
  REJECTED: { label: "Refusé", classes: "bg-red-500/10 text-red-700" },
}

interface ClubReportCardProps {
  report: ClubReportListItem
  readOnly?: boolean
  onView: (id: string) => void
  onShare?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function ClubReportCard({
  report,
  readOnly = false,
  onView,
  onShare,
  onEdit,
  onDelete,
}: ClubReportCardProps) {
  const status = statusStyles[report.status] ?? statusStyles.DRAFT
  const subjectLabel = getReportSubjectLabel(report)
  const authorLabel = getReportAuthorLabel(report)
  const isMatch = report.reportKind === "MATCH"
  const isReceived = !!report.receivedViaSubmissionId || readOnly

  return (
    <div
      className="group cursor-pointer rounded-2xl bg-white shadow-sm ring-1 ring-stadium-200 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md"
      onClick={() => onView(report.id)}
    >
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-stadium-900">
            {report.title}
          </h3>
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
              status.classes
            )}
          >
            {status.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-stadium-500">
          <Badge variant="outline" className="border-stadium-200 text-[10px]">
            {isMatch ? (
              <span className="flex items-center gap-1">
                <Trophy className="h-3 w-3" /> Match
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" /> Joueur
              </span>
            )}
          </Badge>
          {isReceived && (
            <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700 text-[10px]">
              <Inbox className="mr-1 h-3 w-3" />
              Agent
            </Badge>
          )}
        </div>

        <p className="text-xs text-stadium-600">{subjectLabel}</p>

        <div className="flex items-center justify-between border-t border-stadium-100 pt-3">
          <span className="text-xs text-stadium-500">{authorLabel}</span>
          <span className="text-[11px] text-stadium-400">
            {new Date(report.createdAt).toLocaleDateString("fr-FR")}
          </span>
        </div>

        <div
          className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onView(report.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {onShare && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onShare(report.id)}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
          {!readOnly && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(report.id)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                )}
                {onEdit && onDelete && <DropdownMenuSeparator />}
                {onDelete && (
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDelete(report.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  )
}
