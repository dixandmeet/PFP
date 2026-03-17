"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MoreVertical,
  Edit,
  Trash2,
  Link as LinkIcon,
  User,
  Shield,
  Building2,
} from "lucide-react"
import { MediaGallery } from "./MediaGallery"
import { CommentSection } from "./CommentSection"
import { ShareModal } from "./ShareModal"
import { useToast } from "@/components/ui/use-toast"
import { getRelativeTime } from "@/lib/utils/post-utils"
import { isClubRole } from "@/lib/utils/role-helpers"

interface PostUser {
  id: string
  email: string
  role: string
  playerProfile?: {
    firstName: string
    lastName: string
    primaryPosition?: string
    profilePicture?: string
  }
  agentProfile?: {
    firstName: string
    lastName: string
    agencyName?: string
    profilePicture?: string
  }
  clubProfile?: {
    clubName: string
    logo?: string
  }
}

interface Post {
  id: string
  content: string
  mediaUrls: string[]
  createdAt: string
  user: PostUser
  _count?: {
    likes: number
    comments: number
    shares: number
  }
  isLiked?: boolean
  isBookmarked?: boolean
}

interface FeedCardProps {
  post: Post
  currentUserId: string
  onUpdate?: () => void
}

export function FeedCard({ post, currentUserId, onUpdate }: FeedCardProps) {
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(post.isLiked || false)
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false)
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isOwner = post.user.id === currentUserId

  const getUserDisplayName = (user: PostUser) => {
    if (user.playerProfile) {
      return `${user.playerProfile.firstName} ${user.playerProfile.lastName}`.trim() || "Joueur"
    }
    if (user.agentProfile) {
      return `${user.agentProfile.firstName} ${user.agentProfile.lastName}`.trim() || "Agent"
    }
    if (user.clubProfile) {
      return user.clubProfile.clubName || "Club"
    }
    return "Utilisateur"
  }

  const ROLE_LABELS: Record<string, string> = {
    PLAYER: "Joueur",
    AGENT: "Agent",
    CLUB: "Club",
    CLUB_STAFF: "Staff club",
  }

  const POSITION_LABELS: Record<string, string> = {
    GK: "Gardien",
    DF: "Défenseur",
    MF: "Milieu",
    FW: "Attaquant",
  }

  const getUserSubtitle = (user: PostUser) => {
    if (user.playerProfile && user.playerProfile.primaryPosition) {
      return POSITION_LABELS[user.playerProfile.primaryPosition] || user.playerProfile.primaryPosition
    }
    if (user.agentProfile && user.agentProfile.agencyName) {
      return user.agentProfile.agencyName
    }
    return ROLE_LABELS[user.role] || user.role
  }

  const getUserAvatar = (user: PostUser) => {
    return (
      user.playerProfile?.profilePicture ||
      user.agentProfile?.profilePicture ||
      user.clubProfile?.logo
    )
  }

  const handleLike = async () => {
    const previousState = isLiked
    const previousCount = likeCount

    // Optimistic update
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: isLiked ? "DELETE" : "POST",
      })

      if (!response.ok) throw new Error("Erreur")
    } catch (error) {
      // Revert on error
      setIsLiked(previousState)
      setLikeCount(previousCount)
      toast({
        title: "Erreur",
        description: "Impossible de liker ce post",
        variant: "destructive",
      })
    }
  }

  const handleBookmark = async () => {
    const previousState = isBookmarked
    setIsBookmarked(!isBookmarked)

    try {
      const response = await fetch(`/api/posts/${post.id}/bookmark`, {
        method: isBookmarked ? "DELETE" : "POST",
      })

      if (!response.ok) throw new Error("Erreur")

      toast({
        title: isBookmarked ? "Post retiré" : "Post sauvegardé",
        description: isBookmarked
          ? "Le post a été retiré de vos favoris"
          : "Le post a été ajouté à vos favoris",
      })
    } catch (error) {
      setIsBookmarked(previousState)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder ce post",
        variant: "destructive",
      })
    }
  }

  const handleShare = () => {
    setShareModalOpen(true)
  }

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce post ?")) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Erreur")

      toast({
        title: "Post supprimé",
        description: "Le post a été supprimé avec succès",
      })

      if (onUpdate) onUpdate()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer ce post",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      const url = `${window.location.origin}/feed?postId=${post.id}`
      await navigator.clipboard.writeText(url)
      toast({
        title: "Lien copié",
        description: "Le lien du post a été copié dans le presse-papier",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      })
    }
  }

  // Formater le contenu avec mentions et hashtags
  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => (
      <span key={i}>
        {i > 0 && <br />}
        {line.split(/(@\w+|#\w+)/).map((part, j) => {
          if (part.startsWith('@')) {
            return (
              <a
                key={j}
                href={`/profile/${part.slice(1)}`}
                className="text-pitch-600 hover:text-pitch-700 font-semibold hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {part}
              </a>
            )
          } else if (part.startsWith('#')) {
            return (
              <a
                key={j}
                href={`/feed?hashtag=${part.slice(1)}`}
                className="text-pitch-600 hover:text-pitch-700 font-semibold hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {part}
              </a>
            )
          }
          return part
        })}
      </span>
    ))
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="card-stadium hover:-translate-y-1 transition-all duration-300"
      >
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 sm:gap-4 flex-1">
              <div className="relative">
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-pitch-200 ring-2 ring-pitch-100">
                  <AvatarImage src={getUserAvatar(post.user)} />
                  <AvatarFallback className="bg-gradient-to-br from-pitch-500 to-pitch-600 text-white font-bold">
                    {getUserDisplayName(post.user).charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-md">
                  {post.user.role === "PLAYER" && <User className="h-3 w-3 text-pitch-600" />}
                  {post.user.role === "AGENT" && <Shield className="h-3 w-3 text-gold-600" />}
                  {isClubRole(post.user.role) && <Building2 className="h-3 w-3 text-victory-600" />}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-black text-stadium-900 text-base sm:text-lg truncate max-w-[160px] sm:max-w-xs">
                    {getUserDisplayName(post.user)}
                  </h3>
                  <Badge
                    className={`text-xs font-semibold ${
                      post.user.role === "PLAYER"
                        ? "bg-pitch-100 text-pitch-700 border-pitch-200"
                        : post.user.role === "AGENT"
                        ? "bg-gold-100 text-gold-700 border-gold-200"
                        : "bg-victory-100 text-victory-700 border-victory-200"
                    } border-2`}
                  >
                    {getUserSubtitle(post.user)}
                  </Badge>
                </div>
                <p className="text-sm text-stadium-500 font-medium">
                  {getRelativeTime(post.createdAt)}
                </p>
              </div>
            </div>

            {/* Menu actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-stadium-400 hover:text-stadium-600"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyLink}>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Copier le lien
                </DropdownMenuItem>
                {isOwner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDelete} disabled={deleting}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deleting ? "Suppression..." : "Supprimer"}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Contenu */}
          <div className="mb-4">
            <p className="text-base text-stadium-800 whitespace-pre-wrap leading-relaxed">
              {formatContent(post.content)}
            </p>
          </div>

          {/* Médias — pleine largeur (déborde du padding) */}
          {post.mediaUrls && post.mediaUrls.length > 0 && (
            <MediaGallery
              mediaUrls={post.mediaUrls}
              className="-mx-4 sm:-mx-6 mb-4"
              postId={post.id}
              postContent={post.content}
              postUser={post.user}
              postCreatedAt={post.createdAt}
              postCounts={{
                likes: post._count?.likes || 0,
                comments: post._count?.comments || 0,
                shares: post._count?.shares || 0,
              }}
            />
          )}

          {/* Statistiques */}
          {(likeCount > 0 || (post._count?.comments || 0) > 0 || (post._count?.shares || 0) > 0) && (
            <div className="flex items-center gap-4 text-sm text-stadium-500 font-medium mb-4">
              {likeCount > 0 && <span>{likeCount} J'aime</span>}
              {(post._count?.comments || 0) > 0 && (
                <span>{post._count?.comments} Commentaire{(post._count?.comments || 0) > 1 ? 's' : ''}</span>
              )}
              {(post._count?.shares || 0) > 0 && (
                <span>{post._count?.shares} Partage{(post._count?.shares || 0) > 1 ? 's' : ''}</span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-pitch-100">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1.5 sm:gap-2 font-semibold transition-all px-2 sm:px-3 ${
                  isLiked
                    ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                    : "text-stadium-600 hover:text-red-600 hover:bg-red-50"
                }`}
                onClick={handleLike}
              >
                <Heart
                  className={`h-5 w-5 transition-all flex-shrink-0 ${
                    isLiked ? "fill-red-600 scale-110" : ""
                  }`}
                />
                <span className="text-sm hidden sm:inline">J&apos;aime</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="gap-1.5 sm:gap-2 font-semibold text-stadium-600 hover:text-pitch-600 hover:bg-pitch-50 transition-all px-2 sm:px-3"
              >
                <Share2 className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm hidden sm:inline">Partager</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={`gap-1.5 sm:gap-2 font-semibold transition-all px-2 sm:px-3 ${
                isBookmarked
                  ? "text-gold-600 hover:text-gold-700 hover:bg-gold-50"
                  : "text-stadium-600 hover:text-gold-600 hover:bg-gold-50"
              }`}
            >
              <Bookmark
                className={`h-5 w-5 transition-all flex-shrink-0 ${
                  isBookmarked ? "fill-gold-600" : ""
                }`}
              />
              <span className="text-sm hidden sm:inline">Sauvegarder</span>
            </Button>
          </div>

          {/* Section commentaires */}
          <CommentSection
            postId={post.id}
            currentUserId={currentUserId}
            initialCommentCount={post._count?.comments || 0}
          />
        </div>
      </motion.div>

      {/* Modal de partage */}
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        postId={post.id}
        onShare={() => {
          if (onUpdate) onUpdate()
        }}
      />
    </>
  )
}
