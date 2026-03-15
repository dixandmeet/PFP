"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { AgentProfileCard } from "@/components/profile/AgentProfileCard"
import { UserFeed } from "@/components/profile/UserFeed"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface UserProfile {
  id: string
  email: string
  role: string
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
    licenseNumber?: string
    licenseCountry?: string
    phoneNumber?: string
    website?: string
  }
  _count?: {
    followedBy: number
    following: number
    posts: number
  }
}

export default function AgentProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      try {
        const userResponse = await fetch("/api/users/me")
        if (!userResponse.ok) {
          throw new Error("Non authentifié")
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

      const updateResponse = await fetch(`/api/agents/${user?.agentProfile?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverPhoto: url }),
      })

      if (updateResponse.ok) {
        toast({
          title: "Succès",
          description: "Photo de couverture mise à jour",
        })
        window.location.reload()
      } else {
        throw new Error("Erreur lors de la mise à jour du profil")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la photo de couverture",
        variant: "destructive",
      })
    }
  }

  // État de chargement premium
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl opacity-20 blur-xl animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-gray-900 font-semibold">Chargement du profil</p>
            <p className="text-sm text-gray-500">Veuillez patienter...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // État d'erreur
  if (!user || !user.agentProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profil non trouvé</h2>
          <p className="text-gray-500 mb-6">
            Veuillez vous connecter avec un compte agent pour accéder à cette page.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
          >
            Se connecter
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Carte de profil */}
        <AgentProfileCard
          user={user}
          isOwner={true}
          onEditClick={() => router.push("/agent/profile/edit")}
          onViewPublicClick={() => router.push(`/profile/${user.id}`)}
          onCoverPhotoChange={handleCoverPhotoChange}
        />

        {/* Section Publications */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <UserFeed userId={user.id} currentUserId={user.id} />
        </motion.div>
      </div>
    </div>
  )
}
