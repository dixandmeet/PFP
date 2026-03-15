// Register page
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
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
  GoogleIcon,
  FootballIcon,
  ChevronLeftIcon,
  CheckSmallIcon,
  UserIcon,
  BriefcaseIcon,
  BuildingIcon,
} from "@/components/auth/icons"

// Types de rôles avec leurs descriptions et icônes
const roleOptions = [
  {
    value: "PLAYER",
    label: "Joueur",
    description: "Je suis un joueur de football",
    icon: <UserIcon />,
    color: "pitch",
  },
  {
    value: "AGENT",
    label: "Agent",
    description: "Je représente des joueurs",
    icon: <BriefcaseIcon />,
    color: "gold",
  },
  {
    value: "CLUB",
    label: "Club",
    description: "Je représente un club",
    icon: <BuildingIcon />,
    color: "victory",
  },
]

// Fonction de calcul de la force du mot de passe
const calculatePasswordStrength = (password: string): { score: number; label: string; color: string } => {
  let score = 0
  if (!password) return { score: 0, label: "", color: "" }

                  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1

  if (score <= 3) return { score, label: "Faible", color: "bg-red-500" }
  if (score <= 5) return { score, label: "Moyen", color: "bg-gold-500" }
  return { score, label: "Fort", color: "bg-pitch-500" }
}

