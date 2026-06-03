"use client"

import * as React from "react"
import type { PlacesAutocompleteMode, PlacesSuggestion } from "@/lib/google/places-autocomplete"

export const PLACES_FALLBACK_HINT =
  "L'autocomplétion d'adresse est indisponible. Vous pouvez saisir l'adresse manuellement."

type AutocompleteStatus = "IDLE" | "LOADING" | "OK" | "ERROR"

export function usePlacesAutocompleteApi(options: {
  mode: PlacesAutocompleteMode
  countryRestriction?: string
  debounce?: number
}) {
  const { mode, countryRestriction, debounce = 300 } = options
  const [inputValue, setInputValueState] = React.useState("")
  const [suggestions, setSuggestions] = React.useState<PlacesSuggestion[]>([])
  const [status, setStatus] = React.useState<AutocompleteStatus>("IDLE")
  const [serviceUnavailable, setServiceUnavailable] = React.useState(false)
  const requestIdRef = React.useRef(0)

  const setValue = React.useCallback((next: string, shouldFetch = true) => {
    setInputValueState(next)
    if (!shouldFetch) return
    if (!next.trim()) {
      setSuggestions([])
      setStatus("IDLE")
    }
  }, [])

  const clearSuggestions = React.useCallback(() => {
    setSuggestions([])
    setStatus("IDLE")
  }, [])

  React.useEffect(() => {
    const query = inputValue.trim()
    if (query.length < 2) {
      setSuggestions([])
      setStatus("IDLE")
      return
    }

    const requestId = ++requestIdRef.current
    setStatus("LOADING")

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/places/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: query,
            mode,
            countryCode: countryRestriction,
          }),
        })

        if (requestId !== requestIdRef.current) return

        const data = (await res.json()) as {
          suggestions?: PlacesSuggestion[]
          error?: string
        }

        if (!res.ok) {
          setSuggestions([])
          setStatus("ERROR")
          if (res.status === 503 || res.status === 502) {
            setServiceUnavailable(true)
          }
          return
        }

        setServiceUnavailable(false)
        const nextSuggestions = data.suggestions ?? []
        setSuggestions(nextSuggestions)
        setStatus(nextSuggestions.length > 0 ? "OK" : "IDLE")
      } catch {
        if (requestId !== requestIdRef.current) return
        setSuggestions([])
        setStatus("ERROR")
        setServiceUnavailable(true)
      }
    }, debounce)

    return () => clearTimeout(timer)
  }, [inputValue, mode, countryRestriction, debounce])

  return {
    inputValue,
    setValue,
    suggestions,
    status,
    serviceUnavailable,
    clearSuggestions,
  }
}
