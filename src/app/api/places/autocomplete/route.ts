import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  fetchPlacesAutocompleteSuggestions,
  isPlacesAutocompleteConfigured,
  type PlacesAutocompleteMode,
} from "@/lib/google/places-autocomplete"
import { checkAndRecordRateLimit } from "@/lib/rate-limit/api-rate-limit"
import { getClientIp } from "@/lib/request-ip"
import { handleApiError } from "@/lib/utils/api-helpers"

const PLACES_MAX_PER_IP = 60
const PLACES_IP_WINDOW_MS = 60 * 1000

const bodySchema = z.object({
  input: z.string().max(200),
  mode: z.enum(["address", "city"]).default("address"),
  countryCode: z
    .string()
    .length(2)
    .optional()
    .transform((v) => v?.toLowerCase()),
})

export async function POST(request: NextRequest) {
  try {
    if (!isPlacesAutocompleteConfigured()) {
      return NextResponse.json(
        { error: "Places API non configurée", suggestions: [] },
        { status: 503 }
      )
    }

    const clientIp = getClientIp(request) ?? "unknown"
    const ipLimit = await checkAndRecordRateLimit(
      "places_autocomplete_ip",
      clientIp,
      PLACES_MAX_PER_IP,
      PLACES_IP_WINDOW_MS
    )
    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          error: "Trop de requêtes. Réessayez dans quelques instants.",
          retryAfter: ipLimit.retryAfterSec,
          suggestions: [],
        },
        { status: 429 }
      )
    }

    const json = await request.json()
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Requête invalide", suggestions: [] },
        { status: 400 }
      )
    }

    const { input, mode, countryCode } = parsed.data
    const result = await fetchPlacesAutocompleteSuggestions({
      input,
      mode: mode as PlacesAutocompleteMode,
      countryCode,
    })

    if (result.error) {
      return NextResponse.json(
        { error: result.error, suggestions: [] },
        { status: 502 }
      )
    }

    return NextResponse.json({ suggestions: result.suggestions })
  } catch (error) {
    return handleApiError(error)
  }
}
