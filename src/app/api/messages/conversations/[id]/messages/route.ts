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

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId: user.id },
      },
    })

    if (!participant) {
      return NextResponse.json({ error: "Acces interdit" }, { status: 403 })
    }

    const cursor = request.nextUrl.searchParams.get("cursor")
    const limit = 50

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            playerProfile: { select: { firstName: true, lastName: true, profilePicture: true } },
            agentProfile: { select: { firstName: true, lastName: true, profilePicture: true } },
            clubProfile: { select: { clubName: true, logo: true } },
          },
        },
        attachments: {
          include: {
            report: {
              select: {
                id: true,
                title: true,
                shareSlug: true,
                status: true,
                authorType: true,
                subject: { select: { firstName: true, lastName: true } },
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })

    const hasMore = messages.length > limit
    if (hasMore) messages.pop()

    await prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    })

    return NextResponse.json({
      messages: messages.reverse(),
      hasMore,
      nextCursor: hasMore ? messages[0]?.id : null,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id: conversationId } = await params

    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId: user.id },
      },
    })

    if (!participant) {
      return NextResponse.json({ error: "Acces interdit" }, { status: 403 })
    }

    const body = await request.json()
    const { content, attachments } = body as {
      content?: string
      attachments?: Array<{
        type: "FILE" | "REPORT"
        fileUrl?: string
        fileName?: string
        fileSize?: number
        mimeType?: string
        reportId?: string
      }>
    }

    if (!content && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: "Message ou piece jointe requis" }, { status: 400 })
    }

    if (attachments?.some(a => a.type === "REPORT" && a.reportId)) {
      const reportIds = attachments.filter(a => a.type === "REPORT").map(a => a.reportId!)
      const reports = await prisma.playerReport.findMany({
        where: { id: { in: reportIds } },
      })
      if (reports.length !== reportIds.length) {
        return NextResponse.json({ error: "Rapport introuvable" }, { status: 404 })
      }
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content: content || null,
        attachments: attachments?.length
          ? {
              create: attachments.map((a) => ({
                type: a.type,
                fileUrl: a.fileUrl || null,
                fileName: a.fileName || null,
                fileSize: a.fileSize || null,
                mimeType: a.mimeType || null,
                reportId: a.reportId || null,
              })),
            }
          : undefined,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            playerProfile: { select: { firstName: true, lastName: true, profilePicture: true } },
            agentProfile: { select: { firstName: true, lastName: true, profilePicture: true } },
            clubProfile: { select: { clubName: true, logo: true } },
          },
        },
        attachments: {
          include: {
            report: {
              select: {
                id: true,
                title: true,
                shareSlug: true,
                status: true,
                authorType: true,
                subject: { select: { firstName: true, lastName: true } },
                createdAt: true,
              },
            },
          },
        },
      },
    })

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    })

    await prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
