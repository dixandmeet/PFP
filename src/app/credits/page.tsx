import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

/**
 * Page /credits — redirige vers la page crédits correspondant au rôle de l'utilisateur.
 *
 * Nécessaire car les URLs Stripe (success_url / cancel_url) redirigent vers /credits
 * après un paiement, mais les vraies pages crédits sont sous /player/credits,
 * /agent/credits, /club/credits ou /admin/credits.
 */
export default async function CreditsRedirectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const role = session.user.role

  const basePath =
    role === "CLUB" || role === "CLUB_STAFF"
      ? "/club/credits"
      : role === "AGENT"
        ? "/agent/credits"
        : role === "ADMIN"
          ? "/admin/credits"
          : "/player/credits"

  // Préserver les query params (ex: ?success=true&session_id=...)
  const params = await searchParams
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      qs.set(key, value)
    } else if (Array.isArray(value)) {
      for (const v of value) qs.append(key, v)
    }
  }

  const queryString = qs.toString()
  redirect(queryString ? `${basePath}?${queryString}` : basePath)
}
