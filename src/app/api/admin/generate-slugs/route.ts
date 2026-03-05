// API Admin: Générer les slugs pour les profils existants qui n'en ont pas
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { generateUniqueSlug } from "@/lib/utils/slug"

export async function POST() {
  try {
    const user = await requireAuth()
    
    // Vérifier que c'est un admin
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès refusé" },
        { status: 403 }
      )
    }

    let updated = { players: 0, agents: 0, clubs: 0 }

    // Générer les slugs pour les joueurs sans slug
    const playersWithoutSlug = await prisma.playerProfile.findMany({
      where: { slug: null },
      select: { id: true, firstName: true, lastName: true, displayName: true },
    })

    for (const player of playersWithoutSlug) {
      const name = player.displayName || `${player.firstName} ${player.lastName}`
      const slug = await generateUniqueSlug(name, "player", player.id)
      await prisma.playerProfile.update({
        where: { id: player.id },
        data: { slug },
      })
      updated.players++
    }

    // Générer les slugs pour les agents sans slug
    const agentsWithoutSlug = await prisma.agentProfile.findMany({
      where: { slug: null },
      select: { id: true, firstName: true, lastName: true },
    })

    for (const agent of agentsWithoutSlug) {
      const name = `${agent.firstName} ${agent.lastName}`
      const slug = await generateUniqueSlug(name, "agent", agent.id)
      await prisma.agentProfile.update({
        where: { id: agent.id },
        data: { slug },
      })
      updated.agents++
    }

    // Générer les slugs pour les clubs sans slug
    const clubsWithoutSlug = await prisma.clubProfile.findMany({
      where: { slug: null },
      select: { id: true, clubName: true },
    })

    for (const club of clubsWithoutSlug) {
      const slug = await generateUniqueSlug(club.clubName, "club", club.id)
      await prisma.clubProfile.update({
        where: { id: club.id },
        data: { slug },
      })
      updated.clubs++
    }

    return NextResponse.json({
      success: true,
      updated,
      message: `Slugs générés: ${updated.players} joueurs, ${updated.agents} agents, ${updated.clubs} clubs`,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
