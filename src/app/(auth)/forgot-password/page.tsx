// Forgot Password page
"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Icônes SVG
const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg className="w-16 h-16 text-pitch-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

// Icône de ballon de foot
const FootballIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M12 4l-1.41 1.41L12 6.83l1.41-1.42L12 4zm0 14l1.41-1.41L12 15.17l-1.41 1.42L12 18zm6-6l-1.41-1.41L15.17 12l1.42 1.41L18 12zM6 12l1.41 1.41L8.83 12l-1.42-1.41L6 12zm6-2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
)

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

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

    setLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
        
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="absolute bottom-32 left-16"
        >
          <FootballIcon className="w-24 h-24 text-white animate-float-slow" />
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
                Récupérez<br />
                <span className="text-gold-400">votre accès</span>
              </h1>
              <p className="text-lg text-white/80 max-w-md">
                Pas de panique ! Nous allons vous aider à retrouver l'accès à votre compte en quelques étapes simples.
              </p>
            </div>

            {/* Étapes */}
            <div className="space-y-4 pt-8 border-t border-white/20">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                  1
                </div>
                <span className="text-white/90">Entrez votre adresse email</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                  2
                </div>
                <span className="text-white/90">Recevez un lien par email</span>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                  3
                </div>
                <span className="text-white/90">Créez un nouveau mot de passe</span>
              </motion.div>
            </div>

            {/* Info sécurité */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mt-8"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gold-400/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <div className="text-white font-medium text-sm mb-1">Sécurité</div>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Le lien de réinitialisation expire après 1 heure pour protéger votre compte.
                  </p>
                </div>
              </div>
            </motion.div>
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
              {/* Retour */}
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 text-stadium-500 hover:text-stadium-700 transition-colors mb-8"
              >
                <ArrowLeftIcon />
                <span className="text-sm font-medium">Retour à la connexion</span>
              </Link>

              {/* Header */}
              <div className="text-center lg:text-left mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="lg:hidden mx-auto w-16 h-16 bg-gradient-to-br from-pitch-500 to-pitch-600 rounded-2xl flex items-center justify-center mb-4"
                >
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </motion.div>
                <h2 className="text-3xl font-bold text-stadium-900 mb-2">
                  Mot de passe oublié
                </h2>
                <p className="text-stadium-500">
                  Entrez votre email pour recevoir un lien de réinitialisation.
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
                      validateEmail(e.target.value)
                    }}
                    placeholder="nom@exemple.com"
                    icon={<MailIcon />}
                    error={emailError}
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
                      <span>Envoi en cours...</span>
                    </div>
                  ) : (
                    "Envoyer le lien"
                  )}
                </Button>
              </form>

              {/* Aide supplémentaire */}
              <div className="mt-8 p-4 bg-stadium-50 rounded-xl">
                <p className="text-sm text-stadium-600 text-center">
                  Vous n'avez pas reçu l'email ?{" "}
                  <button 
                    type="button"
                    onClick={() => !loading && handleSubmit({ preventDefault: () => {} } as any)}
                    className="text-pitch-600 hover:underline font-medium"
                    disabled={loading || !email}
                  >
                    Renvoyer
                  </button>
                </p>
              </div>
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
                Email envoyé !
              </h2>
              
              <p className="text-stadium-500 mb-6">
                Nous avons envoyé un lien de réinitialisation à{" "}
                <span className="font-medium text-stadium-700">{email}</span>.
                Vérifiez votre boîte de réception.
              </p>

              <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-gold-800">
                  <strong>Note :</strong> Le lien expire dans 1 heure. Si vous ne trouvez pas l'email, 
                  vérifiez votre dossier spam.
                </p>
              </div>

              <div className="space-y-3">
                <Link href="/login" className="block">
                  <Button
                    type="button"
                    className="w-full h-12 text-base font-semibold"
                    size="lg"
                  >
                    Retour à la connexion
                  </Button>
                </Link>
                
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false)
                    setEmail("")
                  }}
                  className="text-sm text-pitch-600 hover:underline font-medium"
                >
                  Utiliser une autre adresse email
                </button>
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-stadium-400">
            Besoin d'aide ?{" "}
            <Link href="/support" className="text-pitch-600 hover:underline">
              Contactez le support
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
