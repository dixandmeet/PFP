"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const STEPS = [
  { key: "PROFILE", label: "Profil", description: "Informations personnelles" },
  { key: "KYC", label: "Identité", description: "Pièce d'identité" },
] as const

export type StaffStepKey = (typeof STEPS)[number]["key"]

interface StaffOnboardingStepperProps {
  currentStep: StaffStepKey
  completedSteps: string[]
}

export function StaffOnboardingStepper({
  currentStep,
  completedSteps,
}: StaffOnboardingStepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep)

  return (
    <nav aria-label="Étapes d'inscription staff" className="mb-8">
      <ol className="flex items-center w-full max-w-md mx-auto">
        {STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.key)
          const isCurrent = step.key === currentStep
          const isPast = index < currentIndex

          return (
            <li
              key={step.key}
              className={cn(
                "flex items-center",
                index < STEPS.length - 1 ? "flex-1" : ""
              )}
            >
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300",
                    isCompleted || isPast
                      ? "bg-pitch-600 border-pitch-600 text-white"
                      : isCurrent
                        ? "bg-white border-pitch-600 text-pitch-600 ring-4 ring-pitch-100"
                        : "bg-white border-gray-300 text-gray-400"
                  )}
                >
                  {isCompleted || isPast ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "text-xs font-medium",
                      isCurrent
                        ? "text-pitch-700"
                        : isCompleted || isPast
                          ? "text-pitch-600"
                          : "text-gray-400"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-gray-400 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 mt-[-20px] transition-all duration-300",
                    isPast || isCompleted
                      ? "bg-pitch-600"
                      : "bg-gray-200"
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
