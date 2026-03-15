// Page de vérification d'email
"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { motion } from "framer-motion"
import { FootballIcon } from "@/components/auth/icons"

type VerificationState = "loading" | "success" | "error" | "expired" | "already-verified"

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pitch-50 via-white to-pitch-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-pitch-500 border-t-transparent rounded-full"
        />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [state, setState] = useState<VerificationState>("loading")
  const [message, setMessage] = useState("")
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const token = searchParams.get("token")
  const email = searchParams.get("email")

  useEffect(() => {
    if (!token || !email) {
      setState("error")
      setMessage("Lien de vérification invalide. Paramètres manquants.")
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`
        )
        const data = await response.json()

        if (response.ok) {
          if (data.alreadyVerified) {
            setState("already-verified")
            setMessage("Votre email est déjà vérifié.")
          } else {
            setState("success")
            setMessage("Votre email a été vérifié avec succès !")
          }
        } else {
          if (data.error?.includes("expiré")) {
            setState("expired")
            setMessage(data.error)
          } else {
            setState("error")
            setMessage(data.error || "Erreur lors de la vérification.")
          }
        }
      } catch (error) {
        setState("error")
        setMessage("Une erreur est survenue. Veuillez réessayer.")
      }
    }

    verifyEmail()
  }, [token, email])

  const handleResendVerification = async () => {
    if (!email || resendLoading) return

    setResendLoading(true)
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setResendSuccess(true)
        setTimeout(() => setResendSuccess(false), 5000)
      }
    } catch (error) {
      console.error("Erreur lors du renvoi:", error)
    } finally {
      setResendLoading(false)
    }
  }

  const handleContinue = () => {
    if (session) {
      router.push("/onboarding")
    } else {
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pitch-50 via-white to-pitch-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md w-full"
      >
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <FootballIcon className="w-12 h-12 rounded-xl" />
          <span className="text-2xl font-bold text-stadium-900">Profoot Profile</span>
        </Link>

        {/* État : Chargement */}
        {state === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-pitch-500 border-t-transparent rounded-full"
              />
            </div>
            <h1 className="text-2xl font-bold text-stadium-900 mb-3">
              Vérification en cours...
            </h1>
            <p className="text-stadium-500">
              Nous vérifions votre adresse email.
            </p>
          </motion.div>
        )}

        {/* État : Succès */}
        {(state === "success" || state === "already-verified") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="w-24 h-24 bg-pitch-50 rounded-full flex items-center justify-center">
                <svg className="w-14 h-14 text-pitch-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </motion.div>

            <h1 className="text-2xl font-bold text-stadium-900 mb-3">
              {state === "already-verified" ? "Email déjà vérifié" : "Email vérifié !"}
            </h1>
            <p className="text-stadium-500 mb-8">
              {state === "already-verified" 
                ? "Votre adresse email est déjà vérifiée. Vous pouvez continuer."
                : "Votre adresse email a été vérifiée avec succès. Vous pouvez maintenant compléter votre profil."
              }
            </p>

            <button
              onClick={handleContinue}
              className="w-full h-12 bg-pitch-500 text-white font-semibold rounded-xl hover:bg-pitch-600 transition-colors shadow-lg shadow-pitch-500/25"
            >
              {session ? "Continuer vers l'onboarding" : "Se connecter"}
            </button>
          </motion.div>
        )}

        {/* État : Token expiré */}
        {state === "expired" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gold-50 rounded-full flex items-center justify-center">
                <svg className="w-14 h-14 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-stadium-900 mb-3">
              Lien expiré
            </h1>
            <p className="text-stadium-500 mb-8">
              {message}
            </p>

            {email && (
              <div className="space-y-3">
                <button
                  onClick={handleResendVerification}
                  disabled={resendLoading || resendSuccess}
                  className="w-full h-12 bg-pitch-500 text-white font-semibold rounded-xl hover:bg-pitch-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pitch-500/25"
                >
                  {resendLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Envoi en cours...
                    </span>
                  ) : resendSuccess ? (
                    "Email envoyé ! Vérifiez votre boîte mail."
                  ) : (
                    "Renvoyer un lien de vérification"
                  )}
                </button>

                <Link
                  href="/login"
                  className="block w-full h-12 leading-[48px] text-center border-2 border-stadium-200 text-stadium-700 font-semibold rounded-xl hover:bg-stadium-50 transition-colors"
                >
                  Retour à la connexion
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {/* État : Erreur */}
        {state === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
                <svg className="w-14 h-14 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-stadium-900 mb-3">
              Erreur de vérification
            </h1>
            <p className="text-stadium-500 mb-8">
              {message}
            </p>

            <div className="space-y-3">
              {email && (
                <button
                  onClick={handleResendVerification}
                  disabled={resendLoading || resendSuccess}
                  className="w-full h-12 bg-pitch-500 text-white font-semibold rounded-xl hover:bg-pitch-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pitch-500/25"
                >
                  {resendLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Envoi en cours...
                    </span>
                  ) : resendSuccess ? (
                    "Email envoyé ! Vérifiez votre boîte mail."
                  ) : (
                    "Renvoyer un lien de vérification"
                  )}
                </button>
              )}

              <Link
                href="/login"
                className="block w-full h-12 leading-[48px] text-center border-2 border-stadium-200 text-stadium-700 font-semibold rounded-xl hover:bg-stadium-50 transition-colors"
              >
                Retour à la connexion
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
