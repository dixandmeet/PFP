"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { StaffOnboardingStepper, type StaffStepKey } from "./StaffOnboardingStepper"
import { StaffStep1Profile } from "./StaffStep1Profile"
import { StaffStep2Kyc } from "./StaffStep2Kyc"
import { Loader2, AlertCircle, CheckCircle2, PartyPopper } from "lucide-react"
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
        setCompletedSteps(["PROFILE", "KYC"])
        return
      }

      setCurrentStep(step)

      const completed: string[] = []
      if (step === "KYC") {
        completed.push("PROFILE")
      }
      setCompletedSteps(completed)
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
          Bienvenue dans l'équipe de <strong>{state?.clubName}</strong>.
          Vous pouvez maintenant accéder à l'espace club.
        </p>
        <Button onClick={() => router.push("/club/dashboard")}>
          Accéder au dashboard
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
            setCompletedSteps((prev) => [...prev, "PROFILE"])
            setCurrentStep("KYC")
            loadState()
          }}
        />
      )}

      {currentStep === "KYC" && (
        <StaffStep2Kyc
          existingDocs={state?.kycDocuments || []}
          onComplete={() => {
            setCompletedSteps((prev) => [...prev, "KYC"])
            setDone(true)
          }}
          onBack={() => {
            setCurrentStep("PROFILE")
            setCompletedSteps((prev) => prev.filter((s) => s !== "PROFILE"))
          }}
        />
      )}
    </div>
  )
}
