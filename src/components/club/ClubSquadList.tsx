"use client"

import { motion } from "framer-motion"
import { Users, User } from "lucide-react"

interface Player {
  id: number
  name: string
  position: string
  nationality: string
  number?: number
  image?: string
}

interface ClubSquadListProps {
  players: Player[]
}

const positionLabels: Record<string, string> = {
  "Goalkeeper": "Gardien",
  "Defence": "Défenseur",
  "Midfield": "Milieu",
  "Offence": "Attaquant",
}

const positionColors: Record<string, string> = {
  "Goalkeeper": "bg-amber-100 text-amber-700",
  "Defence": "bg-blue-100 text-blue-700",
  "Midfield": "bg-green-100 text-green-700",
  "Offence": "bg-red-100 text-red-700",
}

export function ClubSquadList({ players }: ClubSquadListProps) {
  if (players.length === 0) {
    return null
  }

  // Grouper par position
  const groupedPlayers = players.reduce((acc, player) => {
    const position = player.position || "Other"
    if (!acc[position]) {
      acc[position] = []
    }
    acc[position].push(player)
    return acc
  }, {} as Record<string, Player[]>)

  const positionOrder = ["Goalkeeper", "Defence", "Midfield", "Offence", "Other"]
  const sortedPositions = Object.keys(groupedPlayers).sort(
    (a, b) => positionOrder.indexOf(a) - positionOrder.indexOf(b)
  )

  return (
    <div className="card-stadium overflow-hidden">
      <div className="p-3 bg-gradient-to-r from-pitch-50 to-pitch-100/50 border-b border-pitch-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-pitch-600" />
            <h3 className="font-bold text-pitch-800 text-sm">Effectif</h3>
          </div>
          <span className="text-xs text-stadium-500">{players.length} joueurs</span>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {sortedPositions.map((position) => (
          <div key={position}>
            <div className="px-3 py-1.5 bg-stadium-50 border-b border-stadium-100">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                positionColors[position] || "bg-stadium-100 text-stadium-700"
              }`}>
                {positionLabels[position] || position}
              </span>
            </div>
            <div className="divide-y divide-pitch-50">
              {groupedPlayers[position].map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="px-3 py-2 hover:bg-pitch-50/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {/* Numéro ou avatar */}
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pitch-100 to-pitch-200 flex items-center justify-center flex-shrink-0">
                      {player.number ? (
                        <span className="text-xs font-bold text-pitch-700">{player.number}</span>
                      ) : (
                        <User className="h-3.5 w-3.5 text-pitch-600" />
                      )}
                    </div>

                    {/* Nom et nationalité */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stadium-800 truncate">
                        {player.name}
                      </p>
                      <p className="text-xs text-stadium-500">
                        {player.nationality}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
