"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { UserFeed } from "@/components/profile/UserFeed"
import {
  ClubProfileHero,
  PrimaryActionsCard,
  ProfileCompletionCard,
  ClubStatsRow,
  RecentActivityCard,
  PremiumUpsellCard,
} from "@/components/profileclub"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { calculateClubCompletion } from "@/lib/utils/club-completion"
import {
  Loader2,
  Building2,
  LayoutGrid,
  MessageSquare,
} from "lucide-react"

interface UserProfile {
  id: string
  email: string
  role: string
  clubProfile?: {
    id: string
    clubName: string
    shortName?: string
    clubType?: string
    logo?: string
    coverPhoto?: string
    country?: string
    city?: string
    league?: string
    bio?: string
    foundedYear?: number
    isVerified?: boolean
  }
  _count?: {
    followedBy: number
    following: number
    posts: number
  }
}

export default function ClubProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const userResponse = await fetch("/api/users/me")
        if (!userResponse.ok) {
          throw new Error("Non authentifie")
        }

        const userData = await userResponse.json()

        const statsResponse = await fetch(`/api/users/${userData.id}`)
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setUser(statsData)
        } else {
          setUser(userData)
        }
      } catch (error) {
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

      const updateResponse = await fetch(`/api/clubs/${user?.clubProfile?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverPhoto: url }),
      })

      if (updateResponse.ok) {
        toast({
          title: "Succes",
          description: "Photo de couverture mise a jour",
        })
        window.location.reload()
      } else {
        throw new Error("Erreur lors de la mise a jour du profil")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre a jour la photo de couverture",
        variant: "destructive",
      })
    }
  }

  const triggerCoverUpload = () => {
    coverInputRef.current?.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative inline-flex p-6 bg-gradient-to-br from-pitch-100 to-pitch-50 rounded-3xl mb-4">
            <Loader2 className="h-10 w-10 animate-spin text-pitch-600" />
            <div className="absolute inset-0 rounded-3xl bg-pitch-400/20 animate-ping" />
          </div>
          <p className="text-stadium-600 font-semibold text-lg">
            Chargement du profil...
          </p>
          <p className="text-stadium-400 text-sm mt-1">Veuillez patienter</p>
        </motion.div>
      </div>
    )
  }

  if (!user || !user.clubProfile) {
    return (
      <div className="container mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="inline-flex p-6 bg-stadium-100 rounded-3xl mb-4">
            <Building2 className="h-12 w-12 text-stadium-400" />
          </div>
          <h2 className="text-2xl font-bold text-stadium-800 mb-2">
            Profil club non trouve
          </h2>
          <p className="text-stadium-600">
            Veuillez vous connecter avec un compte club
          </p>
        </motion.div>
      </div>
    )
  }

  const stats = user._count || { followedBy: 0, following: 0, posts: 0 }
  const club = user.clubProfile

  const { percentage: completionPercentage } = calculateClubCompletion(club)
  const profileComplete = completionPercentage === 100
  const hasCreatedListing = stats.posts > 0

  return (
    <div className="min-h-screen bg-stadium-50/30">
      {/* NIVEAU 1: Hero - Identite */}
      <div className="container mx-auto px-4 pt-6">
        <ClubProfileHero
          clubName={club.clubName}
          shortName={club.shortName}
          logo={club.logo}
          coverPhoto={club.coverPhoto}
          city={club.city}
          country={club.country}
          league={club.league}
          bio={club.bio}
          isVerified={club.isVerified}
          onEditCover={handleCoverPhotoChange}
          onEditProfile={() => router.push("/club/profile/edit")}
        />
      </div>

      {/* NIVEAU 2: CTA Actions principales */}
      <div className="container mx-auto px-4 mt-4">
        <PrimaryActionsCard userId={user.id} />
      </div>

      {/* NIVEAU 3: Suivi - Layout 2 colonnes */}
      <div className="container mx-auto px-4 mt-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full justify-start bg-white border-2 border-stadium-100 rounded-2xl p-1.5 h-auto">
                  <TabsTrigger
                    value="overview"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl data-[state=active]:bg-pitch-500 data-[state=active]:text-white font-semibold transition-colors duration-200"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Vue d&apos;ensemble
                  </TabsTrigger>
                  <TabsTrigger
                    value="posts"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl data-[state=active]:bg-pitch-500 data-[state=active]:text-white font-semibold transition-colors duration-200"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Publications
                    {stats.posts > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 bg-stadium-100 data-[state=active]:bg-white/20 rounded-full text-xs font-bold">
                        {stats.posts}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                  <ClubStatsRow
                    stats={{
                      postsCount: stats.posts,
                      followersCount: stats.followedBy,
                      followingCount: stats.following,
                      viewsCount: 0,
                    }}
                    onStatClick={(statId) => {
                      if (statId === "posts") setActiveTab("posts")
                    }}
                  />

                  <RecentActivityCard postsCount={stats.posts} />
                </TabsContent>

                <TabsContent value="posts" className="mt-6">
                  <UserFeed userId={user.id} currentUserId={user.id} />
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <ProfileCompletionCard
                profile={{
                  clubName: club.clubName,
                  shortName: club.shortName,
                  clubType: club.clubType,
                  logo: club.logo,
                  coverPhoto: club.coverPhoto,
                  country: club.country,
                  city: club.city,
                  bio: club.bio,
                  foundedYear: club.foundedYear,
                }}
                onEditCover={triggerCoverUpload}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <PremiumUpsellCard
                isPremium={!!club.isVerified}
                hasCreatedListing={hasCreatedListing}
                profileComplete={profileComplete}
              />
            </motion.div>
          </div>
        </div>
      </div>

      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleCoverPhotoChange(file)
        }}
        aria-label="Uploader une photo de couverture"
      />
    </div>
  )
}
