"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Trophy, PenSquare } from "lucide-react"
import { UserFeed } from "@/components/profile/UserFeed"
import {
  ProfileHeader,
  ProfileInsights,
  InterestsPanel,
  ProfilePresentationCard,
  CareerTimeline,
} from "@/components/player/profile"
import { InsightsDevPanel } from "@/components/player/insights"
import { useProfileInsights } from "@/hooks/useProfileInsights"

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
  _count?: {
    followedBy: number
    following: number
    posts: number
  }
}

function computeCompletion(p?: UserProfile["playerProfile"]): number {
  if (!p) return 0
  const fields = [
    p.firstName,
    p.lastName,
    p.primaryPosition,
    p.nationality,
    p.profilePicture,
    p.coverPhoto,
    p.bio,
    p.currentClub,
  ]
  return Math.round((fields.filter(Boolean).length / fields.length) * 100)
}

export default function PlayerProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const {
    interests,
    stats,
    markInterestAsRead,
    addInterest,
    incrementViews,
  } = useProfileInsights()

  useEffect(() => {
    async function loadProfile() {
      try {
        const userResponse = await fetch("/api/users/me")
        if (!userResponse.ok) throw new Error("Non authentifié")
        const userData = await userResponse.json()

        const statsResponse = await fetch(`/api/users/${userData.id}`)
        if (statsResponse.ok) {
          setUser(await statsResponse.json())
        } else {
          setUser(userData)
        }
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de charger le profil",
          variant: "destructive",
        })
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [toast, router])

  const handleCoverPhotoChange = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("fileType", "PROFILE_PICTURE")

      const uploadResponse = await fetch("/api/files/upload-direct", {
        method: "POST",
        body: formData,
      })
      if (!uploadResponse.ok) throw new Error("Erreur lors de l'upload")

      const { url } = await uploadResponse.json()

      const updateResponse = await fetch(`/api/players/${user?.playerProfile?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverPhoto: url }),
      })

      if (updateResponse.ok) {
        toast({ title: "Succès", description: "Photo de couverture mise à jour" })
        window.location.reload()
      } else {
        throw new Error("Erreur lors de la mise à jour")
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la photo de couverture",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!user || !user.playerProfile) {
    router.push("/onboarding")
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
      </div>
    )
  }

  const completion = computeCompletion(user.playerProfile)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <ProfileHeader
        user={user}
        completionPercentage={completion}
        onEditClick={() => router.push("/player/profile/edit")}
        onViewPublicClick={() => router.push(`/profile/${user.id}`)}
        onCoverPhotoChange={handleCoverPhotoChange}
      />

      <ProfileInsights stats={stats} />

      <InterestsPanel
        interests={interests}
        onMarkAsRead={markInterestAsRead}
      />

      <ProfilePresentationCard
        bio={user.playerProfile.bio}
        onEditClick={() => router.push("/player/profile/edit")}
      />

      <Tabs defaultValue="parcours" className="w-full">
        <TabsList className="w-full h-12 p-1 bg-white border border-slate-200 rounded-xl">
          <TabsTrigger
            value="parcours"
            className="flex-1 h-full rounded-lg font-semibold text-sm gap-2 text-slate-500 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
          >
            <Trophy className="h-4 w-4" />
            Parcours
          </TabsTrigger>
          <TabsTrigger
            value="posts"
            className="flex-1 h-full rounded-lg font-semibold text-sm gap-2 text-slate-500 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
          >
            <PenSquare className="h-4 w-4" />
            Posts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="parcours" className="mt-5">
          <CareerTimeline playerProfileId={user.playerProfile.id} />
        </TabsContent>

        <TabsContent value="posts" className="mt-5">
          <UserFeed userId={user.id} currentUserId={user.id} />
        </TabsContent>
      </Tabs>

      <InsightsDevPanel
        onAddInterest={addInterest}
        onIncrementViews={incrementViews}
      />
    </div>
  )
}
