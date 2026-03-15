"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Building2,
  FileText,
  Send,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import type { OnboardingSessionEntry } from "./types"

const ONBOARDING_STEPS = [
  { key: "CREATOR", label: "Identite", icon: Mail },
  { key: "CLUB_INFO", label: "Club", icon: Building2 },
  { key: "KYC", label: "Documents", icon: FileText },
  { key: "SUBMIT", label: "Soumission", icon: Send },
  { key: "DONE", label: "Termine", icon: CheckCircle2 },
]

function getStepIndex(step: string): number {
  return ONBOARDING_STEPS.findIndex((s) => s.key === step)
}

function getClubStatusBadge(status: string) {
  switch (status) {
    case "DRAFT":
      return <Badge variant="secondary">Brouillon</Badge>
    case "PENDING_REVIEW":
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">En attente de validation</Badge>
    case "ACTIVE":
      return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Valide</Badge>
    case "REJECTED":
      return <Badge variant="destructive">Rejete</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

interface UserOnboardingSectionProps {
  session: OnboardingSessionEntry
  clubStatus?: string
  clubRejectReason?: string | null
  onAction: (action: string, data?: any) => Promise<void>
}

export function UserOnboardingSection({
  session,
  clubStatus,
  clubRejectReason,
  onAction,
}: UserOnboardingSectionProps) {
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  const currentStepIndex = getStepIndex(session.currentStep)
  const status = clubStatus || session.club?.status || "DRAFT"
  const isPendingReview = status === "PENDING_REVIEW"

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      await onAction("approveOnboarding")
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) return
    setIsRejecting(true)
    try {
      await onAction("rejectOnboarding", { reason: rejectReason.trim() })
      setRejectOpen(false)
      setRejectReason("")
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700">Onboarding Club</h3>
        </div>
        {getClubStatusBadge(status)}
      </div>
      <div className="p-6 space-y-6">
        {/* Stepper */}
        <div className="flex items-center gap-1">
          {ONBOARDING_STEPS.map((step, i) => {
            const isCompleted = i < currentStepIndex || session.currentStep === "DONE"
            const isCurrent = i === currentStepIndex && session.currentStep !== "DONE"
            const Icon = step.icon

            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      flex items-center justify-center h-8 w-8 rounded-full border-2 transition-colors
                      ${isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : ""}
                      ${isCurrent ? "bg-blue-500 border-blue-500 text-white" : ""}
                      ${!isCompleted && !isCurrent ? "bg-white border-slate-200 text-slate-400" : ""}
                    `}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className={`text-xs mt-1.5 ${isCurrent ? "font-semibold text-blue-600" : isCompleted ? "text-emerald-600" : "text-slate-400"}`}>
                    {step.label}
                  </span>
                </div>
                {i < ONBOARDING_STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 mt-[-16px] ${i < currentStepIndex || session.currentStep === "DONE" ? "bg-emerald-400" : "bg-slate-200"}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {session.creatorOtpVerifiedAt && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">OTP verifie le</p>
              <p className="text-slate-900">
                {format(new Date(session.creatorOtpVerifiedAt), "dd MMM yyyy HH:mm", { locale: fr })}
              </p>
            </div>
          )}
          {session.verifiedCreatorEmail && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Email createur verifie</p>
              <p className="text-slate-900">{session.verifiedCreatorEmail}</p>
            </div>
          )}
          {session.club && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Club</p>
              <p className="text-slate-900">{session.club.clubName}</p>
            </div>
          )}
        </div>

        {/* Reject reason */}
        {status === "REJECTED" && (clubRejectReason || session.club?.rejectReason) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs font-medium text-red-700 mb-1">Motif du rejet</p>
            <p className="text-sm text-red-600">{clubRejectReason || session.club?.rejectReason}</p>
          </div>
        )}

        {/* Admin actions */}
        {isPendingReview && (
          <div className="flex items-center gap-3 pt-2 border-t">
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isApproving ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
              )}
              Valider le club
            </Button>

            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isApproving || isRejecting}
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Rejeter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rejeter l'onboarding</DialogTitle>
                  <DialogDescription>
                    Indiquez le motif du rejet. L'utilisateur sera notifie par email.
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Motif du rejet..."
                  rows={4}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRejectOpen(false)}>
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={!rejectReason.trim() || isRejecting}
                  >
                    {isRejecting ? (
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    ) : null}
                    Confirmer le rejet
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </Card>
  )
}
