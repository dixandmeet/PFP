"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { FeedCard } from "@/components/feed/FeedCard"
import { CreatePostDialog } from "@/components/feed/CreatePostDialog"
import {
  Loader2,
  MessageSquare,
  Plus,
  TrendingUp,
  PenLine,
} from "lucide-react"

interface Post {
  id: string
  content: string
  mediaUrls: string[]
  createdAt: string
  user: {
    id: string
    email: string
    role: string
    playerProfile?: {
      firstName: string
      lastName: string
      primaryPosition: string
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
  _count?: {
    likes: number
    comments: number
    shares: number
  }
  isLiked?: boolean
  isBookmarked?: boolean
}

interface UserFeedProps {
  userId: string
  currentUserId?: string
}

export function UserFeed({ userId, currentUserId }: UserFeedProps) {
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  
  const isOwner = userId === currentUserId

  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true)
        const response = await fetch(`/api/posts?userId=${userId}&page=${page}&limit=20`)
        
        if (!response.ok) {
          throw new Error("Erreur lors du chargement des posts")
        }

        const data = await response.json()
        
        if (page === 1) {
          setPosts(data.posts || [])
        } else {
          setPosts(prev => [...prev, ...(data.posts || [])])
        }
        
        setHasMore(data.pagination?.page < data.pagination?.totalPages)
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les posts",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [userId, page, toast])

  const reloadPosts = async () => {
    try {
      const response = await fetch(`/api/posts?userId=${userId}&limit=20`)
      if (!response.ok) throw new Error("Erreur")

      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de recharger les posts",
        variant: "destructive",
      })
    }
  }

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts])
  }

  // Loading state
  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          </div>
          <p className="text-gray-500 font-medium">Chargement des publications...</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-stadium-100/90 bg-gradient-to-b from-white to-stadium-50/40 p-8 sm:p-12 shadow-[0_4px_24px_-4px_rgba(15,81,50,0.08)]"
      >
        <div className="mx-auto max-w-md text-center">
          <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
            <div
              className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pitch-400/25 via-pitch-500/10 to-transparent blur-xl"
              aria-hidden
            />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-pitch-100/80 bg-gradient-to-br from-pitch-50 to-white shadow-sm">
              <MessageSquare className="h-9 w-9 text-pitch-500/80" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-stadium-900 sm:text-2xl">
            {isOwner ? "Partagez votre première publication" : "Aucune publication"}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-stadium-600 sm:text-base">
            {isOwner
              ? "Une annonce, une analyse, un repérage : vos publications renforcent votre visibilité auprès des clubs et des joueurs."
              : "Cet utilisateur n'a pas encore publié de contenu."}
          </p>
          {isOwner && (
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={() => setCreateDialogOpen(true)}
                size="lg"
                className="h-12 w-full rounded-xl bg-gradient-to-r from-pitch-600 to-pitch-700 px-6 text-base font-semibold text-white shadow-lg shadow-pitch-600/25 transition hover:from-pitch-700 hover:to-pitch-800 sm:w-auto sm:min-w-[240px]"
              >
                <PenLine className="mr-2 h-5 w-5 shrink-0" />
                Rédiger une publication
              </Button>
            </div>
          )}
        </div>
        {isOwner && (
          <CreatePostDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onPostCreated={handlePostCreated}
          />
        )}
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-100">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Publications</h2>
            <p className="text-sm text-gray-500">
              {posts.length} {posts.length > 1 ? "publications" : "publication"}
            </p>
          </div>
        </div>
        {isOwner && (
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau
          </Button>
        )}
      </motion.div>

      {/* Posts */}
      <AnimatePresence mode="popLayout">
        <div className="space-y-4">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <FeedCard
                post={post}
                currentUserId={currentUserId || ""}
                onUpdate={reloadPosts}
              />
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Load more */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center pt-6"
        >
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={loading}
            className="group flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-emerald-300 hover:text-emerald-600 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <span>Voir plus</span>
                <span className="text-gray-400 group-hover:text-emerald-400">↓</span>
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Dialog création */}
      {isOwner && (
        <CreatePostDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  )
}
