import { prisma } from "@/lib/prisma"
import { generateSlug } from "./slug"

/**
 * Génère un slug unique en vérifiant la base de données.
 * Ajoute un suffixe numérique si le slug existe déjà.
 * SERVER-ONLY: utilise Prisma, ne pas importer côté client.
 */
export async function generateUniqueSlug(
  name: string,
  profileType: "player" | "agent" | "club",
  excludeId?: string
): Promise<string> {
  const baseSlug = generateSlug(name)
  let slug = baseSlug
  let counter = 1

  while (true) {
    let existing: { id: string } | null = null

    if (profileType === "player") {
      existing = await prisma.playerProfile.findUnique({
        where: { slug },
        select: { id: true },
      })
    } else if (profileType === "agent") {
      existing = await prisma.agentProfile.findUnique({
        where: { slug },
        select: { id: true },
      })
    } else if (profileType === "club") {
      existing = await prisma.clubProfile.findUnique({
        where: { slug },
        select: { id: true },
      })
    }

    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }
}

/**
 * Résoudre un slug ou un ID en userId.
 * SERVER-ONLY: utilise Prisma, ne pas importer côté client.
 */
export async function resolveProfileSlug(slugOrId: string): Promise<{
  userId: string
  profileType: "player" | "agent" | "club"
} | null> {
  const isCuidFormat = /^c[a-z0-9]{24,}$/i.test(slugOrId)

  if (isCuidFormat) {
    const user = await prisma.user.findUnique({
      where: { id: slugOrId },
      select: {
        id: true,
        playerProfile: { select: { id: true } },
        agentProfile: { select: { id: true } },
        clubProfile: { select: { id: true } },
      },
    })

    if (!user) return null

    const profileType = user.playerProfile
      ? "player"
      : user.agentProfile
        ? "agent"
        : user.clubProfile
          ? "club"
          : null

    if (!profileType) return null
    return { userId: user.id, profileType }
  }

  const [player, agent, club] = await Promise.all([
    prisma.playerProfile.findUnique({
      where: { slug: slugOrId },
      select: { userId: true },
    }),
    prisma.agentProfile.findUnique({
      where: { slug: slugOrId },
      select: { userId: true },
    }),
    prisma.clubProfile.findUnique({
      where: { slug: slugOrId },
      select: { userId: true },
    }),
  ])

  if (player) return { userId: player.userId, profileType: "player" }
  if (agent) return { userId: agent.userId, profileType: "agent" }
  if (club) return { userId: club.userId, profileType: "club" }

  return null
}
