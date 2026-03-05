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
  console.error("API Error:", error)

  if (error instanceof ZodError) {
    return errorResponse("Données invalides", 400, error.errors)
  }

  if (error instanceof Error) {
    // Erreurs métier connues
    if (error.message.includes("Non authentifié")) {
      return errorResponse(error.message, 401)
    }
    if (error.message.includes("Accès interdit") || error.message.includes("permission")) {
      return errorResponse(error.message, 403)
    }
    if (error.message.includes("Non trouvé") || error.message.includes("n'existe pas")) {
      return errorResponse(error.message, 404)
    }

    return errorResponse(error.message, 400)
  }

  return errorResponse("Erreur serveur", 500)
}

export async function parseBody<T>(request: Request): Promise<T> {
  try {
    return await request.json()
  } catch {
    throw new Error("Corps de requête invalide")
  }
}
