// GET /api/reports/shared/[id] - Voir un rapport partagé via messagerie
// Accepte un CUID (id) ou un shareSlug
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { handleApiError } from "@/lib/utils/api-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    const { id } = await params

    const isCuid = /^c[a-z0-9]{24,}$/.test(id)

    const report = isCuid
      ? await prisma.playerReport.findUnique({
          where: { id },
          include: {
            author: true,
            subject: true,
            sections: { orderBy: { order: "asc" } },
          },
        })
      : await prisma.playerReport.findUnique({
          where: { shareSlug: id },
          include: {
            author: true,
            subject: true,
            sections: { orderBy: { order: "asc" } },
          },
        })

    if (!report) {
      return NextResponse.json(
        { error: "Rapport non trouvé" },
        { status: 404 }
      )
    }

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
    })

    const isAuthor = playerProfile && report.authorId === playerProfile.id
    const isSubject = playerProfile && report.subjectId === playerProfile.id
    const isAdmin = session.user.role === "ADMIN"

    const sharedViaMessage = await prisma.messageAttachment.findFirst({
      where: {
        type: "REPORT",
        reportId: report.id,
        message: {
          conversation: {
            participants: {
              some: {
                userId: session.user.id,
              },
            },
          },
        },
      },
    })

    if (!isAuthor && !isSubject && !isAdmin && !sharedViaMessage) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      )
    }

    return NextResponse.json(report)
  } catch (error) {
    return handleApiError(error)
  }
}
