"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Trophy, Check, X, Minus } from "lucide-react"
import type { Match } from "@/lib/services/thesportsdb"

interface ClubLastResultsProps {
  matches: Match[]
  clubName: string
  fullWidth?: boolean
}

export function ClubLastResults({ matches, clubName, fullWidth = false }: ClubLastResultsProps) {
  if (matches.length === 0) {
    return (
      <div className="card-stadium p-8 text-center">
        <Trophy className="h-12 w-12 text-stadium-300 mx-auto mb-3" />
        <p className="text-stadium-500">Aucun résultat récent</p>
      </div>
    )
  }

  const getResult = (match: Match): "win" | "draw" | "loss" => {
    if (match.score.home === null || match.score.away === null) return "draw"
    
    const isHome = match.homeTeam.name.toLowerCase().includes(clubName.toLowerCase()) ||
                   match.homeTeam.shortName.toLowerCase().includes(clubName.toLowerCase())
    
    const clubScore = isHome ? match.score.home : match.score.away
    const opponentScore = isHome ? match.score.away : match.score.home

    if (clubScore > opponentScore) return "win"
    if (clubScore < opponentScore) return "loss"
    return "draw"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", { 
      day: "numeric", 
      month: fullWidth ? "long" : "short",
      year: fullWidth ? "numeric" : undefined
    })
  }

  return (
    <div className="card-stadium overflow-hidden">
      {!fullWidth && (
        <div className="p-3 bg-gradient-to-r from-pitch-50 to-pitch-100/50 border-b border-pitch-200">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-pitch-600" />
            <h3 className="font-bold text-pitch-800 text-sm">Derniers résultats</h3>
          </div>
        </div>
      )}

      <div className="divide-y divide-pitch-50">
        {matches.map((match, index) => {
          const result = getResult(match)
          
          return (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`hover:bg-pitch-50/50 transition-colors ${fullWidth ? "p-4 sm:p-5" : "p-3"}`}
            >
              <div className={`flex items-center gap-2 ${fullWidth ? "mb-3" : "mb-2"}`}>
                <span className={`text-stadium-500 ${fullWidth ? "text-sm font-medium" : "text-xs"}`}>
                  {match.competition}
                </span>
                <span className="text-stadium-400">•</span>
                <span className={`text-stadium-500 ${fullWidth ? "text-sm" : "text-xs"}`}>
                  {formatDate(match.date)}
                </span>
              </div>
              
              <div className={`flex items-center ${fullWidth ? "gap-4" : "gap-2"}`}>
                {/* Équipe domicile */}
                <div className={`flex items-center flex-1 min-w-0 ${fullWidth ? "gap-3" : "gap-1.5"}`}>
                  <Image
                    src={match.homeTeam.crest}
                    alt={match.homeTeam.shortName}
                    width={fullWidth ? 32 : 20}
                    height={fullWidth ? 32 : 20}
                    className="object-contain"
                    loading="lazy"
                  />
                  <span className={`font-medium text-stadium-700 truncate ${fullWidth ? "text-base" : "text-xs"}`}>
                    {fullWidth ? match.homeTeam.name : match.homeTeam.shortName}
                  </span>
                </div>

                {/* Score */}
                <div className={`flex items-center gap-2 ${fullWidth ? "px-4 py-2 bg-stadium-50 rounded-lg" : "px-2"}`}>
                  <span className={`font-bold text-stadium-900 text-center ${fullWidth ? "text-xl w-6" : "text-sm w-4"}`}>
                    {match.score.home ?? "-"}
                  </span>
                  <span className="text-stadium-400">-</span>
                  <span className={`font-bold text-stadium-900 text-center ${fullWidth ? "text-xl w-6" : "text-sm w-4"}`}>
                    {match.score.away ?? "-"}
                  </span>
                </div>

                {/* Équipe extérieur */}
                <div className={`flex items-center flex-1 min-w-0 justify-end ${fullWidth ? "gap-3" : "gap-1.5"}`}>
                  <span className={`font-medium text-stadium-700 truncate ${fullWidth ? "text-base" : "text-xs"}`}>
                    {fullWidth ? match.awayTeam.name : match.awayTeam.shortName}
                  </span>
                  <Image
                    src={match.awayTeam.crest}
                    alt={match.awayTeam.shortName}
                    width={fullWidth ? 32 : 20}
                    height={fullWidth ? 32 : 20}
                    className="object-contain"
                    loading="lazy"
                  />
                </div>

                {/* Indicateur résultat */}
                <div className={`rounded-full flex items-center justify-center flex-shrink-0 ${
                  fullWidth ? "w-8 h-8" : "w-6 h-6"
                } ${
                  result === "win" 
                    ? "bg-green-100 text-green-600" 
                    : result === "loss"
                    ? "bg-red-100 text-red-600"
                    : "bg-stadium-100 text-stadium-600"
                }`}>
                  {result === "win" && <Check className={fullWidth ? "h-5 w-5" : "h-3.5 w-3.5"} />}
                  {result === "loss" && <X className={fullWidth ? "h-5 w-5" : "h-3.5 w-3.5"} />}
                  {result === "draw" && <Minus className={fullWidth ? "h-5 w-5" : "h-3.5 w-3.5"} />}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
