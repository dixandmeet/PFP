"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { UserFeed } from "@/components/profile/UserFeed"
import { ClubProfileHeader } from "@/components/club/ClubProfileHeader"
import { ClubLastResults } from "@/components/club/ClubLastResults"
import { ClubUpcomingMatches } from "@/components/club/ClubUpcomingMatches"
import { ClubSquadList } from "@/components/club/ClubSquadList"
import { ClubStaffList } from "@/components/club/ClubStaffList"
import { ClubOpportunities } from "@/components/club/ClubOpportunities"
import { Loader2, ArrowLeft, Building2, Newspaper, Trophy, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import type { Match } from "@/lib/services/thesportsdb"

interface ClubData {
  id: string
  clubName: string
  shortName?: string
  logo?: string
  coverPhoto?: string
  country?: string
  city?: string
  league?: string
  division?: string
  bio?: string
  foundedYear?: number
  isVerified?: boolean
  userId: string
}

interface StaffMember {
  id: string
  name: string
  role: string
  email?: string
}

interface Team {
  id: string
  name: string
  level?: string
  staffMembers: StaffMember[]
}

interface Listing {
  id: string
  title: string
  position: string
  publishedAt: string | null
  contractType?: string
  salaryMin?: number
  salaryMax?: number
  currency?: string
}

interface Player {
  id: number
  name: string
  position: string
  nationality: string
  number?: number
  image?: string
}

interface ClubPublicData {
  club: ClubData
  stats: {
    followers: number
    following: number
    posts: number
  }
  teams: Team[]
  listings: Listing[]
  matches: {
    lastResults: Match[]
    upcomingMatches: Match[]
  }
  squad: Player[]
  isDemo?: boolean
}

export default function ClubPublicPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [data, setData] = useState<ClubPublicData | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const clubId = params.id as string

  useEffect(() => {
    async function loadData() {
      try {
        // Charger l'utilisateur actuel (si connecté)
        try {
          const currentUserResponse = await fetch("/api/users/me")
          if (currentUserResponse.ok) {
            const currentUserData = await currentUserResponse.json()
            setCurrentUser(currentUserData)

            // Vérifier si l'utilisateur suit ce club
            const followResponse = await fetch(`/api/follow/${clubId}?type=CLUB`)
            if (followResponse.ok) {
              const followData = await followResponse.json()
              setIsFollowing(followData.isFollowing || false)
            }
          }
        } catch {
          // Non connecté, pas de problème
        }

        // Charger les données publiques du club
        const response = await fetch(`/api/clubs/${clubId}/public`)
        if (!response.ok) {
          throw new Error("Club non trouvé")
        }

        const clubData = await response.json()
        setData(clubData)
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du club",
          variant: "destructive",
        })
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [clubId, router, toast])

  const handleFollow = async () => {
    if (!currentUser) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour suivre un club",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // Pour les clubs de démonstration, juste mettre à jour l'UI
    if (data?.isDemo) {
      setIsFollowing(!isFollowing)
      setData({
        ...data,
        stats: {
          ...data.stats,
          followers: data.stats.followers + (isFollowing ? -1 : 1),
        },
      })
      toast({
        title: "Démonstration",
        description: isFollowing
          ? "Vous ne suivez plus ce club (démo)"
          : "Vous suivez maintenant ce club (démo)",
      })
      return
    }

    try {
      setFollowLoading(true)

      const method = isFollowing ? "DELETE" : "POST"
      const response = await fetch(`/api/follow/${clubId}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "CLUB" }),
      })

      if (!response.ok) throw new Error("Erreur")

      setIsFollowing(!isFollowing)

      // Mettre à jour le compteur local
      if (data) {
        setData({
          ...data,
          stats: {
            ...data.stats,
            followers: data.stats.followers + (isFollowing ? -1 : 1),
          },
        })
      }

      toast({
        title: "Succès",
        description: isFollowing
          ? "Vous ne suivez plus ce club"
          : "Vous suivez maintenant ce club",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le suivi",
        variant: "destructive",
      })
    } finally {
      setFollowLoading(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${data?.club.clubName} - ProFoot Profile`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Lien copié",
        description: "Le lien du profil a été copié dans le presse-papier",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-stadium-50 to-pitch-50">
        <div className="text-center">
          <div className="inline-flex p-4 bg-gradient-to-br from-pitch-100 to-pitch-50 rounded-full mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-pitch-600" />
          </div>
          <p className="text-stadium-600 font-semibold">Chargement du club...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-stadium-600">Club non trouvé</p>
          <Link href="/">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stadium-50 to-pitch-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Bouton retour */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-stadium-600 hover:text-stadium-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </div>

        {/* Header du club */}
        <div className="mb-8">
          <ClubProfileHeader
            club={data.club}
            followersCount={data.stats.followers}
            followingCount={data.stats.following}
            isFollowing={isFollowing}
            isLoading={followLoading}
            onFollow={handleFollow}
            onShare={handleShare}
          />
        </div>

        {/* Contenu en 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche - Tabs (2/3) */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="feed" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-4 bg-white/80 backdrop-blur-sm border border-stadium-200 rounded-xl p-1">
                <TabsTrigger 
                  value="feed" 
                  className="flex items-center gap-2 data-[state=active]:bg-pitch-600 data-[state=active]:text-white rounded-lg transition-all"
                >
                  <Newspaper className="h-4 w-4" />
                  <span className="hidden sm:inline">Feed</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="results" 
                  className="flex items-center gap-2 data-[state=active]:bg-pitch-600 data-[state=active]:text-white rounded-lg transition-all"
                >
                  <Trophy className="h-4 w-4" />
                  <span className="hidden sm:inline">Résultats</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="upcoming" 
                  className="flex items-center gap-2 data-[state=active]:bg-pitch-600 data-[state=active]:text-white rounded-lg transition-all"
                >
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Prochains matchs</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="space-y-6 mt-0">
                {data.isDemo ? (
                  <div className="card-stadium p-8 text-center">
                    <div className="inline-flex p-4 bg-gradient-to-br from-victory-100 to-victory-50 rounded-full mb-4">
                      <Building2 className="h-8 w-8 text-victory-600" />
                    </div>
                    <h3 className="text-lg font-bold text-stadium-800 mb-2">
                      Profil de démonstration
                    </h3>
                    <p className="text-stadium-600 text-sm">
                      Ceci est un aperçu du profil de {data.club.clubName}. 
                      Les publications et interactions ne sont pas disponibles pour les clubs de démonstration.
                    </p>
                  </div>
                ) : (
                  <UserFeed 
                    userId={data.club.userId} 
                    currentUserId={currentUser?.id} 
                  />
                )}
              </TabsContent>

              <TabsContent value="results" className="mt-0">
                <ClubLastResults 
                  matches={data.matches.lastResults} 
                  clubName={data.club.clubName}
                  fullWidth
                />
              </TabsContent>

              <TabsContent value="upcoming" className="mt-0">
                <ClubUpcomingMatches 
                  matches={data.matches.upcomingMatches} 
                  fullWidth
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Colonne droite - Widgets (1/3) */}
          <div className="space-y-4">
            {/* Effectif */}
            <ClubSquadList players={data.squad} />

            {/* Staff technique */}
            <ClubStaffList teams={data.teams} />

            {/* Opportunités */}
            <ClubOpportunities 
              listings={data.listings} 
              clubId={data.club.id}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
