"use client"

import { motion } from "framer-motion"
import { Calendar, Clock } from "lucide-react"
import type { Match } from "@/lib/services/thesportsdb"

interface ClubUpcomingMatchesProps {
  matches: Match[]
  fullWidth?: boolean
}

export function ClubUpcomingMatches({ matches, fullWidth = false }: ClubUpcomingMatchesProps) {
  if (matches.length === 0) {
    return (
      <div className="card-stadium p-8 text-center">
        <Calendar className="h-12 w-12 text-stadium-300 mx-auto mb-3" />
        <p className="text-stadium-500">Aucun match à venir</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", { 
      weekday: fullWidth ? "long" : "short",
      day: "numeric", 
      month: fullWidth ? "long" : "short",
      year: fullWidth ? "numeric" : undefined
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("fr-FR", { 
      hour: "2-digit", 
      minute: "2-digit" 
    })
  }

  return (
    <div className="card-stadium overflow-hidden">
      {!fullWidth && (
        <div className="p-3 bg-gradient-to-r from-victory-50 to-victory-100/50 border-b border-victory-200">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-victory-600" />
            <h3 className="font-bold text-victory-800 text-sm">Prochains matchs</h3>
          </div>
        </div>
      )}

      <div className="divide-y divide-pitch-50">
        {matches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`hover:bg-pitch-50/50 transition-colors ${fullWidth ? "p-4 sm:p-5" : "p-3"}`}
          >
            <div className={`flex items-center gap-2 ${fullWidth ? "mb-4" : "mb-2"}`}>
              <span className={`text-stadium-500 ${fullWidth ? "text-sm font-medium" : "text-xs"}`}>
                {match.competition}
              </span>
              <span className="text-stadium-400">•</span>
              <span className={`text-victory-600 font-medium capitalize ${fullWidth ? "text-sm" : "text-xs"}`}>
                {formatDate(match.date)}
              </span>
            </div>
            
            <div className={`flex items-center ${fullWidth ? "gap-4" : "gap-3"}`}>
              {/* Équipe domicile */}
              <div className={`flex items-center flex-1 min-w-0 ${fullWidth ? "gap-3" : "gap-2"}`}>
                <img 
                  src={match.homeTeam.crest} 
                  alt={match.homeTeam.shortName}
                  className={`object-contain ${fullWidth ? "w-10 h-10" : "w-6 h-6"}`}
                />
                <span className={`font-medium text-stadium-800 truncate ${fullWidth ? "text-base" : "text-sm"}`}>
                  {fullWidth ? match.homeTeam.name : match.homeTeam.shortName}
                </span>
              </div>

              {/* VS ou heure */}
              <div className={`flex flex-col items-center ${fullWidth ? "px-4 py-2 bg-victory-50 rounded-lg" : "px-2"}`}>
                <div className={`flex items-center gap-1 text-stadium-500 ${fullWidth ? "text-sm" : "text-xs"}`}>
                  <Clock className={fullWidth ? "h-4 w-4" : "h-3 w-3"} />
                  <span className="font-medium">{formatTime(match.date)}</span>
                </div>
              </div>

              {/* Équipe extérieur */}
              <div className={`flex items-center flex-1 min-w-0 justify-end ${fullWidth ? "gap-3" : "gap-2"}`}>
                <span className={`font-medium text-stadium-800 truncate ${fullWidth ? "text-base" : "text-sm"}`}>
                  {fullWidth ? match.awayTeam.name : match.awayTeam.shortName}
                </span>
                <img 
                  src={match.awayTeam.crest} 
                  alt={match.awayTeam.shortName}
                  className={`object-contain ${fullWidth ? "w-10 h-10" : "w-6 h-6"}`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
