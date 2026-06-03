"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  PLACES_FALLBACK_HINT,
  usePlacesAutocompleteApi,
} from "@/hooks/use-places-autocomplete-api"

interface AddressAutocompleteProps {
  id?: string
  value?: string
  onValueChange: (address: string) => void
  /** Code ISO du pays (ex. "fr") pour restreindre les suggestions */
  countryRestriction?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

const plainInputClassName =
  "flex h-11 w-full rounded-md border border-stadium-200 bg-stadium-50/50 px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-500/30 focus-visible:border-pitch-400 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground"

function PlacesFallbackHint() {
  return (
    <p className="text-xs text-amber-700 mt-1.5" role="status">
      {PLACES_FALLBACK_HINT}
    </p>
  )
}

function PlainAddressInput({
  id,
  value,
  onValueChange,
  placeholder,
  className,
  disabled,
  showFallbackHint = false,
}: AddressAutocompleteProps & { showFallbackHint?: boolean }) {
  return (
    <div>
      <input
        id={id}
        type="text"
        value={value ?? ""}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="street-address"
        className={cn(plainInputClassName, className)}
      />
      {showFallbackHint && <PlacesFallbackHint />}
    </div>
  )
}

export function AddressAutocomplete({
  id,
  value,
  onValueChange,
  countryRestriction,
  placeholder = "Rechercher une adresse…",
  className,
  disabled = false,
}: AddressAutocompleteProps) {
  const {
    inputValue,
    setValue: setInputValue,
    suggestions,
    status,
    serviceUnavailable,
    clearSuggestions,
  } = usePlacesAutocompleteApi({
    mode: "address",
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
      <PlainAddressInput
        id={id}
        value={value ?? inputValue}
        onValueChange={onValueChange}
        placeholder={placeholder}
        className={className}
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
        inputWrapperRef.current &&
        !inputWrapperRef.current.contains(target) &&
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
    setInputValue(description, false)
    onValueChange(description)
    clearSuggestions()
    setIsFocused(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setInputValue(next)
    onValueChange(next)
  }

  const handleBlur = () => {
    onValueChange(inputValue)
    setIsFocused(false)
    clearSuggestions()
  }

  const dropdown = showSuggestions ? (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="rounded-xl border border-stadium-200 bg-white shadow-lg overflow-hidden"
    >
      <div className="max-h-60 overflow-y-auto p-1">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.placeId}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleSelect(suggestion.description)}
            className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2.5 text-sm outline-none hover:bg-pitch-50"
          >
            <MapPin className="h-4 w-4 shrink-0 text-stadium-400" />
            <div className="flex flex-col items-start text-left">
              <span className="font-medium text-stadium-900">{suggestion.mainText}</span>
              {suggestion.secondaryText && (
                <span className="text-xs text-stadium-500">{suggestion.secondaryText}</span>
              )}
            </div>
          </button>
        ))}
      </div>
      <div className="border-t border-stadium-100 px-3 py-1.5">
        <p className="text-[10px] text-stadium-400 text-right">Powered by Google</p>
      </div>
    </div>
  ) : null

  return (
    <div className="relative">
      <div ref={inputWrapperRef} className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stadium-400 pointer-events-none" />
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="street-address"
          className={cn(
            "flex h-11 w-full rounded-md border border-stadium-200 bg-stadium-50/50 pl-9 pr-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-500/30 focus-visible:border-pitch-400 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground",
            className
          )}
        />
      </div>

      {typeof document !== "undefined" && createPortal(dropdown, document.body)}
    </div>
  )
}
