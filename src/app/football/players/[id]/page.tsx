"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Calendar,
  Loader2,
  Hash,
  Flag,
  Building2,
  Search,
  ChevronRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { getPlayerInitials, getClubInitials } from "@/lib/utils/initials"
import { translatePosition, translateNationality } from "@/lib/utils/football-translations"

interface Player {
  id: string
  slug: string
  name: string
  position: string | null
  nationality: string | null
  dateOfBirth: string | null
  number: number | null
  image: string | null
  cutout: string | null
  teamName: string | null
  teamId: string | null
  team: {
    id: string
    slug: string
    name: string
    logo: string | null
    country: string | null
    league: string | null
  } | null
}

export default function FootballPlayerPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)

  const playerId = params.id as string

  useEffect(() => {
    async function loadPlayer() {
      try {
        const response = await fetch(`/api/football/players/${playerId}`)
        if (!response.ok) {
          throw new Error("Joueur non trouvé")
        }
        const data = await response.json()
        setPlayer(data.player)

        // Rediriger vers l'URL avec slug si on accède via un ID technique (CUID ou sportsdb-)
        if (data.player?.slug && playerId !== data.player.slug) {
          router.replace(`/football/players/${data.player.slug}`, { scroll: false })
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger le joueur",
          variant: "destructive",
        })
        router.push("/search")
      } finally {
        setLoading(false)
      }
    }

    loadPlayer()
  }, [playerId, router, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-pitch-600 mx-auto mb-4" />
          <p className="text-stadium-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!player) {
    return null
  }

  // Calculer l'âge
  const age = player.dateOfBirth 
    ? Math.floor((Date.now() - new Date(player.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : null

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Navigation améliorée */}
      <div className="flex items-center justify-between mb-6">
        {/* Bouton retour contextuel - retourne à la page précédente */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-stadium-600 hover:text-pitch-600 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Retour</span>
        </button>
        
        {/* Lien vers la recherche */}
        <Link
          href="/search"
          className="inline-flex items-center gap-2 text-stadium-500 hover:text-pitch-600 transition-colors"
        >
          <Search className="h-4 w-4" />
          <span className="text-sm">Recherche</span>
        </Link>
      </div>

      {/* Carte principale */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-pitch-600 to-pitch-800 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Photo */}
            <div className="relative h-36 w-36 md:h-40 md:w-40 rounded-2xl bg-white shadow-xl overflow-hidden flex-shrink-0">
              {player.cutout || player.image ? (
                <Image
                  src={player.cutout || player.image!}
                  alt={player.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-pitch-100 to-pitch-200">
                  <span className="text-4xl font-bold text-pitch-600">{getPlayerInitials(player.name)}</span>
                </div>
              )}
            </div>

            {/* Infos principales */}
            <div className="text-center md:text-left">
              {player.number && (
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <Badge className="bg-gold-500 text-white border-0 text-xs">
                    #{player.number}
                  </Badge>
                </div>
              )}
              <h1 className="text-lg md:text-xl font-bold text-white mb-1">{player.name}</h1>
              {player.position && (
                <p className="text-white/80 text-base">{translatePosition(player.position)}</p>
              )}
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Informations personnelles */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-stadium-800 flex items-center gap-2">
                <User className="h-4 w-4 text-pitch-600" />
                Informations
              </h3>
              
              {player.nationality && (
                <div className="flex items-center justify-between p-3 bg-stadium-50 rounded-lg">
                  <span className="text-stadium-500 flex items-center gap-2 text-sm">
                    <Flag className="h-4 w-4" />
                    Nationalité
                  </span>
                  <span className="font-medium text-sm">{translateNationality(player.nationality)}</span>
                </div>
              )}

              {player.dateOfBirth && (
                <div className="flex items-center justify-between p-3 bg-stadium-50 rounded-lg">
                  <span className="text-stadium-500 flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    Date de naissance
                  </span>
                  <span className="font-medium text-sm">
                    {new Date(player.dateOfBirth).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                    {age && <span className="text-stadium-400 ml-1">({age} ans)</span>}
                  </span>
                </div>
              )}

              {player.position && (
                <div className="flex items-center justify-between p-3 bg-stadium-50 rounded-lg">
                  <span className="text-stadium-500 flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    Position
                  </span>
                  <span className="font-medium text-sm">{translatePosition(player.position)}</span>
                </div>
              )}

              {player.number && (
                <div className="flex items-center justify-between p-3 bg-stadium-50 rounded-lg">
                  <span className="text-stadium-500 flex items-center gap-2 text-sm">
                    <Hash className="h-4 w-4" />
                    Numéro
                  </span>
                  <span className="font-medium text-sm">{player.number}</span>
                </div>
              )}
            </div>

            {/* Équipe */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-stadium-800 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-victory-600" />
                Équipe
              </h3>

              {player.team ? (
                <Link
                  href={`/football/teams/${player.team.slug}`}
                  className="flex items-center gap-4 p-4 bg-stadium-50 rounded-xl hover:bg-stadium-100 transition-colors group"
                >
                  <div className="relative h-14 w-14 rounded-lg bg-white overflow-hidden flex-shrink-0 shadow-sm">
                    {player.team.logo ? (
                      <Image
                        src={player.team.logo}
                        alt={player.team.name}
                        fill
                        className="object-contain p-1.5"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-victory-100 to-victory-200">
                        <span className="text-sm font-bold text-victory-600">{getClubInitials(player.team.name)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stadium-800 text-sm group-hover:text-pitch-700 transition-colors">{player.team.name}</p>
                    {player.team.league && (
                      <p className="text-xs text-stadium-500 truncate">{player.team.league}</p>
                    )}
                    <p className="text-xs text-pitch-600 mt-0.5">Voir le club</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-stadium-400 group-hover:text-pitch-600 transition-colors" />
                </Link>
              ) : player.teamName ? (
                <Link
                  href={`/football/teams/${player.teamName.toLowerCase().replace(/\s+/g, "-").normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}
                  className="flex items-center gap-4 p-4 bg-stadium-50 rounded-xl hover:bg-stadium-100 transition-colors group"
                >
                  <div className="relative h-14 w-14 rounded-lg bg-white overflow-hidden flex-shrink-0 shadow-sm">
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-victory-100 to-victory-200">
                      <span className="text-sm font-bold text-victory-600">{getClubInitials(player.teamName)}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stadium-800 text-sm group-hover:text-pitch-700 transition-colors">{player.teamName}</p>
                    <p className="text-xs text-pitch-600 mt-0.5">Voir le club</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-stadium-400 group-hover:text-pitch-600 transition-colors" />
                </Link>
              ) : (
                <div className="p-4 bg-stadium-50 rounded-xl text-center">
                  <p className="text-stadium-500 text-sm">Aucune équipe associée</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
