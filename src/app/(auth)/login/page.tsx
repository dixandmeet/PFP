// Login page
"use client"

import { useState, useEffect, Suspense } from "react"
import { getSession, signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthBranding } from "@/components/auth/auth-branding"
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
  GoogleIcon,
  FootballIcon,
  ChevronLeftIcon,
} from "@/components/auth/icons"

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stadium-50 to-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-pitch-500 border-t-transparent rounded-full"
        />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Vérifier si l'utilisateur vient de s'inscrire ou s'il y a une erreur OAuth
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    }
    
    const errorParam = searchParams.get("error")
    if (errorParam) {
      if (errorParam === "OAuthAccountNotLinked") {
        setError("Un compte existe déjà avec cet email. Connectez-vous avec votre mot de passe.")
      } else if (errorParam === "OAuthCallback") {
        setError("Erreur lors de la connexion avec Google. Veuillez réessayer.")
      }
    }
  }, [searchParams])

  // Validation de l'email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      setEmailError("")
      return false
    }
    if (!emailRegex.test(email)) {
      setEmailError("Format d'email invalide")
      return false
    }
    setEmailError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!validateEmail(email)) {
      return
    }

    if (!password) {
      setError("Veuillez remplir tous les champs")
      return
    }

    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email ou mot de passe incorrect")
      } else {
        const session = await getSession()
        const role = session?.user?.role
        const callbackUrl = searchParams.get("callbackUrl")
        const safeCallbackUrl =
          callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : null
        const fallbackUrl = role === "ADMIN" ? "/admin" : role ? `/${role.toLowerCase()}/dashboard` : "/player/dashboard"

        router.push(safeCallbackUrl ?? fallbackUrl)
        router.refresh()
      }
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError("")

    try {
      const callbackUrl = searchParams.get("callbackUrl") || "/welcome"
      await signIn("google", { callbackUrl })
    } catch (err) {
      setError("Erreur lors de la connexion avec Google")
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Partie gauche - Branding */}
      <AuthBranding variant="login" />

      {/* Partie droite - Formulaire */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col bg-white relative">
        {/* Bouton retour */}
        <div className="p-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-stadium-500 hover:text-stadium-700 transition-colors text-sm font-medium group"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">
              <ChevronLeftIcon />
            </span>
            Retour
          </Link>
        </div>

        {/* Formulaire centré */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-[400px]"
          >
            {/* Logo mobile */}
            <Link href="/" className="flex lg:hidden items-center justify-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-xl bg-pitch-500 flex items-center justify-center">
                <FootballIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-stadium-900">Profoot Profile</span>
            </Link>

            {/* Header */}
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl font-bold text-stadium-900 mb-2 tracking-tight">
                Connexion
              </h2>
              <p className="text-stadium-500 text-[15px]">
                Bienvenue ! Entrez vos identifiants pour continuer.
              </p>
            </div>

            {/* Messages */}
            <AnimatePresence mode="wait">
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  className="flex items-center gap-3 bg-pitch-50 border border-pitch-200 text-pitch-700 px-4 py-3.5 rounded-xl mb-6"
                >
                  <CheckIcon />
                  <p className="text-sm font-medium">Inscription réussie ! Connectez-vous.</p>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3.5 rounded-xl text-sm mb-6"
                >
                  <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bouton Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full h-12 flex items-center justify-center gap-3 bg-white border-2 border-stadium-200 rounded-xl font-medium text-stadium-700 hover:bg-stadium-50 hover:border-stadium-300 hover:shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-stadium-400 border-t-transparent rounded-full"
                />
              ) : (
                <>
                  <GoogleIcon />
                  <span>Continuer avec Google</span>
                </>
              )}
            </button>

            {/* Séparateur */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stadium-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-stadium-400 font-medium tracking-wider">
                  ou avec email
                </span>
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" required>
                  Adresse email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (emailError) validateEmail(e.target.value)
                  }}
                  onBlur={() => validateEmail(email)}
                  placeholder="player@profoot.com"
                  icon={<MailIcon />}
                  error={emailError}
                  required
                  className="h-12"
                />
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" required>
                    Mot de passe
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-pitch-600 hover:text-pitch-700 transition-colors font-medium"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  icon={<LockIcon />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-stadium-400 hover:text-stadium-600 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  }
                  required
                  className="h-12"
                />
              </div>

              {/* Bouton de connexion */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold shadow-lg shadow-pitch-500/25 hover:shadow-xl hover:shadow-pitch-500/30 transition-shadow"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Connexion en cours...</span>
                  </div>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>

            {/* Lien d'inscription */}
            <p className="mt-8 text-center text-sm text-stadium-500">
              Nouveau sur Profoot Profile ?{" "}
              <Link href="/register" className="text-pitch-600 hover:text-pitch-700 font-semibold transition-colors">
                Créer un compte
              </Link>
            </p>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-stadium-400 leading-relaxed">
              En vous connectant, vous acceptez nos{" "}
              <Link href="/terms" className="text-pitch-600 hover:underline">
                conditions d&apos;utilisation
              </Link>
              {" "}et notre{" "}
              <Link href="/privacy" className="text-pitch-600 hover:underline">
                politique de confidentialité
              </Link>
              .
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
