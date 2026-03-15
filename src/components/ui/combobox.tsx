"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface ComboboxOption {
  value: string
  label: string
  sublabel?: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  buttonClassName?: string
  disabled?: boolean
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Sélectionner...",
  searchPlaceholder = "Rechercher...",
  emptyText = "Aucun résultat.",
  className,
  buttonClassName,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({})

  const selectedOption = options.find((option) => option.value === value)

  const filteredOptions = React.useMemo(() => {
    if (!search) return options
    const searchLower = search.toLowerCase()
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchLower) ||
        option.sublabel?.toLowerCase().includes(searchLower)
    )
  }, [options, search])

  // Positionner le dropdown sous le bouton
  const updatePosition = React.useCallback(() => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    })
  }, [])

  // Mettre à jour la position quand on ouvre et lors du scroll/resize
  React.useEffect(() => {
    if (!open) return
    updatePosition()
    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)
    return () => {
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
    }
  }, [open, updatePosition])

  // Fermer quand on clique en dehors
  React.useEffect(() => {
    if (!open) return
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  // Focus sur l'input quand on ouvre
  React.useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  const dropdown = open ? (
    <div ref={dropdownRef} style={dropdownStyle} className="rounded-md border bg-popover shadow-lg">
      <div className="flex items-center border-b px-3">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex h-10 w-full bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="max-h-60 overflow-y-auto p-1">
        {filteredOptions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          filteredOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onValueChange(option.value)
                setOpen(false)
                setSearch("")
              }}
              className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                value === option.value && "bg-accent"
              )}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === option.value ? "opacity-100" : "opacity-0"
                )}
              />
              <div className="flex flex-col items-start">
                <span>{option.label}</span>
                {option.sublabel && (
                  <span className="text-xs text-muted-foreground">{option.sublabel}</span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  ) : null

  return (
    <div className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!disabled) {
            setOpen(!open)
          }
        }}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border-2 border-pitch-100 bg-background px-3 py-2 text-sm focus:border-pitch-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          !selectedOption && "text-muted-foreground",
          buttonClassName
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </button>

      {typeof document !== "undefined" && createPortal(dropdown, document.body)}
    </div>
  )
}
