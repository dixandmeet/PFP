import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getClubForUser, listMembers, inviteMember, removeMember, changeRole } from "@/lib/services/club-members"
import { inviteClubMemberSchema, removeMemberSchema, changeRoleSchema } from "@/lib/validators/club-member-schemas"
import { handleApiError } from "@/lib/utils/api-helpers"
import { isClubRole } from "@/lib/utils/role-helpers"
import { sendEmail, emailTemplates } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { getBaseUrl } from "@/lib/url"

/**
 * GET /api/club/members — List all ACTIVE + INVITED members
 */
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    if (!isClubRole(session.user.role)) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 })
    }

    const clubInfo = await getClubForUser(session.user.id)
    if (!clubInfo) {
      // Invitation en attente : message explicite
      const hasInvitation = await prisma.clubMember.findFirst({
        where: { userId: session.user.id, status: "INVITED" },
        select: { id: true },
      })
      if (hasInvitation) {
        return NextResponse.json(
          { error: "Acceptez votre invitation pour accéder à cette page." },
          { status: 403 }
        )
      }
      return NextResponse.json({ error: "Club non trouve" }, { status: 404 })
    }

    const members = await listMembers(clubInfo.clubProfileId)

    return NextResponse.json({
      members,
      currentUserRole: clubInfo.role,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/club/members — Invite a member by email
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    if (!isClubRole(session.user.role)) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 })
    }

    const clubInfo = await getClubForUser(session.user.id)
    if (!clubInfo) {
      return NextResponse.json({ error: "Club non trouve" }, { status: 404 })
    }

    if (clubInfo.role !== "OWNER" && clubInfo.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Seuls les proprietaires et admins peuvent inviter des membres" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = inviteClubMemberSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Donnees invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email, role } = parsed.data

    const member = await inviteMember(
      clubInfo.clubProfileId,
      email,
      role,
      session.user.id
    )

    // Send invitation email
    const inviteUrl = `${getBaseUrl()}/invite/${member.inviteToken}`
    const inviterName = session.user.name || "Un administrateur"

    try {
      const { subject, html } = emailTemplates.clubMemberInvitationEmail(
        inviterName,
        email,
        role,
        inviteUrl
      )
      await sendEmail({ to: email, subject, html })
    } catch {
      // Email failure should not block the invitation
      console.error("[API] Failed to send invitation email to", email)
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

/**
 * PATCH /api/club/members — Change a member's role
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    if (!isClubRole(session.user.role)) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 })
    }

    const clubInfo = await getClubForUser(session.user.id)
    if (!clubInfo || clubInfo.role !== "OWNER") {
      return NextResponse.json(
        { error: "Seul le proprietaire peut modifier les roles" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = changeRoleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Donnees invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const updated = await changeRole(
      clubInfo.clubProfileId,
      parsed.data.memberId,
      parsed.data.role
    )

    return NextResponse.json(updated)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/club/members — Remove a member (soft-remove)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    if (!isClubRole(session.user.role)) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 })
    }

    const clubInfo = await getClubForUser(session.user.id)
    if (!clubInfo || (clubInfo.role !== "OWNER" && clubInfo.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Seuls les proprietaires et admins peuvent retirer des membres" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = removeMemberSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Donnees invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await removeMember(clubInfo.clubProfileId, parsed.data.memberId)

    return NextResponse.json({ removed: true })
  } catch (error) {
    return handleApiError(error)
  }
}
