// Reset Password page
"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Icônes SVG
const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg className="w-16 h-16 text-pitch-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const AlertTriangleIcon = () => (
  <svg className="w-16 h-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
)

// Icône de ballon de foot
const FootballIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M12 4l-1.41 1.41L12 6.83l1.41-1.42L12 4zm0 14l1.41-1.41L12 15.17l-1.41 1.42L12 18zm6-6l-1.41-1.41L15.17 12l1.42 1.41L18 12zM6 12l1.41 1.41L8.83 12l-1.42-1.41L6 12zm6-2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
)

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

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "", color: "" })

  // Vérifier le token au chargement
  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      return
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`)
        const data = await response.json()
        setTokenValid(data.valid)
      } catch (err) {
        setTokenValid(false)
      }
    }

    verifyToken()
  }, [token])

  // Mise à jour de la force du mot de passe
  useEffect(() => {
    if (password) {
      setPasswordStrength(calculatePasswordStrength(password))
    } else {
      setPasswordStrength({ score: 0, label: "", color: "" })
    }
  }, [password])

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

  // Validation de confirmation
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const isPasswordValid = validatePassword(password)
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword)

    if (!isPasswordValid || !isConfirmPasswordValid) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue")
        return
      }

      setSuccess(true)
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  // État de chargement de la vérification du token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-pitch-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-stadium-500">Vérification du lien...</p>
        </div>
      </div>
    )
  }

  // Token invalide ou expiré
  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
              <AlertTriangleIcon />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-stadium-900 mb-3">
            Lien invalide ou expiré
          </h2>
          
          <p className="text-stadium-500 mb-6">
            Ce lien de réinitialisation n'est plus valide. Il a peut-être expiré ou a déjà été utilisé.
          </p>

          <div className="space-y-3">
            <Link href="/forgot-password" className="block">
              <Button
                type="button"
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                Demander un nouveau lien
              </Button>
            </Link>
            
            <Link href="/login" className="block">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 text-base font-semibold border-2"
                size="lg"
              >
                Retour à la connexion
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Partie gauche - Image et branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
        {/* Background avec gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-pitch-600 via-pitch-700 to-pitch-900" />
        
        {/* Motif de terrain */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-white/20 rounded-full" />
        </div>

        {/* Éléments décoratifs animés */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute top-20 right-20"
        >
          <FootballIcon className="w-32 h-32 text-white animate-float" />
        </motion.div>

        {/* Contenu principal */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <FootballIcon className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Profoot Profile</span>
            </Link>

            {/* Titre principal */}
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                Nouveau<br />
                <span className="text-gold-400">mot de passe</span>
              </h1>
              <p className="text-lg text-white/80 max-w-md">
                Choisissez un mot de passe fort pour sécuriser votre compte.
              </p>
            </div>

            {/* Conseils de sécurité */}
            <div className="space-y-4 pt-8 border-t border-white/20">
              <h3 className="text-white font-medium">Conseils pour un mot de passe sécurisé :</h3>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-pitch-400" />
                <span className="text-white/80 text-sm">Au moins 8 caractères</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-pitch-400" />
                <span className="text-white/80 text-sm">Mélangez majuscules et minuscules</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-pitch-400" />
                <span className="text-white/80 text-sm">Ajoutez des chiffres et symboles</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-pitch-400" />
                <span className="text-white/80 text-sm">Évitez les informations personnelles</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Partie droite - Formulaire */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center bg-white px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo mobile */}
          <Link href="/" className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-pitch-500 flex items-center justify-center">
              <FootballIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-stadium-900">Profoot Profile</span>
          </Link>

          {!success ? (
            <>
              {/* Header */}
              <div className="text-center lg:text-left mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="lg:hidden mx-auto w-16 h-16 bg-gradient-to-br from-pitch-500 to-pitch-600 rounded-2xl flex items-center justify-center mb-4"
                >
                  <LockIcon />
                </motion.div>
                <h2 className="text-3xl font-bold text-stadium-900 mb-2">
                  Nouveau mot de passe
                </h2>
                <p className="text-stadium-500">
                  Créez un nouveau mot de passe pour votre compte.
                </p>
              </div>

              {/* Message d'erreur */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6"
                >
                  {error}
                </motion.div>
              )}

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Mot de passe */}
                <div className="space-y-2">
                  <Label htmlFor="password" required>
                    Nouveau mot de passe
                  </Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      validatePassword(e.target.value)
                    }}
                    onBlur={() => validatePassword(password)}
                    placeholder="Au moins 8 caractères"
                    icon={<LockIcon />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-stadium-400 hover:text-stadium-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    }
                    error={passwordError}
                    required
                    className="h-12"
                  />
                  {/* Indicateur de force */}
                  {password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-2"
                    >
                      <div className="flex gap-1">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all ${
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
                </div>

                {/* Confirmation */}
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
                      validateConfirmPassword(e.target.value)
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
                      >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    }
                    error={confirmPasswordError}
                    required
                    className="h-12"
                  />
                </div>

                {/* Bouton */}
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
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
                      <span>Modification en cours...</span>
                    </div>
                  ) : (
                    "Réinitialiser le mot de passe"
                  )}
                </Button>
              </form>
            </>
          ) : (
            /* État de succès */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-pitch-50 rounded-full flex items-center justify-center"
                >
                  <CheckCircleIcon />
                </motion.div>
              </div>
              
              <h2 className="text-2xl font-bold text-stadium-900 mb-3">
                Mot de passe modifié !
              </h2>
              
              <p className="text-stadium-500 mb-6">
                Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>

              <Link href="/login" className="block">
                <Button
                  type="button"
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  Se connecter
                </Button>
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-pitch-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-stadium-500">Chargement...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
