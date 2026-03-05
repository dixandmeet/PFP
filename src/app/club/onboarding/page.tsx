import { ClubOnboardingWizard } from "@/components/club/onboarding/ClubOnboardingWizard"

export const metadata = {
  title: "Enregistrement Club - Profoot Profile",
  description: "Enregistrez votre club sur Profoot Profile",
}

export default function ClubOnboardingPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Enregistrement de votre club
        </h1>
        <p className="text-gray-500 mt-1">
          Complétez les 4 étapes ci-dessous pour enregistrer votre club sur
          Profoot Profile.
        </p>
      </div>

      <ClubOnboardingWizard />
    </div>
  )
}
