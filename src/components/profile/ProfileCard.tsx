"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Edit, 
  Eye, 
  Camera,
  MapPin,
  Briefcase,
  Shield,
  Users,
  Building2
} from "lucide-react"
import { 
  POSITIONS, 
  POSITION_ON_FIELD_MAP, 
  POSITION_MOVEMENTS_MAP,
  CLUBS 
} from "@/lib/constants/football-data"

// Fonction pour obtenir le logo du club depuis la liste
const getClubLogo = (clubName?: string): string | undefined => {
  if (!clubName) return undefined
  const club = CLUBS.find(c => c.name === clubName)
  return club?.logo
}

// Fonction pour obtenir le nom complet de la position
const getFullPositionName = (abbreviation?: string): string => {
  if (!abbreviation) return ""
  const position = POSITIONS.find(p => p.code === abbreviation)
  return position?.name || abbreviation
}

// Fonction pour obtenir la position sur le terrain
const getPositionOnField = (code?: string) => {
  if (!code) return { x: 50, y: 50 }
  return POSITION_ON_FIELD_MAP[code] || { x: 50, y: 50 }
}

// Fonction pour obtenir les mouvements d'animation
const getPositionMovements = (code?: string) => {
  if (!code) return { x: [50], y: [50] }
  return POSITION_MOVEMENTS_MAP[code] || { x: [50], y: [50] }
}

interface UserProfile {
  id: string
  email: string
  role: string
  playerProfile?: {
    id: string
    firstName: string
    lastName: string
    displayName?: string
    profilePicture?: string
    coverPhoto?: string
    primaryPosition?: string
    nationality?: string
    bio?: string
    currentClub?: string
    currentLeague?: string
  }
  agentProfile?: {
    id: string
    firstName: string
    lastName: string
    profilePicture?: string
    coverPhoto?: string
    agencyName?: string
    bio?: string
    specialties?: string[]
    isVerified?: boolean
  }
  clubProfile?: {
    id: string
    clubName: string
    shortName?: string
    logo?: string
    coverPhoto?: string
    country?: string
    city?: string
    league?: string
    bio?: string
    isVerified?: boolean
  }
  _count?: {
    followedBy: number
    following: number
    posts: number
  }
}

interface ProfileCardProps {
  user: UserProfile
  profileType: "player" | "agent" | "club"
  isOwner?: boolean
  onEditClick?: () => void
  onViewPublicClick?: () => void
  onCoverPhotoChange?: (file: File) => void
}

