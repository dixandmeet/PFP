"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { StaffOnboardingStepper, type StaffStepKey } from "./StaffOnboardingStepper"
import { StaffStep1Profile } from "./StaffStep1Profile"
import { StaffStep2Kyc } from "./StaffStep2Kyc"
import { StaffStep3InviteWait, type PendingInvite } from "./StaffStep3InviteWait"
import { Loader2, AlertCircle, PartyPopper } from "lucide-react"
import { Button } from "@/components/ui/button"

type OnboardingStep = StaffStepKey | "DONE"

interface StaffOnboardingState {
  step: OnboardingStep
  clubName: string
  clubRole: string
  staffProfile: {
    firstName?: string | null
    lastName?: string | null
    jobTitle?: string | null
    bio?: string | null
    phone?: string | null
  } | null
  kycDocuments: Array<{
    id: string
    type: string
    fileName: string
    fileSize: number | null
    createdAt: string
  }>
  pendingInvites?: PendingInvite[]
}

function completedStepsForStep(step: OnboardingStep): string[] {
  const completed: string[] = []
  if (step === "KYC" || step === "INVITE" || step === "DONE") {
    completed.push("PROFILE")
  }
  if (step === "INVITE" || step === "DONE") {
    completed.push("KYC")
  }
  if (step === "DONE") {
    completed.push("INVITE")
  }
  return completed
}

export function StaffOnboardingWizard() {
  const router = useRouter()
  const [state, setState] = useState<StaffOnboardingState | null>(null)
  const [currentStep, setCurrentStep] = useState<StaffStepKey>("PROFILE")
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  const loadState = useCallback(async () => {
    try {
      const res = await fetch("/api/club/staff-onboarding")
      if (!res.ok) {
        throw new Error("Impossible de charger l'état de l'onboarding")
      }
      const data: StaffOnboardingState = await res.json()
      setState(data)

      const step = data.step as OnboardingStep

      if (step === "DONE") {
        setDone(true)
        setCompletedSteps(completedStepsForStep("DONE"))
        return
      }

      if (step === "PROFILE" || step === "KYC" || step === "INVITE") {
        setCurrentStep(step)
        setCompletedSteps(completedStepsForStep(step))
      }
    } catch {
      setError("Impossible de charger les données. Veuillez rafraîchir la page.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadState()
  }, [loadState])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-pitch-500 animate-spin mb-4" />
        <p className="text-pitch-600">Chargement...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()}>Rafraîchir</Button>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
          <PartyPopper className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-pitch-900">Inscription terminée !</h2>
        <p className="text-pitch-600 text-center max-w-md">
          Bienvenue dans l&apos;équipe de{" "}
          <strong>{state?.clubName || "votre club"}</strong>. Vous pouvez
          maintenant accéder à l&apos;espace club.
        </p>
        <Button onClick={() => router.push("/club/dashboard")}>
          Accéder au dashboard
        </Button>
        <Button variant="outline" onClick={() => router.push("/club/staff/profile")}>
          Retour au profil
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <StaffOnboardingStepper
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      {currentStep === "PROFILE" && (
        <StaffStep1Profile
          profile={state?.staffProfile || null}
          onComplete={() => {
            setCompletedSteps(completedStepsForStep("KYC"))
            setCurrentStep("KYC")
            loadState()
          }}
        />
      )}

      {currentStep === "KYC" && (
        <StaffStep2Kyc
          existingDocs={state?.kycDocuments || []}
          onComplete={(nextStep) => {
            if (nextStep === "DONE") {
              setCompletedSteps(completedStepsForStep("DONE"))
              setDone(true)
              loadState()
              return
            }
            setCompletedSteps(completedStepsForStep("INVITE"))
            setCurrentStep("INVITE")
            loadState()
          }}
          onBack={() => {
            setCurrentStep("PROFILE")
            setCompletedSteps([])
          }}
        />
      )}

      {currentStep === "INVITE" && (
        <StaffStep3InviteWait
          pendingInvites={state?.pendingInvites || []}
          onBack={() => {
            setCurrentStep("KYC")
            setCompletedSteps(completedStepsForStep("KYC"))
          }}
        />
      )}
    </div>
  )
}
