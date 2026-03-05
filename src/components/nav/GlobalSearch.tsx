"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, User, Building2, Briefcase, Loader2, X, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface Player {
  id: string
  userId: string
  firstName: string
  lastName: string
  displayName?: string
  primaryPosition?: string
  profilePicture?: string
  currentClub?: string
}

interface Club {
  id: string
  userId: string
  clubName: string
  shortName?: string
  logo?: string
  league?: string
  country?: string
}

interface Agent {
  id: string
  userId: string
  firstName: string
  lastName: string
  agencyName?: string
  profilePicture?: string
}

interface SearchResults {
  players: Player[]
  clubs: Club[]
  agents: Agent[]
}

// Cache LRU pour stocker les résultats de recherche
const MAX_CACHE_SIZE = 50
const searchCache = new Map<string, { results: SearchResults; timestamp: number }>()

function getFromCache(query: string): SearchResults | null {
  const normalizedQuery = query.toLowerCase().trim()
  const cached = searchCache.get(normalizedQuery)
  
  if (cached) {
    // Cache valide pendant 5 minutes
    if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.results
    }
    // Cache expiré, on le supprime
    searchCache.delete(normalizedQuery)
  }
  return null
}

function setInCache(query: string, results: SearchResults) {
  const normalizedQuery = query.toLowerCase().trim()
  
  // Stratégie LRU : supprimer les entrées les plus anciennes si on dépasse la limite
  if (searchCache.size >= MAX_CACHE_SIZE) {
    const firstKey = searchCache.keys().next().value
    if (firstKey) {
      searchCache.delete(firstKey)
    }
  }
  
  searchCache.set(normalizedQuery, { results, timestamp: Date.now() })
}