export function ProfileCard({
  user,
  profileType,
  isOwner = false,
  onEditClick,
  onViewPublicClick,
  onCoverPhotoChange,
}: ProfileCardProps) {
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [isBioExpanded, setIsBioExpanded] = useState(false)

  // Récupérer les infos selon le type de profil
  const getProfileInfo = () => {
    if (profileType === "player" && user.playerProfile) {
      return {
        name: user.playerProfile.displayName || 
              `${user.playerProfile.firstName} ${user.playerProfile.lastName}`,
        picture: user.playerProfile.profilePicture,
        coverPhoto: user.playerProfile.coverPhoto,
        position: getFullPositionName(user.playerProfile.primaryPosition),
        club: user.playerProfile.currentClub || "À renseigner",
        clubLogo: getClubLogo(user.playerProfile.currentClub),
        location: user.playerProfile.nationality,
        bio: user.playerProfile.bio,
        isVerified: false,
      }
    } else if (profileType === "agent" && user.agentProfile) {
      return {
        name: `${user.agentProfile.firstName} ${user.agentProfile.lastName}`,
        picture: user.agentProfile.profilePicture,
        coverPhoto: user.agentProfile.coverPhoto,
        position: user.agentProfile.agencyName || "Agent",
        club: undefined,
        clubLogo: undefined,
        location: user.agentProfile.specialties?.join(", "),
        bio: user.agentProfile.bio,
        isVerified: user.agentProfile.isVerified,
      }
    } else if (profileType === "club" && user.clubProfile) {
      return {
        name: user.clubProfile.clubName,
        picture: user.clubProfile.logo,
        coverPhoto: user.clubProfile.coverPhoto,
        position: user.clubProfile.league || "",
        club: undefined,
        clubLogo: undefined,
        location: `${user.clubProfile.city ? user.clubProfile.city + ", " : ""}${user.clubProfile.country || ""}`,
        bio: user.clubProfile.bio,
        isVerified: user.clubProfile.isVerified,
      }
    }
    return {
      name: user.email,
      picture: undefined,
      coverPhoto: undefined,
      position: "",
      club: undefined,
      clubLogo: undefined,
      location: "",
      bio: "",
      isVerified: false,
    }
  }

  const profileInfo = getProfileInfo()
  const stats = user._count || { followedBy: 0, following: 0, posts: 0 }

  const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onCoverPhotoChange) {
      setIsUploadingCover(true)
      onCoverPhotoChange(file)
      setTimeout(() => setIsUploadingCover(false), 1000)
    }
  }

  return (
    <Card className="overflow-hidden border-2 border-stadium-200 shadow-xl">
      {/* Photo de couverture */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-pitch-100 to-pitch-200">
        {profileInfo.coverPhoto ? (
          // Utiliser img standard pour les uploads locaux, Image pour les URLs distantes
          profileInfo.coverPhoto.startsWith('/uploads') ? (
            <img
              src={profileInfo.coverPhoto}
              alt="Photo de couverture"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <Image
              src={profileInfo.coverPhoto}
              alt="Photo de couverture"
              fill
              className="object-cover"
              priority
            />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-stadium-400">
              <Camera className="h-16 w-16 mx-auto mb-2" />
              <p className="text-sm">Aucune photo de couverture</p>
            </div>
          </div>
        )}
        
        {/* Bouton upload couverture (uniquement pour le propriétaire) */}
        {isOwner && (
          <label className="absolute top-4 right-4 cursor-pointer">
            <div className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all">
              <Camera className="h-5 w-5 text-pitch-700" />
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverPhotoUpload}
              disabled={isUploadingCover}
            />
          </label>
        )}
      </div>

      <CardContent className="relative pt-6 pb-8 px-6">
        {/* Layout principal avec photo à gauche et terrain à droite */}
        <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-8 -mt-16 mb-6">
          {/* Section gauche: Photo et infos */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 flex-1">
            {/* Photo de profil - à gauche */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative flex-shrink-0"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-stadium-100">
                {profileInfo.picture ? (
                  profileInfo.picture.startsWith('/uploads') ? (
                    <img
                      src={profileInfo.picture}
                      alt={profileInfo.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <Image
                      src={profileInfo.picture}
                      alt={profileInfo.name}
                      width={112}
                      height={112}
                      className="object-cover w-full h-full"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pitch-200 to-pitch-300">
                    <Users className="h-10 w-10 text-pitch-600" />
                  </div>
                )}
              </div>
              {profileInfo.isVerified && (
                <div className="absolute bottom-1 right-1 bg-pitch-600 rounded-full p-1.5 shadow-lg">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              )}
            </motion.div>

            {/* Informations principales */}
            <div className="flex-1 text-center sm:text-left sm:pt-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-stadium-900 mb-1">
                {profileInfo.name}
              </h1>
              
              {/* Poste complet */}
              {profileInfo.position && (
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <Briefcase className="h-4 w-4 text-pitch-600" />
                  <p className="text-base text-pitch-700 font-semibold">
                    {profileInfo.position}
                  </p>
                </div>
              )}

              {/* Club avec logo */}
              {profileType === "player" && (
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  {profileInfo.clubLogo ? (
                    profileInfo.clubLogo.startsWith('/uploads') ? (
                      <img
                        src={profileInfo.clubLogo}
                        alt="Logo du club"
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <Image
                        src={profileInfo.clubLogo}
                        alt="Logo du club"
                        width={20}
                        height={20}
                        className="rounded-full object-cover"
                      />
                    )
                  ) : (
                    <Building2 className="h-4 w-4 text-stadium-500" />
                  )}
                  <span className={`text-sm ${profileInfo.club === "À renseigner" ? "text-stadium-400 italic" : "text-stadium-700 font-medium"}`}>
                    {profileInfo.club}
                  </span>
                </div>
              )}

              {/* Localisation */}
              {profileInfo.location && (
                <div className="flex items-center justify-center sm:justify-start gap-2 text-stadium-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{profileInfo.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Terrain de football - à droite (uniquement pour les joueurs) */}
          {profileType === "player" && user.playerProfile?.primaryPosition && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex-shrink-0"
            >
              <div className="relative w-36 h-48 sm:w-44 sm:h-56 rounded-xl overflow-hidden shadow-lg border-2 border-pitch-300">
                {/* Fond du terrain */}
                <div className="absolute inset-0 bg-gradient-to-b from-pitch-500 to-pitch-600" />
                
                {/* Lignes du terrain */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 100 140"
                  preserveAspectRatio="none"
                >
                  {/* Bordure du terrain */}
                  <rect
                    x="5"
                    y="5"
                    width="90"
                    height="130"
                    fill="none"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="0.8"
                  />
                  
                  {/* Ligne médiane */}
                  <line
                    x1="5"
                    y1="70"
                    x2="95"
                    y2="70"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="0.8"
                  />
                  
                  {/* Rond central */}
                  <circle
                    cx="50"
                    cy="70"
                    r="12"
                    fill="none"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="0.8"
                  />
                  <circle
                    cx="50"
                    cy="70"
                    r="1.5"
                    fill="rgba(255,255,255,0.6)"
                  />
                  
                  {/* Surface de réparation haute */}
                  <rect
                    x="20"
                    y="5"
                    width="60"
                    height="25"
                    fill="none"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="0.8"
                  />
                  {/* Petite surface haute */}
                  <rect
                    x="35"
                    y="5"
                    width="30"
                    height="10"
                    fill="none"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="0.8"
                  />
                  {/* Point de penalty haut */}
                  <circle
                    cx="50"
                    cy="20"
                    r="1.5"
                    fill="rgba(255,255,255,0.6)"
                  />
                  
                  {/* Surface de réparation basse */}
                  <rect
                    x="20"
                    y="110"
                    width="60"
                    height="25"
                    fill="none"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="0.8"
                  />
                  {/* Petite surface basse */}
                  <rect
                    x="35"
                    y="125"
                    width="30"
                    height="10"
                    fill="none"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="0.8"
                  />
                  {/* Point de penalty bas */}
                  <circle
                    cx="50"
                    cy="120"
                    r="1.5"
                    fill="rgba(255,255,255,0.6)"
                  />
                  
                  {/* Cages - haute */}
                  <rect
                    x="40"
                    y="2"
                    width="20"
                    height="3"
                    fill="none"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="1"
                  />
                  
                  {/* Cages - basse */}
                  <rect
                    x="40"
                    y="135"
                    width="20"
                    height="3"
                    fill="none"
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth="1"
                  />
                </svg>
                
                {/* Joueur animé sur le terrain */}
                <motion.div
                  className="absolute"
                  initial={{
                    left: `${getPositionOnField(user.playerProfile.primaryPosition).x}%`,
                    top: `${getPositionOnField(user.playerProfile.primaryPosition).y}%`,
                  }}
                  animate={{
                    left: getPositionMovements(user.playerProfile.primaryPosition).x.map(x => `${x}%`),
                    top: getPositionMovements(user.playerProfile.primaryPosition).y.map(y => `${y}%`),
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ transform: "translate(-50%, -50%)" }}
                >
                  {/* Marqueur du joueur */}
                  <div className="relative">
                    {/* Effet de pulsation */}
                    <motion.div
                      className="absolute inset-0 bg-white rounded-full"
                      animate={{
                        scale: [1, 1.8, 1],
                        opacity: [0.6, 0, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{ width: 24, height: 24, marginLeft: -4, marginTop: -4 }}
                    />
                    {/* Point du joueur */}
                    <div className="w-4 h-4 bg-white rounded-full shadow-lg border-2 border-pitch-800 flex items-center justify-center">
                      <div className="w-2 h-2 bg-pitch-600 rounded-full" />
                    </div>
                  </div>
                </motion.div>
                
              </div>
            </motion.div>
          )}
        </div>

        {/* Stats et Présentation côte à côte */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6 max-w-4xl mx-auto">
          {/* Statistiques - à gauche */}
          <div className="flex-shrink-0">
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:w-32">
              <div className="text-center p-3 bg-stadium-50 rounded-lg">
                <p className="text-xl font-bold text-pitch-700">{stats.posts}</p>
                <p className="text-xs text-stadium-600">Posts</p>
              </div>
              <div className="text-center p-3 bg-stadium-50 rounded-lg">
                <p className="text-xl font-bold text-pitch-700">{stats.followedBy}</p>
                <p className="text-xs text-stadium-600">Abonnés</p>
              </div>
              <div className="text-center p-3 bg-stadium-50 rounded-lg">
                <p className="text-xl font-bold text-pitch-700">{stats.following}</p>
                <p className="text-xs text-stadium-600">Abonnements</p>
              </div>
            </div>
          </div>

          {/* Bio - à droite */}
          {profileInfo.bio && (
            <div className="flex-1">
              <div className="bg-gradient-to-r from-stadium-50 to-pitch-50 rounded-xl p-5 border border-stadium-100 h-full">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-pitch-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-pitch-700 mb-2">Présentation</h3>
                    <p className={`text-sm text-stadium-700 leading-relaxed whitespace-pre-line ${!isBioExpanded ? 'line-clamp-4' : ''}`}>
                      {profileInfo.bio}
                    </p>
                    {profileInfo.bio && profileInfo.bio.length > 200 && (
                      <button
                        onClick={() => setIsBioExpanded(!isBioExpanded)}
                        className="mt-2 text-sm font-medium text-pitch-600 hover:text-pitch-700 transition-colors"
                      >
                        {isBioExpanded ? "Voir moins" : "Voir plus"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        {isOwner && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onEditClick}
              size="sm"
              className="bg-gradient-to-r from-pitch-600 to-pitch-700 hover:from-pitch-700 hover:to-pitch-800 text-white font-semibold shadow-lg"
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier le profil
            </Button>
            <Button
              onClick={onViewPublicClick}
              variant="outline"
              size="sm"
              className="border-2 border-pitch-600 text-pitch-700 hover:bg-pitch-50 font-semibold"
            >
              <Eye className="mr-2 h-4 w-4" />
              Consulter la page publique
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
