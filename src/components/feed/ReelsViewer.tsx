"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ShareModal } from "./ShareModal"
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  ChevronUp,
  ChevronDown,
  User,
  Shield,
  Building2,
  Send,
  Loader2,
  Film,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getSupportedFormatsMessage } from "@/lib/utils/video-utils"

interface ReelUser {
  id: string
  email: string
  role: string
  playerProfile?: {
    firstName: string
    lastName: string
    displayName?: string
    profilePicture?: string
  }
  agentProfile?: {
    firstName: string
    lastName: string
    profilePicture?: string
  }
  clubProfile?: {
    clubName: string
    logo?: string
  }
}

interface Reel {
  id: string
  content: string
  videoUrl: string
  createdAt: string
  user: ReelUser
  _count?: {
    likes: number
    comments: number
    shares: number
  }
  isLiked?: boolean
  isBookmarked?: boolean
}

interface ReelsViewerProps {
  reels: Reel[]
  initialIndex?: number
  onClose: () => void
  currentUserId?: string
  onLoadMore?: () => void
  hasMore?: boolean
}

export function ReelsViewer({
  reels,
  initialIndex = 0,
  onClose,
  currentUserId,
  onLoadMore,
  hasMore = false,
}: ReelsViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({})
  const [bookmarkedReels, setBookmarkedReels] = useState<Record<string, boolean>>({})
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [showControls, setShowControls] = useState(true)
  const [touchStartY, setTouchStartY] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [postingComment, setPostingComment] = useState(false)
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({})
  const [shareCounts, setShareCounts] = useState<Record<string, number>>({})
  const [videoLoadError, setVideoLoadError] = useState(false)
  const [duration, setDuration] = useState(0)
  const [isSeekingReel, setIsSeekingReel] = useState(false)

  const { toast } = useToast()
  const { register, handleSubmit, reset } = useForm<{ content: string }>()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const currentReel = reels[currentIndex]

  // Réinitialiser l'erreur vidéo quand on change de reel
  useEffect(() => {
    setVideoLoadError(false)
  }, [currentIndex])

  // Initialiser les états de like/bookmark
  useEffect(() => {
    const likes: Record<string, boolean> = {}
    const bookmarks: Record<string, boolean> = {}
    const counts: Record<string, number> = {}
    const commentC: Record<string, number> = {}
    const shareC: Record<string, number> = {}
    reels.forEach(reel => {
      likes[reel.id] = reel.isLiked || false
      bookmarks[reel.id] = reel.isBookmarked || false
      counts[reel.id] = reel._count?.likes || 0
      commentC[reel.id] = reel._count?.comments || 0
      shareC[reel.id] = reel._count?.shares || 0
    })
    setLikedReels(likes)
    setBookmarkedReels(bookmarks)
    setLikeCounts(counts)
    setCommentCounts(commentC)
    setShareCounts(shareC)
  }, [reels])

  // Bloquer le scroll du body quand le viewer est ouvert
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  // Gérer la lecture vidéo lors du changement d'index
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = 0
    setProgress(0)

    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false))
    }
  }, [currentIndex])

  // Mettre à jour la progression et la durée
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateProgress = () => {
      if (video.duration && !isSeekingReel) {
        setProgress((video.currentTime / video.duration) * 100)
      }
    }

    const updateDuration = () => {
      if (video.duration) setDuration(video.duration)
    }

    video.addEventListener("timeupdate", updateProgress)
    video.addEventListener("loadedmetadata", updateDuration)
    return () => {
      video.removeEventListener("timeupdate", updateProgress)
      video.removeEventListener("loadedmetadata", updateDuration)
    }
  }, [currentIndex, isSeekingReel])

  // Auto-hide des contrôles
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }, [])

  useEffect(() => {
    resetControlsTimeout()
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [resetControlsTimeout])

  // Navigation clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer les raccourcis quand l'utilisateur tape dans un champ de saisie
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowUp":
          e.preventDefault()
          goToPrevious()
          break
        case "ArrowDown":
          e.preventDefault()
          goToNext()
          break
        case " ":
          e.preventDefault()
          togglePlay()
          break
        case "m":
          toggleMute()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentIndex, isPlaying, isMuted])

  const goToNext = useCallback(() => {
    if (isTransitioning) return
    if (currentIndex < reels.length - 1) {
      setIsTransitioning(true)
      setCurrentIndex(prev => prev + 1)
      setTimeout(() => setIsTransitioning(false), 400)

      // Charger plus si on approche de la fin
      if (currentIndex >= reels.length - 3 && hasMore && onLoadMore) {
        onLoadMore()
      }
    }
  }, [currentIndex, reels.length, isTransitioning, hasMore, onLoadMore])

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return
    if (currentIndex > 0) {
      setIsTransitioning(true)
      setCurrentIndex(prev => prev - 1)
      setTimeout(() => setIsTransitioning(false), 400)
    }
  }, [currentIndex, isTransitioning])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
    resetControlsTimeout()
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
    resetControlsTimeout()
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleReelSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const video = videoRef.current
    if (!video || !video.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = Math.max(0, Math.min(1, x / rect.width))
    video.currentTime = pct * video.duration
    setProgress(pct * 100)
    resetControlsTimeout()
  }

  const handleReelSeekDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSeekingReel) return
    handleReelSeek(e)
  }

  // Gestion du swipe tactile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY === null) return
    const touchEndY = e.changedTouches[0].clientY
    const diff = touchStartY - touchEndY

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext()
      } else {
        goToPrevious()
      }
    }
    setTouchStartY(null)
  }

  // Gestion du scroll molette
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    if (Math.abs(e.deltaY) > 30) {
      if (e.deltaY > 0) {
        goToNext()
      } else {
        goToPrevious()
      }
    }
  }, [goToNext, goToPrevious])

  const handleLike = async () => {
    if (!currentReel) return
    const reelId = currentReel.id
    const wasLiked = likedReels[reelId]

    // Optimistic update
    setLikedReels(prev => ({ ...prev, [reelId]: !wasLiked }))
    setLikeCounts(prev => ({
      ...prev,
      [reelId]: wasLiked ? (prev[reelId] || 1) - 1 : (prev[reelId] || 0) + 1
    }))

    try {
      const response = await fetch(`/api/posts/${reelId}/like`, {
        method: wasLiked ? "DELETE" : "POST",
      })
      if (!response.ok) throw new Error()
    } catch {
      // Revert
      setLikedReels(prev => ({ ...prev, [reelId]: wasLiked }))
      setLikeCounts(prev => ({
        ...prev,
        [reelId]: wasLiked ? (prev[reelId] || 0) + 1 : (prev[reelId] || 1) - 1
      }))
    }
  }

  const handleBookmark = async () => {
    if (!currentReel) return
    const reelId = currentReel.id
    const wasBookmarked = bookmarkedReels[reelId]

    setBookmarkedReels(prev => ({ ...prev, [reelId]: !wasBookmarked }))

    try {
      const response = await fetch(`/api/posts/${reelId}/bookmark`, {
        method: wasBookmarked ? "DELETE" : "POST",
      })
      if (!response.ok) throw new Error()
    } catch {
      setBookmarkedReels(prev => ({ ...prev, [reelId]: wasBookmarked }))
    }
  }

  // Ouvrir les commentaires
  const handleOpenComments = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!currentReel) return

    setShowComments(true)
    setLoadingComments(true)
    setComments([])

    // Pause la vidéo quand on ouvre les commentaires
    const video = videoRef.current
    if (video && !video.paused) {
      video.pause()
      setIsPlaying(false)
    }

    try {
      const response = await fetch(`/api/posts/${currentReel.id}/comments?page=1&limit=20`)
      if (!response.ok) throw new Error("Erreur")
      const data = await response.json()
      setComments(data.comments || [])
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les commentaires",
        variant: "destructive",
      })
    } finally {
      setLoadingComments(false)
    }
  }

  const handleCloseComments = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setShowComments(false)
    setComments([])
  }

  const onSubmitComment = async (data: { content: string }) => {
    if (!data.content.trim() || !currentReel) return

    setPostingComment(true)
    try {
      const response = await fetch(`/api/posts/${currentReel.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data.content }),
      })

      if (!response.ok) throw new Error("Erreur")

      const newComment = await response.json()
      setComments(prev => [...prev, newComment])
      setCommentCounts(prev => ({
        ...prev,
        [currentReel.id]: (prev[currentReel.id] || 0) + 1,
      }))
      reset()

      toast({
        title: "Succès",
        description: "Commentaire publié",
      })
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de publier le commentaire",
        variant: "destructive",
      })
    } finally {
      setPostingComment(false)
    }
  }

  // Ouvrir le partage
  const handleOpenShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowShareModal(true)
  }

  const handleShareComplete = () => {
    if (!currentReel) return
    setShareCounts(prev => ({
      ...prev,
      [currentReel.id]: (prev[currentReel.id] || 0) + 1,
    }))
  }

  const getUserDisplayName = (user: ReelUser) => {
    if (user.playerProfile) {
      return user.playerProfile.displayName || `${user.playerProfile.firstName} ${user.playerProfile.lastName}`
    }
    if (user.agentProfile) {
      return `${user.agentProfile.firstName} ${user.agentProfile.lastName}`
    }
    if (user.clubProfile) {
      return user.clubProfile.clubName
    }
    return user.email
  }

  const getUserAvatar = (user: ReelUser) => {
    return (
      user.playerProfile?.profilePicture ||
      user.agentProfile?.profilePicture ||
      user.clubProfile?.logo
    )
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "PLAYER": return <User className="h-2.5 w-2.5 text-pitch-600" />
      case "AGENT": return <Shield className="h-2.5 w-2.5 text-gold-600" />
      case "CLUB": return <Building2 className="h-2.5 w-2.5 text-victory-600" />
      default: return null
    }
  }

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  if (!currentReel) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      onClick={resetControlsTimeout}
    >
      {/* Vidéo principale */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative w-full h-full max-w-[480px] mx-auto flex items-center justify-center"
        >
          <video
            ref={(el) => { videoRef.current = el }}
            src={currentReel.videoUrl}
            className={cn("w-full h-full object-contain", videoLoadError && "hidden")}
            loop
            playsInline
            muted={isMuted}
            onClick={togglePlay}
            onCanPlay={(e) => {
              const v = e.currentTarget
              if (v.paused && isPlaying) v.play().catch(() => {})
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => { setVideoLoadError(true); setIsPlaying(false) }}
          />

          {/* Fallback si format vidéo non supporté */}
          {videoLoadError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-4 text-center z-10">
              <Film className="h-14 w-14 text-white/60 mb-4 flex-shrink-0" />
              <p className="text-sm font-medium text-white/80">Format vidéo non supporté par le navigateur</p>
              <p className="text-xs text-white/50 mt-2 max-w-sm">{getSupportedFormatsMessage()}</p>
              <a
                href={currentReel.videoUrl}
                download
                className="mt-4 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-colors"
              >
                Télécharger la vidéo
              </a>
            </div>
          )}

          {/* Overlay gradient bas */}
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

          {/* Overlay gradient haut */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

          {/* Header - Bouton fermer */}
          <div className={cn(
            "absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}>
            <span className="text-white font-bold text-lg tracking-tight">Reels</span>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full h-10 w-10"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Indicateur Play/Pause au centre */}
          <AnimatePresence>
            {!isPlaying && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
              >
                <div className="p-5 rounded-full bg-black/40 backdrop-blur-md">
                  <Play className="h-12 w-12 text-white fill-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions latérales (style TikTok/Instagram) */}
          <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-20">
            {/* Like */}
            <button
              onClick={(e) => { e.stopPropagation(); handleLike() }}
              className="flex flex-col items-center gap-1 group"
            >
              <div className={cn(
                "p-2.5 rounded-full transition-all",
                likedReels[currentReel.id]
                  ? "bg-red-500/20"
                  : "bg-white/10 group-hover:bg-white/20"
              )}>
                <Heart
                  className={cn(
                    "h-6 w-6 transition-all",
                    likedReels[currentReel.id]
                      ? "text-red-500 fill-red-500 scale-110"
                      : "text-white"
                  )}
                />
              </div>
              <span className="text-white text-xs font-semibold">
                {formatCount(likeCounts[currentReel.id] || 0)}
              </span>
            </button>

            {/* Commentaires */}
            <button
              onClick={handleOpenComments}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="p-2.5 rounded-full bg-white/10 group-hover:bg-white/20 transition-all">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <span className="text-white text-xs font-semibold">
                {formatCount(commentCounts[currentReel.id] || 0)}
              </span>
            </button>

            {/* Partager */}
            <button
              onClick={handleOpenShare}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="p-2.5 rounded-full bg-white/10 group-hover:bg-white/20 transition-all">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-white text-xs font-semibold">
                {formatCount(shareCounts[currentReel.id] || 0)}
              </span>
            </button>

            {/* Sauvegarder */}
            <button
              onClick={(e) => { e.stopPropagation(); handleBookmark() }}
              className="flex flex-col items-center gap-1 group"
            >
              <div className={cn(
                "p-2.5 rounded-full transition-all",
                bookmarkedReels[currentReel.id]
                  ? "bg-gold-500/20"
                  : "bg-white/10 group-hover:bg-white/20"
              )}>
                <Bookmark
                  className={cn(
                    "h-6 w-6 transition-all",
                    bookmarkedReels[currentReel.id]
                      ? "text-gold-500 fill-gold-500"
                      : "text-white"
                  )}
                />
              </div>
            </button>

            {/* Volume */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleMute() }}
              className="flex flex-col items-center gap-1 group"
            >
              <div className="p-2.5 rounded-full bg-white/10 group-hover:bg-white/20 transition-all">
                {isMuted ? (
                  <VolumeX className="h-6 w-6 text-white" />
                ) : (
                  <Volume2 className="h-6 w-6 text-white" />
                )}
              </div>
            </button>
          </div>

          {/* Barre de progression seekable */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 z-30 px-4 pb-2 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}>
            <div
              className="group/seek w-full h-6 flex items-end cursor-pointer"
              onClick={handleReelSeek}
              onMouseDown={(e) => { e.stopPropagation(); setIsSeekingReel(true) }}
              onMouseMove={handleReelSeekDrag}
              onMouseUp={() => setIsSeekingReel(false)}
              onMouseLeave={() => setIsSeekingReel(false)}
              onTouchStart={(e) => {
                e.stopPropagation()
                setIsSeekingReel(true)
                const touch = e.touches[0]
                const rect = e.currentTarget.getBoundingClientRect()
                const pct = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width))
                const video = videoRef.current
                if (video && video.duration) {
                  video.currentTime = pct * video.duration
                  setProgress(pct * 100)
                }
              }}
              onTouchMove={(e) => {
                if (!isSeekingReel) return
                const touch = e.touches[0]
                const rect = e.currentTarget.getBoundingClientRect()
                const pct = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width))
                const video = videoRef.current
                if (video && video.duration) {
                  video.currentTime = pct * video.duration
                  setProgress(pct * 100)
                }
              }}
              onTouchEnd={() => setIsSeekingReel(false)}
            >
              <div className="relative w-full h-1 group-hover/seek:h-1.5 bg-white/30 rounded-full transition-all">
                <div
                  className="absolute inset-y-0 left-0 bg-white rounded-full"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="absolute top-1/2 h-3.5 w-3.5 bg-white rounded-full shadow-md opacity-0 group-hover/seek:opacity-100 transition-opacity"
                  style={{ left: `${progress}%`, transform: `translate(-50%, -50%)` }}
                />
              </div>
            </div>
            {duration > 0 && (
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-white/60 font-medium tabular-nums">
                  {formatTime((progress / 100) * duration)}
                </span>
                <span className="text-[10px] text-white/60 font-medium tabular-nums">
                  {formatTime(duration)}
                </span>
              </div>
            )}
          </div>

          {/* Barre fine toujours visible (quand contrôles cachés) */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 z-20 transition-opacity duration-300",
            showControls ? "opacity-0" : "opacity-100"
          )}>
            <div className="h-full bg-white/70" style={{ width: `${progress}%` }} />
          </div>

          {/* Infos utilisateur et contenu (bas) */}
          <div className="absolute bottom-14 left-4 right-16 z-20">
            {/* Profil utilisateur */}
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-white/80 ring-2 ring-white/30">
                  <AvatarImage src={getUserAvatar(currentReel.user)} />
                  <AvatarFallback className="bg-gradient-to-br from-pitch-500 to-pitch-600 text-white font-bold text-sm">
                    {getUserDisplayName(currentReel.user).charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-white rounded-full shadow-sm">
                  {getRoleIcon(currentReel.user.role)}
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm leading-tight">
                  {getUserDisplayName(currentReel.user)}
                </h3>
                <p className="text-white/60 text-xs font-medium">
                  {new Date(currentReel.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Contenu texte */}
            {currentReel.content && (
              <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
                {currentReel.content}
              </p>
            )}
          </div>

          {/* Navigation haut/bas (desktop) */}
          <div className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 flex-col gap-1 z-20 hidden sm:flex transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}>
            <button
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className={cn(
                "p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all",
                currentIndex === 0 && "opacity-30 cursor-not-allowed"
              )}
            >
              <ChevronUp className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={goToNext}
              disabled={currentIndex === reels.length - 1}
              className={cn(
                "p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all",
                currentIndex === reels.length - 1 && "opacity-30 cursor-not-allowed"
              )}
            >
              <ChevronDown className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Indicateur de position */}
          <div className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}>
            {reels.slice(
              Math.max(0, currentIndex - 2),
              Math.min(reels.length, currentIndex + 3)
            ).map((_, i) => {
              const actualIndex = Math.max(0, currentIndex - 2) + i
              return (
                <div
                  key={actualIndex}
                  className={cn(
                    "w-1 rounded-full transition-all duration-300",
                    actualIndex === currentIndex
                      ? "h-6 bg-white"
                      : "h-2 bg-white/30"
                  )}
                />
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Panneau de commentaires (drawer du bas) */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[110] flex items-end justify-center"
            onClick={handleCloseComments}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Panneau */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[480px] max-h-[70vh] bg-stadium-950 rounded-t-3xl border-t border-white/10 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-white/30" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3 border-b border-white/10">
                <h3 className="text-white font-bold text-base">
                  Commentaires ({commentCounts[currentReel.id] || 0})
                </h3>
                <button
                  onClick={handleCloseComments}
                  className="p-1.5 rounded-full hover:bg-white/10 transition-all"
                >
                  <X className="h-5 w-5 text-white/70" />
                </button>
              </div>

              {/* Liste des commentaires */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                {loadingComments ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-white/50" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-white/30" />
                    <p className="text-white/50 text-sm font-medium">Aucun commentaire</p>
                    <p className="text-white/30 text-xs">Soyez le premier à commenter !</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage
                          src={
                            comment.user?.playerProfile?.profilePicture ||
                            comment.user?.agentProfile?.profilePicture ||
                            comment.user?.clubProfile?.logo
                          }
                        />
                        <AvatarFallback className="bg-white/10 text-white text-xs">
                          {(comment.user?.playerProfile?.firstName?.[0] ||
                            comment.user?.agentProfile?.firstName?.[0] ||
                            comment.user?.clubProfile?.clubName?.[0] ||
                            "?")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold text-xs">
                            {comment.user?.playerProfile
                              ? `${comment.user.playerProfile.firstName} ${comment.user.playerProfile.lastName}`
                              : comment.user?.agentProfile
                              ? `${comment.user.agentProfile.firstName} ${comment.user.agentProfile.lastName}`
                              : comment.user?.clubProfile?.clubName || "Utilisateur"}
                          </span>
                          <span className="text-white/30 text-xs">
                            {new Date(comment.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                        <p className="text-white/80 text-sm mt-0.5 break-words">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Formulaire de commentaire */}
              <form
                onSubmit={handleSubmit(onSubmitComment)}
                className="px-4 py-3 border-t border-white/10 flex gap-2"
              >
                <Textarea
                  {...register("content", { required: true, minLength: 1 })}
                  placeholder="Ajouter un commentaire..."
                  rows={1}
                  className="flex-1 bg-white/10 border-white/10 text-white placeholder:text-white/40 resize-none min-h-[40px] max-h-[80px] rounded-xl text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                <Button
                  type="submit"
                  disabled={postingComment}
                  size="icon"
                  className="bg-pitch-600 hover:bg-pitch-700 text-white rounded-xl h-10 w-10 flex-shrink-0"
                >
                  {postingComment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de partage */}
      {currentReel && (
        <ShareModal
          open={showShareModal}
          onOpenChange={setShowShareModal}
          postId={currentReel.id}
          onShare={handleShareComplete}
        />
      )}
    </motion.div>
  )
}
