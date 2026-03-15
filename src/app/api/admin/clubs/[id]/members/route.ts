// Admin API: gestion des membres d'un club
// GET    — Lister les membres
// POST   — Inviter un nouveau membre
// PATCH  — Changer le rôle d'un membre
// DELETE — Retirer un membre
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  listMembers,
  inviteMember,
  removeMember,
  changeRole,
} from "@/lib/services/club-members"
import { sendTrackedEmail, emailTemplates } from "@/lib/email"
import { getBaseUrl } from "@/lib/url"
import { handleApiError } from "@/lib/utils/api-helpers"
import { z } from "zod"

type RouteContext = { params: Promise<{ id: string }> }

function isAdmin(role: string) {
  return role === "ADMIN"
}

/**
 * GET /api/admin/clubs/[id]/members — Liste des membres
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user?.id || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const { id: clubProfileId } = await context.params
    const members = await listMembers(clubProfileId)

    return NextResponse.json({ members })
  } catch (error) {
    return handleApiError(error)
  }
}

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "STAFF", "VIEWER"]),
})

/**
 * POST /api/admin/clubs/[id]/members — Inviter un membre (admin-initiated)
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user?.id || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const { id: clubProfileId } = await context.params
    const body = await request.json()
    const parsed = inviteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const member = await inviteMember(
      clubProfileId,
      parsed.data.email,
      parsed.data.role as any,
      session.user.id
    )

    // Envoyer l'email d'invitation
    if (member.inviteToken) {
      const inviteUrl = `${getBaseUrl()}/invite/${member.inviteToken}`
      const adminName = session.user.name || "L'administrateur"

      const emailContent = emailTemplates.clubMemberInvitationEmail(
        adminName,
        parsed.data.email,
        parsed.data.role,
        inviteUrl
      )

      await sendTrackedEmail({
        to: parsed.data.email,
        subject: emailContent.subject,
        html: emailContent.html,
        userId: member.userId || "",
        template: "club_member_invitation_admin",
        metadata: { clubProfileId, role: parsed.data.role, invitedBy: session.user.id },
      })
    }

    return NextResponse.json({
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

const changeRoleSchema = z.object({
  memberId: z.string(),
  role: z.enum(["ADMIN", "STAFF", "VIEWER"]),
})

/**
 * PATCH /api/admin/clubs/[id]/members — Changer le rôle
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user?.id || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const { id: clubProfileId } = await context.params
    const body = await request.json()
    const parsed = changeRoleSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides" },
        { status: 400 }
      )
    }

    const member = await changeRole(clubProfileId, parsed.data.memberId, parsed.data.role as any)

    return NextResponse.json({ member })
  } catch (error) {
    return handleApiError(error)
  }
}

const removeSchema = z.object({
  memberId: z.string(),
})

/**
 * DELETE /api/admin/clubs/[id]/members — Retirer un membre
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user?.id || !isAdmin(session.user.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const { id: clubProfileId } = await context.params
    const body = await request.json()
    const parsed = removeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 })
    }

    await removeMember(clubProfileId, parsed.data.memberId)

    return NextResponse.json({ removed: true })
  } catch (error) {
    return handleApiError(error)
  }
}
