// Welcome page after successful registration/login
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import Link from "next/link"
import { FootballIcon } from "@/components/auth/icons"

const CheckCircleIcon = () => (
  <svg className="w-20 h-20 text-pitch-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export default function WelcomePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [countdown, setCountdown] = useState(5)
  const [isNewUser, setIsNewUser] = useState(false)

  useEffect(() => {
    // Vérifier si c'est un nouvel utilisateur (pas de profil complété)
    const checkNewUser = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch("/api/users/me")
          const data = await response.json()
          // Si l'utilisateur n'a pas de profil, c'est un nouvel utilisateur
          setIsNewUser(!data.hasProfile)
        } catch (error) {
          console.error("Error checking user profile:", error)
        }
      }
    }
    
    if (status === "authenticated") {
      checkNewUser()
    }
  }, [session, status])

  useEffect(() => {
    // Compte à rebours
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Rediriger quand le countdown atteint 0
  useEffect(() => {
    if (countdown === 0) {
      const role = session?.user?.role || "PLAYER"
      if (isNewUser) {
        router.push("/onboarding")
      } else {
        router.push(role === "ADMIN" ? "/admin" : `/${role.toLowerCase()}/dashboard`)
      }
    }
  }, [countdown, router, session, isNewUser])

  // Rediriger si pas authentifié
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pitch-50 via-white to-pitch-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-pitch-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "Utilisateur"
  const userRole = session?.user?.role || "PLAYER"
  const dashboardPath = userRole === "ADMIN" ? "/admin" : `/${userRole.toLowerCase()}/dashboard`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pitch-50 via-white to-pitch-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <FootballIcon className="w-12 h-12 rounded-xl" />
          <span className="text-2xl font-bold text-stadium-900">Profoot Profile</span>
        </Link>

        {/* Icône de succès */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 bg-pitch-50 rounded-full flex items-center justify-center">
            <CheckCircleIcon />
          </div>
        </motion.div>

        {/* Message de bienvenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-stadium-900 mb-3">
            Bienvenue, {userName} ! 🎉
          </h1>
          <p className="text-stadium-500 mb-8">
            {isNewUser 
              ? "Votre compte a été créé avec succès. Complétez votre profil pour commencer."
              : "Connexion réussie ! Vous allez être redirigé vers votre tableau de bord."
            }
          </p>
        </motion.div>

        {/* Compte à rebours */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-pitch-500 text-white">
            <motion.span
              key={countdown}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-bold"
            >
              {countdown}
            </motion.span>
          </div>
          <p className="mt-3 text-sm text-stadium-400">
            Redirection automatique dans {countdown} seconde{countdown > 1 ? "s" : ""}...
          </p>
        </motion.div>

        {/* Bouton d'action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <button
            onClick={() => {
              if (isNewUser) {
                router.push("/onboarding")
              } else {
                router.push(dashboardPath)
              }
            }}
            className="w-full h-12 bg-pitch-500 text-white font-semibold rounded-xl hover:bg-pitch-600 transition-colors"
          >
            {isNewUser ? "Compléter mon profil" : "Accéder au tableau de bord"}
          </button>
        </motion.div>

        {/* Info supplémentaire */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-xs text-stadium-400"
        >
          Un email de bienvenue vous a été envoyé à{" "}
          <span className="font-medium text-stadium-600">{session?.user?.email}</span>
        </motion.p>
      </motion.div>
    </div>
  )
}
