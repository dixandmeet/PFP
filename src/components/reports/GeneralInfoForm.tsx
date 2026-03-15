"use client"

import { UseFormRegister, FieldErrors } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText } from "lucide-react"

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
  watchAuthorType: string
  watchStatus: string
  authorTypes: AuthorType[]
  statuses: Status[]
}

const statusDescriptions: Record<string, string> = {
  DRAFT: "Visible uniquement par vous",
  PENDING_APPROVAL: "En attente de validation",
  APPROVED: "Visible par les recruteurs",
  REJECTED: "Non visible publiquement",
}

export function GeneralInfoForm({
  register,
  errors,
  watchAuthorType,
  watchStatus,
  authorTypes,
  statuses,
}: GeneralInfoFormProps) {
  return (
    <div className="bg-white rounded-2xl border border-stadium-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stadium-100">
          <FileText className="h-4.5 w-4.5 text-stadium-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-stadium-900">Informations générales</h2>
          <p className="text-sm text-stadium-500">Informations de base du rapport</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <Label htmlFor="title" className="text-sm text-stadium-600 font-medium">
            Titre du rapport <span className="text-red-400">*</span>
          </Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="Ex: Rapport de performance T1 2026"
            className="mt-1.5 border-stadium-200 focus:border-pitch-400 focus:ring-pitch-400/20 transition-colors duration-150"
          />
          {errors.title && (
            <p className="text-sm text-red-500 mt-1">
              {errors.title.message as string}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label htmlFor="authorType" className="text-sm text-stadium-600 font-medium">
              Type d&apos;auteur <span className="text-red-400">*</span>
            </Label>
            <select
              id="authorType"
              {...register("authorType")}
              value={watchAuthorType}
              className="flex h-11 w-full rounded-xl border border-stadium-200 bg-white px-3 py-2 text-sm text-stadium-900 transition-colors duration-150 focus:border-pitch-400 focus:outline-none focus:ring-2 focus:ring-pitch-400/20 mt-1.5"
            >
              {authorTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.authorType && (
              <p className="text-sm text-red-500 mt-1">
                {errors.authorType.message as string}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="status" className="text-sm text-stadium-600 font-medium">
              Statut <span className="text-red-400">*</span>
            </Label>
            <select
              id="status"
              {...register("status")}
              value={watchStatus}
              className="flex h-11 w-full rounded-xl border border-stadium-200 bg-white px-3 py-2 text-sm text-stadium-900 transition-colors duration-150 focus:border-pitch-400 focus:outline-none focus:ring-2 focus:ring-pitch-400/20 mt-1.5"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            {watchStatus && statusDescriptions[watchStatus] && (
              <p className="text-xs text-stadium-400 mt-1.5">
                {statusDescriptions[watchStatus]}
              </p>
            )}
            {errors.status && (
              <p className="text-sm text-red-500 mt-1">
                {errors.status.message as string}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
