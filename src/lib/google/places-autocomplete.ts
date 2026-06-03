export type PlacesAutocompleteMode = "address" | "city"

export type PlacesSuggestion = {
  placeId: string
  description: string
  mainText: string
  secondaryText: string
}

type GoogleAutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string
      text?: { text?: string }
      structuredFormat?: {
        mainText?: { text?: string }
        secondaryText?: { text?: string }
      }
    }
  }>
  error?: { message?: string; status?: string }
}

function getPlacesApiKey(): string | undefined {
  return (
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ||
    undefined
  )
}

export function isPlacesAutocompleteConfigured(): boolean {
  return !!getPlacesApiKey()
}

export async function fetchPlacesAutocompleteSuggestions(params: {
  input: string
  mode: PlacesAutocompleteMode
  countryCode?: string
  languageCode?: string
}): Promise<{ suggestions: PlacesSuggestion[]; error?: string }> {
  const apiKey = getPlacesApiKey()
  if (!apiKey) {
    return { suggestions: [], error: "missing_api_key" }
  }

  const input = params.input.trim()
  if (input.length < 2) {
    return { suggestions: [] }
  }

  const body: Record<string, unknown> = {
    input,
    languageCode: params.languageCode ?? "fr",
  }

  if (params.countryCode) {
    body.includedRegionCodes = [params.countryCode.toLowerCase()]
  }

  if (params.mode === "city") {
    body.includedPrimaryTypes = ["(cities)"]
  }

  const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  const data = (await response.json()) as GoogleAutocompleteResponse

  if (!response.ok) {
    const message = data.error?.message ?? response.statusText
    return { suggestions: [], error: message }
  }

  const suggestions: PlacesSuggestion[] = []
  for (const item of data.suggestions ?? []) {
    const prediction = item.placePrediction
    if (!prediction?.placeId) continue

    const description = prediction.text?.text ?? ""
    const mainText =
      prediction.structuredFormat?.mainText?.text ?? description.split(",")[0]?.trim() ?? ""
    const secondaryText = prediction.structuredFormat?.secondaryText?.text ?? ""

    suggestions.push({
      placeId: prediction.placeId,
      description: description || mainText,
      mainText,
      secondaryText,
    })
  }

  return { suggestions }
}
