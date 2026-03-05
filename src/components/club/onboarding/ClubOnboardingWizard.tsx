"use client"

import { useState, useEffect, useCallback } from "react"
import { OnboardingStepper, type StepKey as StepperStepKey } from "./OnboardingStepper"
import { Step1CreatorVerification } from "./Step1CreatorVerification"
import { Step2ClubInfo } from "./Step2ClubInfo"
import { Step3KycDocuments } from "./Step3KycDocuments"
import { Step4Submit } from "./Step4Submit"
import { Loader2, AlertCircle, Clock, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type StepKey = "CREATOR" | "CLUB_INFO" | "KYC" | "SUBMIT" | "DONE"

interface OnboardingSession {
  id: string
  currentStep: StepKey
  creatorOtpVerifiedAt: string | null
  verifiedCreatorEmail: string | null
  clubId: string | null
  club: {
    id: string
    clubName: string
    country: string
    city: string | null
    foundedYear: number | null
    clubType: string | null
    legalForm: string | null
    registrationNumber: string | null
    federation: string | null
    federationNumber: string | null
    officialEmail: string | null
    officialPhone: string | null
    address: string | null
    status: string
    kycDocuments: Array<{
      id: string
      type: string
      filename: string
      size: number
      uploadedAt: string
    }>
  } | null
}

export function ClubOnboardingWizard() {
  const [session, setSession] = useState<OnboardingSession | null>(null)
  const [currentStep, setCurrentStep] = useState<StepKey>("CREATOR")
  const [completedSteps, setCompletedSteps] = useState<StepKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Charger la session d'onboarding existante
  const loadSession = useCallback(async () => {
    try {
      const res = await fetch("/api/onboarding/session")
      if (res.ok) {
        const data = await res.json()
        if (data.session) {
          setSession(data.session)
          setCurrentStep(data.session.currentStep)

          // Calculer les étapes complétées
          const completed: StepKey[] = []
          if (data.session.creatorOtpVerifiedAt) completed.push("CREATOR")
          if (data.session.clubId) completed.push("CLUB_INFO")
          if (
            data.session.club?.kycDocuments?.length >= 3
          ) {
            completed.push("KYC")
          }
          if (data.session.club?.status === "PENDING_REVIEW") {
            completed.push("SUBMIT")
          }
          setCompletedSteps(completed)
        }
      }
    } catch {
      // Session non trouvée, on commence de zéro
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSession()
  }, [loadSession])

  // Handlers de navigation
  const handleCreatorVerified = (email: string) => {
    setCompletedSteps((prev) => [...new Set([...prev, "CREATOR" as StepKey])])
    setCurrentStep("CLUB_INFO")
    // Recharger la session
    loadSession()
  }

  const handleClubSaved = (clubId: string) => {
    setCompletedSteps((prev) => [...new Set([...prev, "CLUB_INFO" as StepKey])])
    setCurrentStep("KYC")
    loadSession()
  }

  const handleKycComplete = async () => {
    setCompletedSteps((prev) => [...new Set([...prev, "KYC" as StepKey])])
    await loadSession() // Rafraîchir pour inclure les documents uploadés
    setCurrentStep("SUBMIT")
  }

  const handleSubmitted = () => {
    setCompletedSteps((prev) => [...new Set([...prev, "SUBMIT" as StepKey])])
    setCurrentStep("DONE")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-pitch-500 animate-spin" />
      </div>
    )
  }

  // Club déjà actif
  if (session?.club?.status === "ACTIVE") {
    return (
      <div className="text-center py-12 space-y-6">
        <div className="w-16 h-16 rounded-full bg-pitch-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-pitch-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Club déjà activé !
          </h2>
          <p className="text-gray-500 mt-2">
            Votre club <strong>{session.club.clubName}</strong> est actif.
          </p>
        </div>
        <Link href="/club/dashboard">
          <Button>Accéder au tableau de bord</Button>
        </Link>
      </div>
    )
  }

  // Club en attente de review
  if (session?.club?.status === "PENDING_REVIEW") {
    return (
      <div className="text-center py-12 space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            En cours de vérification
          </h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Votre demande pour <strong>{session.club.clubName}</strong> est en
            cours d&apos;examen par notre équipe. Vous recevrez un email dès que la
            vérification sera terminée (24-48h).
          </p>
        </div>
      </div>
    )
  }

  // Préparer les defaultValues pour Step2
  const clubDefaults = session?.club
    ? {
        clubName: session.club.clubName,
        country: session.club.country,
        city: session.club.city || "",
        yearFounded: session.club.foundedYear || undefined,
        clubType: session.club.clubType as "PRO" | "AMATEUR" | "ACADEMY" | undefined,
        legalForm: session.club.legalForm || "",
        registrationNumber: session.club.registrationNumber || "",
        federation: session.club.federation || "",
        federationNumber: session.club.federationNumber || "",
        officialEmail: session.club.officialEmail || "",
        officialPhone: session.club.officialPhone || "",
        address: session.club.address || "",
      }
    : undefined

  return (
    <div className="space-y-8">
      <OnboardingStepper
        currentStep={currentStep === "DONE" ? "SUBMIT" : currentStep}
        completedSteps={completedSteps}
      />

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Club rejeté - message d'info */}
      {session?.club?.status === "REJECTED" && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Votre demande précédente a été refusée
              </p>
              <p className="text-sm text-red-700 mt-1">
                Vous pouvez corriger les informations et resoumettre votre demande.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {currentStep === "CREATOR" && (
          <Step1CreatorVerification onVerified={handleCreatorVerified} />
        )}

        {currentStep === "CLUB_INFO" && (
          <Step2ClubInfo
            defaultValues={clubDefaults}
            clubId={session?.clubId}
            onSaved={handleClubSaved}
            onBack={() => setCurrentStep("CREATOR")}
          />
        )}

        {currentStep === "KYC" && session?.clubId && (
          <Step3KycDocuments
            clubId={session.clubId}
            existingDocs={
              session.club?.kycDocuments?.map((d) => ({
                id: d.id,
                type: d.type,
                filename: d.filename,
                size: d.size,
                uploadedAt: d.uploadedAt,
              })) || []
            }
            onComplete={handleKycComplete}
            onBack={() => setCurrentStep("CLUB_INFO")}
          />
        )}

        {currentStep === "SUBMIT" && session?.club && (
          <Step4Submit
            club={{
              id: session.club.id,
              clubName: session.club.clubName,
              country: session.club.country,
              city: session.club.city,
              clubType: session.club.clubType,
              legalForm: session.club.legalForm,
              officialEmail: session.club.officialEmail,
              officialPhone: session.club.officialPhone,
            }}
            docs={
              session.club.kycDocuments?.map((d) => ({
                id: d.id,
                type: d.type,
                filename: d.filename,
              })) || []
            }
            creatorEmail={session.verifiedCreatorEmail || ""}
            onSubmit={handleSubmitted}
            onBack={() => setCurrentStep("KYC")}
          />
        )}

        {currentStep === "DONE" && (
          <div className="text-center py-12 space-y-6">
            <div className="w-16 h-16 rounded-full bg-pitch-100 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-pitch-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Demande soumise !
              </h2>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                Votre demande est en cours de vérification. Vous recevrez un
                email dès que notre équipe aura examiné votre dossier.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
