// Guard server-side : vérifie que le club est ACTIVE
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

/**
 * Vérifie que l'utilisateur a un club avec le statut ACTIVE.
 * Redirige vers /club/onboarding si le club n'est pas actif.
 * 
 * Utilisation dans les layouts/pages server components :
 * ```ts
 * await requireActiveClub(session.user.id)
 * ```
 */
export async function requireActiveClub(userId: string): Promise<{
  club: {
    id: string
    clubName: string
    status: string
    slug: string | null
  }
}> {
  const club = await prisma.clubProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      clubName: true,
      status: true,
      slug: true,
    },
  })

  // Pas de club du tout → onboarding
  if (!club) {
    redirect("/club/onboarding")
  }

  // Club pas actif → onboarding
  if (club.status !== "ACTIVE") {
    redirect("/club/onboarding")
  }

  return { club }
}

/**
 * Vérifie si le club est actif (sans redirection).
 * Utile pour les API routes ou la logique conditionnelle.
 */
export async function isClubActive(userId: string): Promise<boolean> {
  const club = await prisma.clubProfile.findUnique({
    where: { userId },
    select: { status: true },
  })

  return club?.status === "ACTIVE"
}

/**
 * Vérifie que le club est actif pour les API routes.
 * Retourne une erreur formatée si le club n'est pas actif.
 */
export async function checkClubActiveForApi(userId: string): Promise<{
  active: boolean
  error?: string
  clubId?: string
}> {
  const club = await prisma.clubProfile.findUnique({
    where: { userId },
    select: { id: true, status: true },
  })

  if (!club) {
    return { active: false, error: "Aucun club associé à ce compte" }
  }

  if (club.status !== "ACTIVE") {
    const messages: Record<string, string> = {
      DRAFT: "Votre club est en cours de création. Veuillez compléter l'onboarding.",
      PENDING_REVIEW: "Votre club est en cours de vérification par notre équipe.",
      REJECTED: "Votre demande de club a été refusée. Veuillez corriger et resoumettre.",
    }
    return {
      active: false,
      error: messages[club.status] || "Votre club n'est pas actif",
    }
  }

  return { active: true, clubId: club.id }
}
