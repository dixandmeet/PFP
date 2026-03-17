"use client"

import { UseFormRegister, FieldErrors, Control, Controller } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  User,
  Shield,
  Search,
  Dumbbell,
} from "lucide-react"

interface AuthorType {
  value: string
  label: string
}

interface Status {
  value: string
  label: string
}

interface GeneralInfoFormProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  control: Control<any>
  watchAuthorType: string
  watchStatus: string
  authorTypes: AuthorType[]
  statuses: Status[]
}

const statusMeta: Record<
  string,
  { description: string; icon: React.ElementType; color: string; bg: string }
> = {
  DRAFT: {
    description: "Visible uniquement par vous",
    icon: Clock,
    color: "text-slate-500",
    bg: "bg-slate-50 border-slate-200",
  },
  PENDING_APPROVAL: {
    description: "En attente de validation par un agent",
    icon: AlertCircle,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
  },
  APPROVED: {
    description: "Visible par les recruteurs et agents",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
  },
  REJECTED: {
    description: "Non visible publiquement",
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-50 border-red-200",
  },
}

const authorMeta: Record<string, { icon: React.ElementType }> = {
  PLAYER: { icon: User },
  AGENT: { icon: Shield },
  SCOUT: { icon: Search },
  COACH: { icon: Dumbbell },
}

export function GeneralInfoForm({
  register,
  errors,
  control,
  watchAuthorType,
  watchStatus,
  authorTypes,
  statuses,
}: GeneralInfoFormProps) {
  const currentStatus = statusMeta[watchStatus]

  return (
    <div className="bg-white rounded-2xl border border-stadium-100 shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-stadium-100 bg-stadium-50/40">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-stadium-200 shadow-sm">
          <FileText className="h-4 w-4 text-stadium-600" aria-hidden />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-stadium-900">Informations générales</h2>
          <p className="text-xs text-stadium-500">Titre, auteur et statut du rapport</p>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-sm text-stadium-700 font-medium">
            Titre du rapport <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="Ex: Maxime Chanot, Rapport T1 2026"
            className="rounded-xl border-stadium-200 focus:border-pitch-400 focus:ring-2 focus:ring-pitch-400/20 transition-colors"
          />
          {errors.title && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              {errors.title.message as string}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Author type */}
          <div className="space-y-1.5">
            <Label className="text-sm text-stadium-700 font-medium">
              Type d&apos;auteur <span className="text-red-400">*</span>
            </Label>
            <Controller
              name="authorType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="rounded-xl border-stadium-200 h-11">
                    <SelectValue placeholder="Sélectionner…" />
                  </SelectTrigger>
                  <SelectContent>
                    {authorTypes.map((type) => {
                      const meta = authorMeta[type.value]
                      const Icon = meta?.icon
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            {Icon && <Icon className="h-3.5 w-3.5 text-stadium-400 shrink-0" />}
                            {type.label}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.authorType && (
              <p className="text-xs text-red-500 mt-1">{errors.authorType.message as string}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label className="text-sm text-stadium-700 font-medium">
              Statut <span className="text-red-400">*</span>
            </Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="rounded-xl border-stadium-200 h-11">
                    <SelectValue placeholder="Sélectionner…" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => {
                      const meta = statusMeta[status.value]
                      const Icon = meta?.icon
                      return (
                        <SelectItem key={status.value} value={status.value}>
                          <span className="flex items-center gap-2">
                            {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${meta?.color}`} />}
                            {status.label}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && (
              <p className="text-xs text-red-500 mt-1">{errors.status.message as string}</p>
            )}
          </div>
        </div>

        {/* Status description */}
        {currentStatus && (
          <div
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${currentStatus.bg} ${currentStatus.color}`}
          >
            {(() => {
              const Icon = currentStatus.icon
              return <Icon className="h-3.5 w-3.5 shrink-0" />
            })()}
            {currentStatus.description}
          </div>
        )}
      </div>
    </div>
  )
}
