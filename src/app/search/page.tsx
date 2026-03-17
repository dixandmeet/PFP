"use client"

import { useState, useEffect, useCallback, useMemo, useRef, Suspense, memo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  User, 
  Building2, 
  Briefcase, 
  Loader2, 
  ArrowLeft,
  X,
  TrendingUp,
  ChevronRight,
  Globe,
  Clock,
  UserPlus,
  Check,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getPlayerInitials, getClubInitials } from "@/lib/utils/initials"
import { generateSlug } from "@/lib/utils/slug"

type SearchType = "all" | "clubs" | "players" | "agents"

interface LocalPlayer {
  id: string
  userId: string
  firstName: string
  lastName: string
  displayName?: string
  primaryPosition?: string
  profilePicture?: string
  currentClub?: string
}

interface LocalClub {
  id: string
  userId: string
  clubName: string
  shortName?: string
  logo?: string
  league?: string
  country?: string
}

interface LocalAgent {
  id: string
  userId: string
  firstName: string
  lastName: string
  agencyName?: string
  profilePicture?: string
}

// Joueurs football enregistrés dans la BDD (provenant de TheSportsDB/API-Football)
interface FootballPlayer {
  id: string
  name: string
  position: string | null
  nationality: string | null
  dateOfBirth: Date | null
  number: number | null
  image: string | null
  cutout: string | null
  teamName: string | null
  sportsDbId: string | null
  apiFootballId: number | null
}

// Équipes football enregistrées dans la BDD (provenant de TheSportsDB/API-Football)
interface FootballTeam {
  id: string
  name: string
  shortName: string | null
  country: string
  league: string | null
  logo: string | null
  sportsDbId: string | null
  apiFootballId: number | null
}

interface ExternalClub {
  id: string
  name: string
  shortName: string
  logo: string | null
  country: string
  league: string | null
  externalIds?: {
    sportsDb?: string
  }
}

interface ExternalPlayer {
  id: string
  name: string
  position: string
  nationality: string
  image: string | null
  dateOfBirth: string | null
  externalIds?: {
    sportsDb?: string
  }
}

interface LocalResults {
  players: LocalPlayer[]
  clubs: LocalClub[]
  agents: LocalAgent[]
  footballPlayers: FootballPlayer[]
  footballTeams: FootballTeam[]
}

interface ExternalResults {
  clubs: ExternalClub[]
  players: ExternalPlayer[]
}

// Type unifié pour les joueurs (plateforme + football)
interface UnifiedPlayer {
  id: string
  name: string
  position: string | null
  nationality: string | null
  image: string | null
  teamName?: string | null
  href: string
  type: "profile" | "football"
}

// Type unifié pour les clubs (plateforme + football)
interface UnifiedClub {
  id: string
  name: string
  shortName: string | null
  logo: string | null
  league: string | null
  country: string | null
  href: string
  type: "profile" | "football"
}

// Types pour les suggestions
interface SuggestionClub {
  id: string
  userId?: string
  clubName?: string
  name?: string
  shortName?: string | null
  logo?: string | null
  league?: string | null
  country?: string | null
  isFollowing: boolean
  entityType: "CLUB"
}

interface SuggestionPlayer {
  id: string
  userId?: string
  firstName?: string
  lastName?: string
  displayName?: string
  name?: string
  primaryPosition?: string
  position?: string | null
  profilePicture?: string | null
  image?: string | null
  cutout?: string | null
  currentClub?: string
  teamName?: string | null
  nationality?: string | null
  isFollowing: boolean
  entityType: "PLAYER"
}

interface SuggestionAgent {
  id: string
  userId: string
  firstName: string
  lastName: string
  agencyName?: string
  profilePicture?: string | null
  isFollowing: boolean
  entityType: "AGENT"
}

interface SuggestionsData {
  clubs: SuggestionClub[]
  players: SuggestionPlayer[]
  agents: SuggestionAgent[]
  footballTeams: SuggestionClub[]
  footballPlayers: SuggestionPlayer[]
}

// Props partagées pour les cartes de suggestion
interface SuggestionCardProps {
  followingStates: Record<string, boolean>
  followingLoading: Record<string, boolean>
  handleFollow: (entityId: string, entityType: "CLUB" | "PLAYER" | "AGENT") => void
}

