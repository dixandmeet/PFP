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
  Target,
  Building2,
  MapPin,
  Filter,
  Eye,
  Trophy,
  Users
} from "lucide-react"
import Link from "next/link"

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
  contractType?: string
  clubProfile: {
    id: string
    clubName: string
    country: string
    city?: string
    league?: string
  }
}

interface Agent {
  id: string
  firstName: string
  lastName: string
  agencyName?: string
  country?: string
  licenseNumber?: string
  isVerified: boolean
}

const positions = [
  { value: "GK", label: "Gardien" },
  { value: "DF", label: "Défenseur" },
  { value: "MF", label: "Milieu" },
  { value: "FW", label: "Attaquant" },
]

export default function PlayerSearchPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [clubs, setClubs] = useState<Club[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [agents, setAgents] = useState<Agent[]>([])

  // Filtres clubs
  const [clubQuery, setClubQuery] = useState("")
  const [clubCountry, setClubCountry] = useState("")

  // Filtres annonces
  const [listingPosition, setListingPosition] = useState("")
  const [listingCountry, setListingCountry] = useState("")

  // Filtres agents
  const [agentQuery, setAgentQuery] = useState("")
  const [agentCountry, setAgentCountry] = useState("")

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
      if (listingCountry) params.append("country", listingCountry)
      params.append("limit", "20")

      const response = await fetch(`/api/listings?${params.toString()}`)
      if (!response.ok) throw new Error("Erreur de recherche")

      const data = await response.json()
      setListings(data.listings || [])
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les opportunités",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const searchAgents = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (agentQuery) params.append("query", agentQuery)
      if (agentCountry) params.append("country", agentCountry)
      params.append("limit", "20")

      const response = await fetch(`/api/agents?${params.toString()}`)
      if (!response.ok) throw new Error("Erreur de recherche")

      const data = await response.json()
      setAgents(data.agents || [])
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les agents",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Charger les opportunités par défaut
  useEffect(() => {
    searchListings()
  }, [])

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-stadium-900">Recherche</h1>
        <p className="text-stadium-600 mt-1">
          Trouvez des opportunités, clubs et agents
        </p>
      </div>

      <Tabs defaultValue="listings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white border-2 border-pitch-100">
          <TabsTrigger value="listings" className="data-[state=active]:bg-pitch-600 data-[state=active]:text-white">
            <Target className="mr-2 h-4 w-4" />
            Opportunités
          </TabsTrigger>
          <TabsTrigger value="clubs" className="data-[state=active]:bg-pitch-600 data-[state=active]:text-white">
            <Building2 className="mr-2 h-4 w-4" />
            Clubs
          </TabsTrigger>
          <TabsTrigger value="agents" className="data-[state=active]:bg-pitch-600 data-[state=active]:text-white">
            <Users className="mr-2 h-4 w-4" />
            Agents
          </TabsTrigger>
        </TabsList>

        {/* Recherche d'opportunités */}
        <TabsContent value="listings" className="space-y-4">
          <Card className="border-2 border-pitch-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-stadium-800">
                <Filter className="h-5 w-5 text-pitch-600" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="listingPosition">Position</Label>
                  <Select value={listingPosition || "all"} onValueChange={(val) => setListingPosition(val === "all" ? "" : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les positions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      {positions.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="listingCountry">Pays</Label>
                  <Input
                    id="listingCountry"
                    placeholder="France, Espagne..."
                    value={listingCountry}
                    onChange={(e) => setListingCountry(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={searchListings} disabled={loading} className="w-full bg-pitch-600 hover:bg-pitch-700">
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Recherche...</>
                ) : (
                  <><Search className="mr-2 h-4 w-4" />Rechercher</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Résultats opportunités */}
          <div className="grid gap-4 md:grid-cols-2">
            {listings.length === 0 && !loading && (
              <div className="col-span-2 text-center py-12 text-stadium-500">
                Aucune opportunité trouvée. Modifiez vos filtres.
              </div>
            )}
            {listings.map((listing) => (
              <Card key={listing.id} className="border-2 border-stadium-100 hover:border-pitch-200 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg text-stadium-800">{listing.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {listing.clubProfile.clubName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-pitch-100 text-pitch-700">{listing.position}</Badge>
                      {listing.contractType && (
                        <Badge variant="outline">{listing.contractType}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stadium-600">
                      <MapPin className="h-4 w-4" />
                      {listing.clubProfile.city && `${listing.clubProfile.city}, `}
                      {listing.clubProfile.country}
                    </div>
                    {listing.clubProfile.league && (
                      <div className="flex items-center gap-2 text-sm text-stadium-500">
                        <Trophy className="h-4 w-4" />
                        {listing.clubProfile.league}
                      </div>
                    )}
                    <p className="text-xs text-stadium-400">
                      Publiée le {new Date(listing.publishedAt).toLocaleDateString("fr-FR")}
                    </p>
                    <Link href={`/player/opportunities/${listing.id}`}>
                      <Button variant="outline" size="sm" className="w-full border-pitch-200 text-pitch-700 hover:bg-pitch-50">
                        <Eye className="mr-2 h-4 w-4" />
                        Voir les détails
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recherche de clubs */}
        <TabsContent value="clubs" className="space-y-4">
          <Card className="border-2 border-pitch-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-stadium-800">
                <Filter className="h-5 w-5 text-pitch-600" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clubQuery">Nom du club</Label>
                  <Input
                    id="clubQuery"
                    placeholder="PSG, Real Madrid..."
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
              </div>

              <Button onClick={searchClubs} disabled={loading} className="w-full bg-pitch-600 hover:bg-pitch-700">
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
            {clubs.length === 0 && !loading && (
              <div className="col-span-2 text-center py-12 text-stadium-500">
                Aucun club trouvé. Lancez une recherche.
              </div>
            )}
            {clubs.map((club) => (
              <Card key={club.id} className="border-2 border-stadium-100 hover:border-pitch-200 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-stadium-800">{club.clubName}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {club.city && `${club.city}, `}
                        {club.country}
                      </CardDescription>
                    </div>
                    {club.isVerified && (
                      <Badge className="bg-pitch-600">Vérifié</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {club.league && (
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-victory-600" />
                        <span className="text-sm text-stadium-600">{club.league}</span>
                      </div>
                    )}
                    <p className="text-sm text-pitch-600 font-medium">
                      {club.activeListingsCount} opportunité(s) disponible(s)
                    </p>
                    <Link href={`/clubs/${club.id}`}>
                      <Button variant="outline" size="sm" className="w-full border-pitch-200 text-pitch-700 hover:bg-pitch-50">
                        <Eye className="mr-2 h-4 w-4" />
                        Voir le profil
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recherche d'agents */}
        <TabsContent value="agents" className="space-y-4">
          <Card className="border-2 border-pitch-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-stadium-800">
                <Filter className="h-5 w-5 text-pitch-600" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agentQuery">Nom ou agence</Label>
                  <Input
                    id="agentQuery"
                    placeholder="Nom de l'agent ou agence..."
                    value={agentQuery}
                    onChange={(e) => setAgentQuery(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="agentCountry">Pays</Label>
                  <Input
                    id="agentCountry"
                    placeholder="France, Espagne..."
                    value={agentCountry}
                    onChange={(e) => setAgentCountry(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={searchAgents} disabled={loading} className="w-full bg-pitch-600 hover:bg-pitch-700">
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Recherche...</>
                ) : (
                  <><Search className="mr-2 h-4 w-4" />Rechercher</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Résultats agents */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.length === 0 && !loading && (
              <div className="col-span-full text-center py-12 text-stadium-500">
                Aucun agent trouvé. Lancez une recherche.
              </div>
            )}
            {agents.map((agent) => (
              <Card key={agent.id} className="border-2 border-stadium-100 hover:border-pitch-200 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-stadium-800">
                        {agent.firstName} {agent.lastName}
                      </CardTitle>
                      {agent.agencyName && (
                        <CardDescription>{agent.agencyName}</CardDescription>
                      )}
                    </div>
                    {agent.isVerified && (
                      <Badge className="bg-pitch-600">Vérifié</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {agent.country && (
                      <div className="flex items-center gap-2 text-sm text-stadium-600">
                        <MapPin className="h-4 w-4" />
                        {agent.country}
                      </div>
                    )}
                    {agent.licenseNumber && (
                      <p className="text-xs text-stadium-500">
                        Licence: {agent.licenseNumber}
                      </p>
                    )}
                    <Link href={`/player/agents/${agent.id}`}>
                      <Button variant="outline" size="sm" className="w-full border-pitch-200 text-pitch-700 hover:bg-pitch-50">
                        <Eye className="mr-2 h-4 w-4" />
                        Voir le profil
                      </Button>
                    </Link>
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
