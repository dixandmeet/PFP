import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const unreadOnly = request.nextUrl.searchParams.get("unreadOnly") === "true"

    const allConversations = await prisma.conversation.findMany({
      where: {
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
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: { select: { id: true, name: true } },
            attachments: true,
          },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    })

    // Dedupliquer : garder une seule conversation par interlocuteur
    // (la plus recente ou celle avec des messages)
    const seen = new Map<string, typeof allConversations[0]>()
    for (const conv of allConversations) {
      const otherParticipant = conv.participants.find(p => p.user.id !== user.id)
      if (!otherParticipant) continue
      const otherUserId = otherParticipant.user.id

      const existing = seen.get(otherUserId)
      if (!existing) {
        seen.set(otherUserId, conv)
      } else {
        // Garder la conversation avec le message le plus recent
        const existingDate = existing.lastMessageAt?.getTime() || 0
        const currentDate = conv.lastMessageAt?.getTime() || 0
        if (currentDate > existingDate) {
          seen.set(otherUserId, conv)
        }
      }
    }

    let conversations = Array.from(seen.values())
      .sort((a, b) => {
        const dateA = a.lastMessageAt?.getTime() || 0
        const dateB = b.lastMessageAt?.getTime() || 0
        return dateB - dateA
      })

    if (unreadOnly) {
      conversations = conversations.filter((conv) => {
        const myParticipant = conv.participants.find(p => p.userId === user.id)
        if (!myParticipant) return false
        const lastMsg = conv.lastMessageAt?.getTime() || 0
        const lastRead = myParticipant.lastReadAt?.getTime() || 0
        return lastMsg > lastRead
      })
    }

    return NextResponse.json({ conversations, total: conversations.length })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { recipientId } = await request.json()

    if (!recipientId) {
      return NextResponse.json({ error: "recipientId requis" }, { status: 400 })
    }

    if (recipientId === user.id) {
      return NextResponse.json({ error: "Impossible de s'envoyer un message" }, { status: 400 })
    }

    const recipient = await prisma.user.findUnique({ where: { id: recipientId } })
    if (!recipient) {
      return NextResponse.json({ error: "Destinataire non trouve" }, { status: 404 })
    }

    // Chercher toutes les conversations entre ces 2 utilisateurs
    // et prendre celle avec le message le plus recent (evite les doublons)
    const existingConversations = await prisma.conversation.findMany({
      where: {
        AND: [
          { participants: { some: { userId: user.id } } },
          { participants: { some: { userId: recipientId } } },
        ],
      },
      include: {
        _count: { select: { messages: true } },
      },
      orderBy: { lastMessageAt: "desc" },
    })

    // Privilegier la conversation qui a des messages
    const bestConversation = existingConversations.find(c => c._count.messages > 0)
      || existingConversations[0]
      || null

    if (bestConversation) {
      const existing = await prisma.conversation.findUnique({
        where: { id: bestConversation.id },
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
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: {
              sender: { select: { id: true, name: true } },
              attachments: true,
            },
          },
        },
      })

      return NextResponse.json({ conversation: existing })
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: user.id },
            { userId: recipientId },
          ],
        },
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
        messages: true,
      },
    })

    return NextResponse.json({ conversation }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
