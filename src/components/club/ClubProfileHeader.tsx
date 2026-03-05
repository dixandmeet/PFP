"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  MapPin,
  Shield,
  Building2,
  Users,
  UserPlus,
  UserMinus,
  Share2,
  Loader2,
  Trophy,
  Calendar
} from "lucide-react"

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

interface ClubProfileHeaderProps {
  club: ClubData
  followersCount: number
  followingCount: number
  isFollowing: boolean
  isLoading?: boolean
  onFollow: () => void
  onShare: () => void
}

export function ClubProfileHeader({
  club,
  followersCount,
  followingCount,
  isFollowing,
  isLoading = false,
  onFollow,
  onShare,
}: ClubProfileHeaderProps) {
  return (
    <Card className="overflow-hidden border-2 border-stadium-200 shadow-xl">
      <CardContent className="relative pt-6 pb-6 px-6">
        {/* Logo et infos principales */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
          {/* Logo du club */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative flex-shrink-0"
          >
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl border-4 border-white shadow-xl overflow-hidden bg-white">
              {club.logo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={club.logo}
                  alt={club.clubName}
                  className="object-contain w-full h-full p-2"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-victory-100 to-victory-200">
                  <Building2 className="h-12 w-12 text-victory-600" />
                </div>
              )}
            </div>
            {club.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-victory-600 rounded-full p-1.5 shadow-lg">
                <Shield className="h-4 w-4 text-white" />
              </div>
            )}
          </motion.div>

          {/* Informations principales */}
          <div className="flex-1 text-center sm:text-left sm:pb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-stadium-900 mb-1">
              {club.clubName}
              {club.shortName && (
                <span className="text-stadium-500 font-normal text-lg ml-2">
                  ({club.shortName})
                </span>
              )}
            </h1>
            
            {/* Championnat */}
            {club.league && (
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <Trophy className="h-4 w-4 text-victory-600" />
                <p className="text-base text-victory-700 font-semibold">
                  {club.league}
                  {club.division && ` - ${club.division}`}
                </p>
              </div>
            )}

            {/* Localisation */}
            {(club.city || club.country) && (
              <div className="flex items-center justify-center sm:justify-start gap-2 text-stadium-600">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">
                  {club.city && `${club.city}, `}{club.country}
                </span>
              </div>
            )}

            {/* Année de fondation */}
            {club.foundedYear && (
              <div className="flex items-center justify-center sm:justify-start gap-2 text-stadium-500 mt-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Fondé en {club.foundedYear}</span>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-2 sm:pb-2">
            <Button
              onClick={onFollow}
              disabled={isLoading}
              variant={isFollowing ? "outline" : "default"}
              className={
                isFollowing
                  ? "border-2 border-pitch-600 text-pitch-700 hover:bg-pitch-50"
                  : "bg-gradient-to-r from-pitch-600 to-pitch-700 hover:from-pitch-700 hover:to-pitch-800 text-white"
              }
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isFollowing ? (
                <UserMinus className="mr-2 h-4 w-4" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {isFollowing ? "Ne plus suivre" : "Suivre"}
            </Button>

            <Button
              onClick={onShare}
              variant="outline"
              className="border-2 border-stadium-300"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center sm:justify-start gap-6 mb-6">
          <div className="text-center">
            <p className="text-xl font-bold text-pitch-700">{followersCount}</p>
            <p className="text-xs text-stadium-600">Abonnés</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-pitch-700">{followingCount}</p>
            <p className="text-xs text-stadium-600">Abonnements</p>
          </div>
        </div>

        {/* Bio */}
        {club.bio && (
          <div className="bg-gradient-to-r from-stadium-50 to-victory-50 rounded-xl p-5 border border-stadium-100">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="h-5 w-5 text-victory-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-victory-700 mb-2">À propos</h3>
                <p className="text-sm text-stadium-700 leading-relaxed line-clamp-2">
                  {club.bio}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
