import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getClubForUser, transferOwnership } from "@/lib/services/club-members"
import { transferOwnershipSchema } from "@/lib/validators/club-member-schemas"
import { handleApiError } from "@/lib/utils/api-helpers"
import { isClubRole } from "@/lib/utils/role-helpers"

/**
 * POST /api/club/members/transfer — Transfer club ownership
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
    if (!clubInfo || clubInfo.role !== "OWNER") {
      return NextResponse.json(
        { error: "Seul le proprietaire peut transferer la propriete" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = transferOwnershipSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Donnees invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    await transferOwnership(
      clubInfo.clubProfileId,
      session.user.id,
      parsed.data.toMemberId
    )

    return NextResponse.json({ transferred: true })
  } catch (error) {
    return handleApiError(error)
  }
}
