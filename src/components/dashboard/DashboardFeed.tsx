"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { PageHeader } from "@/components/layout/PageHeader"
import { EmptyState } from "@/components/ui/empty-state"
import { FeedCard } from "@/components/feed/FeedCard"
import { FeedSkeletonList } from "@/components/feed/FeedCardSkeleton"
import { CreatePostDialog } from "@/components/feed/CreatePostDialog"
import {
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  ClipboardList,
  ArrowRight,
  Clock,
} from "lucide-react"
import { isClubRole } from "@/lib/utils/role-helpers"

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

interface DashboardFeedProps {
  role: "PLAYER" | "AGENT" | "CLUB" | "CLUB_STAFF"
  showOnboardingCard?: boolean
  clubStatus?: string | null
}

export function DashboardFeed({ role, showOnboardingCard = false, clubStatus }: DashboardFeedProps) {
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>("")

  // Gradient selon le rôle
  const gradientClass = role === "PLAYER" 
    ? "from-pitch-600 to-pitch-700 hover:from-pitch-700 hover:to-pitch-800"
    : role === "AGENT"
      ? "from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700"
      : "from-victory-500 to-victory-600 hover:from-victory-600 hover:to-victory-700"

  // Charger les posts et l'utilisateur courant
  useEffect(() => {
    async function loadData() {
      try {
        // Charger l'utilisateur et les posts en parallèle
        const [userResponse, postsResponse] = await Promise.all([
          fetch("/api/users/me"),
          fetch("/api/posts?limit=20"),
        ])

        if (userResponse.ok) {
          const userData = await userResponse.json()
          setCurrentUserId(userData.id)
        }

        if (!postsResponse.ok) throw new Error("Erreur")

        const data = await postsResponse.json()
        setPosts(data.posts || [])
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger le feed",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts])
  }

  const reloadPosts = async () => {
    setRefreshing(true)
    try {
      const response = await fetch("/api/posts?limit=20")
      if (!response.ok) throw new Error("Erreur")

      const data = await response.json()
      setPosts(data.posts || [])
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de recharger le feed",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-stadium-900">Feed</h2>
        </div>
        <FeedSkeletonList count={3} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Carte onboarding club - DRAFT */}
      {isClubRole(role) && showOnboardingCard && (
        <Link
          href="/club/onboarding"
          className="block p-5 rounded-xl border-2 border-pitch-200 bg-pitch-50/80 hover:bg-pitch-100/80 hover:border-pitch-300 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-pitch-500 flex items-center justify-center shrink-0">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-stadium-900">Finaliser votre onboarding</h3>
              <p className="text-sm text-stadium-600 mt-1">
                Complétez l&apos;enregistrement de votre club pour débloquer la gestion du profil, des équipes et des annonces.
              </p>
              <span className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-pitch-600">
                Continuer
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Carte en attente de validation - PENDING_REVIEW */}
      {isClubRole(role) && clubStatus === "PENDING_REVIEW" && (
        <div className="p-5 rounded-xl border-2 border-amber-200 bg-amber-50/80">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-stadium-900">Club en cours de verification</h3>
              <p className="text-sm text-stadium-600 mt-1">
                Votre demande d&apos;enregistrement est en cours de verification par notre equipe. Vous serez notifie une fois la validation terminee.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Carte rejetée - REJECTED */}
      {isClubRole(role) && clubStatus === "REJECTED" && (
        <Link
          href="/club/onboarding"
          className="block p-5 rounded-xl border-2 border-red-200 bg-red-50/80 hover:bg-red-100/80 hover:border-red-300 transition-colors"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center shrink-0">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-stadium-900">Demande refusee</h3>
              <p className="text-sm text-stadium-600 mt-1">
                Votre demande d&apos;enregistrement a ete refusee. Veuillez corriger les informations et resoumettre.
              </p>
              <span className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-red-600">
                Corriger et resoumettre
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Actions du feed */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-stadium-900">Feed</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={reloadPosts}
            disabled={refreshing}
            className="border border-stadium-200 hover:bg-stadium-50 text-stadium-600 rounded-xl h-9"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""} sm:mr-1.5`} />
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
          <Button
            onClick={() => setDialogOpen(true)}
            className={`bg-gradient-to-r ${gradientClass} text-white font-semibold shadow-sm hover:shadow-md rounded-xl h-9`}
          >
            <Plus className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Nouveau post</span>
          </Button>
        </div>
      </div>

      {/* Feed */}
      {posts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Aucun post pour le moment"
          description="Soyez le premier à partager quelque chose avec la communauté !"
          action={
            <Button 
              onClick={() => setDialogOpen(true)}
              className={`bg-gradient-to-r ${gradientClass}`}
            >
              <Plus className="mr-2 h-4 w-4" />
              Créer le premier post
            </Button>
          }
        />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {posts.map((post) => (
              <FeedCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                onUpdate={reloadPosts}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Dialog de création */}
      <CreatePostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onPostCreated={handlePostCreated}
      />
    </div>
  )
}
