"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { OnboardingStepper, type StepKey as StepperStepKey } from "./OnboardingStepper"
import { Step2ClubInfo } from "./Step2ClubInfo"
import { Step3KycDocuments } from "./Step3KycDocuments"
import { Step4Submit } from "./Step4Submit"
import { Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

type DbStepKey = "CREATOR" | "CLUB_INFO" | "KYC" | "SUBMIT" | "DONE"
type StepKey = StepperStepKey | "DONE"

export interface OnboardingSession {
  id: string
  currentStep: DbStepKey
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

function toDisplayStep(step: DbStepKey): StepKey {
  if (step === "CREATOR") return "CLUB_INFO"
  if (step === "DONE") return "DONE"
  return step
}

function toStepperStep(step: StepKey): StepperStepKey {
  if (step === "DONE") return "SUBMIT"
  return step
}

function completedStepsFromSession(data: OnboardingSession): StepperStepKey[] {
  const completed: StepperStepKey[] = []
  if (data.clubId) completed.push("CLUB_INFO")
  if ((data.club?.kycDocuments?.length ?? 0) >= 3) completed.push("KYC")
  if (data.club?.status === "PENDING_REVIEW") completed.push("SUBMIT")
  return completed
}

function normalizeOnboardingSession(raw: OnboardingSession): OnboardingSession {
  return {
    ...raw,
    currentStep: raw.currentStep === "CREATOR" ? "CLUB_INFO" : raw.currentStep,
    creatorOtpVerifiedAt: raw.creatorOtpVerifiedAt
      ? String(raw.creatorOtpVerifiedAt)
      : null,
    club: raw.club
      ? {
          ...raw.club,
          kycDocuments: raw.club.kycDocuments.map((d) => ({
            ...d,
            uploadedAt: String(d.uploadedAt),
          })),
        }
      : null,
  }
}

interface ClubOnboardingWizardProps {
  initialSession?: OnboardingSession | null
}

export function ClubOnboardingWizard({
  initialSession = null,
}: ClubOnboardingWizardProps) {
  const router = useRouter()
  const normalizedInitial = initialSession
    ? normalizeOnboardingSession(initialSession)
    : null

  const [session, setSession] = useState<OnboardingSession | null>(
    normalizedInitial
  )
  const [currentStep, setCurrentStep] = useState<StepKey>(
    normalizedInitial ? toDisplayStep(normalizedInitial.currentStep) : "CLUB_INFO"
  )
  const [completedSteps, setCompletedSteps] = useState<StepperStepKey[]>(
    normalizedInitial ? completedStepsFromSession(normalizedInitial) : []
  )
  const [loading, setLoading] = useState(!normalizedInitial)
  const [error, setError] = useState("")

  const applySession = useCallback((data: OnboardingSession) => {
    const normalized = normalizeOnboardingSession(data)
    setSession(normalized)
    setCurrentStep(toDisplayStep(normalized.currentStep))
    setCompletedSteps(completedStepsFromSession(normalized))
  }, [])

  const loadSession = useCallback(async () => {
    try {
      const res = await fetch("/api/onboarding/session")
      if (res.ok) {
        const data = await res.json()
        if (data.session) {
          applySession(data.session)
        }
      }
    } catch {
      // Session non trouvée, on commence de zéro
    } finally {
      setLoading(false)
    }
  }, [applySession])

  useEffect(() => {
    if (!normalizedInitial) {
      loadSession()
    } else {
      setLoading(false)
    }
  }, [normalizedInitial, loadSession])

  const handleClubSaved = (clubId: string) => {
    setCompletedSteps((prev) => [...new Set([...prev, "CLUB_INFO" as StepperStepKey])])
    setCurrentStep("KYC")
    loadSession()
  }

  const handleKycComplete = async () => {
    setCompletedSteps((prev) => [...new Set([...prev, "KYC" as StepperStepKey])])
    await loadSession()
    setCurrentStep("SUBMIT")
  }

  const handleSubmitted = () => {
    setCompletedSteps((prev) => [...new Set([...prev, "SUBMIT" as StepperStepKey])])
    router.replace("/club/dashboard")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-pitch-500 animate-spin" />
      </div>
    )
  }

  const clubStatus = session?.club?.status

  if (clubStatus === "ACTIVE" || clubStatus === "PENDING_REVIEW") {
    const isActive = clubStatus === "ACTIVE"
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div
          className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
            isActive ? "bg-green-100" : "bg-amber-100"
          }`}
        >
          {isActive ? (
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          ) : (
            <Clock className="w-10 h-10 text-amber-600" />
          )}
        </div>
        <div className="text-center max-w-md space-y-2">
          <h2 className="text-2xl font-bold text-stadium-900">
            {isActive ? "Club enregistré" : "Demande en cours de vérification"}
          </h2>
          <p className="text-stadium-600">
            {isActive ? (
              <>
                <strong>{session?.club?.clubName}</strong> est actif sur Profoot Profile.
              </>
            ) : (
              <>
                La demande pour <strong>{session?.club?.clubName}</strong> est en cours
                d&apos;examen par notre équipe.
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => router.push("/club/dashboard")}>Retour au dashboard</Button>
          <Button variant="outline" onClick={() => router.push("/club/profile")}>
            Voir le profil club
          </Button>
        </div>
      </div>
    )
  }

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
        currentStep={toStepperStep(currentStep)}
        completedSteps={completedSteps}
      />

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

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

      <div className="bg-white rounded-2xl border border-stadium-200 p-6 md:p-8 shadow-sm">
        {currentStep === "CLUB_INFO" && (
          <Step2ClubInfo
            defaultValues={clubDefaults}
            clubId={session?.clubId}
            onSaved={handleClubSaved}
            onBack={() => router.back()}
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
            onSubmit={handleSubmitted}
            onBack={() => setCurrentStep("KYC")}
          />
        )}
      </div>
    </div>
  )
}
