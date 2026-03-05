import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { acceptInvite } from "@/lib/services/club-members"
import { acceptInviteSchema } from "@/lib/validators/club-member-schemas"
import { handleApiError } from "@/lib/utils/api-helpers"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/club/members/accept — Accept an invitation by token
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
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

    // Permettre l'accès à l'espace club : mettre à jour le rôle en CLUB si ce n'est pas déjà le cas
    if (session.user.role !== "CLUB") {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: "CLUB" },
      })
    }

    return NextResponse.json({
      accepted: true,
      clubProfileId: member.clubProfileId,
      role: member.role,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