// Composant carte club suggestion (extrait et mémorisé)
const ClubSuggestionCard = memo(function ClubSuggestionCard({ club, followingStates, followingLoading, handleFollow }: { club: SuggestionClub } & SuggestionCardProps) {
  const name = club.clubName || club.name || "Club"
  const initials = getClubInitials(name, club.shortName || undefined)
  const href = club.userId ? `/profile/${club.userId}` : `/football/teams/${generateSlug(name)}`
  const isFollowing = followingStates[club.id] || false
  const isLoading = followingLoading[club.id] || false

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-stadium-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <Link href={href} className="block p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-gradient-to-br from-victory-100 to-victory-200 flex-shrink-0">
            {club.logo ? (
              <Image src={club.logo} alt={name} fill sizes="48px" className="object-contain p-1.5" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <span className="text-sm font-bold text-victory-600">{initials}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-stadium-800 text-sm truncate">{name}</p>
            <p className="text-xs text-stadium-400 truncate">
              {club.league || club.country || "Club"}
            </p>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-3">
        <button
          onClick={(e) => {
            e.preventDefault()
            handleFollow(club.id, "CLUB")
          }}
          disabled={isLoading}
          className={cn(
            "w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all",
            isFollowing
              ? "bg-pitch-100 text-pitch-700 hover:bg-pitch-200"
              : "bg-stadium-100 text-stadium-600 hover:bg-pitch-100 hover:text-pitch-700"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isFollowing ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Suivi
            </>
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5" />
              Suivre
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
})

// Composant carte joueur suggestion (extrait et mémorisé)
const PlayerSuggestionCard = memo(function PlayerSuggestionCard({ player, followingStates, followingLoading, handleFollow }: { player: SuggestionPlayer } & SuggestionCardProps) {
  const name = player.displayName || player.name ||
    (player.firstName && player.lastName ? `${player.firstName} ${player.lastName}` : "Joueur")
  const initials = getPlayerInitials(name)
  const position = player.primaryPosition || player.position || null
  const image = player.profilePicture || player.cutout || player.image
  const team = player.currentClub || player.teamName
  const href = player.userId ? `/profile/${player.userId}` : `/football/players/${player.id}`
  const isFollowing = followingStates[player.id] || false
  const isLoading = followingLoading[player.id] || false

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-stadium-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <Link href={href} className="block p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-pitch-100 to-pitch-200 flex-shrink-0 ring-2 ring-white shadow-sm">
            {image ? (
              <Image src={image} alt={name} fill sizes="48px" className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <span className="text-sm font-bold text-pitch-600">{initials}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-stadium-800 text-sm truncate">{name}</p>
            <p className="text-xs text-stadium-400 truncate">
              {position || "Joueur"}
              {team && ` • ${team}`}
            </p>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-3">
        <button
          onClick={(e) => {
            e.preventDefault()
            handleFollow(player.id, "PLAYER")
          }}
          disabled={isLoading}
          className={cn(
            "w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all",
            isFollowing
              ? "bg-pitch-100 text-pitch-700 hover:bg-pitch-200"
              : "bg-stadium-100 text-stadium-600 hover:bg-pitch-100 hover:text-pitch-700"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isFollowing ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Suivi
            </>
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5" />
              Suivre
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
})

// Composant carte agent suggestion (extrait et mémorisé)
const AgentSuggestionCard = memo(function AgentSuggestionCard({ agent, followingStates, followingLoading, handleFollow }: { agent: SuggestionAgent } & SuggestionCardProps) {
  const name = `${agent.firstName} ${agent.lastName}`
  const initials = `${agent.firstName?.[0] || ""}${agent.lastName?.[0] || ""}`.toUpperCase()
  const href = `/profile/${agent.userId}`
  const isFollowing = followingStates[agent.id] || false
  const isLoading = followingLoading[agent.id] || false

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-stadium-100 overflow-hidden hover:shadow-md transition-shadow"
    >
      <Link href={href} className="block p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-gold-100 to-gold-200 flex-shrink-0 ring-2 ring-white shadow-sm">
            {agent.profilePicture ? (
              <Image src={agent.profilePicture} alt={name} fill sizes="48px" className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <span className="text-sm font-bold text-gold-600">{initials}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-stadium-800 text-sm truncate">{name}</p>
            <p className="text-xs text-stadium-400 truncate">
              {agent.agencyName || "Agent indépendant"}
            </p>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-3">
        <button
          onClick={(e) => {
            e.preventDefault()
            handleFollow(agent.id, "AGENT")
          }}
          disabled={isLoading}
          className={cn(
            "w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all",
            isFollowing
              ? "bg-gold-100 text-gold-700 hover:bg-gold-200"
              : "bg-stadium-100 text-stadium-600 hover:bg-gold-100 hover:text-gold-700"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isFollowing ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Suivi
            </>
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5" />
              Suivre
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
})

const filterTabs: { value: SearchType; label: string; icon: React.ElementType }[] = [
  { value: "all", label: "Tous", icon: Search },
  { value: "clubs", label: "Clubs", icon: Building2 },
  { value: "players", label: "Joueurs", icon: User },
  { value: "agents", label: "Agents", icon: Briefcase },
]

// Suggestions de recherche populaires
const popularSearches = [
  "Paris Saint-Germain",
  "Real Madrid", 
  "Kylian Mbappé",
  "Manchester United",
]

// Historique des recherches - localStorage
const SEARCH_HISTORY_KEY = "pfp_search_history"
const MAX_HISTORY = 10

// Titre dynamique selon le rôle
const getTitleByRole = (role?: string) => {
  switch (role) {
    case "PLAYER": return "Découvrez des opportunités"
    case "CLUB": return "Trouvez votre prochain talent"
    case "AGENT": return "Explorez le marché des talents"
    default: return "Explorez notre réseau"
  }
}

// Sous-titre dynamique selon le rôle
const getSubtitleByRole = (role?: string) => {
  switch (role) {
    case "PLAYER": return "Trouvez des clubs, agents et opportunités de carrière"
    case "CLUB": return "Recherchez des joueurs et des agents pour votre équipe"
    case "AGENT": return "Découvrez des joueurs et des clubs pour vos clients"
    default: return "Explorez notre base de données mondiale de joueurs, clubs et agents"
  }
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-4 border-pitch-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const initialQuery = searchParams.get("q") || ""
  const initialTab = searchParams.get("tab") as SearchType
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Déterminer l'URL du dashboard selon le rôle
  const dashboardUrl = session?.user?.role === "ADMIN"
    ? "/admin"
    : session?.user?.role
      ? `/${session.user.role.toLowerCase()}/dashboard`
      : "/player/dashboard"
  
  // Valider que le tab est une valeur valide
  const validTabs: SearchType[] = ["all", "clubs", "players", "agents"]
  const validInitialTab = validTabs.includes(initialTab) ? initialTab : "all"
  
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [activeFilter, setActiveFilter] = useState<SearchType>(validInitialTab)
  const [loading, setLoading] = useState(false)
  const [loadingExternal, setLoadingExternal] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [localResults, setLocalResults] = useState<LocalResults>({
    players: [],
    clubs: [],
    agents: [],
    footballPlayers: [],
    footballTeams: [],
  })
  const [externalResults, setExternalResults] = useState<ExternalResults>({
    clubs: [],
    players: [],
  })
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // États pour les suggestions et l'historique
  const [suggestions, setSuggestions] = useState<SuggestionsData>({
    clubs: [],
    players: [],
    agents: [],
    footballTeams: [],
    footballPlayers: [],
  })
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({})
  const [followingLoading, setFollowingLoading] = useState<Record<string, boolean>>({})

  // Charger l'historique des recherches depuis localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const history = localStorage.getItem(SEARCH_HISTORY_KEY)
      if (history) {
        try {
          setSearchHistory(JSON.parse(history))
        } catch {
          setSearchHistory([])
        }
      }
    }
  }, [])

  // Sauvegarder une recherche dans l'historique
  const saveToHistory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    setSearchHistory(prev => {
      const filtered = prev.filter(h => h.toLowerCase() !== searchQuery.toLowerCase())
      const newHistory = [searchQuery, ...filtered].slice(0, MAX_HISTORY)
      
      if (typeof window !== "undefined") {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
      }
      
      return newHistory
    })
  }, [])

  // Supprimer un élément de l'historique
  const removeFromHistory = useCallback((searchQuery: string) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(h => h !== searchQuery)
      
      if (typeof window !== "undefined") {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filtered))
      }
      
      return filtered
    })
  }, [])

  // Effacer tout l'historique
  const clearHistory = useCallback(() => {
    setSearchHistory([])
    if (typeof window !== "undefined") {
      localStorage.removeItem(SEARCH_HISTORY_KEY)
    }
  }, [])

  // Charger les suggestions aléatoires
  const loadSuggestions = useCallback(async () => {
    setLoadingSuggestions(true)
    try {
      const type = activeFilter === "all" ? "all" : activeFilter
      const response = await fetch(`/api/search/suggestions?type=${type}&limit=6`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data)
        
        // Mettre à jour les états de suivi
        const newFollowingStates: Record<string, boolean> = {}
        ;[...data.clubs, ...data.footballTeams].forEach((item: SuggestionClub) => {
          newFollowingStates[item.id] = item.isFollowing
        })
        ;[...data.players, ...data.footballPlayers].forEach((item: SuggestionPlayer) => {
          newFollowingStates[item.id] = item.isFollowing
        })
        data.agents?.forEach((item: SuggestionAgent) => {
          newFollowingStates[item.id] = item.isFollowing
        })
        setFollowingStates(prev => ({ ...prev, ...newFollowingStates }))
      }
    } catch (error) {
      console.error("Erreur chargement suggestions:", error)
    } finally {
      setLoadingSuggestions(false)
    }
  }, [activeFilter])

  // Charger les suggestions au montage et quand le filtre change
  useEffect(() => {
    if (!query.trim()) {
      loadSuggestions()
    }
  }, [loadSuggestions, query])

  // Gérer le suivi/désuivi d'une entité
  const handleFollow = useCallback(async (entityId: string, entityType: "CLUB" | "PLAYER" | "AGENT") => {
    if (!session?.user) {
      router.push("/login")
      return
    }

    const isCurrentlyFollowing = followingStates[entityId]
    setFollowingLoading(prev => ({ ...prev, [entityId]: true }))

    try {
      const response = await fetch(`/api/follow/${entityId}`, {
        method: isCurrentlyFollowing ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: entityType }),
      })

      if (response.ok) {
        setFollowingStates(prev => ({ ...prev, [entityId]: !isCurrentlyFollowing }))
      }
    } catch (error) {
      console.error("Erreur follow:", error)
    } finally {
      setFollowingLoading(prev => ({ ...prev, [entityId]: false }))
    }
  }, [session, router, followingStates])

  // Debounce la query pour éviter trop de requêtes
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300) // 300ms de délai

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  // Recherche locale (BDD)
  const searchLocal = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setLocalResults({ players: [], clubs: [], agents: [], footballPlayers: [], footballTeams: [] })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&limit=20`)
      if (response.ok) {
        const data = await response.json()
        setLocalResults({
          players: data.players || [],
          clubs: data.clubs || [],
          agents: data.agents || [],
          footballPlayers: data.footballPlayers || [],
          footballTeams: data.footballTeams || [],
        })
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Recherche externe (TheSportsDB)
  const searchExternal = useCallback(async (searchQuery: string, type: SearchType) => {
    if (!searchQuery.trim()) {
      setExternalResults({ clubs: [], players: [] })
      return
    }

    // Ne pas chercher pour les agents (pas d'API externe)
    if (type === "agents") {
      setExternalResults({ clubs: [], players: [] })
      return
    }

    setLoadingExternal(true)
    try {
      const externalType = type === "all" ? "all" : type
      const response = await fetch(
        `/api/search/external?query=${encodeURIComponent(searchQuery)}&type=${externalType}`
      )
      if (response.ok) {
        const data = await response.json()
        setExternalResults({
          clubs: data.clubs || [],
          players: data.players || [],
        })
      }
    } catch (error) {
      console.error("External search error:", error)
    } finally {
      setLoadingExternal(false)
    }
  }, [])

  // Fusionner et dédupliquer les joueurs
  const unifiedPlayers = useMemo((): UnifiedPlayer[] => {
    const players: UnifiedPlayer[] = []
    const seenSportsDbIds = new Set<string>()
    const seenNames = new Set<string>()

    // 1. Ajouter les joueurs de la plateforme (profils utilisateurs) - priorité haute
    for (const player of localResults.players) {
      const name = player.displayName || `${player.firstName} ${player.lastName}`
      players.push({
        id: player.id,
        name,
        position: player.primaryPosition || null,
        nationality: null,
        image: player.profilePicture || null,
        teamName: player.currentClub,
        href: `/profile/${player.userId}`,
        type: "profile",
      })
      seenNames.add(name.toLowerCase())
    }

    // 2. Ajouter les joueurs football de la BDD (déjà enregistrés)
    for (const player of localResults.footballPlayers) {
      if (player.sportsDbId) {
        seenSportsDbIds.add(player.sportsDbId)
      }
      // Éviter les doublons par nom (cas où un profil utilisateur existe)
      if (!seenNames.has(player.name.toLowerCase())) {
        players.push({
          id: player.id,
          name: player.name,
          position: player.position,
          nationality: player.nationality,
          image: player.cutout || player.image,
          teamName: player.teamName,
          href: `/football/players/${player.id}`,
          type: "football",
        })
        seenNames.add(player.name.toLowerCase())
      }
    }

    // 3. Ajouter les joueurs externes NON DUPLIQUÉS
    for (const player of externalResults.players) {
      // Extraire le sportsDbId de l'ID externe (format: "sportsdb-player-XXXXX" ou juste l'ID)
      const sportsDbId = player.externalIds?.sportsDb || player.id.replace("sportsdb-player-", "")
      
      // Vérifier si déjà présent (par sportsDbId ou par nom)
      if (!seenSportsDbIds.has(sportsDbId) && !seenNames.has(player.name.toLowerCase())) {
        players.push({
          id: player.id,
          name: player.name,
          position: player.position,
          nationality: player.nationality,
          image: player.image,
          href: `/football/players/${player.id}`,
          type: "football",
        })
        seenNames.add(player.name.toLowerCase())
      }
    }

    return players
  }, [localResults.players, localResults.footballPlayers, externalResults.players])

  // Fusionner et dédupliquer les clubs
  const unifiedClubs = useMemo((): UnifiedClub[] => {
    const clubs: UnifiedClub[] = []
    const seenSportsDbIds = new Set<string>()
    const seenNames = new Set<string>()

    // 1. Ajouter les clubs de la plateforme (profils utilisateurs) - priorité haute
    for (const club of localResults.clubs) {
      clubs.push({
        id: club.id,
        name: club.clubName,
        shortName: club.shortName || null,
        logo: club.logo || null,
        league: club.league || null,
        country: club.country || null,
        href: `/profile/${club.userId}`,
        type: "profile",
      })
      seenNames.add(club.clubName.toLowerCase())
    }

    // 2. Ajouter les équipes football de la BDD (déjà enregistrées)
    for (const team of localResults.footballTeams) {
      if (team.sportsDbId) {
        seenSportsDbIds.add(team.sportsDbId)
      }
      // Éviter les doublons par nom
      if (!seenNames.has(team.name.toLowerCase())) {
        clubs.push({
          id: team.id,
          name: team.name,
          shortName: team.shortName,
          logo: team.logo,
          league: team.league,
          country: team.country,
          href: `/football/teams/${generateSlug(team.name)}`,
          type: "football",
        })
        seenNames.add(team.name.toLowerCase())
      }
    }

    // 3. Ajouter les clubs externes NON DUPLIQUÉS
    for (const club of externalResults.clubs) {
      // Extraire le sportsDbId de l'ID externe
      const sportsDbId = club.externalIds?.sportsDb || club.id.replace("sportsdb-team-", "")
      
      // Vérifier si déjà présent
      if (!seenSportsDbIds.has(sportsDbId) && !seenNames.has(club.name.toLowerCase())) {
        clubs.push({
          id: club.id,
          name: club.name,
          shortName: club.shortName,
          logo: club.logo,
          league: club.league,
          country: club.country,
          href: `/football/teams/${generateSlug(club.name)}`,
          type: "football",
        })
        seenNames.add(club.name.toLowerCase())
      }
    }

    return clubs
  }, [localResults.clubs, localResults.footballTeams, externalResults.clubs])

  // Effectuer la recherche automatiquement quand la query change (debounced)
  useEffect(() => {
    if (debouncedQuery.trim()) {
      // Mettre à jour l'URL sans recharger la page
      const newUrl = `/search?q=${encodeURIComponent(debouncedQuery.trim())}`
      window.history.replaceState({}, '', newUrl)
      
      // Sauvegarder dans l'historique
      saveToHistory(debouncedQuery.trim())
      
      searchLocal(debouncedQuery.trim())
      searchExternal(debouncedQuery.trim(), activeFilter)
    } else {
      // Réinitialiser les résultats si la query est vide
      setLocalResults({ players: [], clubs: [], agents: [], footballPlayers: [], footballTeams: [] })
      setExternalResults({ clubs: [], players: [] })
    }
  }, [debouncedQuery, searchLocal, searchExternal, activeFilter, saveToHistory])

  // Soumettre la recherche (pour le formulaire)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // La recherche se fait automatiquement, pas besoin d'action supplémentaire
  }

  // Changer de filtre
  const handleFilterChange = (filter: SearchType) => {
    setActiveFilter(filter)
    if (query.trim()) {
      searchExternal(query.trim(), filter)
    }
  }

  // Calculer si on a des résultats
  const hasPlayers = unifiedPlayers.length > 0
  const hasClubs = unifiedClubs.length > 0
  const hasAgents = localResults.agents.length > 0
  const hasResults = hasPlayers || hasClubs || hasAgents
  const isSearching = loading || loadingExternal

  // Filtrer les résultats selon le filtre actif
  const showPlayers = activeFilter === "all" || activeFilter === "players"
  const showClubs = activeFilter === "all" || activeFilter === "clubs"
  const showAgents = activeFilter === "all" || activeFilter === "agents"

  // Gérer le clic sur une suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    inputRef.current?.focus()
  }

  // Combiner les clubs pour les suggestions
  const allSuggestedClubs = useMemo(() => {
    return [...suggestions.clubs, ...suggestions.footballTeams].slice(0, 6)
  }, [suggestions.clubs, suggestions.footballTeams])

  // Combiner les joueurs pour les suggestions
  const allSuggestedPlayers = useMemo(() => {
    return [...suggestions.players, ...suggestions.footballPlayers].slice(0, 6)
  }, [suggestions.players, suggestions.footballPlayers])

  return (
    <div className="min-h-screen">
      {/* Header Premium avec gradient */}
      <div className="relative overflow-hidden">
        {/* Background décoratif */}
        <div className="absolute inset-0 bg-gradient-to-br from-pitch-600 via-pitch-700 to-stadium-900" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-pitch-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-4 pt-4 sm:pt-6 pb-20 max-w-4xl">
          {/* Navigation — masquée sur mobile (MobileHeader gère la navigation) */}
          <Link
            href={dashboardUrl}
            className="hidden lg:inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Retour au dashboard</span>
          </Link>

          {/* Titre dynamique selon le rôle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-xs font-medium mb-3 sm:mb-4">
              <Search className="h-3 w-3" />
              Recherche Avancée
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              {getTitleByRole(session?.user?.role)}
            </h1>
            <p className="text-white/60 text-xs sm:text-sm md:text-base">
              {getSubtitleByRole(session?.user?.role)}
            </p>
          </motion.div>

          {/* Barre de recherche premium */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSearch}
            className="relative"
          >
            <div className={cn(
              "relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-apple-xl transition-all duration-300",
              isFocused && "ring-2 ring-white/50 shadow-2xl"
            )}>
              <div className="flex items-center">
                <div className="pl-5">
                  <Search className={cn(
                    "h-5 w-5 transition-colors",
                    isFocused ? "text-pitch-600" : "text-stadium-400"
                  )} />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Joueur, club, agent..."
                  className="flex-1 min-w-0 h-14 px-4 bg-transparent text-stadium-900 placeholder:text-stadium-400 focus:outline-none text-base"
                />
                <AnimatePresence>
                  {query && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      type="button"
                      onClick={() => setQuery("")}
                      className="p-2 rounded-full hover:bg-stadium-100 transition-colors shrink-0"
                    >
                      <X className="h-4 w-4 text-stadium-400" />
                    </motion.button>
                  )}
                </AnimatePresence>
                <Button
                  type="submit"
                  className="h-10 w-10 sm:w-auto sm:px-5 mr-2 rounded-xl bg-gradient-to-r from-pitch-600 to-pitch-700 hover:from-pitch-700 hover:to-pitch-800 text-sm font-medium shrink-0"
                >
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1.5">Rechercher</span>
                </Button>
              </div>
            </div>
          </motion.form>

          {/* Filtres compacts */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-1 mt-4"
          >
            <div className="inline-flex bg-white/10 backdrop-blur-sm rounded-full p-1">
              {filterTabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.value}
                    onClick={() => handleFilterChange(tab.value)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      activeFilter === tab.value
                        ? "bg-white text-stadium-900 shadow-sm"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 pt-6 pb-12 max-w-5xl">
        {/* État de chargement */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-apple-lg p-12"
            >
              <div className="flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-2 border-pitch-200 border-t-pitch-600 animate-spin" />
                </div>
                <span className="mt-4 text-stadium-600 text-sm">Recherche en cours...</span>
              </div>
            </motion.div>
          )}

          {/* Résultats */}
          {!loading && query.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Résumé des résultats */}
              {hasResults && (
                <div className="flex items-center justify-between px-1">
                  <p className="text-sm text-stadium-500">
                    {unifiedPlayers.length + unifiedClubs.length + localResults.agents.length} résultats pour "{query}"
                  </p>
                  {loadingExternal && (
                    <div className="flex items-center gap-2 text-xs text-stadium-400">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Chargement...
                    </div>
                  )}
                </div>
              )}

              {/* Message si aucun résultat */}
              {!hasResults && !isSearching && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl shadow-apple-lg p-12 text-center"
                >
                  <div className="w-16 h-16 bg-stadium-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-stadium-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-stadium-800 mb-2">
                    Aucun résultat trouvé
                  </h3>
                  <p className="text-stadium-500 text-sm mb-4">
                    Aucun résultat pour "{query}". Essayez avec d'autres termes.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {popularSearches.slice(0, 3).map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1.5 bg-stadium-100 hover:bg-stadium-200 rounded-full text-xs text-stadium-600 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Clubs */}
              {showClubs && hasClubs && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-apple overflow-hidden"
                >
                  <div className="px-5 py-3 border-b border-stadium-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-victory-500 to-victory-600 rounded-lg flex items-center justify-center">
                        <Building2 className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="font-semibold text-stadium-800 text-sm">Clubs</span>
                      <span className="text-xs text-stadium-400 bg-stadium-100 px-2 py-0.5 rounded-full">
                        {unifiedClubs.length}
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-stadium-50">
                    {unifiedClubs.slice(0, 6).map((club, index) => {
                      const initials = getClubInitials(club.name, club.shortName || undefined)
                      return (
                        <motion.div
                          key={`${club.type}-${club.id}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            href={club.href}
                            className="flex items-center gap-3 px-5 py-3 hover:bg-stadium-50 transition-colors group"
                          >
                            <div className="relative h-10 w-10 rounded-xl overflow-hidden bg-gradient-to-br from-victory-100 to-victory-200 flex-shrink-0">
                              {club.logo ? (
                                <Image src={club.logo} alt={club.name} fill sizes="40px" className="object-contain p-1.5" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-victory-600">{initials}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-stadium-800 text-sm truncate group-hover:text-victory-700 transition-colors">
                                {club.name}
                              </p>
                              <p className="text-xs text-stadium-400 truncate">
                                {club.league || club.country || "Club"}
                              </p>
                            </div>
                            {club.type === "profile" && (
                              <span className="px-2 py-0.5 bg-pitch-100 text-pitch-700 text-[10px] font-medium rounded-full">
                                Vérifié
                              </span>
                            )}
                            <ChevronRight className="h-4 w-4 text-stadium-300 group-hover:text-stadium-500 transition-colors" />
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>
                  {unifiedClubs.length > 6 && (
                    <div className="px-5 py-3 border-t border-stadium-100 bg-stadium-50/50">
                      <button className="text-xs text-pitch-600 font-medium hover:text-pitch-700">
                        Voir tous les clubs ({unifiedClubs.length})
                      </button>
                    </div>
                  )}
                </motion.section>
              )}

              {/* Joueurs */}
              {showPlayers && hasPlayers && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-apple overflow-hidden"
                >
                  <div className="px-5 py-3 border-b border-stadium-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-pitch-500 to-pitch-600 rounded-lg flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="font-semibold text-stadium-800 text-sm">Joueurs</span>
                      <span className="text-xs text-stadium-400 bg-stadium-100 px-2 py-0.5 rounded-full">
                        {unifiedPlayers.length}
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-stadium-50">
                    {unifiedPlayers.slice(0, 6).map((player, index) => {
                      const initials = getPlayerInitials(player.name)
                      return (
                        <motion.div
                          key={`${player.type}-${player.id}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            href={player.href}
                            className="flex items-center gap-3 px-5 py-3 hover:bg-stadium-50 transition-colors group"
                          >
                            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-pitch-100 to-pitch-200 flex-shrink-0 ring-2 ring-white shadow-sm">
                              {player.image ? (
                                <Image src={player.image} alt={player.name} fill sizes="40px" className="object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <span className="text-sm font-bold text-pitch-600">{initials}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-stadium-800 text-sm truncate group-hover:text-pitch-700 transition-colors">
                                {player.name}
                              </p>
                              <p className="text-xs text-stadium-400 truncate">
                                {player.position || "Joueur"}
                                {player.teamName && ` • ${player.teamName}`}
                              </p>
                            </div>
                            {player.type === "profile" && (
                              <span className="px-2 py-0.5 bg-pitch-100 text-pitch-700 text-[10px] font-medium rounded-full">
                                Profil
                              </span>
                            )}
                            {player.type === "football" && (
                              <span className="px-2 py-0.5 bg-stadium-100 text-stadium-600 text-[10px] font-medium rounded-full flex items-center gap-1">
                                <Globe className="h-2.5 w-2.5" />
                                Pro
                              </span>
                            )}
                            <ChevronRight className="h-4 w-4 text-stadium-300 group-hover:text-stadium-500 transition-colors" />
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>
                  {unifiedPlayers.length > 6 && (
                    <div className="px-5 py-3 border-t border-stadium-100 bg-stadium-50/50">
                      <button className="text-xs text-pitch-600 font-medium hover:text-pitch-700">
                        Voir tous les joueurs ({unifiedPlayers.length})
                      </button>
                    </div>
                  )}
                </motion.section>
              )}

              {/* Agents */}
              {showAgents && hasAgents && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-apple overflow-hidden"
                >
                  <div className="px-5 py-3 border-b border-stadium-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg flex items-center justify-center">
                        <Briefcase className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="font-semibold text-stadium-800 text-sm">Agents</span>
                      <span className="text-xs text-stadium-400 bg-stadium-100 px-2 py-0.5 rounded-full">
                        {localResults.agents.length}
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-stadium-50">
                    {localResults.agents.slice(0, 6).map((agent, index) => {
                      const initials = `${agent.firstName?.[0] || ""}${agent.lastName?.[0] || ""}`.toUpperCase()
                      return (
                        <motion.div
                          key={agent.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link
                            href={`/profile/${agent.userId}`}
                            className="flex items-center gap-3 px-5 py-3 hover:bg-stadium-50 transition-colors group"
                          >
                            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-gold-100 to-gold-200 flex-shrink-0 ring-2 ring-white shadow-sm">
                              {agent.profilePicture ? (
                                <Image src={agent.profilePicture} alt={agent.firstName} fill sizes="40px" className="object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <span className="text-sm font-bold text-gold-600">{initials}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-stadium-800 text-sm truncate group-hover:text-gold-700 transition-colors">
                                {agent.firstName} {agent.lastName}
                              </p>
                              <p className="text-xs text-stadium-400 truncate">
                                {agent.agencyName || "Agent indépendant"}
                              </p>
                            </div>
                            <span className="px-2 py-0.5 bg-gold-100 text-gold-700 text-[10px] font-medium rounded-full">
                              Certifié
                            </span>
                            <ChevronRight className="h-4 w-4 text-stadium-300 group-hover:text-stadium-500 transition-colors" />
                          </Link>
                        </motion.div>
                      )
                    })}
                  </div>
                  {localResults.agents.length > 6 && (
                    <div className="px-5 py-3 border-t border-stadium-100 bg-stadium-50/50">
                      <button className="text-xs text-pitch-600 font-medium hover:text-pitch-700">
                        Voir tous les agents ({localResults.agents.length})
                      </button>
                    </div>
                  )}
                </motion.section>
              )}
            </motion.div>
          )}

          {/* État initial - Écran d'accueil avec suggestions */}
          {!loading && !query.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Historique des recherches */}
              {searchHistory.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-stadium-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-stadium-100 flex items-center justify-center">
                        <Clock className="h-3.5 w-3.5 text-stadium-500" />
                      </div>
                      <h3 className="font-semibold text-stadium-700 text-sm">Recherches récentes</h3>
                    </div>
                    <button
                      onClick={clearHistory}
                      className="text-xs text-stadium-400 hover:text-red-500 transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Effacer
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((term) => (
                      <div
                        key={term}
                        className="flex items-center gap-1 px-3 py-1.5 bg-stadium-50 border border-stadium-200 rounded-xl text-sm text-stadium-600 group"
                      >
                        <button
                          onClick={() => handleSuggestionClick(term)}
                          className="hover:text-pitch-700 transition-colors"
                        >
                          {term}
                        </button>
                        <button
                          onClick={() => removeFromHistory(term)}
                          className="p-0.5 rounded-full hover:bg-stadium-200 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3 text-stadium-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recherches populaires */}
              <div className="bg-white rounded-2xl shadow-lg border border-stadium-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-pitch-100 flex items-center justify-center">
                    <TrendingUp className="h-3.5 w-3.5 text-pitch-600" />
                  </div>
                  <h3 className="font-semibold text-stadium-700 text-sm">Recherches populaires</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3.5 py-2 bg-stadium-50 hover:bg-pitch-50 border border-stadium-200 hover:border-pitch-300 rounded-xl text-sm text-stadium-600 hover:text-pitch-700 transition-all hover:shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggestions en grille */}
              {loadingSuggestions ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 text-pitch-600 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Section Clubs */}
                  {(activeFilter === "all" || activeFilter === "clubs") && allSuggestedClubs.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 bg-gradient-to-br from-victory-500 to-victory-600 rounded-lg flex items-center justify-center">
                          <Building2 className="h-3.5 w-3.5 text-white" />
                        </div>
                        <h3 className="font-semibold text-stadium-800 text-sm">Clubs suggérés</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {allSuggestedClubs.map((club, index) => (
                          <motion.div
                            key={club.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <ClubSuggestionCard club={club} followingStates={followingStates} followingLoading={followingLoading} handleFollow={handleFollow} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section Joueurs */}
                  {(activeFilter === "all" || activeFilter === "players") && allSuggestedPlayers.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 bg-gradient-to-br from-pitch-500 to-pitch-600 rounded-lg flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-white" />
                        </div>
                        <h3 className="font-semibold text-stadium-800 text-sm">Joueurs suggérés</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {allSuggestedPlayers.map((player, index) => (
                          <motion.div
                            key={player.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <PlayerSuggestionCard player={player} followingStates={followingStates} followingLoading={followingLoading} handleFollow={handleFollow} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section Agents */}
                  {(activeFilter === "all" || activeFilter === "agents") && suggestions.agents.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 bg-gradient-to-br from-gold-500 to-gold-600 rounded-lg flex items-center justify-center">
                          <Briefcase className="h-3.5 w-3.5 text-white" />
                        </div>
                        <h3 className="font-semibold text-stadium-800 text-sm">Agents suggérés</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {suggestions.agents.map((agent, index) => (
                          <motion.div
                            key={agent.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                          >
                            <AgentSuggestionCard agent={agent} followingStates={followingStates} followingLoading={followingLoading} handleFollow={handleFollow} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Message si aucune suggestion */}
              {!loadingSuggestions && 
               allSuggestedClubs.length === 0 && 
               allSuggestedPlayers.length === 0 && 
               suggestions.agents.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-stadium-400 text-sm">
                    Tapez au moins 2 caractères pour commencer la recherche
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
