import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"
import { updateClubReportSchema } from "@/lib/validators/schemas"
import {
  resolveClubContext,
  canClubReadReport,
  canClubEditReport,
  clubReportInclude,
} from "@/lib/services/club-reports"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const ctx = await resolveClubContext(session.user.id, session.user.role)
    if (!ctx) {
      return NextResponse.json({ error: "Club non actif ou introuvable" }, { status: 403 })
    }

    const { id } = await params
    const allowed = await canClubReadReport(id, ctx.clubProfileId)
    if (!allowed) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const report = await prisma.playerReport.findUnique({
      where: { id },
      include: clubReportInclude,
    })

    if (!report) {
      return NextResponse.json({ error: "Rapport non trouvé" }, { status: 404 })
    }

    const canEdit = report.clubProfileId === ctx.clubProfileId
    return NextResponse.json({ report, canEdit })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const ctx = await resolveClubContext(session.user.id, session.user.role)
    if (!ctx) {
      return NextResponse.json({ error: "Club non actif ou introuvable" }, { status: 403 })
    }

    const { id } = await params
    const canEdit = await canClubEditReport(id, ctx.clubProfileId)
    if (!canEdit) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    const body = await request.json()
    const validated = updateClubReportSchema.parse(body)

    if (validated.sections) {
      await prisma.reportSection.deleteMany({ where: { reportId: id } })
    }

    const updatedReport = await prisma.playerReport.update({
      where: { id },
      data: {
        ...(validated.title && { title: validated.title }),
        ...(validated.status && { status: validated.status }),
        ...(validated.authorType && { authorType: validated.authorType }),
        ...(validated.attachments && { attachments: validated.attachments }),
        ...(validated.sections && {
          sections: {
            create: validated.sections.map((section, index) => ({
              title: section.title,
              content: section.content,
              order: section.order ?? index,
            })),
          },
        }),
      },
      include: clubReportInclude,
    })

    return NextResponse.json(updatedReport)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const ctx = await resolveClubContext(session.user.id, session.user.role)
    if (!ctx) {
      return NextResponse.json({ error: "Club non actif ou introuvable" }, { status: 403 })
    }

    const { id } = await params
    const canEdit = await canClubEditReport(id, ctx.clubProfileId)
    if (!canEdit) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    await prisma.playerReport.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
