"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { 
  Loader2, 
  Search, 
  Users,
  Target,
  Building2,
  MapPin,
  TrendingUp,
  Filter,
  Eye
} from "lucide-react"
import Link from "next/link"

interface Player {
  id: string
  firstName: string
  lastName: string
  primaryPosition: string
  nationality: string
  currentClub?: string
  dateOfBirth: string
  availableFrom?: string
}

interface Club {
  id: string
  clubName: string
  country: string
  city?: string
  league?: string
  isVerified: boolean
  activeListingsCount: number
}

interface Listing {
  id: string
  title: string
  position: string
  publishedAt: string
  clubProfile: {
    clubName: string
    country: string
    city?: string
  }
}

const positions = [
  { value: "GK", label: "Gardien" },
  { value: "DF", label: "Défenseur" },
  { value: "MF", label: "Milieu" },
  { value: "FW", label: "Attaquant" },
]

export default function AgentSearchPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [listings, setListings] = useState<Listing[]>([])

  // Filtres joueurs
  const [playerQuery, setPlayerQuery] = useState("")
  const [playerPosition, setPlayerPosition] = useState("")
  const [playerNationality, setPlayerNationality] = useState("")

  // Filtres clubs
  const [clubQuery, setClubQuery] = useState("")
  const [clubCountry, setClubCountry] = useState("")

  // Filtres annonces
  const [listingPosition, setListingPosition] = useState("")

  const searchPlayers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (playerQuery) params.append("query", playerQuery)
      if (playerPosition) params.append("position", playerPosition)
      if (playerNationality) params.append("nationality", playerNationality)
      params.append("limit", "20")

      const response = await fetch(`/api/players?${params.toString()}`)
      if (!response.ok) throw new Error("Erreur de recherche")

      const data = await response.json()
      setPlayers(data.players || [])
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les joueurs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const searchClubs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (clubQuery) params.append("query", clubQuery)
      if (clubCountry) params.append("country", clubCountry)
      params.append("limit", "20")

      const response = await fetch(`/api/clubs?${params.toString()}`)
      if (!response.ok) throw new Error("Erreur de recherche")

      const data = await response.json()
      setClubs(data.clubs || [])
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les clubs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const searchListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("status", "PUBLISHED")
      if (listingPosition) params.append("position", listingPosition)
      params.append("limit", "20")

      const response = await fetch(`/api/listings?${params.toString()}`)
      if (!response.ok) throw new Error("Erreur de recherche")

      const data = await response.json()
      setListings(data.listings || [])
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les annonces",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Charger les annonces par défaut
  useEffect(() => {
    searchListings()
  }, [])

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Recherche Avancée</h1>
        <p className="text-gray-600 mt-1">
          Trouvez des joueurs, clubs et opportunités
        </p>
      </div>

      <Tabs defaultValue="listings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="listings">
            <Target className="mr-2 h-4 w-4" />
            Annonces
          </TabsTrigger>
          <TabsTrigger value="players">
            <Users className="mr-2 h-4 w-4" />
            Joueurs
          </TabsTrigger>
          <TabsTrigger value="clubs">
            <Building2 className="mr-2 h-4 w-4" />
            Clubs
          </TabsTrigger>
        </TabsList>

        {/* Recherche d'annonces */}
        <TabsContent value="listings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="listingPosition">Position</Label>
                <Select value={listingPosition} onValueChange={setListingPosition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos.value} value={pos.value}>
                        {pos.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={searchListings} disabled={loading} className="w-full">
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Recherche...</>
                ) : (
                  <><Search className="mr-2 h-4 w-4" />Rechercher</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Résultats annonces */}
          <div className="grid gap-4 md:grid-cols-2">
            {listings.map((listing) => (
              <Card key={listing.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{listing.title}</CardTitle>
                  <CardDescription>
                    <Building2 className="inline h-4 w-4 mr-1" />
                    {listing.clubProfile.clubName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="outline">{listing.position}</Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {listing.clubProfile.city && `${listing.clubProfile.city}, `}
                      {listing.clubProfile.country}
                    </div>
                    <p className="text-xs text-gray-500">
                      Publiée le{" "}
                      {new Date(listing.publishedAt).toLocaleDateString("fr-FR")}
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      Voir les détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recherche de joueurs */}
        <TabsContent value="players" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="playerQuery">Recherche</Label>
                <Input
                  id="playerQuery"
                  placeholder="Nom du joueur..."
                  value={playerQuery}
                  onChange={(e) => setPlayerQuery(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="playerPosition">Position</Label>
                  <Select value={playerPosition} onValueChange={setPlayerPosition}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      {positions.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="playerNationality">Nationalité</Label>
                  <Input
                    id="playerNationality"
                    placeholder="France, Brésil..."
                    value={playerNationality}
                    onChange={(e) => setPlayerNationality(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={searchPlayers} disabled={loading} className="w-full">
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Recherche...</>
                ) : (
                  <><Search className="mr-2 h-4 w-4" />Rechercher</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Résultats joueurs */}
          <div className="grid gap-4 md:grid-cols-3">
            {players.map((player) => (
              <Card key={player.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {player.firstName} {player.lastName}
                  </CardTitle>
                  <CardDescription>
                    {player.primaryPosition} • {calculateAge(player.dateOfBirth)} ans
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {player.nationality}
                    </div>
                    {player.currentClub && (
                      <p className="text-sm text-gray-600">{player.currentClub}</p>
                    )}
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      Voir profil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recherche de clubs */}
        <TabsContent value="clubs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="clubQuery">Recherche</Label>
                <Input
                  id="clubQuery"
                  placeholder="Nom du club..."
                  value={clubQuery}
                  onChange={(e) => setClubQuery(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="clubCountry">Pays</Label>
                <Input
                  id="clubCountry"
                  placeholder="France, Espagne..."
                  value={clubCountry}
                  onChange={(e) => setClubCountry(e.target.value)}
                />
              </div>

              <Button onClick={searchClubs} disabled={loading} className="w-full">
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Recherche...</>
                ) : (
                  <><Search className="mr-2 h-4 w-4" />Rechercher</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Résultats clubs */}
          <div className="grid gap-4 md:grid-cols-2">
            {clubs.map((club) => (
              <Card key={club.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{club.clubName}</CardTitle>
                      <CardDescription>
                        <MapPin className="inline h-4 w-4 mr-1" />
                        {club.city && `${club.city}, `}
                        {club.country}
                      </CardDescription>
                    </div>
                    {club.isVerified && (
                      <Badge className="bg-blue-600">Vérifié</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {club.league && (
                      <Badge variant="outline">{club.league}</Badge>
                    )}
                    <p className="text-sm text-gray-600">
                      {club.activeListingsCount} annonce(s) active(s)
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      Voir profil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
