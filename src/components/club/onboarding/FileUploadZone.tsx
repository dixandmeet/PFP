"use client"

import { useCallback, useState, useRef } from "react"
import { Upload, File, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploadZoneProps {
  clubId: string
  docType: string
  label: string
  required?: boolean
  existingFile?: {
    id: string
    filename: string
    size: number
    uploadedAt: string
  } | null
  onUploaded: (doc: {
    id: string
    type: string
    filename: string
    size: number
    uploadedAt: string
  }) => void
  onDeleted?: (docId: string) => void
  disabled?: boolean
}

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileUploadZone({
  clubId,
  docType,
  label,
  required = false,
  existingFile,
  onUploaded,
  onDeleted,
  disabled = false,
}: FileUploadZoneProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const [deleting, setDeleting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(
    async (file: File) => {
      setError("")

      // Validation client
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Format non accepté. Utilisez PDF, JPG ou PNG.")
        return
      }
      if (file.size > MAX_SIZE) {
        setError("Le fichier ne doit pas dépasser 10 Mo.")
        return
      }

      setUploading(true)
      setProgress(30)

      try {
        // Upload direct via API (évite CORS avec S3/MinIO)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("docType", docType)

        const uploadRes = await fetch(
          `/api/onboarding/club/${clubId}/kyc/upload`,
          {
            method: "POST",
            body: formData,
          }
        )

        if (!uploadRes.ok) {
          const json = await uploadRes.json().catch(() => ({}))
          throw new Error(json.error || "Erreur lors de l'upload")
        }

        const { document } = await uploadRes.json()
        setProgress(100)

        onUploaded({
          id: document.id,
          type: docType,
          filename: document.filename,
          size: document.size,
          uploadedAt: document.uploadedAt,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inattendue")
      } finally {
        setUploading(false)
        setProgress(0)
      }
    },
    [clubId, docType, onUploaded]
  )

  const handleDelete = async () => {
    if (!existingFile || !onDeleted) return
    setDeleting(true)
    setError("")

    try {
      const res = await fetch(
        `/api/onboarding/club/${clubId}/kyc/${existingFile.id}`,
        { method: "DELETE" }
      )

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || "Erreur lors de la suppression")
      }

      onDeleted(existingFile.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue")
    } finally {
      setDeleting(false)
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (disabled || uploading) return
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [disabled, uploading, handleFile]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    // Reset input
    if (inputRef.current) inputRef.current.value = ""
  }

  // Fichier déjà uploadé
  if (existingFile && !uploading) {
    return (
      <div className="border border-pitch-200 rounded-lg p-4 bg-pitch-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-pitch-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900">{label}</p>
              <p className="text-xs text-gray-500">
                {existingFile.filename} ({formatFileSize(existingFile.size)})
              </p>
            </div>
          </div>
          {onDeleted && !disabled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-2">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {required && <span className="text-xs text-red-500">*</span>}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled && !uploading) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
          dragOver
            ? "border-pitch-400 bg-pitch-50"
            : "border-gray-300 hover:border-pitch-300 hover:bg-gray-50",
          (disabled || uploading) && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || uploading}
        />

        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 text-pitch-500 animate-spin mx-auto" />
            <p className="text-sm text-gray-600">Upload en cours...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-pitch-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm text-gray-600">
                <span className="text-pitch-600 font-medium">
                  Cliquez pour sélectionner
                </span>{" "}
                ou glissez-déposez
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PDF, JPG ou PNG (max 10 Mo)
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
