"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileUploadZone } from "./FileUploadZone"
import {
  REQUIRED_KYC_DOCS,
  KYC_DOC_LABELS,
} from "@/lib/validators/club-onboarding-schemas"
import { ArrowLeft, ArrowRight, FileCheck } from "lucide-react"

type KycDoc = {
  id: string
  type: string
  filename: string
  size: number
  uploadedAt: string
}

interface Step3Props {
  clubId: string
  existingDocs: KycDoc[]
  onComplete: () => void
  onBack: () => void
}

const ALL_DOC_TYPES = [
  "PROOF_LEGAL",
  "REPRESENTATIVE_ID",
  "POWER_PROOF",
  "BANK_RIB",
] as const

export function Step3KycDocuments({
  clubId,
  existingDocs,
  onComplete,
  onBack,
}: Step3Props) {
  const [docs, setDocs] = useState<KycDoc[]>(existingDocs)

  const handleUploaded = (doc: KycDoc) => {
    setDocs((prev) => {
      // Remplacer si même type existe
      const filtered = prev.filter((d) => d.type !== doc.type)
      return [...filtered, doc]
    })
  }

  const handleDeleted = (docId: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== docId))
  }

  const getDocByType = (type: string) => docs.find((d) => d.type === type) || null

  const requiredDocsUploaded = REQUIRED_KYC_DOCS.every((type) =>
    docs.some((d) => d.type === type)
  )

  const uploadedCount = docs.length
  const totalRequired = REQUIRED_KYC_DOCS.length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Documents justificatifs
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Uploadez les documents requis pour la vérification de votre club.
        </p>
      </div>

      {/* Progression */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <FileCheck className="w-5 h-5 text-pitch-600" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">
              Documents uploadés
            </span>
            <span className="text-sm text-gray-500">
              {uploadedCount}/{totalRequired} requis
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-pitch-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (uploadedCount / totalRequired) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Upload zones */}
      <div className="space-y-4">
        {ALL_DOC_TYPES.map((type) => {
          const isRequired = (REQUIRED_KYC_DOCS as readonly string[]).includes(type)
          const existing = getDocByType(type)

          return (
            <FileUploadZone
              key={type}
              clubId={clubId}
              docType={type}
              label={KYC_DOC_LABELS[type] || type}
              required={isRequired}
              existingFile={
                existing
                  ? {
                      id: existing.id,
                      filename: existing.filename,
                      size: existing.size,
                      uploadedAt: existing.uploadedAt,
                    }
                  : null
              }
              onUploaded={handleUploaded}
              onDeleted={handleDeleted}
            />
          )
        })}
      </div>

      {!requiredDocsUploaded && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">
            Tous les documents requis (*) doivent être uploadés pour continuer.
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Button
          onClick={onComplete}
          disabled={!requiredDocsUploaded}
          className="flex-1"
        >
          <ArrowRight className="w-4 h-4 mr-2" />
          Continuer
        </Button>
      </div>
    </div>
  )
}
