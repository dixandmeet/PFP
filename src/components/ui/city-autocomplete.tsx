"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Search, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  PLACES_FALLBACK_HINT,
  usePlacesAutocompleteApi,
} from "@/hooks/use-places-autocomplete-api"

interface CityAutocompleteProps {
  value?: string
  onValueChange: (city: string) => void
  /** ISO country code to restrict results (e.g. "fr", "de") */
  countryRestriction?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

const plainInputClassName =
  "flex h-12 w-full rounded-md border-2 border-pitch-100 bg-background pl-9 pr-3 py-2 text-sm transition-colors focus:border-pitch-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground"

function PlacesFallbackHint() {
  return (
    <p className="text-xs text-amber-700 mt-1.5" role="status">
      {PLACES_FALLBACK_HINT}
    </p>
  )
}

function PlainCityInput({
  value,
  onValueChange,
  placeholder,
  className,
  disabled,
  showFallbackHint = false,
}: CityAutocompleteProps & { showFallbackHint?: boolean }) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={plainInputClassName}
      />
      {showFallbackHint && <PlacesFallbackHint />}
    </div>
  )
}

export function CityAutocomplete({
  value,
  onValueChange,
  countryRestriction,
  placeholder = "Rechercher une ville...",
  className,
  disabled = false,
}: CityAutocompleteProps) {
  const {
    inputValue,
    setValue: setInputValue,
    suggestions,
    status,
    serviceUnavailable,
    clearSuggestions,
  } = usePlacesAutocompleteApi({
    mode: "city",
    countryRestriction,
    debounce: 300,
  })

  const inputWrapperRef = React.useRef<HTMLDivElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = React.useState(false)
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({})

  React.useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value, false)
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  if (serviceUnavailable) {
    return (
      <PlainCityInput
        value={value ?? inputValue}
        onValueChange={onValueChange}
        placeholder={placeholder}
        disabled={disabled}
        showFallbackHint
      />
    )
  }

  const updatePosition = React.useCallback(() => {
    if (!inputWrapperRef.current) return
    const rect = inputWrapperRef.current.getBoundingClientRect()
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    })
  }, [])

  const showSuggestions = isFocused && status === "OK" && suggestions.length > 0

  React.useEffect(() => {
    if (!showSuggestions) return
    updatePosition()
    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)
    return () => {
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
    }
  }, [showSuggestions, updatePosition])

  React.useEffect(() => {
    if (!isFocused) return
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        inputWrapperRef.current && !inputWrapperRef.current.contains(target) &&
        (!dropdownRef.current || !dropdownRef.current.contains(target))
      ) {
        setIsFocused(false)
        clearSuggestions()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isFocused, clearSuggestions])

  const handleSelect = (description: string) => {
    const cityName = description.split(",")[0].trim()
    setInputValue(cityName, false)
    onValueChange(cityName)
    clearSuggestions()
    setIsFocused(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setInputValue(next)
    onValueChange(next)
  }

  const dropdown = showSuggestions ? (
    <div ref={dropdownRef} style={dropdownStyle} className="rounded-md border bg-popover shadow-lg overflow-hidden">
      <div className="max-h-60 overflow-y-auto p-1">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.placeId}
            type="button"
            onClick={() => handleSelect(suggestion.description)}
            className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-2.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
          >
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-col items-start">
              <span className="font-medium">{suggestion.mainText}</span>
              {suggestion.secondaryText && (
                <span className="text-xs text-muted-foreground">{suggestion.secondaryText}</span>
              )}
            </div>
          </button>
        ))}
      </div>
      <div className="border-t px-3 py-1.5">
        <p className="text-[10px] text-muted-foreground text-right">Powered by Google</p>
      </div>
    </div>
  ) : null

  return (
    <div className={cn("relative", className)}>
      <div ref={inputWrapperRef} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          disabled={disabled}
          placeholder={placeholder}
          className={plainInputClassName}
        />
      </div>

      {typeof document !== "undefined" && createPortal(dropdown, document.body)}
    </div>
  )
}
