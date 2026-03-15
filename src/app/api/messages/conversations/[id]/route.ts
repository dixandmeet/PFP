import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: conversationId } = await params

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { userId: user.id } },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true,
                playerProfile: {
                  select: { firstName: true, lastName: true, profilePicture: true },
                },
                agentProfile: {
                  select: { firstName: true, lastName: true, profilePicture: true },
                },
                clubProfile: {
                  select: { clubName: true, logo: true },
                },
              },
            },
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation non trouvee" }, { status: 404 })
    }

    return NextResponse.json({ conversation })
  } catch (error) {
    return handleApiError(error)
  }
}