export default function RegisterPage() {
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
      <RegisterContent />
    </Suspense>
  )
}

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [role, setRole] = useState<"PLAYER" | "AGENT" | "CLUB">("PLAYER")
  const [error, setError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "", color: "" })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [termsError, setTermsError] = useState("")

  // Vérifier les erreurs OAuth
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam === "OAuthAccountNotLinked") {
      setError("Un compte existe déjà avec cet email. Connectez-vous avec votre mot de passe.")
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

  // Validation du mot de passe
  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("")
      return false
    }
    if (password.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères")
      return false
    }
    if (!/[A-Z]/.test(password)) {
      setPasswordError("Le mot de passe doit contenir au moins une majuscule")
      return false
    }
    if (!/[a-z]/.test(password)) {
      setPasswordError("Le mot de passe doit contenir au moins une minuscule")
      return false
    }
    if (!/[0-9]/.test(password)) {
      setPasswordError("Le mot de passe doit contenir au moins un chiffre")
      return false
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      setPasswordError("Le mot de passe doit contenir au moins un caractère spécial")
      return false
    }
    setPasswordError("")
    return true
  }

  // Validation de confirmation du mot de passe
  const validateConfirmPassword = (confirmPass: string) => {
    if (!confirmPass) {
      setConfirmPasswordError("")
      return false
    }
    if (confirmPass !== password) {
      setConfirmPasswordError("Les mots de passe ne correspondent pas")
      return false
    }
    setConfirmPasswordError("")
    return true
  }

  // Mise à jour de la force du mot de passe
  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password))
    } else {
      setPasswordStrength({ score: 0, label: "", color: "" })
    }
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword)

    if (!acceptTerms) {
      setTermsError("Vous devez accepter les conditions pour continuer")
    }

    if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid || !acceptTerms) {
      return
    }

    setLoading(true)

    try {
      // 1. Créer le compte
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue")
        return
      }

      // 2. Auto-login après inscription
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        // Si l'auto-login échoue, rediriger vers login
        router.push("/login?registered=true")
        return
      }

      // 3. Rediriger vers la page d'onboarding
      router.push("/onboarding")
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
      await signIn("google", { callbackUrl: "/welcome" })
    } catch (err) {
      setError("Erreur lors de la connexion avec Google")
      setGoogleLoading(false)
    }
  }

  const getColorClasses = (optionColor: string, isSelected: boolean) => {
    if (!isSelected) return {
      border: "border-stadium-200 hover:border-stadium-300 bg-white",
      iconBg: "bg-stadium-100 text-stadium-500",
      badge: "",
    }

    switch (optionColor) {
      case "pitch":
        return {
          border: "border-pitch-500 bg-pitch-50 shadow-sm shadow-pitch-500/10",
          iconBg: "bg-pitch-500 text-white",
          badge: "bg-pitch-500",
        }
      case "gold":
        return {
          border: "border-gold-500 bg-gold-50 shadow-sm shadow-gold-500/10",
          iconBg: "bg-gold-500 text-white",
          badge: "bg-gold-500",
        }
      case "victory":
        return {
          border: "border-victory-500 bg-victory-50 shadow-sm shadow-victory-500/10",
          iconBg: "bg-victory-500 text-white",
          badge: "bg-victory-500",
        }
      default:
        return {
          border: "border-stadium-200 bg-white",
          iconBg: "bg-stadium-100 text-stadium-500",
          badge: "",
        }
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Partie gauche - Branding */}
      <AuthBranding variant="register" />

      {/* Partie droite - Formulaire */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col bg-white relative">
        {/* Header avec bouton retour */}
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

        {/* Formulaire scrollable */}
        <div className="flex-1 flex items-start lg:items-center justify-center px-6 pb-8 lg:pb-12 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-[400px] py-2"
          >
            {/* Logo mobile */}
            <Link href="/" className="flex lg:hidden items-center justify-center gap-2 mb-6">
              <FootballIcon className="w-10 h-10 rounded-xl" />
              <span className="text-xl font-bold text-stadium-900">Profoot Profile</span>
            </Link>

            {/* Header */}
            <div className="text-center lg:text-left mb-6">
              <h2 className="text-3xl font-bold text-stadium-900 mb-2 tracking-tight">
                Inscription
              </h2>
              <p className="text-stadium-500 text-[15px]">
                Rejoignez la communauté Profoot Profile
              </p>
            </div>

            {/* Message d'erreur */}
            <AnimatePresence mode="wait">
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
                  <span>S&apos;inscrire avec Google</span>
                </>
              )}
            </button>

            {/* Séparateur */}
            <div className="relative my-6">
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
              {/* Sélection du rôle */}
              <div className="space-y-2.5">
                <Label required>Je suis un(e)</Label>
                <div className="grid grid-cols-3 gap-3">
                  {roleOptions.map((option, index) => {
                    const isSelected = role === option.value
                    const colors = getColorClasses(option.color, isSelected)
                    
                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        onClick={() => setRole(option.value as "PLAYER" | "AGENT" | "CLUB")}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${colors.border}`}
                      >
                        <div className={`p-2 rounded-lg transition-all duration-200 ${colors.iconBg}`}>
                          {option.icon}
                        </div>
                        <span className={`font-medium text-sm transition-colors ${
                          isSelected ? "text-stadium-900" : "text-stadium-600"
                        }`}>
                          {option.label}
                        </span>
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 25 }}
                              className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center ${colors.badge} shadow-sm`}
                            >
                              <CheckSmallIcon />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

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
                <Label htmlFor="password" required>
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (passwordError) validatePassword(e.target.value)
                  }}
                  onBlur={() => validatePassword(password)}
                  placeholder="Min. 8 car., majuscule, chiffre, spécial"
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
                  error={passwordError}
                  required
                  className="h-12"
                />
                {/* Indicateur de force du mot de passe */}
                <AnimatePresence>
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5 overflow-hidden"
                    >
                      <div className="flex gap-1 pt-1">
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: i * 0.05, duration: 0.2 }}
                            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 origin-left ${
                              i < passwordStrength.score
                                ? passwordStrength.color
                                : "bg-stadium-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-stadium-500">
                        Force : <span className="font-medium">{passwordStrength.label}</span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Confirmation du mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" required>
                  Confirmer le mot de passe
                </Label>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (confirmPasswordError) validateConfirmPassword(e.target.value)
                  }}
                  onBlur={() => validateConfirmPassword(confirmPassword)}
                  placeholder="Retapez votre mot de passe"
                  icon={<LockIcon />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-stadium-400 hover:text-stadium-600 transition-colors"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  }
                  error={confirmPasswordError}
                  required
                  className="h-12"
                />
              </div>

              {/* Checkbox CGV */}
              <div className="space-y-1.5">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => {
                        setAcceptTerms(e.target.checked)
                        if (e.target.checked) setTermsError("")
                      }}
                      className="peer sr-only"
                    />
                    <div className={`w-[18px] h-[18px] rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
                      acceptTerms 
                        ? "bg-pitch-500 border-pitch-500" 
                        : termsError 
                          ? "border-red-400 bg-red-50" 
                          : "border-stadium-300 group-hover:border-stadium-400"
                    }`}>
                      <AnimatePresence>
                        {acceptTerms && (
                          <motion.svg
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </motion.svg>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <span className="text-sm text-stadium-500 leading-relaxed">
                    J&apos;accepte les{" "}
                    <Link href="/terms" className="text-pitch-600 hover:underline font-medium">
                      conditions générales d&apos;utilisation
                    </Link>
                    {" "}et la{" "}
                    <Link href="/privacy" className="text-pitch-600 hover:underline font-medium">
                      politique de confidentialité
                    </Link>
                    {" "}de Profoot Profile.{" "}
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                <AnimatePresence>
                  {termsError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-xs text-red-500 ml-8"
                    >
                      {termsError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Bouton d'inscription */}
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
                    <span>Création du compte...</span>
                  </div>
                ) : (
                  "Créer mon compte"
                )}
              </Button>
            </form>

            {/* Lien de connexion */}
            <p className="mt-6 text-center text-sm text-stadium-500">
              Déjà inscrit ?{" "}
              <Link href="/login" className="text-pitch-600 hover:text-pitch-700 font-semibold transition-colors">
                Se connecter
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
