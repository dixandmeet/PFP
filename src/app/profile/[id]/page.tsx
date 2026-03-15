"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { UserFeed } from "@/components/profile/UserFeed"
import { MessagingMenu } from "@/components/messaging"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  Loader2, 
  UserPlus, 
  UserMinus, 
  Share2,
  ArrowLeft,
  MapPin,
  Briefcase,
  Building2,
  Shield,
  Users,
  Calendar,
  Trophy,
  MessageCircle,
  MoreHorizontal,
  Check,
  ExternalLink,
  TrendingUp,
  Lock,
  Coins,
  Eye,
  EyeOff,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  POSITIONS, 
  POSITION_ON_FIELD_MAP, 
  POSITION_MOVEMENTS_MAP 
} from "@/lib/constants/football-data"

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
    slug?: string
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
    isPublic?: boolean
    dateOfBirth?: string
    height?: number
    weight?: number
    preferredFoot?: string
  }
  agentProfile?: {
    id: string
    slug?: string
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
    slug?: string
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

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"posts" | "about">("posts")
  const [showMessaging, setShowMessaging] = useState(false)
  
  // Popup de confirmation de crédit
  const [showCreditDialog, setShowCreditDialog] = useState(false)
  const [creditBalance, setCreditBalance] = useState<number | null>(null)
  const [creditLoading, setCreditLoading] = useState(false)

  const slugOrId = params.id as string
  const isOwner = currentUser?.id === user?.id

  // Charger le solde de crédits
  const loadCreditBalance = useCallback(async () => {
    try {
      const response = await fetch("/api/credits/wallets")
      if (response.ok) {
        const data = await response.json()
        setCreditBalance(data.totalBalance)
      }
    } catch {
      // Ignorer les erreurs
    }
  }, [])

  useEffect(() => {
    async function loadProfile() {
      try {
        // Charger l'utilisateur actuel (si connecté)
        try {
          const currentUserResponse = await fetch("/api/users/me")
          if (currentUserResponse.ok) {
            const currentUserData = await currentUserResponse.json()
            setCurrentUser(currentUserData)
          }
        } catch {
          // Non connecté, pas de problème
        }

        // Charger le profil public (supporte slug et ID)
        const profileResponse = await fetch(`/api/profile/by-slug/${slugOrId}`)
        
        if (!profileResponse.ok) {
          // Fallback sur l'ancienne API par ID
          const fallbackResponse = await fetch(`/api/users/${slugOrId}`)
          if (!fallbackResponse.ok) {
            throw new Error("Profil non trouvé")
          }
          const fallbackData = await fallbackResponse.json()
          setUser(fallbackData)
          
          // Vérifier le statut de suivi
          if (currentUser) {
            const followResponse = await fetch(`/api/users/${fallbackData.id}/follow`)
            if (followResponse.ok) {
              const followData = await followResponse.json()
              setIsFollowing(followData.isFollowing || false)
            }
          }
          return
        }

        const profileData = await profileResponse.json()
        setUser(profileData)

        // Mettre à jour l'URL avec le slug si disponible
        const slug = profileData.playerProfile?.slug || 
                     profileData.agentProfile?.slug || 
                     profileData.clubProfile?.slug
        
        if (slug && slug !== slugOrId) {
          window.history.replaceState(null, "", `/profile/${slug}`)
        }

      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil",
          variant: "destructive",
        })
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [slugOrId, router, toast])

  // Charger le statut de suivi une fois que user et currentUser sont disponibles
  useEffect(() => {
    async function checkFollowStatus() {
      if (!currentUser || !user) return
      
      try {
        const followResponse = await fetch(`/api/users/${user.id}/follow`)
        if (followResponse.ok) {
          const followData = await followResponse.json()
          setIsFollowing(followData.isFollowing || false)
        }
      } catch {
        // Ignorer
      }
    }

    checkFollowStatus()
  }, [currentUser, user])

  // Charger les crédits quand l'utilisateur est connecté
  useEffect(() => {
    if (currentUser) {
      loadCreditBalance()
    }
  }, [currentUser, loadCreditBalance])

  // Tracker la consultation de profil (1 crédit, silencieux)
  useEffect(() => {
    if (!user || !currentUser || currentUser.id === user.id) return

    const trackView = async () => {
      try {
        const res = await fetch("/api/profile-views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileId: user.id }),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.cost > 0) {
            loadCreditBalance()
          }
        }
      } catch {
        // Silencieux - ne pas perturber la navigation
      }
    }
    trackView()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, currentUser?.id])

  // Ouvrir le popup de confirmation de crédit
  const handleFollowClick = async () => {
    if (!currentUser) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour suivre un profil",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (isFollowing) {
      // Unfollow direct (pas de crédit à dépenser)
      handleUnfollow()
      return
    }

    // Recharger le solde avant d'afficher le popup
    await loadCreditBalance()
    setShowCreditDialog(true)
  }

  // Confirmer la dépense de crédit et suivre
  const handleConfirmFollow = async () => {
    if (!currentUser || !user) return

    try {
      setCreditLoading(true)

      const response = await fetch("/api/credits/follow-spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: user.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.insufficientCredits) {
          toast({
            title: "Crédits insuffisants",
            description: "Rechargez votre compte pour suivre ce profil",
            variant: "destructive",
          })
        } else if (data.alreadyFollowing) {
          setIsFollowing(true)
          toast({
            title: "Déjà suivi",
            description: "Vous suivez déjà ce profil",
          })
        } else {
          throw new Error(data.error || "Erreur")
        }
        return
      }

      setIsFollowing(true)
      setCreditBalance(data.remainingCredits)
      setShowCreditDialog(false)

      toast({
        title: "Profil débloqué !",
        description: `Vous suivez maintenant ce profil. 1 crédit dépensé.`,
      })

      // Recharger les stats du profil
      const profileResponse = await fetch(`/api/profile/by-slug/${slugOrId}`)
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setUser(profileData)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de suivre ce profil",
        variant: "destructive",
      })
    } finally {
      setCreditLoading(false)
    }
  }

  // Unfollow
  const handleUnfollow = async () => {
    if (!currentUser || !user) return

    try {
      setFollowLoading(true)

      const response = await fetch(`/api/users/${user.id}/follow`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Erreur")

      setIsFollowing(false)

      toast({
        title: "Désabonné",
        description: "Vous ne suivez plus cet utilisateur",
      })

      // Recharger les stats
      const profileResponse = await fetch(`/api/profile/by-slug/${slugOrId}`)
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setUser(profileData)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se désabonner",
        variant: "destructive",
      })
    } finally {
      setFollowLoading(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Profil de ${getProfileName()}`,
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

  const getProfileName = () => {
    if (!user) return ""
    if (user.playerProfile) {
      return user.playerProfile.displayName ||
        `${user.playerProfile.firstName} ${user.playerProfile.lastName}`
    }
    if (user.agentProfile) {
      return `${user.agentProfile.firstName} ${user.agentProfile.lastName}`
    }
    if (user.clubProfile) {
      return user.clubProfile.clubName
    }
    return user.email
  }

  const getProfileType = (): "player" | "agent" | "club" => {
    if (user?.playerProfile) return "player"
    if (user?.agentProfile) return "agent"
    if (user?.clubProfile) return "club"
    return "player"
  }

  const getProfileInfo = () => {
    if (!user) return null
    
    if (user.playerProfile) {
      return {
        name: user.playerProfile.displayName || `${user.playerProfile.firstName} ${user.playerProfile.lastName}`,
        firstName: user.playerProfile.firstName,
        picture: user.playerProfile.profilePicture,
        coverPhoto: user.playerProfile.coverPhoto,
        position: getFullPositionName(user.playerProfile.primaryPosition),
        positionCode: user.playerProfile.primaryPosition,
        club: user.playerProfile.currentClub,
        league: user.playerProfile.currentLeague,
        location: user.playerProfile.nationality,
        bio: user.playerProfile.bio,
        isVerified: false,
        type: "player" as const,
      }
    }
    
    if (user.agentProfile) {
      return {
        name: `${user.agentProfile.firstName} ${user.agentProfile.lastName}`,
        firstName: user.agentProfile.firstName,
        picture: user.agentProfile.profilePicture,
        coverPhoto: user.agentProfile.coverPhoto,
        position: user.agentProfile.agencyName || "Agent",
        positionCode: null,
        club: null,
        league: null,
        location: user.agentProfile.specialties?.join(", "),
        bio: user.agentProfile.bio,
        isVerified: user.agentProfile.isVerified,
        type: "agent" as const,
      }
    }
    
    if (user.clubProfile) {
      return {
        name: user.clubProfile.clubName,
        firstName: user.clubProfile.shortName || user.clubProfile.clubName.charAt(0),
        picture: user.clubProfile.logo,
        coverPhoto: user.clubProfile.coverPhoto,
        position: user.clubProfile.league || "",
        positionCode: null,
        club: null,
        league: user.clubProfile.league,
        location: `${user.clubProfile.city ? user.clubProfile.city + ", " : ""}${user.clubProfile.country || ""}`,
        bio: user.clubProfile.bio,
        isVerified: user.clubProfile.isVerified,
        type: "club" as const,
      }
    }
    
    return null
  }

  const stats = user?._count || { followedBy: 0, following: 0, posts: 0 }
  const profileInfo = getProfileInfo()

  // L'utilisateur peut voir le contenu s'il est le propriétaire ou s'il suit le profil
  const canViewContent = isOwner || isFollowing

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-stadium-50 to-pitch-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-pitch-200 border-t-pitch-600 animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-pitch-600 animate-spin" />
            </div>
          </div>
          <p className="mt-4 text-stadium-600 font-medium">Chargement du profil...</p>
        </motion.div>
      </div>
    )
  }

  if (!user || !profileInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stadium-50 to-pitch-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-16 w-16 text-stadium-300 mx-auto mb-4" />
          <p className="text-stadium-600 text-lg font-medium">Profil non trouvé</p>
          <Button onClick={() => router.push("/search")} className="mt-4" variant="outline">
            Retour à la recherche
          </Button>
        </div>
      </div>
    )
  }

  const initials = profileInfo.firstName?.slice(0, 2).toUpperCase() || "?"

  return (
    <div className="min-h-screen bg-gradient-to-br from-stadium-50 via-white to-pitch-50/30">
      {/* Hero Header */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-pitch-500 via-pitch-600 to-pitch-700 relative overflow-hidden">
          {profileInfo.coverPhoto ? (
            profileInfo.coverPhoto.startsWith('/uploads') ? (
              <img
                src={profileInfo.coverPhoto}
                alt="Couverture"
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
            ) : (
              <Image
                src={profileInfo.coverPhoto}
                alt="Couverture"
                fill
                className="object-cover opacity-80"
                priority
              />
            )
          ) : (
            <>
              {/* Motif décoratif */}
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-pitch-400/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          
          {/* Navigation */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/30 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/30 transition-colors"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Profile Info Card */}
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="relative -mt-20 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl border border-stadium-100 overflow-hidden"
            >
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0 flex flex-col items-center md:items-start">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="relative"
                    >
                      <div className={cn(
                        "w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-xl border-4 border-white",
                        profileInfo.type === "club" ? "bg-white" : "bg-gradient-to-br from-pitch-100 to-pitch-200"
                      )}>
                        {profileInfo.picture ? (
                          profileInfo.picture.startsWith('/uploads') ? (
                            <img
                              src={profileInfo.picture}
                              alt={profileInfo.name}
                              className={cn(
                                "object-cover w-full h-full",
                                profileInfo.type === "club" && "object-contain p-2"
                              )}
                            />
                          ) : (
                            <Image
                              src={profileInfo.picture}
                              alt={profileInfo.name}
                              fill
                              className={cn(
                                "object-cover",
                                profileInfo.type === "club" && "object-contain p-2"
                              )}
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl font-bold text-pitch-600">{initials}</span>
                          </div>
                        )}
                      </div>
                      {profileInfo.isVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-pitch-600 rounded-full p-1.5 shadow-lg border-2 border-white">
                          <Shield className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-stadium-900 mb-1">
                          {profileInfo.name}
                        </h1>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-stadium-600 mt-2">
                          {profileInfo.position && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pitch-100 text-pitch-700 rounded-full font-medium">
                              <Briefcase className="h-3.5 w-3.5" />
                              {profileInfo.position}
                            </span>
                          )}
                          {profileInfo.club && (
                            <span className="inline-flex items-center gap-1.5">
                              <Building2 className="h-4 w-4 text-stadium-400" />
                              {canViewContent ? profileInfo.club : "Free Agent"}
                            </span>
                          )}
                          {profileInfo.location && (
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="h-4 w-4 text-stadium-400" />
                              {profileInfo.location}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      {!isOwner && (
                        <div className="flex items-center justify-center md:justify-end gap-2">
                          {/* Bouton Message - uniquement si on suit le profil */}
                          {isFollowing && (
                            <Button
                              onClick={() => {
                                if (!currentUser) {
                                  toast({
                                    title: "Connexion requise",
                                    description: "Vous devez être connecté pour envoyer un message",
                                    variant: "destructive",
                                  })
                                  router.push("/login")
                                  return
                                }
                                setShowMessaging(true)
                              }}
                              className="rounded-full px-6 font-semibold bg-stadium-100 text-stadium-700 hover:bg-stadium-200 border border-stadium-200 transition-all"
                            >
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Message
                            </Button>
                          )}
                          <Button
                            onClick={handleFollowClick}
                            disabled={followLoading}
                            className={cn(
                              "rounded-full px-6 font-semibold transition-all",
                              isFollowing
                                ? "bg-stadium-100 text-stadium-700 hover:bg-stadium-200 border border-stadium-200"
                                : "bg-gradient-to-r from-pitch-600 to-pitch-700 hover:from-pitch-700 hover:to-pitch-800 text-white shadow-lg shadow-pitch-200"
                            )}
                          >
                            {followLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isFollowing ? (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Suivi
                              </>
                            ) : (
                              <>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Suivre
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-center md:justify-start gap-6 mt-6 pt-6 border-t border-stadium-100">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-stadium-900">{stats.posts}</p>
                        <p className="text-xs text-stadium-500 uppercase tracking-wide">Publications</p>
                      </div>
                      <div className="h-8 w-px bg-stadium-200" />
                      <div className="text-center">
                        <p className="text-2xl font-bold text-stadium-900">{stats.followedBy}</p>
                        <p className="text-xs text-stadium-500 uppercase tracking-wide">Abonnés</p>
                      </div>
                      <div className="h-8 w-px bg-stadium-200" />
                      <div className="text-center">
                        <p className="text-2xl font-bold text-stadium-900">{stats.following}</p>
                        <p className="text-xs text-stadium-500 uppercase tracking-wide">Abonnements</p>
                      </div>
                    </div>
                  </div>

                  {/* Terrain animé pour les joueurs */}
                  {profileInfo.type === "player" && profileInfo.positionCode && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="hidden lg:block flex-shrink-0"
                    >
                      <div className="relative w-32 h-44 rounded-xl overflow-hidden shadow-lg border-2 border-pitch-200">
                        {/* Fond du terrain */}
                        <div className="absolute inset-0 bg-gradient-to-b from-pitch-500 to-pitch-600" />
                        
                        {/* Lignes du terrain */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 140" preserveAspectRatio="none">
                          <rect x="5" y="5" width="90" height="130" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
                          <line x1="5" y1="70" x2="95" y2="70" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
                          <circle cx="50" cy="70" r="12" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
                          <circle cx="50" cy="70" r="1.5" fill="rgba(255,255,255,0.5)" />
                          <rect x="20" y="5" width="60" height="25" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
                          <rect x="35" y="5" width="30" height="10" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
                          <rect x="20" y="110" width="60" height="25" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
                          <rect x="35" y="125" width="30" height="10" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
                        </svg>
                        
                        {/* Joueur animé */}
                        <motion.div
                          className="absolute"
                          initial={{
                            left: `${getPositionOnField(profileInfo.positionCode).x}%`,
                            top: `${getPositionOnField(profileInfo.positionCode).y}%`,
                          }}
                          animate={{
                            left: getPositionMovements(profileInfo.positionCode).x.map(x => `${x}%`),
                            top: getPositionMovements(profileInfo.positionCode).y.map(y => `${y}%`),
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          style={{ transform: "translate(-50%, -50%)" }}
                        >
                          <div className="relative">
                            <motion.div
                              className="absolute inset-0 bg-white rounded-full"
                              animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                              style={{ width: 20, height: 20, marginLeft: -3, marginTop: -3 }}
                            />
                            <div className="w-3.5 h-3.5 bg-white rounded-full shadow-lg border-2 border-pitch-800" />
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Bio - visible uniquement si suivi ou propriétaire */}
                {profileInfo.bio && canViewContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 p-4 bg-gradient-to-r from-stadium-50 to-pitch-50/50 rounded-xl border border-stadium-100"
                  >
                    <p className="text-sm text-stadium-700 leading-relaxed">{profileInfo.bio}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="container mx-auto px-4 max-w-4xl pb-12">
        {canViewContent ? (
          <>
            {/* Tab Navigation */}
            <div className="flex items-center gap-1 p-1 bg-stadium-100 rounded-xl mb-6 w-fit">
              <button
                onClick={() => setActiveTab("posts")}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
                  activeTab === "posts"
                    ? "bg-white text-stadium-900 shadow-sm"
                    : "text-stadium-600 hover:text-stadium-900"
                )}
              >
                <MessageCircle className="h-4 w-4 inline-block mr-2" />
                Publications
              </button>
              <button
                onClick={() => setActiveTab("about")}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
                  activeTab === "about"
                    ? "bg-white text-stadium-900 shadow-sm"
                    : "text-stadium-600 hover:text-stadium-900"
                )}
              >
                <Users className="h-4 w-4 inline-block mr-2" />
                À propos
              </button>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === "posts" && (
                <motion.div
                  key="posts"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <UserFeed userId={user.id} currentUserId={currentUser?.id} />
                </motion.div>
              )}

              {activeTab === "about" && (
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-2xl shadow-sm border border-stadium-100 p-6"
                >
                  <h3 className="text-lg font-semibold text-stadium-800 mb-4">Informations</h3>
                  <div className="space-y-4">
                    {profileInfo.position && (
                      <div className="flex items-center gap-3 py-3 border-b border-stadium-100">
                        <Briefcase className="h-5 w-5 text-pitch-600" />
                        <div>
                          <p className="text-xs text-stadium-500 uppercase tracking-wide">Poste</p>
                          <p className="font-medium text-stadium-800">{profileInfo.position}</p>
                        </div>
                      </div>
                    )}
                    {profileInfo.club && (
                      <div className="flex items-center gap-3 py-3 border-b border-stadium-100">
                        <Building2 className="h-5 w-5 text-pitch-600" />
                        <div>
                          <p className="text-xs text-stadium-500 uppercase tracking-wide">Club actuel</p>
                          <p className="font-medium text-stadium-800">{profileInfo.club}</p>
                        </div>
                      </div>
                    )}
                    {profileInfo.location && (
                      <div className="flex items-center gap-3 py-3 border-b border-stadium-100">
                        <MapPin className="h-5 w-5 text-pitch-600" />
                        <div>
                          <p className="text-xs text-stadium-500 uppercase tracking-wide">
                            {profileInfo.type === "player" ? "Nationalité" : "Localisation"}
                          </p>
                          <p className="font-medium text-stadium-800">{profileInfo.location}</p>
                        </div>
                      </div>
                    )}
                    {profileInfo.league && (
                      <div className="flex items-center gap-3 py-3">
                        <Trophy className="h-5 w-5 text-pitch-600" />
                        <div>
                          <p className="text-xs text-stadium-500 uppercase tracking-wide">Ligue</p>
                          <p className="font-medium text-stadium-800">{profileInfo.league}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          /* Contenu verrouillé - l'utilisateur ne suit pas ce profil */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-stadium-100 overflow-hidden">
              {/* Aperçu flouté */}
              <div className="relative">
                <div className="p-6 filter blur-sm select-none pointer-events-none opacity-50">
                  <div className="flex items-center gap-1 p-1 bg-stadium-100 rounded-xl mb-6 w-fit">
                    <div className="px-6 py-2.5 rounded-lg text-sm font-medium bg-white text-stadium-900 shadow-sm">
                      <MessageCircle className="h-4 w-4 inline-block mr-2" />
                      Publications
                    </div>
                    <div className="px-6 py-2.5 rounded-lg text-sm font-medium text-stadium-600">
                      <Users className="h-4 w-4 inline-block mr-2" />
                      À propos
                    </div>
                  </div>
                  
                  {/* Faux contenu flouté */}
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-stadium-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-stadium-200" />
                          <div className="space-y-1.5">
                            <div className="h-3 w-24 bg-stadium-200 rounded" />
                            <div className="h-2 w-16 bg-stadium-100 rounded" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 w-full bg-stadium-200 rounded" />
                          <div className="h-3 w-3/4 bg-stadium-200 rounded" />
                          <div className="h-3 w-1/2 bg-stadium-100 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overlay de verrouillage */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-white via-white/95 to-white/80">
                  <div className="text-center max-w-sm px-6">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pitch-100 to-pitch-200 flex items-center justify-center">
                        <Lock className="h-7 w-7 text-pitch-600" />
                      </div>
                      <h3 className="text-lg font-bold text-stadium-900 mb-2">
                        Contenu réservé aux abonnés
                      </h3>
                      <p className="text-sm text-stadium-500 mb-6 leading-relaxed">
                        Suivez ce profil pour accéder à ses publications, informations détaillées et pouvoir lui envoyer un message.
                      </p>
                      <Button
                        onClick={handleFollowClick}
                        disabled={followLoading}
                        className="rounded-full px-8 py-3 font-semibold bg-gradient-to-r from-pitch-600 to-pitch-700 hover:from-pitch-700 hover:to-pitch-800 text-white shadow-lg shadow-pitch-200 transition-all"
                      >
                        {followLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Coins className="h-4 w-4 mr-2" />
                        )}
                        Suivre pour 1 crédit
                      </Button>
                      <p className="text-xs text-stadium-400 mt-3">
                        1 crédit sera déduit de votre solde
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Dialog de confirmation de dépense de crédit */}
      <Dialog open={showCreditDialog} onOpenChange={setShowCreditDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pitch-100 to-pitch-200 flex items-center justify-center">
                <Coins className="h-5 w-5 text-pitch-600" />
              </div>
              Suivre {profileInfo.name}
            </DialogTitle>
            <DialogDescription className="text-left pt-2">
              Pour accéder au contenu de ce profil et pouvoir envoyer des messages, vous devez dépenser <strong className="text-stadium-900">1 crédit</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Résumé de la transaction */}
            <div className="bg-gradient-to-r from-stadium-50 to-pitch-50/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stadium-600">Coût du suivi</span>
                <span className="font-bold text-stadium-900">1 crédit</span>
              </div>
              <div className="h-px bg-stadium-200" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-stadium-600">Votre solde actuel</span>
                <span className={cn(
                  "font-bold",
                  (creditBalance ?? 0) >= 1 ? "text-pitch-600" : "text-red-500"
                )}>
                  {creditBalance !== null ? `${creditBalance} crédit${creditBalance !== 1 ? 's' : ''}` : "..."}
                </span>
              </div>
              {creditBalance !== null && creditBalance >= 1 && (
                <>
                  <div className="h-px bg-stadium-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stadium-600">Solde après</span>
                    <span className="font-bold text-stadium-700">
                      {creditBalance - 1} crédit{(creditBalance - 1) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Avertissement si crédits insuffisants */}
            {creditBalance !== null && creditBalance < 1 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100"
              >
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700">Crédits insuffisants</p>
                  <p className="text-xs text-red-500 mt-0.5">
                    Rechargez votre compte pour suivre ce profil.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Ce que vous obtenez */}
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-stadium-500 uppercase tracking-wide">Ce que vous obtenez</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-stadium-700">
                  <Eye className="h-4 w-4 text-pitch-500" />
                  <span>Accès complet au profil et publications</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-stadium-700">
                  <MessageCircle className="h-4 w-4 text-pitch-500" />
                  <span>Possibilité d&apos;envoyer des messages</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-stadium-700">
                  <TrendingUp className="h-4 w-4 text-pitch-500" />
                  <span>Mises à jour et nouvelles publications</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreditDialog(false)}
              className="rounded-full"
            >
              Annuler
            </Button>
            {creditBalance !== null && creditBalance < 1 ? (
              <Button
                onClick={() => {
                  setShowCreditDialog(false)
                  router.push("/credits")
                }}
                className="rounded-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
              >
                <Coins className="mr-2 h-4 w-4" />
                Recharger mes crédits
              </Button>
            ) : (
              <Button
                onClick={handleConfirmFollow}
                disabled={creditLoading}
                className="rounded-full bg-gradient-to-r from-pitch-600 to-pitch-700 hover:from-pitch-700 hover:to-pitch-800 text-white shadow-lg shadow-pitch-200"
              >
                {creditLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Confirmer (1 crédit)
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Messagerie */}
      {currentUser && isFollowing && (
        <MessagingMenu
          currentUserId={currentUser.id}
          recipientId={showMessaging ? user.id : undefined}
          autoOpen={showMessaging}
        />
      )}
    </div>
  )
}
