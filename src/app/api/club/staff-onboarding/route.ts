// GET /api/club/staff-onboarding — État actuel de l'onboarding staff
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getStaffOnboardingState } from "@/lib/services/staff-onboarding-service"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    if (session.user.role !== "CLUB_STAFF") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const state = await getStaffOnboardingState(session.user.id)

    return NextResponse.json({
      step: state.step,
      clubName: state.clubName ?? "",
      clubRole: state.clubRole ?? "",
      staffProfile: state.staffProfile,
      kycDocuments: state.kycDocuments.map((d) => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
      })),
      pendingInvites: state.pendingInvites,
    })
  } catch (error) {
    console.error("[API] staff-onboarding GET error:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
