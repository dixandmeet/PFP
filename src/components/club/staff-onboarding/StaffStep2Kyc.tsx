"use client"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
  FileCheck,
  ShieldCheck,
} from "lucide-react"

interface KycDoc {
  id: string
  type: string
  fileName: string
  fileSize: number | null
  createdAt: string
}

interface StaffStep2Props {
  existingDocs: KycDoc[]
  onComplete: () => void
  onBack: () => void
}

const DOC_TYPES = [
  { key: "IDENTITY_CARD", label: "Carte d'identité", required: false },
  { key: "PASSPORT", label: "Passeport", required: false },
  { key: "DRIVING_LICENSE", label: "Permis de conduire", required: false },
] as const

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
const MAX_SIZE = 10 * 1024 * 1024

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function StaffStep2Kyc({ existingDocs, onComplete, onBack }: StaffStep2Props) {
  const [docs, setDocs] = useState<KycDoc[]>(existingDocs)
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const hasIdentityDoc = docs.some((d) =>
    ["IDENTITY_CARD", "PASSPORT", "DRIVING_LICENSE"].includes(d.type)
  )

  const handleUpload = useCallback(
    async (file: File, docType: string) => {
      setError("")

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Format non accepté. Utilisez PDF, JPG ou PNG.")
        return
      }
      if (file.size > MAX_SIZE) {
        setError("Le fichier ne doit pas dépasser 10 Mo.")
        return
      }

      setUploading(docType)
      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("docType", docType)

        const res = await fetch("/api/club/staff-onboarding/kyc", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || "Erreur lors de l'upload")
        }

        const { document } = await res.json()

        setDocs((prev) => {
          const filtered = prev.filter((d) => d.type !== docType)
          return [
            ...filtered,
            {
              id: document.id,
              type: document.type,
              fileName: document.fileName,
              fileSize: document.fileSize,
              createdAt: document.createdAt,
            },
          ]
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inattendue")
      } finally {
        setUploading(null)
      }
    },
    []
  )

  const handleSubmit = async () => {
    setError("")
    setSubmitting(true)

    try {
      const res = await fetch("/api/club/staff-onboarding/kyc", {
        method: "PUT",
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Erreur lors de la validation")
      }

      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-pitch-100 mb-4">
          <ShieldCheck className="w-7 h-7 text-pitch-600" />
        </div>
        <h2 className="text-xl font-bold text-pitch-900">Vérification d'identité</h2>
        <p className="text-sm text-pitch-600 mt-1">
          Uploadez au moins une pièce d'identité pour finaliser votre inscription.
        </p>
      </div>

      <div className="space-y-4 max-w-lg mx-auto">
        {DOC_TYPES.map((docType) => {
          const existing = docs.find((d) => d.type === docType.key)
          const isUploading = uploading === docType.key

          if (existing && !isUploading) {
            return (
              <div
                key={docType.key}
                className="border border-pitch-200 rounded-lg p-4 bg-pitch-50/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-pitch-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{docType.label}</p>
                      <p className="text-xs text-gray-500">
                        {existing.fileName}
                        {existing.fileSize ? ` (${formatFileSize(existing.fileSize)})` : ""}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDocs((prev) => prev.filter((d) => d.id !== existing.id))
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          }

          return (
            <div key={docType.key} className="space-y-1">
              <p className="text-sm font-medium text-gray-700">{docType.label}</p>
              <div
                onClick={() => !isUploading && inputRefs.current[docType.key]?.click()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
                  "border-gray-300 hover:border-pitch-300 hover:bg-gray-50",
                  isUploading && "opacity-50 cursor-not-allowed"
                )}
              >
                <input
                  ref={(el) => { inputRefs.current[docType.key] = el }}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUpload(file, docType.key)
                    e.target.value = ""
                  }}
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 text-pitch-500 animate-spin" />
                    <span className="text-sm text-gray-600">Upload en cours...</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">
                      <span className="text-pitch-600 font-medium">Cliquez</span> ou glissez-déposez
                    </p>
                    <p className="text-xs text-gray-400">PDF, JPG ou PNG (max 10 Mo)</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {!hasIdentityDoc && (
          <p className="text-xs text-amber-600 text-center">
            Veuillez uploader au moins un document d'identité.
          </p>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-500 justify-center">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!hasIdentityDoc || submitting}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <FileCheck className="w-4 h-4 mr-2" />
            )}
            Terminer l'inscription
          </Button>
        </div>
      </div>
    </div>
  )
}
