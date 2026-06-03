import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"
import { createClubReportSchema } from "@/lib/validators/schemas"
import {
  resolveClubContext,
  generateReportShareSlug,
  clubReportInclude,
  fetchReportsForClub,
} from "@/lib/services/club-reports"
import type { ReportKind, ReportSource } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const ctx = await resolveClubContext(session.user.id, session.user.role)
    if (!ctx) {
      return NextResponse.json({ error: "Club non actif ou introuvable" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const source = (searchParams.get("source") || "owned") as "owned" | "received"
    const kindParam = searchParams.get("kind")
    const kind =
      kindParam === "PLAYER" || kindParam === "MATCH" ? kindParam : undefined

    const reports = await fetchReportsForClub(ctx.clubProfileId, { source, kind })
    return NextResponse.json({ reports })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const ctx = await resolveClubContext(session.user.id, session.user.role)
    if (!ctx) {
      return NextResponse.json({ error: "Club non actif ou introuvable" }, { status: 403 })
    }

    const body = await request.json()
    const validated = createClubReportSchema.parse(body)

    const sections = validated.sections ?? []
    const baseData = {
      clubProfileId: ctx.clubProfileId,
      createdByUserId: ctx.userId,
      source: "CLUB" as ReportSource,
      title: validated.title,
      authorType: validated.authorType,
      shareSlug: generateReportShareSlug(validated.title),
      status: "DRAFT" as const,
      attachments: validated.attachments ?? [],
    }

    if (validated.reportKind === "PLAYER") {
      if (validated.subjectId) {
        const onRoster = await prisma.teamPlayer.findFirst({
          where: {
            playerProfileId: validated.subjectId,
            team: { clubProfileId: ctx.clubProfileId },
          },
        })
        if (!onRoster) {
          const exists = await prisma.playerProfile.findUnique({
            where: { id: validated.subjectId },
            select: { id: true },
          })
          if (!exists) {
            return NextResponse.json({ error: "Joueur introuvable" }, { status: 404 })
          }
        }
      }

      const report = await prisma.playerReport.create({
        data: {
          ...baseData,
          reportKind: "PLAYER" as ReportKind,
          subjectId: validated.subjectId ?? null,
          externalPlayer: validated.externalPlayer ?? undefined,
          sections: {
            create: sections.map(
              (s: { title: string; content: string; order: number }, i: number) => ({
              title: s.title,
              content: s.content,
              order: s.order ?? i,
            })
            ),
          },
        },
        include: clubReportInclude,
      })
      return NextResponse.json(report, { status: 201 })
    }

    const report = await prisma.playerReport.create({
      data: {
        ...baseData,
        reportKind: "MATCH" as ReportKind,
        footballMatchId: validated.footballMatchId ?? null,
        matchManual: validated.matchManual ?? undefined,
        sections: {
          create: sections.map(
            (s: { title: string; content: string; order: number }, i: number) => ({
              title: s.title,
              content: s.content,
              order: s.order ?? i,
            })
          ),
        },
      },
      include: clubReportInclude,
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
