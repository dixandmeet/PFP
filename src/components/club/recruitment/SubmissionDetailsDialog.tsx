"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ApplicationPipeline } from "@/components/club/ApplicationPipeline"
import {
  STATUS_CONFIG,
  type ApiSubmission,
  getInitials,
  formatPosition,
} from "@/lib/club/recruitment"
import { cn } from "@/lib/utils"
import { Target, FileText, Plus } from "lucide-react"
import { CLUB_REPORTS_BASE } from "@/lib/reports/club-report-display"

function InfoBlock({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-stadium-500 mb-2">
        {title}
      </h3>
      <div className="rounded-xl border border-stadium-100 bg-stadium-50/50 p-3">
        {children}
      </div>
    </div>
  )
}

interface SubmissionDetailsDialogProps {
  submission: ApiSubmission | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusUpdate: (submissionId: string, newStatus: string) => Promise<void>
  updatingStatus: boolean
}

export function SubmissionDetailsDialog({
  submission,
  open,
  onOpenChange,
  onStatusUpdate,
  updatingStatus,
}: SubmissionDetailsDialogProps) {
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null)

  if (!submission) return null

  const { playerData, agentProfile } = submission

  const handleStatusChange = async (newStatus: string) => {
    setLoadingStatus(newStatus)
    try {
      await onStatusUpdate(submission.id, newStatus)
    } finally {
      setLoadingStatus(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 border-2 border-pitch-100">
              <AvatarFallback className="bg-pitch-50 text-pitch-700 font-semibold">
                {getInitials(playerData.firstName, playerData.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xl text-stadium-900">
                {playerData.firstName} {playerData.lastName}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {formatPosition(playerData.primaryPosition)} • {playerData.nationality}
              </DialogDescription>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-violet-200 text-violet-700">
                  Agent
                </Badge>
                <Badge
                  className={cn("border", STATUS_CONFIG[submission.status]?.color)}
                >
                  {STATUS_CONFIG[submission.status]?.label}
                </Badge>
                <span className="text-xs text-stadium-500">
                  Proposé le{" "}
                  {new Date(submission.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <InfoBlock title="Profil joueur">
              {playerData.currentClub && (
                <p className="text-sm text-stadium-700">
                  <span className="text-stadium-500">Club actuel : </span>
                  {playerData.currentClub}
                </p>
              )}
              {submission.listing && (
                <p className="flex items-center gap-2 text-sm text-stadium-700 mt-2">
                  <Target className="h-4 w-4 shrink-0 text-pitch-600" />
                  {submission.listing.title}
                </p>
              )}
            </InfoBlock>

            {playerData.careerEntries && playerData.careerEntries.length > 0 && (
              <InfoBlock title="Parcours récent">
                <div className="space-y-2">
                  {playerData.careerEntries.slice(0, 3).map((entry, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-stadium-50 px-3 py-2 text-sm"
                    >
                      <p className="font-medium text-stadium-800">{entry.clubName}</p>
                      <p className="text-stadium-500 text-xs mt-0.5">
                        {entry.season}
                        {entry.appearances != null && ` • ${entry.appearances} matchs`}
                        {entry.goals != null && ` • ${entry.goals} buts`}
                        {entry.assists != null && ` • ${entry.assists} passes D.`}
                      </p>
                    </div>
                  ))}
                </div>
              </InfoBlock>
            )}

            {submission.message && (
              <InfoBlock title="Message de l'agent">
                <p className="text-sm text-stadium-700 whitespace-pre-wrap leading-relaxed">
                  {submission.message}
                </p>
              </InfoBlock>
            )}

            <InfoBlock title="Rapports">
              {submission.reports && submission.reports.length > 0 ? (
                <div className="space-y-2">
                  {submission.reports.map((report) => (
                    <Link
                      key={report.id}
                      href={`${CLUB_REPORTS_BASE}/${report.id}`}
                      className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-pitch-700 ring-1 ring-pitch-100 hover:bg-pitch-50"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="truncate">{report.title}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stadium-500">Aucun rapport joint par l&apos;agent</p>
              )}
              <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                <Link
                  href={`${CLUB_REPORTS_BASE}/new?kind=player&submissionId=${submission.id}&firstName=${encodeURIComponent(playerData.firstName)}&lastName=${encodeURIComponent(playerData.lastName)}&position=${encodeURIComponent(playerData.primaryPosition)}&nationality=${encodeURIComponent(playerData.nationality)}&playerId=${encodeURIComponent(playerData.id)}`}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un rapport scout
                </Link>
              </Button>
            </InfoBlock>
          </div>

          <div className="space-y-4">
            <InfoBlock title="Agent">
              <p className="text-sm font-medium text-stadium-800">
                {agentProfile.firstName} {agentProfile.lastName}
              </p>
              {agentProfile.agencyName && (
                <p className="text-sm text-stadium-500 mt-0.5">
                  {agentProfile.agencyName}
                </p>
              )}
              {agentProfile.licenseNumber && (
                <p className="text-xs text-stadium-400 mt-1">
                  Licence {agentProfile.licenseNumber}
                </p>
              )}
            </InfoBlock>

            <ApplicationPipeline
              currentStatus={submission.status}
              onStatusChange={handleStatusChange}
              loading={updatingStatus}
              loadingStatus={loadingStatus}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
