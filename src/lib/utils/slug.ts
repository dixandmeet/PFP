import { prisma } from "@/lib/prisma"

/**
 * Vérifie si une chaîne est un CUID (identifiant unique)
 * Les CUIDs commencent par 'c' et font 25 caractères alphanumériques
 */
export function isCuid(str: string): boolean {
  return /^c[a-z0-9]{24}$/.test(str)
}

/**
 * Génère un slug à partir d'un nom (ex: "Amadou Diallo" → "amadou-diallo")
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, "") // Supprimer les caractères spéciaux
    .trim()
    .replace(/\s+/g, "-") // Espaces → tirets
    .replace(/-+/g, "-") // Tirets multiples → un seul
}

/**
 * Génère un slug unique en vérifiant la base de données
 * Ajoute un suffixe numérique si le slug existe déjà
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

    // Si pas d'existant ou c'est le même profil (mise à jour)
    if (!existing || (excludeId && existing.id === excludeId)) {
      return slug
    }

    // Ajouter un suffixe numérique
    slug = `${baseSlug}-${counter}`
    counter++
  }
}

/**
 * Résoudre un slug ou un ID en userId
 * Supporte les deux formats : slug lisible ou cuid
 */
export async function resolveProfileSlug(slugOrId: string): Promise<{
  userId: string
  profileType: "player" | "agent" | "club"
} | null> {
  // Vérifier d'abord si c'est un userId direct (cuid format)
  const isCuid = /^c[a-z0-9]{24,}$/i.test(slugOrId)

  if (isCuid) {
    // Chercher par userId
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

  // Chercher par slug dans les 3 types de profils
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
