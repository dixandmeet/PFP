"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Trophy, 
  Calendar,
  Loader2,
  Globe,
  Users,
  Info,
  ChevronRight,
  Shirt,
  Award,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getClubInitials, getPlayerInitials } from "@/lib/utils/initials"
import { translatePosition, translateNationality } from "@/lib/utils/football-translations"

interface Team {
  id: string
  slug: string
  name: string
  shortName: string | null
  country: string
  league: string | null
  logo: string | null
  banner: string | null
  stadiumImage: string | null
  jersey: string | null
  venue: string | null
  founded: number | null
  sportsDbId: string | null
  description: string | null
}

interface Player {
  id: string
  name: string
  position: string | null
  nationality: string | null
  image: string | null
  number: number | null
}

interface PlayersByPosition {
  goalkeepers: Player[]
  defenders: Player[]
  midfielders: Player[]
  forwards: Player[]
  other: Player[]
}

interface Match {
  id: string
  homeTeam: { name: string; logo: string | null }
  awayTeam: { name: string; logo: string | null }
  score: { home: number | null; away: number | null }
  status: string
  date: string
  competition: string
  venue: string | null
}

type TabType = "about" | "squad" | "results" | "calendar"

export default function FootballTeamPage() {
  const params = useParams()
  const router = useRouter()
  const [team, setTeam] = useState<Team | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [playersByPosition, setPlayersByPosition] = useState<PlayersByPosition | null>(null)
  const [matches, setMatches] = useState<{ upcoming: Match[]; past: Match[] }>({ upcoming: [], past: [] })
  const [loading, setLoading] = useState(true)
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("about")

  const teamId = params.id as string

  useEffect(() => {
    async function loadTeam() {
      try {
        const response = await fetch(`/api/football/teams/${teamId}`)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error(`Erreur API /api/football/teams/${teamId}:`, {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          })
          throw new Error(errorData.error || `Équipe non trouvée (${response.status})`)
        }
        const data = await response.json()
        setTeam(data.team)
        setPlayers(data.players || [])
        setPlayersByPosition(data.playersByPosition || null)

        // Rediriger vers l'URL avec slug si on accède via un ID
        if (data.team?.slug && teamId !== data.team.slug) {
          router.replace(`/football/teams/${data.team.slug}`, { scroll: false })
        }

        // Charger les matchs (l'API recherche le sportsDbId si nécessaire)
        setLoadingMatches(true)
        try {
          const matchesResponse = await fetch(`/api/football/teams/${data.team?.slug || teamId}/matches`)
          if (matchesResponse.ok) {
            const matchesData = await matchesResponse.json()
            setMatches(matchesData)
          }
        } catch (error) {
          console.error("Erreur chargement matchs:", error)
        } finally {
          setLoadingMatches(false)
        }
      } catch (error) {
        console.error("Erreur:", error)
        router.push("/search")
      } finally {
        setLoading(false)
      }
    }

    loadTeam()
  }, [teamId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-stadium-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-2 border-pitch-200 border-t-pitch-600 animate-spin mx-auto mb-4" />
          <p className="text-stadium-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!team) {
    return null
  }

  const tabs = [
    { id: "about" as TabType, label: "À propos", icon: Info },
    { id: "squad" as TabType, label: "Effectif", icon: Users, count: players.length },
    { id: "results" as TabType, label: "Résultats", icon: Trophy, count: matches.past.length },
    { id: "calendar" as TabType, label: "Calendrier", icon: Calendar, count: matches.upcoming.length },
  ]

  const getPositionColor = (position: string | null) => {
    if (!position) return "bg-stadium-100 text-stadium-600"
    if (position === "Goalkeeper") return "bg-gold-100 text-gold-700"
    if (position === "Defence" || position.includes("Back") || position.includes("Defender")) return "bg-blue-100 text-blue-700"
    if (position === "Midfield" || position.includes("Midfield")) return "bg-pitch-100 text-pitch-700"
    if (position === "Offence" || position.includes("Forward") || position.includes("Wing") || position.includes("Striker")) return "bg-victory-100 text-victory-700"
    return "bg-stadium-100 text-stadium-600"
  }

  return (
    <div className="min-h-screen bg-stadium-50">
      {/* Header avec bannière */}
      <div className="relative">
        {/* Bannière */}
        <div className="h-56 md:h-72 bg-gradient-to-br from-pitch-600 via-pitch-700 to-stadium-900 relative overflow-hidden">
          {team.banner && (
            <Image
              src={team.banner}
              alt={team.name}
              fill
              className="object-cover opacity-40"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Effet décoratif */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-pitch-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-400/10 rounded-full blur-3xl" />
        </div>

        {/* Contenu header */}
        <div className="absolute inset-0 flex flex-col">
          {/* Navigation */}
          <div className="container mx-auto px-4 pt-6 max-w-5xl">
            <Link 
              href="/search" 
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Retour à la recherche</span>
            </Link>
          </div>

          {/* Infos équipe */}
          <div className="flex-1 flex items-end">
            <div className="container mx-auto px-4 pb-6 max-w-5xl">
              <div className="flex items-end gap-5">
                {/* Logo */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative h-24 w-24 md:h-32 md:w-32 rounded-2xl bg-white shadow-xl overflow-hidden flex-shrink-0"
                >
                  {team.logo ? (
                    <Image
                      src={team.logo}
                      alt={team.name}
                      fill
                      sizes="128px"
                      className="object-contain p-3"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-victory-100 to-victory-200">
                      <span className="text-2xl md:text-3xl font-bold text-victory-600">
                        {getClubInitials(team.name, team.shortName)}
                      </span>
                    </div>
                  )}
                </motion.div>

                {/* Nom et infos */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 pb-1"
                >
                  {team.league && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-pitch-500/30 backdrop-blur-sm rounded-full text-white/90 text-xs font-medium">
                        <Trophy className="h-3 w-3" />
                        {team.league}
                      </span>
                    </div>
                  )}
                  <h1 className="text-xl md:text-2xl font-bold text-white mb-1">{team.name}</h1>
                  <p className="text-white/70 text-sm md:text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {team.country}
                    {team.venue && ` • ${team.venue}`}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-14 lg:top-0 z-20 bg-white border-b border-stadium-200 shadow-sm">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-pitch-600 text-white shadow-md"
                      : "text-stadium-600 hover:bg-stadium-100"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-full text-xs",
                      activeTab === tab.id
                        ? "bg-white/20 text-white"
                        : "bg-stadium-200 text-stadium-600"
                    )}>
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <AnimatePresence mode="wait">
          {/* Tab À propos */}
          {activeTab === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Description */}
              {team.description && (
                <div className="bg-white rounded-2xl shadow-sm border border-stadium-100 p-6">
                  <h2 className="text-base font-semibold text-stadium-800 mb-4 flex items-center gap-2">
                    <Info className="h-4 w-4 text-pitch-600" />
                    À propos du club
                  </h2>
                  <p className="text-stadium-600 leading-relaxed text-sm">
                    {team.description.slice(0, 800)}
                    {team.description.length > 800 && "..."}
                  </p>
                </div>
              )}

              {/* Infos + Stade */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Informations */}
                <div className="bg-white rounded-2xl shadow-sm border border-stadium-100 p-6">
                  <h2 className="text-base font-semibold text-stadium-800 mb-4 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-pitch-600" />
                    Informations
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-stadium-100">
                      <span className="text-stadium-500 text-sm">Pays</span>
                      <span className="font-medium text-stadium-800">{team.country}</span>
                    </div>
                    {team.league && (
                      <div className="flex justify-between items-center py-2 border-b border-stadium-100">
                        <span className="text-stadium-500 text-sm">Compétition</span>
                        <span className="font-medium text-stadium-800">{team.league}</span>
                      </div>
                    )}
                    {team.founded && (
                      <div className="flex justify-between items-center py-2 border-b border-stadium-100">
                        <span className="text-stadium-500 text-sm">Fondé en</span>
                        <span className="font-medium text-stadium-800">{team.founded}</span>
                      </div>
                    )}
                    {team.venue && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-stadium-500 text-sm">Stade</span>
                        <span className="font-medium text-stadium-800">{team.venue}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stade */}
                {team.stadiumImage ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-stadium-100 overflow-hidden">
                    <div className="p-4 border-b border-stadium-100">
                      <h2 className="text-base font-semibold text-stadium-800 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-pitch-600" />
                        {team.venue || "Stade"}
                      </h2>
                    </div>
                    <div className="relative h-48">
                      <Image
                        src={team.stadiumImage}
                        alt={team.venue || "Stade"}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                ) : team.jersey && (
                  <div className="bg-white rounded-2xl shadow-sm border border-stadium-100 overflow-hidden">
                    <div className="p-4 border-b border-stadium-100">
                      <h2 className="text-base font-semibold text-stadium-800 flex items-center gap-2">
                        <Shirt className="h-4 w-4 text-pitch-600" />
                        Maillot
                      </h2>
                    </div>
                    <div className="relative h-48 bg-gradient-to-br from-stadium-50 to-stadium-100">
                      <Image
                        src={team.jersey}
                        alt="Maillot"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain p-4"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Aperçu effectif */}
              {players.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-stadium-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-stadium-800 flex items-center gap-2">
                      <Users className="h-4 w-4 text-pitch-600" />
                      Effectif ({players.length} joueurs)
                    </h2>
                    <button
                      onClick={() => setActiveTab("squad")}
                      className="text-sm text-pitch-600 hover:text-pitch-700 font-medium flex items-center gap-1"
                    >
                      Voir tout
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {players.slice(0, 8).map((player) => (
                      <Link
                        key={player.id}
                        href={`/football/players/${player.id}`}
                        className="flex items-center gap-3 p-3 bg-stadium-50 rounded-xl hover:bg-stadium-100 transition-colors group"
                      >
                        <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-pitch-100 to-pitch-200 flex-shrink-0">
                          {player.image ? (
                            <Image
                              src={player.image}
                              alt={player.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <span className="text-xs font-bold text-pitch-600">
                                {getPlayerInitials(player.name)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stadium-800 group-hover:text-pitch-700 transition-colors truncate">{player.name}</p>
                          <p className="text-xs text-stadium-500 truncate">{translatePosition(player.position)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab Effectif */}
          {activeTab === "squad" && (
            <motion.div
              key="squad"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {playersByPosition && (
                <>
                  {/* Gardiens */}
                  {playersByPosition.goalkeepers.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-stadium-100 overflow-hidden">
                      <div className="px-5 py-3 border-b border-stadium-100 bg-gold-50">
                        <h3 className="text-sm font-semibold text-gold-800 flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-gold-500" />
                          Gardiens ({playersByPosition.goalkeepers.length})
                        </h3>
                      </div>
                      <div className="divide-y divide-stadium-50">
                        {playersByPosition.goalkeepers.map((player) => (
                          <PlayerRow key={player.id} player={player} getPositionColor={getPositionColor} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Défenseurs */}
                  {playersByPosition.defenders.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-stadium-100 overflow-hidden">
                      <div className="px-5 py-3 border-b border-stadium-100 bg-blue-50">
                        <h3 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          Défenseurs ({playersByPosition.defenders.length})
                        </h3>
                      </div>
                      <div className="divide-y divide-stadium-50">
                        {playersByPosition.defenders.map((player) => (
                          <PlayerRow key={player.id} player={player} getPositionColor={getPositionColor} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Milieux */}
                  {playersByPosition.midfielders.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-stadium-100 overflow-hidden">
                      <div className="px-5 py-3 border-b border-stadium-100 bg-pitch-50">
                        <h3 className="text-sm font-semibold text-pitch-800 flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-pitch-500" />
                          Milieux ({playersByPosition.midfielders.length})
                        </h3>
                      </div>
                      <div className="divide-y divide-stadium-50">
                        {playersByPosition.midfielders.map((player) => (
                          <PlayerRow key={player.id} player={player} getPositionColor={getPositionColor} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attaquants */}
                  {playersByPosition.forwards.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-stadium-100 overflow-hidden">
                      <div className="px-5 py-3 border-b border-stadium-100 bg-victory-50">
                        <h3 className="text-sm font-semibold text-victory-800 flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-victory-500" />
                          Attaquants ({playersByPosition.forwards.length})
                        </h3>
                      </div>
                      <div className="divide-y divide-stadium-50">
                        {playersByPosition.forwards.map((player) => (
                          <PlayerRow key={player.id} player={player} getPositionColor={getPositionColor} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {players.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-stadium-100 p-12 text-center">
                  <Users className="h-12 w-12 text-stadium-300 mx-auto mb-4" />
                  <p className="text-stadium-500">Aucun joueur disponible</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab Résultats */}
          {activeTab === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {loadingMatches ? (
                <div className="bg-white rounded-2xl shadow-sm border border-stadium-100 p-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-pitch-600 mx-auto mb-4" />
                  <p className="text-stadium-500">Chargement des résultats...</p>
                </div>
              ) : matches.past.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-stadium-100 p-12 text-center">
                  <Trophy className="h-12 w-12 text-stadium-300 mx-auto mb-4" />
                  <p className="text-stadium-500">Aucun résultat disponible</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-stadium-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-stadium-100">
                    <h2 className="text-base font-semibold text-stadium-800 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-gold-500" />
                      Derniers résultats
                    </h2>
                  </div>
                  <div className="divide-y divide-stadium-50">
                    {matches.past.map((match) => (
                      <MatchRow key={match.id} match={match} teamName={team.name} type="result" />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab Calendrier */}
          {activeTab === "calendar" && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {loadingMatches ? (
                <div className="bg-white rounded-2xl shadow-sm border border-stadium-100 p-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-pitch-600 mx-auto mb-4" />
                  <p className="text-stadium-500">Chargement du calendrier...</p>
                </div>
              ) : matches.upcoming.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-stadium-100 p-12 text-center">
                  <Calendar className="h-12 w-12 text-stadium-300 mx-auto mb-4" />
                  <p className="text-stadium-500">Aucun match programmé</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-stadium-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-stadium-100">
                    <h2 className="text-base font-semibold text-stadium-800 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-victory-500" />
                      Prochains matchs
                    </h2>
                  </div>
                  <div className="divide-y divide-stadium-50">
                    {matches.upcoming.map((match) => (
                      <MatchRow key={match.id} match={match} teamName={team.name} type="upcoming" />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Composant pour afficher un joueur
function PlayerRow({ player, getPositionColor }: { player: Player; getPositionColor: (pos: string | null) => string }) {
  return (
    <Link
      href={`/football/players/${player.id}`}
      className="flex items-center gap-4 px-5 py-3 hover:bg-stadium-50 transition-colors group"
    >
      <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-pitch-100 to-pitch-200 flex-shrink-0 ring-2 ring-white shadow-sm">
        {player.image ? (
          <Image
            src={player.image}
            alt={player.name}
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <span className="text-sm font-bold text-pitch-600">
              {getPlayerInitials(player.name)}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-stadium-800 group-hover:text-pitch-700 transition-colors">
          {player.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {player.number && (
            <span className="text-xs text-stadium-500">#{player.number}</span>
          )}
          {player.nationality && (
            <span className="text-xs text-stadium-400">{translateNationality(player.nationality)}</span>
          )}
        </div>
      </div>
      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", getPositionColor(player.position))}>
        {translatePosition(player.position)}
      </span>
      <ChevronRight className="h-4 w-4 text-stadium-300 group-hover:text-stadium-500 transition-colors" />
    </Link>
  )
}

// Composant pour afficher un match
function MatchRow({ match, teamName, type }: { match: Match; teamName: string; type: "result" | "upcoming" }) {
  const isHomeTeam = match.homeTeam.name.toLowerCase().includes(teamName.toLowerCase().split(" ")[0])
  const isWin = type === "result" && match.score.home !== null && match.score.away !== null && (
    (isHomeTeam && match.score.home > match.score.away) ||
    (!isHomeTeam && match.score.away > match.score.home)
  )
  const isDraw = type === "result" && match.score.home === match.score.away
  const isLoss = type === "result" && !isWin && !isDraw

  return (
    <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4">
      {/* Date */}
      <div className="text-center w-12 sm:w-16 flex-shrink-0">
        <p className="text-xs text-stadium-400">{match.competition}</p>
        <p className="text-sm font-medium text-stadium-600">
          {new Date(match.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
        </p>
      </div>

      {/* Équipe domicile */}
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <span className={cn(
          "text-sm font-medium truncate",
          isHomeTeam ? "text-stadium-800" : "text-stadium-600"
        )}>
          {match.homeTeam.name}
        </span>
        {match.homeTeam.logo && (
          <div className="relative h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
            <Image src={match.homeTeam.logo} alt={match.homeTeam.name} fill sizes="32px" className="object-contain" />
          </div>
        )}
      </div>

      {/* Score ou date */}
      {type === "result" ? (
        <div className={cn(
          "px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm min-w-[54px] sm:min-w-[70px] text-center",
          isWin && "bg-pitch-100 text-pitch-700",
          isDraw && "bg-stadium-100 text-stadium-700",
          isLoss && "bg-red-100 text-red-700"
        )}>
          {match.score.home} - {match.score.away}
        </div>
      ) : (
        <div className="px-2 sm:px-4 py-1.5 sm:py-2 bg-pitch-100 rounded-lg text-xs font-medium text-pitch-700 min-w-[54px] sm:min-w-[70px] text-center flex items-center justify-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(match.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      )}

      {/* Équipe extérieur */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {match.awayTeam.logo && (
          <div className="relative h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
            <Image src={match.awayTeam.logo} alt={match.awayTeam.name} fill sizes="32px" className="object-contain" />
          </div>
        )}
        <span className={cn(
          "text-sm font-medium truncate",
          !isHomeTeam ? "text-stadium-800" : "text-stadium-600"
        )}>
          {match.awayTeam.name}
        </span>
      </div>
    </div>
  )
}
