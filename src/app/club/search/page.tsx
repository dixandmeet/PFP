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
import { useToast } from "@/components/ui/use-toast"
import { 
  Loader2, 
  Search,
  Users,
  Eye,
  Filter,
  MapPin,
  TrendingUp,
  Calendar,
  Building2
} from "lucide-react"

interface Player {
  id: string
  firstName: string
  lastName: string
  displayName?: string
  dateOfBirth: string
  nationality: string
  primaryPosition: string
  secondaryPositions: string[]
  currentClub?: string
  currentLeague?: string
  profilePicture?: string
  availableFrom?: string
  contractEndDate?: string
}

const positions = [
  { value: "GK", label: "Gardien" },
  { value: "DF", label: "Défenseur" },
  { value: "MF", label: "Milieu" },
  { value: "FW", label: "Attaquant" },
]

export default function ClubSearchPage() {
  const { toast } = useToast()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [position, setPosition] = useState("")
  const [nationality, setNationality] = useState("")
  const [minAge, setMinAge] = useState("")
  const [maxAge, setMaxAge] = useState("")
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set())

  const searchPlayers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append("query", searchQuery)
      if (position) params.append("position", position)
      if (nationality) params.append("nationality", nationality)
      if (minAge) params.append("minAge", minAge)
      if (maxAge) params.append("maxAge", maxAge)
      params.append("limit", "30")

      const response = await fetch(`/api/players?${params.toString()}`)
      if (!response.ok) throw new Error("Erreur")

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

  // Recherche initiale
  useEffect(() => {
    searchPlayers()
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

  const togglePlayerSelection = (playerId: string) => {
    const newSelection = new Set(selectedPlayers)
    if (newSelection.has(playerId)) {
      newSelection.delete(playerId)
    } else {
      newSelection.add(playerId)
    }
    setSelectedPlayers(newSelection)
  }

  const handleReset = () => {
    setSearchQuery("")
    setPosition("")
    setNationality("")
    setMinAge("")
    setMaxAge("")
    searchPlayers()
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Recherche de Joueurs</h1>
        <p className="text-gray-600 mt-1">
          Trouvez des talents pour votre club
        </p>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres de recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label htmlFor="search">Recherche</Label>
              <Input
                id="search"
                placeholder="Nom du joueur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="position">Position</Label>
              <Select value={position} onValueChange={setPosition}>
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
              <Label htmlFor="nationality">Nationalité</Label>
              <Input
                id="nationality"
                placeholder="France, Brésil..."
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="minAge">Âge min</Label>
              <Input
                id="minAge"
                type="number"
                placeholder="18"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="maxAge">Âge max</Label>
              <Input
                id="maxAge"
                type="number"
                placeholder="35"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button onClick={searchPlayers} disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recherche...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Rechercher
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions sur sélection */}
      {selectedPlayers.size > 0 && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-blue-900 font-medium">
                {selectedPlayers.size} joueur(s) sélectionné(s)
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Comparer
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedPlayers(new Set())}
                >
                  Désélectionner tout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats */}
      <div className="mb-4 text-sm text-gray-600">
        {players.length} joueur(s) trouvé(s)
      </div>

      {players.length === 0 && !loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">Aucun joueur trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => {
            const isSelected = selectedPlayers.has(player.id)
            return (
              <Card
                key={player.id}
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
                }`}
                onClick={() => togglePlayerSelection(player.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {player.firstName} {player.lastName}
                      </CardTitle>
                      {player.displayName && (
                        <p className="text-sm text-gray-500">
                          "{player.displayName}"
                        </p>
                      )}
                      <CardDescription className="mt-1">
                        {player.primaryPosition} • {calculateAge(player.dateOfBirth)}{" "}
                        ans
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{player.nationality}</span>
                    </div>

                    {player.currentClub && (
                      <div className="text-sm">
                        <Building2 className="inline h-4 w-4 mr-1 text-gray-400" />
                        <span className="font-medium">{player.currentClub}</span>
                        {player.currentLeague && (
                          <span className="text-gray-500 ml-1">
                            • {player.currentLeague}
                          </span>
                        )}
                      </div>
                    )}

                    {player.contractEndDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Fin contrat :{" "}
                          {new Date(player.contractEndDate).toLocaleDateString(
                            "fr-FR"
                          )}
                        </span>
                      </div>
                    )}

                    {player.secondaryPositions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {player.secondaryPositions.slice(0, 3).map((pos, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {pos}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.location.href = `/club/players/${player.id}`
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Voir profil détaillé
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
