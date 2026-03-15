"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Building2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  ShieldCheck,
  Download,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react"
import { KYC_DOC_LABELS } from "@/lib/validators/club-onboarding-schemas"

interface ClubDetail {
  id: string
  clubName: string
  country: string
  city: string | null
  clubType: string | null
  foundedYear: number | null
  legalForm: string | null
  registrationNumber: string | null
  federation: string | null
  federationNumber: string | null
  officialEmail: string | null
  officialPhone: string | null
  address: string | null
  status: string
  kycStatus: string
  rejectReason: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
    emailVerified: string | null
    createdAt: string
  }
  kycDocuments: Array<{
    id: string
    type: string
    url: string
    filename: string
    mime: string
    size: number
    uploadedAt: string
    verifiedAt: string | null
  }>
  onboardingSession: {
    id: string
    currentStep: string
    creatorOtpVerifiedAt: string | null
    verifiedCreatorEmail: string | null
    createdAt: string
  } | null
}

export default function AdminClubReviewPage() {
  const params = useParams()
  const router = useRouter()
  const clubId = params.id as string

  const [club, setClub] = useState<ClubDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)

  const loadClub = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/clubs/${clubId}`)
      if (res.ok) {
        const data = await res.json()
        setClub(data.club)
      } else {
        setError("Club introuvable")
      }
    } catch {
      setError("Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [clubId])

  useEffect(() => {
    loadClub()
  }, [loadClub])

  const handleApprove = async () => {
    if (!confirm("Confirmer l'approbation de ce club ?")) return
    setActionLoading(true)
    setError("")

    try {
      const res = await fetch(`/api/admin/clubs/${clubId}/approve`, {
        method: "POST",
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || "Erreur lors de l'approbation")
        return
      }

      // Recharger
      loadClub()
    } catch {
      setError("Erreur de connexion")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (rejectReason.length < 10) {
      setError("La raison du refus doit contenir au moins 10 caractères")
      return
    }

    setActionLoading(true)
    setError("")

    try {
      const res = await fetch(`/api/admin/clubs/${clubId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error || "Erreur lors du refus")
        return
      }

      loadClub()
      setShowRejectForm(false)
    } catch {
      setError("Erreur de connexion")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    )
  }

  if (!club) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Club introuvable</p>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    PENDING_REVIEW: "bg-amber-100 text-amber-700",
    ACTIVE: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/clubs/pending")}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Retour
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-pitch-100 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-pitch-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {club.clubName}
            </h1>
            <p className="text-gray-500">
              {club.country}
              {club.city ? ` - ${club.city}` : ""}
            </p>
          </div>
        </div>
        <Badge className={statusColors[club.status] || ""}>
          {club.status}
        </Badge>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Rejet précédent */}
      {club.rejectReason && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-sm font-medium text-red-800">Motif du refus précédent :</p>
          <p className="text-sm text-red-700 mt-1">{club.rejectReason}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Créateur */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-pitch-600" />
            <h2 className="font-medium text-gray-900">Créateur du club</h2>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm ml-7">
            <dt className="text-gray-500">Nom</dt>
            <dd>{club.user.name || "-"}</dd>
            <dt className="text-gray-500">Email</dt>
            <dd>{club.user.email}</dd>
            <dt className="text-gray-500">Email vérifié</dt>
            <dd>
              {club.user.emailVerified ? (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Oui
                </span>
              ) : (
                <span className="text-red-600">Non</span>
              )}
            </dd>
            <dt className="text-gray-500">OTP vérifié</dt>
            <dd>
              {club.onboardingSession?.creatorOtpVerifiedAt ? (
                <span className="text-green-600 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />{" "}
                  {club.onboardingSession.verifiedCreatorEmail}
                </span>
              ) : (
                <span className="text-red-600">Non</span>
              )}
            </dd>
          </dl>
        </div>

        {/* Infos club */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-5 h-5 text-pitch-600" />
            <h2 className="font-medium text-gray-900">Informations du club</h2>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm ml-7">
            <dt className="text-gray-500">Nom</dt>
            <dd>{club.clubName}</dd>
            <dt className="text-gray-500">Type</dt>
            <dd>{club.clubType || "-"}</dd>
            <dt className="text-gray-500">Pays / Ville</dt>
            <dd>
              {club.country} {club.city ? `- ${club.city}` : ""}
            </dd>
            <dt className="text-gray-500">Année de fondation</dt>
            <dd>{club.foundedYear || "-"}</dd>
            <dt className="text-gray-500">Forme juridique</dt>
            <dd>{club.legalForm || "-"}</dd>
            <dt className="text-gray-500">N° SIRET/RNA</dt>
            <dd>{club.registrationNumber || "-"}</dd>
            <dt className="text-gray-500">Fédération</dt>
            <dd>{club.federation || "-"}</dd>
            <dt className="text-gray-500">N° affiliation</dt>
            <dd>{club.federationNumber || "-"}</dd>
          </dl>
          <div className="mt-4 ml-7 space-y-2 text-sm">
            {club.officialEmail && (
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" /> {club.officialEmail}
              </div>
            )}
            {club.officialPhone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" /> {club.officialPhone}
              </div>
            )}
            {club.address && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" /> {club.address}
              </div>
            )}
          </div>
        </div>

        {/* Documents KYC */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-pitch-600" />
            <h2 className="font-medium text-gray-900">
              Documents KYC ({club.kycDocuments.length})
            </h2>
          </div>
          {club.kycDocuments.length === 0 ? (
            <p className="text-sm text-gray-500 ml-7">Aucun document uploadé</p>
          ) : (
            <div className="space-y-3 ml-7">
              {club.kycDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {KYC_DOC_LABELS[doc.type] || doc.type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {doc.filename} ({(doc.size / 1024).toFixed(0)} KB) |{" "}
                        {new Date(doc.uploadedAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.verifiedAt && (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Vérifié
                      </Badge>
                    )}
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pitch-600 hover:text-pitch-700"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {club.status === "PENDING_REVIEW" && (
          <div className="border rounded-lg p-4">
            <h2 className="font-medium text-gray-900 mb-4">Actions</h2>

            {showRejectForm ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Motif du refus *
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Expliquez la raison du refus (min 10 caractères)..."
                    rows={4}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectForm(false)}
                    disabled={actionLoading}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={actionLoading || rejectReason.length < 10}
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Confirmer le refus
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Approuver le club
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectForm(true)}
                  disabled={actionLoading}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Refuser
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
