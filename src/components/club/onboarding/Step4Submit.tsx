"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Send,
  AlertCircle,
  Building2,
  FileText,
  ShieldCheck,
  Clock,
} from "lucide-react"
import { KYC_DOC_LABELS } from "@/lib/validators/club-onboarding-schemas"

interface ClubData {
  id: string
  clubName: string
  country: string
  city: string | null
  clubType: string | null
  legalForm: string | null
  officialEmail: string | null
  officialPhone: string | null
}

interface KycDoc {
  id: string
  type: string
  filename: string
}

interface Step4Props {
  club: ClubData
  docs: KycDoc[]
  creatorEmail: string
  onSubmit: () => void
  onBack: () => void
}

export function Step4Submit({
  club,
  docs,
  creatorEmail,
  onSubmit,
  onBack,
}: Step4Props) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    setError("")

    try {
      const res = await fetch(`/api/onboarding/club/${club.id}/submit`, {
        method: "POST",
      })

      const json = await res.json()

      if (!res.ok) {
        if (json.missingItems) {
          setError(
            `Dossier incomplet :\n${json.missingItems.join("\n")}`
          )
        } else {
          setError(json.error || "Erreur lors de la soumission")
        }
        return
      }

      setSubmitted(true)
      onSubmit()
    } catch {
      setError("Erreur de connexion au serveur")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12 space-y-6">
        <div className="w-16 h-16 rounded-full bg-pitch-100 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 text-pitch-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Demande soumise !
          </h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Votre demande d&apos;enregistrement pour <strong>{club.clubName}</strong> est
            en cours de vérification. Vous recevrez un email dès que notre
            équipe aura examiné votre dossier (24-48h).
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Récapitulatif et soumission
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Vérifiez les informations avant de soumettre votre demande.
        </p>
      </div>

      {/* Récapitulatif */}
      <div className="space-y-4">
        {/* Créateur vérifié */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-pitch-600" />
            <h3 className="font-medium text-gray-900">Créateur vérifié</h3>
          </div>
          <p className="text-sm text-gray-600 ml-7">{creatorEmail}</p>
        </div>

        {/* Infos club */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-5 h-5 text-pitch-600" />
            <h3 className="font-medium text-gray-900">Informations du club</h3>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 ml-7 text-sm">
            <dt className="text-gray-500">Nom</dt>
            <dd className="text-gray-900">{club.clubName}</dd>
            <dt className="text-gray-500">Pays / Ville</dt>
            <dd className="text-gray-900">
              {club.country} {club.city ? `- ${club.city}` : ""}
            </dd>
            <dt className="text-gray-500">Type</dt>
            <dd className="text-gray-900">{club.clubType || "-"}</dd>
            <dt className="text-gray-500">Forme juridique</dt>
            <dd className="text-gray-900">{club.legalForm || "-"}</dd>
            <dt className="text-gray-500">Email officiel</dt>
            <dd className="text-gray-900">{club.officialEmail || "-"}</dd>
            <dt className="text-gray-500">Téléphone</dt>
            <dd className="text-gray-900">{club.officialPhone || "-"}</dd>
          </dl>
        </div>

        {/* Documents */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-pitch-600" />
            <h3 className="font-medium text-gray-900">
              Documents ({docs.length})
            </h3>
          </div>
          <ul className="space-y-2 ml-7">
            {docs.map((doc) => (
              <li key={doc.id} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-pitch-500" />
                <span className="text-gray-600">
                  {KYC_DOC_LABELS[doc.type] || doc.type}
                </span>
                <span className="text-gray-400">— {doc.filename}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* Info */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          En soumettant, votre dossier sera examiné par notre équipe. Vous
          recevrez un email de confirmation, puis un email de validation ou de
          refus sous 24 à 48 heures.
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Soumettre pour vérification
        </Button>
      </div>
    </div>
  )
}
