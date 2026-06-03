import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ClubOnboardingWizard } from "@/components/club/onboarding/ClubOnboardingWizard"
import { getOnboardingSessionForDisplay } from "@/lib/services/club-onboarding-service"

export const metadata = {
  title: "Enregistrement Club - Profoot Profile",
  description: "Enregistrez votre club sur Profoot Profile",
}

export default async function ClubOnboardingPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const onboardingSession = await getOnboardingSessionForDisplay(session.user.id)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stadium-900 tracking-tight">
          Enregistrement de votre club
        </h1>
        <p className="text-stadium-500 mt-2 leading-relaxed">
          Complétez les 4 étapes ci-dessous pour enregistrer votre club sur
          Profoot Profile.
        </p>
      </div>

      <ClubOnboardingWizard
        initialSession={JSON.parse(JSON.stringify(onboardingSession))}
      />
    </div>
  )
}
