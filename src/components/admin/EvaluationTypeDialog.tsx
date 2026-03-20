"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Video, ClipboardCheck, ArrowRight } from "lucide-react"

interface EvaluationTypeDialogProps {
  playerName: string
  open: boolean
  onClose: () => void
  onSelectVideo: () => void
  onSelectManual: () => void
  hasVideos?: boolean
}

export function EvaluationTypeDialog({
  playerName,
  open,
  onClose,
  onSelectVideo,
  onSelectManual,
  hasVideos = true,
}: EvaluationTypeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Évaluer {playerName}</DialogTitle>
          <DialogDescription>
            Choisissez le type d&apos;évaluation à effectuer
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          {/* Évaluation vidéo */}
          <button
            onClick={onSelectVideo}
            disabled={!hasVideos}
            className="group relative flex items-start gap-4 rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-pitch-300 hover:bg-pitch-50/50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:shadow-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pitch-100 text-pitch-700 group-disabled:bg-slate-100 group-disabled:text-slate-400">
              <Video className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">Évaluation vidéo</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 group-disabled:hidden transition-opacity" />
              </div>
              <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                Évaluer les compétences du joueur à partir de ses vidéos uploadées (PAC, FIN, TEC, VIS, PHY, DEF, GK)
              </p>
              {!hasVideos && (
                <p className="mt-1 text-xs text-amber-600">Aucune vidéo éligible pour ce joueur</p>
              )}
            </div>
          </button>

          {/* Évaluation manuelle */}
          <button
            onClick={onSelectManual}
            className="group relative flex items-start gap-4 rounded-xl border border-slate-200 p-4 text-left transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">Évaluation manuelle</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                Évaluation globale sur 16 critères (technique, intelligence, physique, mental) — score pondéré 0-100
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