export function GlobalSearch() {
  const router = useRouter()
  const { data: session } = useSession()
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResults>({
    players: [],
    clubs: [],
    agents: [],
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // URL de recherche unifiée
  const searchUrl = "/search"

  // Debounce search
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null)

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ players: [], clubs: [], agents: [] })
      setLoading(false)
      return
    }

    // Vérifier le cache d'abord
    const cachedResults = getFromCache(searchQuery)
    if (cachedResults) {
      setResults(cachedResults)
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      // Utiliser l'API de recherche unifiée
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&limit=5`)
      
      if (!response.ok) {
        throw new Error("Erreur de recherche")
      }

      const data = await response.json()
      
      const searchResults: SearchResults = {
        players: data.players || [],
        clubs: data.clubs || [],
        agents: data.agents || [],
      }

      // Stocker dans le cache
      setInCache(searchQuery, searchResults)
      setResults(searchResults)
    } catch (error) {
      console.error("Search error:", error)
      setResults({ players: [], clubs: [], agents: [] })
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle input change with debounce
  const handleInputChange = (value: string) => {
    setQuery(value)
    setIsOpen(true)

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current)
    }

    if (value.trim()) {
      setLoading(true)
      searchDebounceRef.current = setTimeout(() => {
        performSearch(value)
      }, 300)
    } else {
      setResults({ players: [], clubs: [], agents: [] })
      setLoading(false)
    }
  }

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  // Navigate to profile
  const handleSelect = (type: "player" | "club" | "agent", userId: string) => {
    setIsOpen(false)
    setQuery("")
    router.push(`/profile/${userId}`)
  }

  const hasResults = results.players.length > 0 || results.clubs.length > 0 || results.agents.length > 0
  const showDropdown = isOpen && (query.trim().length > 0)

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stadium-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher joueurs, clubs, agents..."
          className={cn(
            "w-full h-10 pl-10 pr-10 rounded-xl border-2 bg-white text-sm transition-all duration-200",
            "placeholder:text-stadium-400",
            "focus:outline-none focus:ring-2 focus:ring-pitch-500 focus:ring-offset-1",
            isOpen && hasResults
              ? "border-pitch-300 rounded-b-none"
              : "border-stadium-200 hover:border-stadium-300"
          )}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("")
              setResults({ players: [], clubs: [], agents: [] })
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-stadium-100 transition-colors"
          >
            <X className="h-3 w-3 text-stadium-400" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-0 bg-white border-2 border-t-0 border-pitch-300 rounded-b-xl shadow-lg overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-pitch-600" />
                <span className="ml-2 text-sm text-stadium-600">Recherche...</span>
              </div>
            ) : hasResults ? (
              <div className="max-h-80 overflow-y-auto">
                {/* Players */}
                {results.players.length > 0 && (
                  <div>
                    <div className="px-3 py-2 bg-pitch-50 border-b border-pitch-100">
                      <span className="text-xs font-bold text-pitch-700 uppercase tracking-wide flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Joueurs
                      </span>
                    </div>
                    {results.players.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => handleSelect("player", player.userId)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-pitch-50 transition-colors text-left"
                      >
                        <div className="relative h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-pitch-100 to-pitch-200 flex-shrink-0">
                          {player.profilePicture ? (
                            <Image
                              src={player.profilePicture}
                              alt={player.firstName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <User className="h-4 w-4 text-pitch-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-stadium-800 truncate">
                            {player.displayName || `${player.firstName} ${player.lastName}`}
                          </p>
                          <p className="text-xs text-stadium-500 truncate">
                            {player.primaryPosition}
                            {player.currentClub && ` • ${player.currentClub}`}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Clubs */}
                {results.clubs.length > 0 && (
                  <div>
                    <div className="px-3 py-2 bg-victory-50 border-b border-victory-100">
                      <span className="text-xs font-bold text-victory-700 uppercase tracking-wide flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        Clubs
                      </span>
                    </div>
                    {results.clubs.map((club) => (
                      <button
                        key={club.id}
                        onClick={() => handleSelect("club", club.userId)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-victory-50 transition-colors text-left"
                      >
                        <div className="relative h-9 w-9 rounded-lg overflow-hidden bg-gradient-to-br from-victory-100 to-victory-200 flex-shrink-0">
                          {club.logo ? (
                            <Image
                              src={club.logo}
                              alt={club.clubName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Building2 className="h-4 w-4 text-victory-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-stadium-800 truncate">
                            {club.clubName}
                          </p>
                          <p className="text-xs text-stadium-500 truncate">
                            {club.league}
                            {club.country && ` • ${club.country}`}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Agents */}
                {results.agents.length > 0 && (
                  <div>
                    <div className="px-3 py-2 bg-gold-50 border-b border-gold-100">
                      <span className="text-xs font-bold text-gold-700 uppercase tracking-wide flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        Agents
                      </span>
                    </div>
                    {results.agents.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => handleSelect("agent", agent.userId)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gold-50 transition-colors text-left"
                      >
                        <div className="relative h-9 w-9 rounded-full overflow-hidden bg-gradient-to-br from-gold-100 to-gold-200 flex-shrink-0">
                          {agent.profilePicture ? (
                            <Image
                              src={agent.profilePicture}
                              alt={agent.firstName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <Briefcase className="h-4 w-4 text-gold-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-stadium-800 truncate">
                            {agent.firstName} {agent.lastName}
                          </p>
                          <p className="text-xs text-stadium-500 truncate">
                            {agent.agencyName || "Agent indépendant"}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Search className="h-8 w-8 text-stadium-300 mx-auto mb-2" />
                <p className="text-sm text-stadium-500">Aucun résultat pour "{query}"</p>
              </div>
            )}

            {/* Bouton Approfondir la recherche */}
            {query.trim() && (
              <Link
                href={`${searchUrl}?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pitch-50 to-pitch-100 border-t border-pitch-200 text-pitch-700 hover:from-pitch-100 hover:to-pitch-200 transition-colors group"
              >
                <span className="text-sm font-semibold">Approfondir la recherche</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
