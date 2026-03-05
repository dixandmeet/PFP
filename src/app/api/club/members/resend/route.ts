import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getClubForUser, resendInvitation } from "@/lib/services/club-members"
import { handleApiError } from "@/lib/utils/api-helpers"
import { sendEmail, emailTemplates } from "@/lib/email"
import { z } from "zod"

const resendSchema = z.object({
  memberId: z.string().min(1),
})

/**
 * POST /api/club/members/resend — Regenerate invite token and resend invitation email
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    if (session.user.role !== "CLUB") {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 })
    }

    const clubInfo = await getClubForUser(session.user.id)
    if (!clubInfo) {
      return NextResponse.json({ error: "Club non trouve" }, { status: 404 })
    }

    if (clubInfo.role !== "OWNER" && clubInfo.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Seuls les proprietaires et admins peuvent renvoyer une invitation" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = resendSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Donnees invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const member = await resendInvitation(
      parsed.data.memberId,
      clubInfo.clubProfileId,
      session.user.id
    )

    const inviteUrl = `${process.env.NEXTAUTH_URL || "https://profootprofile.com"}/invite/${member.inviteToken}`
    const inviterName = session.user.name || "Un administrateur"

    try {
      const { subject, html } = emailTemplates.clubMemberInvitationEmail(
        inviterName,
        member.email,
        member.role,
        inviteUrl
      )
      await sendEmail({ to: member.email, subject, html })
    } catch {
      console.error("[API] Failed to resend invitation email to", member.email)
      return NextResponse.json(
        { error: "Invitation regeneree mais l'email n'a pas pu etre envoye." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      sent: true,
      member: {
        id: member.id,
        email: member.email,
        role: member.role,
        status: member.status,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
