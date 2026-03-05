"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  Image as ImageIcon,
  Play,
  ExternalLink,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface Post {
  id: string
  content: string
  mediaUrls: string[]
  createdAt: string
  _count: {
    likes: number
    comments: number
  }
}

interface PostDetailDialogProps {
  post: Post | null
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  userImage: string | null
  userRole: string
  onDelete?: (postId: string) => void
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || url.includes("video")
}

export function PostDetailDialog({
  post,
  open,
  onOpenChange,
  userName,
  userImage,
  userRole,
  onDelete,
}: PostDetailDialogProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  if (!post) return null

  const hasMedia = post.mediaUrls && post.mediaUrls.length > 0
  const mediaCount = post.mediaUrls?.length || 0

  const handlePrevMedia = () => {
    setCurrentMediaIndex((prev) => (prev > 0 ? prev - 1 : mediaCount - 1))
  }

  const handleNextMedia = () => {
    setCurrentMediaIndex((prev) => (prev < mediaCount - 1 ? prev + 1 : 0))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="sr-only">Detail du post</DialogTitle>
          {/* Author header */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userImage || ""} />
              <AvatarFallback className="text-sm bg-slate-100 font-semibold">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">{userName}</p>
                <Badge variant="secondary" className="text-xs capitalize">
                  {userRole.toLowerCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="h-3 w-3" />
                <span>
                  {format(new Date(post.createdAt), "d MMMM yyyy 'a' HH:mm", { locale: fr })}
                </span>
                <span className="text-slate-300">·</span>
                <span>
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 pt-4">
          <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        </div>

        {/* Media gallery */}
        {hasMedia && (
          <div className="px-6 pt-4">
            <div className="relative rounded-lg overflow-hidden bg-slate-100">
              {/* Current media */}
              {isVideoUrl(post.mediaUrls[currentMediaIndex]) ? (
                <div className="relative aspect-video">
                  <video
                    src={post.mediaUrls[currentMediaIndex]}
                    controls
                    className="w-full h-full object-contain bg-black"
                  />
                </div>
              ) : (
                <div className="relative aspect-video">
                  <img
                    src={post.mediaUrls[currentMediaIndex]}
                    alt={`Media ${currentMediaIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Navigation arrows */}
              {mediaCount > 1 && (
                <>
                  <button
                    onClick={handlePrevMedia}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleNextMedia}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  {/* Dots indicator */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {post.mediaUrls.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentMediaIndex(index)}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          index === currentMediaIndex
                            ? "bg-white"
                            : "bg-white/50 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Media thumbnails */}
            {mediaCount > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {post.mediaUrls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMediaIndex(index)}
                    className={`relative shrink-0 h-14 w-14 rounded-md overflow-hidden border-2 transition-colors ${
                      index === currentMediaIndex
                        ? "border-slate-900"
                        : "border-transparent hover:border-slate-300"
                    }`}
                  >
                    {isVideoUrl(url) ? (
                      <div className="h-full w-full bg-slate-200 flex items-center justify-center">
                        <Play className="h-4 w-4 text-slate-500" />
                      </div>
                    ) : (
                      <img
                        src={url}
                        alt={`Miniature ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <Separator className="mx-6 mt-4" />

        {/* Stats & Actions */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Heart className="h-4 w-4 text-red-400" />
              <span className="font-medium">{post._count.likes}</span>
              <span className="text-slate-400">likes</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <MessageCircle className="h-4 w-4 text-blue-400" />
              <span className="font-medium">{post._count.comments}</span>
              <span className="text-slate-400">commentaires</span>
            </div>
            {hasMedia && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <ImageIcon className="h-4 w-4 text-emerald-400" />
                <span className="font-medium">{mediaCount}</span>
                <span className="text-slate-400">media(s)</span>
              </div>
            )}
          </div>

          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => {
                onDelete(post.id)
                onOpenChange(false)
              }}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Supprimer
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
