// POST /api/club/staff-onboarding/accept-invite — Accepter une invitation pendant l'onboarding staff
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { z } from "zod"
import { acceptInviteDuringOnboarding } from "@/lib/services/staff-onboarding-service"

const acceptInviteSchema = z.object({
  token: z.string().min(1, "Token requis"),
})

function extractInviteToken(input: string): string {
  const trimmed = input.trim()
  const inviteMatch = trimmed.match(/\/invite\/([^/?#]+)/i)
  if (inviteMatch) return inviteMatch[1]
  return trimmed
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    if (session.user.role !== "CLUB_STAFF") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await request.json()
    const parsed = acceptInviteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const token = extractInviteToken(parsed.data.token)

    const result = await acceptInviteDuringOnboarding(
      session.user.id,
      session.user.email,
      token
    )

    return NextResponse.json({
      success: true,
      step: result.step,
      clubName: result.clubName,
      clubProfileId: result.clubProfileId,
      role: result.role,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur interne du serveur"
    console.error("[API] staff-onboarding/accept-invite POST error:", error)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
