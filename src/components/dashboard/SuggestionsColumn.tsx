"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Building2, 
  Briefcase,
  UserPlus,
  Loader2,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"

interface Suggestion {
  id: string
  type: "PLAYER" | "AGENT" | "CLUB"
  name: string
  subtitle: string
  image?: string | null
  isFollowing: boolean
  link: string
}

interface SuggestionsColumnProps {
  role: "PLAYER" | "AGENT" | "CLUB"
}

export function SuggestionsColumn({ role }: SuggestionsColumnProps) {
  const router = useRouter()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())

  // Fonction pour générer un slug à partir du nom
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  useEffect(() => {
    async function loadSuggestions() {
      try {
        const response = await fetch("/api/search/suggestions?type=all&limit=6")
        if (response.ok) {
          const data = await response.json()
          const allSuggestions: Suggestion[] = []

          // Transformer les clubs (ClubProfile)
          if (data.clubs && data.clubs.length > 0) {
            data.clubs.forEach((club: any) => {
              allSuggestions.push({
                id: club.id,
                type: "CLUB",
                name: club.clubName || club.shortName,
                subtitle: [club.league, club.country].filter(Boolean).join(", ") || "Club",
                image: club.logo,
                isFollowing: club.isFollowing || false,
                link: `/profile/${club.slug || club.userId}`,
              })
            })
          }

          // Transformer les équipes football (FootballTeam)
          if (data.footballTeams && data.footballTeams.length > 0) {
            data.footballTeams.forEach((team: any) => {
              allSuggestions.push({
                id: team.id,
                type: "CLUB",
                name: team.name || team.shortName,
                subtitle: [team.league, team.country].filter(Boolean).join(", ") || "Club",
                image: team.logo,
                isFollowing: team.isFollowing || false,
                link: `/football/teams/${team.id}`,
              })
            })
          }

          // Transformer les joueurs (PlayerProfile)
          if (data.players && data.players.length > 0) {
            data.players.forEach((player: any) => {
              allSuggestions.push({
                id: player.id,
                type: "PLAYER",
                name: player.displayName || `${player.firstName} ${player.lastName}`,
                subtitle: player.primaryPosition || player.currentClub || "Joueur",
                image: player.profilePicture,
                isFollowing: player.isFollowing || false,
                link: `/profile/${player.slug || player.userId}`,
              })
            })
          }

          // Transformer les joueurs football (FootballPlayer)
          if (data.footballPlayers && data.footballPlayers.length > 0) {
            data.footballPlayers.forEach((player: any) => {
              allSuggestions.push({
                id: player.id,
                type: "PLAYER",
                name: player.name,
                subtitle: player.position || player.teamName || "Joueur",
                image: player.cutout || player.image,
                isFollowing: player.isFollowing || false,
                link: `/football/players/${player.id}`,
              })
            })
          }

          // Transformer les agents
          if (data.agents && data.agents.length > 0) {
            data.agents.forEach((agent: any) => {
              allSuggestions.push({
                id: agent.id,
                type: "AGENT",
                name: `${agent.firstName} ${agent.lastName}`,
                subtitle: agent.agencyName || "Agent",
                image: agent.profilePicture,
                isFollowing: agent.isFollowing || false,
                link: `/profile/${agent.slug || agent.userId}`,
              })
            })
          }

          // Mettre à jour les IDs déjà suivis
          const followedIds = allSuggestions
            .filter(s => s.isFollowing)
            .map(s => s.id)
          setFollowingIds(new Set(followedIds))

          setSuggestions(allSuggestions)
        }
      } catch (error) {
        console.error("Erreur lors du chargement des suggestions:", error)
      } finally {
        setLoading(false)
      }
    }
    loadSuggestions()
  }, [])

  const handleFollow = async (id: string, type: "CLUB" | "PLAYER" | "AGENT") => {
    const isCurrentlyFollowing = followingIds.has(id)
    
    // Toggle follow state localement (optimistic update)
    setFollowingIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })

    // Appeler l'API
    try {
      const response = await fetch(`/api/follow/${id}`, { 
        method: isCurrentlyFollowing ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      })
      
      if (!response.ok) {
        // Revert en cas d'erreur
        setFollowingIds(prev => {
          const newSet = new Set(prev)
          if (isCurrentlyFollowing) {
            newSet.add(id)
          } else {
            newSet.delete(id)
          }
          return newSet
        })
      }
    } catch (error) {
      // Revert en cas d'erreur
      setFollowingIds(prev => {
        const newSet = new Set(prev)
        if (isCurrentlyFollowing) {
          newSet.add(id)
        } else {
          newSet.delete(id)
        }
        return newSet
      })
    }
  }

  // Séparer les suggestions par type
  const clubs = suggestions.filter(s => s.type === "CLUB")
  const players = suggestions.filter(s => s.type === "PLAYER")
  const agents = suggestions.filter(s => s.type === "AGENT")

  if (loading) {
    return (
      <div className="card-stadium p-6">
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-pitch-500" />
        </div>
      </div>
    )
  }

  // Fonction pour obtenir le lien de profil selon le type
  const getProfileLink = (suggestion: Suggestion) => {
    return suggestion.link
  }

  // Composant pour afficher une carte de suggestion
  const SuggestionCard = ({ suggestion, index }: { suggestion: Suggestion; index: number }) => {
    const isFollowing = followingIds.has(suggestion.id)
    const [imgError, setImgError] = useState(false)
    
    const DefaultIcon = suggestion.type === "CLUB" ? Building2 : suggestion.type === "AGENT" ? Briefcase : User

    const handleCardClick = () => {
      const link = getProfileLink(suggestion)
      router.push(link)
    }

    const handleFollowClick = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      handleFollow(suggestion.id, suggestion.type)
    }

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={handleCardClick}
        className="p-3 hover:bg-pitch-50/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {/* Avatar/Logo */}
          <div className={`w-10 h-10 overflow-hidden border-2 flex-shrink-0 ${
            suggestion.type === "CLUB" 
              ? "rounded-lg border-victory-200 bg-white" 
              : "rounded-full border-pitch-100 bg-gradient-to-br from-pitch-50 to-white"
          }`}>
            {suggestion.image && !imgError ? (
              <img
                src={suggestion.image}
                alt={suggestion.name}
                onError={() => setImgError(true)}
                className={`w-full h-full ${suggestion.type === "CLUB" ? "object-contain p-1" : "object-cover"}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <DefaultIcon className={`h-5 w-5 ${
                  suggestion.type === "CLUB" ? "text-victory-500" : 
                  suggestion.type === "AGENT" ? "text-gold-500" : "text-pitch-400"
                }`} />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-stadium-900 text-sm truncate">
              {suggestion.name}
            </h4>
            <p className="text-xs text-stadium-500 truncate">
              {suggestion.subtitle}
            </p>
          </div>

          {/* Bouton Suivre */}
          <Button
            size="sm"
            variant={isFollowing ? "outline" : "default"}
            onClick={handleFollowClick}
            className={
              isFollowing 
                ? "h-7 px-2.5 text-xs border-pitch-300 hover:bg-pitch-50" 
                : "h-7 px-2.5 text-xs bg-gradient-to-r from-pitch-600 to-pitch-700 hover:from-pitch-700 hover:to-pitch-800"
            }
          >
            {isFollowing ? "Suivi" : "Suivre"}
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4 sticky top-6">
      {/* Section Clubs */}
      {clubs.length > 0 && (
        <div className="card-stadium overflow-hidden">
          <div className="p-3 bg-gradient-to-r from-victory-50 to-victory-100/50 border-b border-victory-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-victory-600" />
                <h3 className="font-bold text-victory-800 text-sm">Clubs à suivre</h3>
              </div>
              <Link 
                href="/search?tab=clubs" 
                className="text-xs text-victory-600 hover:text-victory-700 font-medium flex items-center gap-0.5 transition-colors"
              >
                Voir plus
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-pitch-50">
            {clubs.slice(0, 3).map((suggestion, index) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Section Joueurs */}
      {players.length > 0 && (
        <div className="card-stadium overflow-hidden">
          <div className="p-3 bg-gradient-to-r from-pitch-50 to-pitch-100/50 border-b border-pitch-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-pitch-600" />
                <h3 className="font-bold text-pitch-800 text-sm">Joueurs à suivre</h3>
              </div>
              <Link 
                href="/search?tab=players" 
                className="text-xs text-pitch-600 hover:text-pitch-700 font-medium flex items-center gap-0.5 transition-colors"
              >
                Voir plus
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-pitch-50">
            {players.slice(0, 3).map((suggestion, index) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Section Agents */}
      {agents.length > 0 && (
        <div className="card-stadium overflow-hidden">
          <div className="p-3 bg-gradient-to-r from-gold-50 to-gold-100/50 border-b border-gold-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gold-600" />
                <h3 className="font-bold text-gold-800 text-sm">Agents à suivre</h3>
              </div>
              <Link 
                href="/search?tab=agents" 
                className="text-xs text-gold-600 hover:text-gold-700 font-medium flex items-center gap-0.5 transition-colors"
              >
                Voir plus
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-pitch-50">
            {agents.slice(0, 3).map((suggestion, index) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
