// GET /api/reports/[id] - Détails rapport
// PATCH /api/reports/[id] - Mise à jour rapport
// DELETE /api/reports/[id] - Supprimer rapport
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

    const report = await prisma.playerReport.findUnique({
      where: { id },
      include: {
        author: true,
        subject: true,
        sections: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!report) {
      return NextResponse.json(
        { error: "Rapport non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier les permissions d'accès
    const isAdmin = session.user.role === "ADMIN"
    let hasAccess = isAdmin

    if (!hasAccess) {
      const playerProfile = await prisma.playerProfile.findUnique({
        where: { userId: session.user.id },
      })

      if (playerProfile) {
        hasAccess = report.authorId === playerProfile.id || report.subjectId === playerProfile.id
      }
    }

    if (!hasAccess && session.user.role === "AGENT") {
      const agentProfile = await prisma.agentProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          mandates: {
            where: { status: "ACTIVE" },
            select: { playerProfileId: true },
          },
        },
      })

      if (agentProfile) {
        const playerIds = agentProfile.mandates.map(m => m.playerProfileId)
        hasAccess = playerIds.includes(report.subjectId)
      }
    }

    // TODO: Vérifier accessPolicy

    if (!hasAccess) {
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

export async function PATCH(
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

    const report = await prisma.playerReport.findUnique({
      where: { id },
    })

    if (!report) {
      return NextResponse.json(
        { error: "Rapport non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur est l'auteur
    let canEdit = session.user.role === "ADMIN"

    if (!canEdit) {
      const playerProfile = await prisma.playerProfile.findUnique({
        where: { userId: session.user.id },
      })
      if (playerProfile && report.authorId === playerProfile.id) {
        canEdit = true
      }
    }

    if (!canEdit && session.user.role === "AGENT") {
      const agentProfile = await prisma.agentProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          mandates: {
            where: { status: "ACTIVE" },
            select: { playerProfileId: true },
          },
        },
      })
      if (agentProfile) {
        const playerIds = agentProfile.mandates.map(m => m.playerProfileId)
        canEdit = playerIds.includes(report.subjectId)
      }
    }

    if (!canEdit) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Gérer les sections si elles sont fournies
    let sectionsData = undefined
    if (body.sections) {
      // Supprimer les anciennes sections
      await prisma.reportSection.deleteMany({
        where: { reportId: id },
      })

      // Créer les nouvelles sections
      sectionsData = {
        create: body.sections.map((section: any, index: number) => ({
          title: section.title,
          content: section.content,
          order: section.order ?? index,
        })),
      }
    }

    const updatedReport = await prisma.playerReport.update({
      where: { id },
      data: {
        title: body.title,
        status: body.status,
        authorType: body.authorType,
        attachments: body.attachments,
        accessPolicy: body.accessPolicy,
        ...(sectionsData && { sections: sectionsData }),
      },
      include: {
        author: true,
        subject: true,
        sections: {
          orderBy: { order: "asc" },
        },
      },
    })

    return NextResponse.json(updatedReport)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
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

    const report = await prisma.playerReport.findUnique({
      where: { id },
    })

    if (!report) {
      return NextResponse.json(
        { error: "Rapport non trouvé" },
        { status: 404 }
      )
    }

    let canDelete = session.user.role === "ADMIN"

    if (!canDelete) {
      const playerProfile = await prisma.playerProfile.findUnique({
        where: { userId: session.user.id },
      })
      if (playerProfile && report.authorId === playerProfile.id) {
        canDelete = true
      }
    }

    if (!canDelete && session.user.role === "AGENT") {
      const agentProfile = await prisma.agentProfile.findUnique({
        where: { userId: session.user.id },
        include: {
          mandates: {
            where: { status: "ACTIVE" },
            select: { playerProfileId: true },
          },
        },
      })
      if (agentProfile) {
        const playerIds = agentProfile.mandates.map(m => m.playerProfileId)
        canDelete = playerIds.includes(report.subjectId)
      }
    }

    if (!canDelete) {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      )
    }

    await prisma.playerReport.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
