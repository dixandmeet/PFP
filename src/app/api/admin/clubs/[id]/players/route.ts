import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { theSportsDBClient } from "@/lib/services/football/thesportsdb"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { id } = await params

    const players = await prisma.footballPlayer.findMany({
      where: { teamId: id },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ players })
  } catch (error) {
    console.error("Error fetching players:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des joueurs" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { action } = body

    const club = await prisma.footballTeam.findUnique({ where: { id } })
    if (!club) {
      return NextResponse.json({ error: "Club non trouvé" }, { status: 404 })
    }

    if (action === "sync" && club.sportsDbId) {
      const encodedId = club.sportsDbId
      const response = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/lookup_all_players.php?id=${encodedId}`
      )
      const data = await response.json()
      const sportsDbPlayers = data?.player || []

      let count = 0
      for (const p of sportsDbPlayers) {
        if (p.strSport !== "Soccer") continue

        await prisma.footballPlayer.upsert({
          where: { sportsDbId: p.idPlayer },
          create: {
            name: p.strPlayer,
            position: p.strPosition || null,
            nationality: p.strNationality || null,
            dateOfBirth: p.dateBorn ? new Date(p.dateBorn) : null,
            number: p.strNumber ? parseInt(p.strNumber) : null,
            sportsDbId: p.idPlayer,
            image: p.strThumb || null,
            cutout: p.strCutout || null,
            teamId: id,
            teamName: club.name,
            lastSyncedAt: new Date(),
          },
          update: {
            name: p.strPlayer,
            position: p.strPosition || null,
            nationality: p.strNationality || null,
            dateOfBirth: p.dateBorn ? new Date(p.dateBorn) : null,
            number: p.strNumber ? parseInt(p.strNumber) : null,
            image: p.strThumb || null,
            cutout: p.strCutout || null,
            teamId: id,
            teamName: club.name,
            lastSyncedAt: new Date(),
          },
        })
        count++
      }

      return NextResponse.json({
        message: `${count} joueurs synchronisés`,
        count,
      })
    }

    if (action === "associate") {
      const { playerId } = body
      if (!playerId) {
        return NextResponse.json({ error: "ID joueur requis" }, { status: 400 })
      }

      const player = await prisma.footballPlayer.update({
        where: { id: playerId },
        data: { teamId: id, teamName: club.name },
      })

      return NextResponse.json({ player, message: "Joueur associé au club" })
    }

    if (action === "dissociate") {
      const { playerId } = body
      if (!playerId) {
        return NextResponse.json({ error: "ID joueur requis" }, { status: 400 })
      }

      const player = await prisma.footballPlayer.update({
        where: { id: playerId },
        data: { teamId: null, teamName: null },
      })

      return NextResponse.json({ player, message: "Joueur dissocié du club" })
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 })
  } catch (error) {
    console.error("Error managing players:", error)
    return NextResponse.json(
      { error: "Erreur lors de la gestion des joueurs" },
      { status: 500 }
    )
  }
}
