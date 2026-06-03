import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { acceptInvite } from "@/lib/services/club-members"
import { acceptInviteSchema } from "@/lib/validators/club-member-schemas"
import { handleApiError } from "@/lib/utils/api-helpers"
import { prisma } from "@/lib/prisma"
import { computeStaffOnboardingStepAfterInvite } from "@/lib/services/staff-onboarding-service"

/**
 * POST /api/club/members/accept — Accept an invitation by token
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = acceptInviteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Token invalide" },
        { status: 400 }
      )
    }

    const member = await acceptInvite(
      parsed.data.token,
      session.user.id,
      session.user.email
    )

    const isOwner = member.role === "OWNER"
    const newRole = isOwner ? "CLUB" : "CLUB_STAFF"

    if (session.user.role !== "CLUB" && session.user.role !== "CLUB_STAFF") {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: newRole },
      })
    }

    let staffOnboardingComplete = false

    if (!isOwner) {
      const nextStep = await computeStaffOnboardingStepAfterInvite(session.user.id)
      await prisma.clubMember.update({
        where: { id: member.id },
        data: { staffOnboardingStep: nextStep },
      })
      staffOnboardingComplete = nextStep === "DONE"
    }

    return NextResponse.json({
      accepted: true,
      clubProfileId: member.clubProfileId,
      role: member.role,
      staffOnboarding: !isOwner,
      staffOnboardingComplete,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
