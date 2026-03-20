// API helpers
import { NextResponse } from "next/server"
import { ZodError } from "zod"

export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status })
}

export function errorResponse(error: string, status: number = 400, details?: any) {
  return NextResponse.json(
    { error, ...(details && { details }) },
    { status }
  )
}

export function handleApiError(error: unknown) {
  // Log complet côté serveur uniquement
  console.error("API Error:", error)

  if (error instanceof ZodError) {
    // Renvoyer seulement les champs en erreur, pas les valeurs
    const safeErrors = error.errors.map((e) => ({
      path: e.path,
      message: e.message,
    }))
    return errorResponse("Données invalides", 400, safeErrors)
  }

  if (error instanceof Error) {
    // Erreurs métier connues — messages safe à renvoyer
    if (error.message.includes("Non authentifié")) {
      return errorResponse("Non authentifié", 401)
    }
    if (
      error.message.includes("Accès interdit") ||
      error.message.includes("permission") ||
      error.message.includes("Réservé aux joueurs")
    ) {
      return errorResponse(
        error.message.includes("Réservé aux joueurs")
          ? error.message
          : "Accès interdit",
        403
      )
    }
    if (error.message.includes("Non trouvé") || error.message.includes("n'existe pas")) {
      return errorResponse("Ressource non trouvée", 404)
    }
    if (error.message.includes("Aucun fichier")) {
      return errorResponse("Aucun fichier fourni", 400)
    }
    if (error.message.includes("Corps de requête invalide")) {
      return errorResponse("Corps de requête invalide", 400)
    }

    // Prisma errors — ne JAMAIS exposer les détails internes
    const isPrismaError =
      error.message.includes("prisma") ||
      error.message.includes("Prisma") ||
      error.message.includes("Invalid value for argument") ||
      error.message.includes("invocation") ||
      error.constructor.name.includes("Prisma")
    if (isPrismaError) {
      return errorResponse("Erreur de base de données", 500)
    }

    // Toute autre erreur — message générique (ne pas exposer error.message brut)
    return errorResponse("Une erreur est survenue", 400)
  }

  return errorResponse("Erreur serveur interne", 500)
}

export async function parseBody<T>(request: Request): Promise<T> {
  try {
    return await request.json()
  } catch {
    throw new Error("Corps de requête invalide")
  }
}
