// Onboarding page for new users to complete their profile
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import { COUNTRIES } from "@/lib/constants/countries"

// ─── Icons ──────────────────────────────────────────────────────────────────

const FootballIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M12 4l-1.41 1.41L12 6.83l1.41-1.42L12 4zm0 14l1.41-1.41L12 15.17l-1.41 1.42L12 18zm6-6l-1.41-1.41L15.17 12l1.42 1.41L18 12zM6 12l1.41 1.41L8.83 12l-1.42-1.41L6 12zm6-2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
)

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
)

const SportIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
  </svg>
)

const CareerIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
)

const BuildingIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
)

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
  </svg>
)

const TipIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
)

// ─── Position & Foot Icons ──────────────────────────────────────────────────

const GoalkeeperIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
  </svg>
)

const DefenderIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
  </svg>
)

const MidfielderIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
)

const ForwardIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
  </svg>
)

// ─── Role Selection Config ──────────────────────────────────────────────────

const roleOptions = [
  {
    value: "PLAYER" as const,
    label: "Joueur",
    description: "Créez votre profil de footballeur professionnel",
    icon: "⚽",
    emoji: "🏃",
  },
  {
    value: "AGENT" as const,
    label: "Agent",
    description: "Gérez vos joueurs et développez votre réseau",
    icon: "🤝",
    emoji: "👔",
  },
  {
    value: "CLUB" as const,
    label: "Club",
    description: "Présentez votre club et recrutez des talents",
    icon: "🏟️",
    emoji: "🏛️",
  },
]

// ─── Configuration ──────────────────────────────────────────────────────────

const roleStepIcons: Record<string, typeof UserIcon[]> = {
  PLAYER: [UserIcon, SportIcon, CareerIcon],
  AGENT: [UserIcon, BuildingIcon, DocumentIcon],
}

const roleSteps: Record<string, { id: string; title: string; subtitle: string }[]> = {
  PLAYER: [
    { id: "personal", title: "Informations personnelles", subtitle: "Dites-nous qui vous êtes" },
    { id: "sport", title: "Profil sportif", subtitle: "Vos caractéristiques de joueur" },
    { id: "career", title: "Carrière", subtitle: "Votre parcours footballistique" },
  ],
  AGENT: [
    { id: "personal", title: "Informations personnelles", subtitle: "Dites-nous qui vous êtes" },
    { id: "agency", title: "Agence", subtitle: "Votre structure professionnelle" },
    { id: "license", title: "Licence", subtitle: "Vos certifications" },
  ],
}

const positions = [
  { value: "GK", label: "Gardien", description: "Dernier rempart", Icon: GoalkeeperIcon },
  { value: "DF", label: "Défenseur", description: "Solidité défensive", Icon: DefenderIcon },
  { value: "MF", label: "Milieu", description: "Maître du jeu", Icon: MidfielderIcon },
  { value: "FW", label: "Attaquant", description: "Finisseur", Icon: ForwardIcon },
]

const strongFootOptions = [
  { value: "RIGHT", label: "Droit", emoji: "🦶" },
  { value: "LEFT", label: "Gauche", emoji: "🦶" },
  { value: "BOTH", label: "Les deux", emoji: "🦶🦶" },
]

// ─── Animations ─────────────────────────────────────────────────────────────

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
}

const staggerItem = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [currentStep, setCurrentStep] = useState(0) // 0 = role selection, 1+ = form steps
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [direction, setDirection] = useState(1)
  const [selectedRole, setSelectedRole] = useState<"PLAYER" | "AGENT" | "CLUB">("PLAYER")
  const [roleConfirmed, setRoleConfirmed] = useState(false)
  const [hasExistingProfile, setHasExistingProfile] = useState(false)
  const [checkingProfile, setCheckingProfile] = useState(true) // Block UI until profile check is done
  
  const [formData, setFormData] = useState({
    // Player fields
    firstName: "", lastName: "", dateOfBirth: "", nationality: "",
    primaryPosition: "MF", strongFoot: "RIGHT", height: "", weight: "", currentClub: "",
    // Agent fields
    agencyName: "", licenseNumber: "", licenseCountry: "",
  })

  // Use selectedRole once confirmed, otherwise session role
  const role = roleConfirmed ? selectedRole : (session?.user?.role as "PLAYER" | "AGENT" | "CLUB") || "PLAYER"
  const steps = roleSteps[role] || roleSteps.PLAYER
  const stepIcons = roleStepIcons[role] || roleStepIcons.PLAYER
  const totalSteps = steps.length + 1 // +1 for role selection step

  // Initialize selectedRole from session & check existing profile
  useEffect(() => {
    if (session?.user?.role && !roleConfirmed) {
      setSelectedRole(session.user.role as "PLAYER" | "AGENT" | "CLUB")
    }
  }, [session?.user?.role, roleConfirmed])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Check if user already has a profile (restrict role change & redirect)
  useEffect(() => {
    if (status === "authenticated") {
      setCheckingProfile(true)
      fetch("/api/users/me")
        .then(res => res.json())
        .then(data => {
          if (data.hasProfile) {
            setHasExistingProfile(true)
            // User already has a profile — redirect to dashboard immediately
            const r = data.role || "PLAYER"
            router.replace(r === "ADMIN" ? "/admin" : `/${r.toLowerCase()}/dashboard`)
            // Don't set checkingProfile to false — keep the loading screen until redirect completes
            return
          }
          setCheckingProfile(false)
        })
        .catch(() => {
          setCheckingProfile(false)
        })
    }
  }, [status, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formStepIndex = currentStep - 1 // Index within roleSteps (0-based)

  const nextStep = async () => {
    // If on role selection step, confirm role and potentially update it
    if (currentStep === 0) {
      setError("")

      // Safety: if user has existing profile, don't allow role change at all — redirect
      if (hasExistingProfile) {
        const r = (session?.user?.role as string) || "PLAYER"
        router.replace(r === "ADMIN" ? "/admin" : `/${r.toLowerCase()}/dashboard`)
        return
      }

      // Only call API if role actually changed
      if (selectedRole !== session?.user?.role) {
        setLoading(true)
        try {
          const res = await fetch("/api/users/me", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: selectedRole }),
          })
          if (!res.ok) {
            const data = await res.json()
            throw new Error(data.error || "Erreur lors du changement de rôle")
          }
          // Update the session with new role
          await update({ role: selectedRole })
        } catch (err: any) {
          setError(err.message)
          setLoading(false)
          return
        }
        setLoading(false)
      }

      // CLUB role has its own dedicated onboarding flow with KYC verification
      if (selectedRole === "CLUB") {
        router.push("/club/onboarding")
        return
      }

      setRoleConfirmed(true)
      setDirection(1)
      setCurrentStep(1)
      return
    }

    // Validate current step before advancing
    setError("")
    if (role === "PLAYER") {
      if (formStepIndex === 0) {
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          setError("Le prénom et le nom sont requis")
          return
        }
        if (!formData.dateOfBirth) {
          setError("La date de naissance est requise")
          return
        }
        if (!formData.nationality.trim()) {
          setError("La nationalité est requise")
          return
        }
      }
      if (formStepIndex === 1) {
        if (!formData.primaryPosition) {
          setError("La position principale est requise")
          return
        }
        if (!formData.strongFoot) {
          setError("Le pied fort est requis")
          return
        }
      }
    } else if (role === "AGENT") {
      if (formStepIndex === 0) {
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          setError("Le prénom et le nom sont requis")
          return
        }
      }
    }

    if (formStepIndex < steps.length - 1) {
      setDirection(1)
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    setDirection(-1)
    if (currentStep === 1) {
      // Go back to role selection
      setCurrentStep(0)
      setRoleConfirmed(false)
    } else if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")

    try {
      let endpoint = ""
      let body = {}

      if (role === "PLAYER") {
        endpoint = "/api/players"
        body = {
          firstName: formData.firstName.trim(), lastName: formData.lastName.trim(),
          dateOfBirth: formData.dateOfBirth, nationality: formData.nationality,
          primaryPosition: formData.primaryPosition, secondaryPositions: [],
          ...(formData.strongFoot && { strongFoot: formData.strongFoot }),
          ...(formData.height && { height: parseInt(formData.height) }),
          ...(formData.weight && { weight: parseInt(formData.weight) }),
          ...(formData.currentClub?.trim() && { currentClub: formData.currentClub.trim() }),
        }
      } else if (role === "AGENT") {
        endpoint = "/api/agents"
        body = {
          firstName: formData.firstName.trim(), lastName: formData.lastName.trim(),
          agencyName: formData.agencyName?.trim() || null,
          licenseNumber: formData.licenseNumber?.trim() || null,
          licenseCountry: formData.licenseCountry || null,
        }
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la création du profil")
      }

      await update()
      router.push(`/${role.toLowerCase()}/dashboard`)
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    // Only allow skipping if user already has a profile (safety check)
    // Otherwise redirect to home page — user can come back later
    if (hasExistingProfile) {
      const r = (session?.user?.role as string) || "PLAYER"
      router.push(r === "ADMIN" ? "/admin" : `/${r.toLowerCase()}/dashboard`)
    } else {
      router.push("/")
    }
  }

  // ─── Loading State ──────────────────────────────────────────────────────

  if (status === "loading" || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pitch-50 via-white to-stadium-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-3 border-pitch-500 border-t-transparent rounded-full"
          />
          <p className="text-sm text-stadium-400 font-medium">Chargement...</p>
        </motion.div>
      </div>
    )
  }

  // ─── Progress & Animations ──────────────────────────────────────────────

  const progressPercent = ((currentStep + 1) / totalSteps) * 100

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  }

  const isRoleStep = currentStep === 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-pitch-50/50 via-white to-stadium-50/50 flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pitch-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pitch-100/20 rounded-full blur-3xl" />
      </div>

      {/* Top progress bar */}
      <div className="relative z-10 w-full">
        <div className="h-1 bg-stadium-100">
          <motion.div
            className="h-full bg-gradient-to-r from-pitch-400 to-pitch-500 rounded-r-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-8"
          >
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
              <div className="w-9 h-9 rounded-xl bg-pitch-500 flex items-center justify-center shadow-md shadow-pitch-500/20 group-hover:shadow-lg group-hover:shadow-pitch-500/30 transition-shadow">
                <FootballIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-stadium-900">Profoot Profile</span>
            </Link>
            
            <h1 className="text-2xl font-bold text-stadium-900 mb-1.5">
              {isRoleStep ? "Bienvenue sur Profoot Profile" : "Complétez votre profil"}
            </h1>
            <p className="text-sm text-stadium-400">
              {isRoleStep ? "Quel type de profil souhaitez-vous créer ?" : `Étape ${currentStep} sur ${steps.length}`}
            </p>
          </motion.div>

          {/* Step Indicator — only show for form steps */}
          {!isRoleStep && (
            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-0">
                {steps.map((step, index) => {
                  const StepIcon = stepIcons[index]
                  const isCompleted = formStepIndex > index
                  const isCurrent = formStepIndex === index

                  return (
                    <div key={step.id} className="flex items-center">
                      <motion.div
                        initial={false}
                        animate={{ scale: isCurrent ? 1 : 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="flex flex-col items-center"
                      >
                        <div
                          className={`
                            w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                            ${isCompleted
                              ? "bg-pitch-500 text-white shadow-md shadow-pitch-500/25"
                              : isCurrent
                                ? "bg-pitch-500 text-white shadow-lg shadow-pitch-500/30 ring-4 ring-pitch-100"
                                : "bg-stadium-100 text-stadium-400"
                            }
                          `}
                        >
                          {isCompleted ? <CheckIcon /> : <StepIcon />}
                        </div>
                        <span className={`text-[11px] font-medium mt-1.5 max-w-[70px] text-center leading-tight ${
                          isCurrent ? "text-pitch-600" : isCompleted ? "text-pitch-500" : "text-stadium-400"
                        }`}>
                          {step.title.split(" ")[0]}
                        </span>
                      </motion.div>

                      {index < steps.length - 1 && (
                        <div className="w-10 h-[2px] mx-1 mt-[-16px]">
                          <div className={`h-full rounded-full transition-colors duration-300 ${
                            formStepIndex > index ? "bg-pitch-500" : "bg-stadium-200"
                          }`} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Card */}
          <motion.div
            layout
            className="bg-white rounded-2xl shadow-xl shadow-stadium-900/[0.04] border border-stadium-100 overflow-hidden"
          >
            {/* Card Header */}
            <div className="px-6 pt-6 pb-4 border-b border-stadium-100/80">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  {isRoleStep ? (
                    <>
                      <h2 className="text-lg font-semibold text-stadium-900">Type de profil</h2>
                      <p className="text-sm text-stadium-400 mt-0.5">Choisissez le profil qui vous correspond</p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-lg font-semibold text-stadium-900">{steps[formStepIndex].title}</h2>
                      <p className="text-sm text-stadium-400 mt-0.5">{steps[formStepIndex].subtitle}</p>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="mx-6 mt-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Content */}
            <div className="p-6">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                >

                  {/* ─── ROLE SELECTION ─── */}
                  {isRoleStep && (
                    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-3">
                      {roleOptions.map((opt) => {
                        const isSelected = selectedRole === opt.value
                        const isDisabled = hasExistingProfile && opt.value !== session?.user?.role
                        return (
                          <motion.button
                            key={opt.value}
                            variants={staggerItem}
                            type="button"
                            onClick={() => !isDisabled && setSelectedRole(opt.value)}
                            whileHover={!isDisabled ? { scale: 1.01 } : {}}
                            whileTap={!isDisabled ? { scale: 0.99 } : {}}
                            className={`
                              relative w-full p-5 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-4
                              ${isDisabled
                                ? "border-stadium-100 bg-stadium-50/50 opacity-50 cursor-not-allowed"
                                : isSelected
                                  ? "border-pitch-500 bg-pitch-50/80 shadow-sm shadow-pitch-500/10"
                                  : "border-stadium-200 hover:border-stadium-300 hover:bg-stadium-50/50"
                              }
                            `}
                          >
                            <div className={`
                              w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0
                              ${isSelected && !isDisabled ? "bg-pitch-100" : "bg-stadium-100"}
                            `}>
                              {opt.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`font-semibold text-base ${isSelected && !isDisabled ? "text-pitch-700" : "text-stadium-800"}`}>
                                {opt.label}
                              </div>
                              <div className={`text-sm mt-0.5 ${isSelected && !isDisabled ? "text-pitch-500" : "text-stadium-400"}`}>
                                {opt.description}
                              </div>
                            </div>
                            {isSelected && !isDisabled && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-6 h-6 bg-pitch-500 rounded-full flex items-center justify-center flex-shrink-0"
                              >
                                <CheckIcon />
                              </motion.div>
                            )}
                          </motion.button>
                        )
                      })}
                    </motion.div>
                  )}

                  {/* ─── PLAYER Steps ─── */}
                  {role === "PLAYER" && formStepIndex === 0 && !isRoleStep && (
                    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
                      <motion.div variants={staggerItem} className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName" required>Prénom</Label>
                          <Input id="firstName" value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} placeholder="Kevin" className="h-12" />
                        </div>
                        <div>
                          <Label htmlFor="lastName" required>Nom</Label>
                          <Input id="lastName" value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} placeholder="Dupont" className="h-12" />
                        </div>
                      </motion.div>
                      <motion.div variants={staggerItem}>
                        <Label htmlFor="dateOfBirth" required>Date de naissance</Label>
                        <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange("dateOfBirth", e.target.value)} className="h-12" />
                      </motion.div>
                      <motion.div variants={staggerItem}>
                        <Label htmlFor="nationality" required>Nationalité</Label>
                        <Combobox
                          options={COUNTRIES}
                          value={formData.nationality}
                          onValueChange={(val) => handleInputChange("nationality", val)}
                          placeholder="Sélectionner un pays"
                          searchPlaceholder="Rechercher un pays…"
                          emptyText="Aucun pays trouvé"
                          buttonClassName="h-12"
                        />
                      </motion.div>
                    </motion.div>
                  )}

                  {role === "PLAYER" && formStepIndex === 1 && !isRoleStep && (
                    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-6">
                      <motion.div variants={staggerItem}>
                        <Label required>Position principale</Label>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {positions.map((pos) => {
                            const isSelected = formData.primaryPosition === pos.value
                            return (
                              <motion.button key={pos.value} type="button" onClick={() => handleInputChange("primaryPosition", pos.value)}
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 group ${isSelected ? "border-pitch-500 bg-pitch-50/80 shadow-sm shadow-pitch-500/10" : "border-stadium-200 hover:border-stadium-300 hover:bg-stadium-50/50"}`}
                              >
                                <div className={`mb-2 ${isSelected ? "text-pitch-600" : "text-stadium-400 group-hover:text-stadium-500"}`}><pos.Icon /></div>
                                <div className={`font-semibold text-sm ${isSelected ? "text-pitch-700" : "text-stadium-700"}`}>{pos.label}</div>
                                <div className={`text-xs mt-0.5 ${isSelected ? "text-pitch-500" : "text-stadium-400"}`}>{pos.description}</div>
                                {isSelected && (
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2.5 right-2.5 w-5 h-5 bg-pitch-500 rounded-full flex items-center justify-center"><CheckIcon /></motion.div>
                                )}
                              </motion.button>
                            )
                          })}
                        </div>
                      </motion.div>
                      <motion.div variants={staggerItem}>
                        <Label required>Pied fort</Label>
                        <div className="grid grid-cols-3 gap-3 mt-2">
                          {strongFootOptions.map((foot) => {
                            const isSelected = formData.strongFoot === foot.value
                            return (
                              <motion.button key={foot.value} type="button" onClick={() => handleInputChange("strongFoot", foot.value)}
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${isSelected ? "border-pitch-500 bg-pitch-50/80 shadow-sm shadow-pitch-500/10" : "border-stadium-200 hover:border-stadium-300 hover:bg-stadium-50/50"}`}
                              >
                                <div className="text-lg mb-1">{foot.emoji}</div>
                                <div className={`text-sm font-medium ${isSelected ? "text-pitch-700" : "text-stadium-600"}`}>{foot.label}</div>
                              </motion.button>
                            )
                          })}
                        </div>
                      </motion.div>
                      <motion.div variants={staggerItem} className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="height">Taille (cm)</Label>
                          <Input id="height" type="number" value={formData.height} onChange={(e) => handleInputChange("height", e.target.value)} placeholder="180" className="h-12" />
                        </div>
                        <div>
                          <Label htmlFor="weight">Poids (kg)</Label>
                          <Input id="weight" type="number" value={formData.weight} onChange={(e) => handleInputChange("weight", e.target.value)} placeholder="75" className="h-12" />
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {role === "PLAYER" && formStepIndex === 2 && !isRoleStep && (
                    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
                      <motion.div variants={staggerItem}>
                        <Label htmlFor="currentClub">Club actuel</Label>
                        <Input id="currentClub" value={formData.currentClub} onChange={(e) => handleInputChange("currentClub", e.target.value)} placeholder="FC Exemple" className="h-12" />
                        <p className="text-xs text-stadium-400 mt-1.5">Optionnel – vous pourrez le modifier plus tard</p>
                      </motion.div>
                      <motion.div variants={staggerItem}>
                        <div className="bg-gradient-to-br from-pitch-50 to-pitch-50/50 rounded-xl p-4 border border-pitch-100/80">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-pitch-100 flex items-center justify-center flex-shrink-0 mt-0.5"><TipIcon /></div>
                            <div>
                              <p className="text-sm font-medium text-pitch-800 mb-0.5">Astuce</p>
                              <p className="text-sm text-pitch-600 leading-relaxed">Vous pourrez ajouter votre historique de carrière complet, vos statistiques et vos vidéos depuis votre profil.</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {/* ─── AGENT Steps ─── */}
                  {role === "AGENT" && formStepIndex === 0 && !isRoleStep && (
                    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
                      <motion.div variants={staggerItem} className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName" required>Prénom</Label>
                          <Input id="firstName" value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} placeholder="Jean" className="h-12" />
                        </div>
                        <div>
                          <Label htmlFor="lastName" required>Nom</Label>
                          <Input id="lastName" value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} placeholder="Martin" className="h-12" />
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {role === "AGENT" && formStepIndex === 1 && !isRoleStep && (
                    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
                      <motion.div variants={staggerItem}>
                        <Label htmlFor="agencyName">Nom de l&apos;agence</Label>
                        <Input id="agencyName" value={formData.agencyName} onChange={(e) => handleInputChange("agencyName", e.target.value)} placeholder="Sport Management Agency" className="h-12" />
                        <p className="text-xs text-stadium-400 mt-1.5">Optionnel – laissez vide si vous êtes indépendant</p>
                      </motion.div>
                    </motion.div>
                  )}

                  {role === "AGENT" && formStepIndex === 2 && !isRoleStep && (
                    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-5">
                      <motion.div variants={staggerItem}>
                        <Label htmlFor="licenseNumber">Numéro de licence</Label>
                        <Input id="licenseNumber" value={formData.licenseNumber} onChange={(e) => handleInputChange("licenseNumber", e.target.value)} placeholder="FFF-2024-XXXX" className="h-12" />
                        <p className="text-xs text-stadium-400 mt-1.5">Optionnel</p>
                      </motion.div>
                      <motion.div variants={staggerItem}>
                        <Label htmlFor="licenseCountry">Pays de la licence</Label>
                        <Combobox
                          options={COUNTRIES}
                          value={formData.licenseCountry}
                          onValueChange={(val) => handleInputChange("licenseCountry", val)}
                          placeholder="Sélectionner un pays"
                          searchPlaceholder="Rechercher un pays…"
                          emptyText="Aucun pays trouvé"
                          buttonClassName="h-12"
                        />
                      </motion.div>
                    </motion.div>
                  )}

                  {/* CLUB role is handled by /club/onboarding — users are redirected there */}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Card Footer / Navigation */}
            <div className="px-6 py-4 bg-stadium-50/50 border-t border-stadium-100/80">
              <div className="flex items-center justify-between">
                <div>
                  {currentStep > 0 ? (
                    <Button type="button" variant="ghost" onClick={prevStep} className="gap-2 text-stadium-500 hover:text-stadium-700">
                      <ArrowLeftIcon />
                      Précédent
                    </Button>
                  ) : (
                    <button type="button" onClick={handleSkip} className="text-sm text-stadium-400 hover:text-stadium-600 transition-colors font-medium px-2 py-1">
                      Passer
                    </button>
                  )}
                </div>
                
                <div>
                  {isRoleStep ? (
                    <Button type="button" onClick={nextStep} disabled={loading} className="gap-2 px-6">
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          <span>Chargement...</span>
                        </div>
                      ) : (
                        <>
                          Continuer
                          <ArrowRightIcon />
                        </>
                      )}
                    </Button>
                  ) : formStepIndex < steps.length - 1 ? (
                    <Button type="button" onClick={nextStep} className="gap-2 px-6">
                      Suivant
                      <ArrowRightIcon />
                    </Button>
                  ) : (
                    <Button type="button" onClick={handleSubmit} disabled={loading} className="gap-2 px-6">
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          <span>Création...</span>
                        </div>
                      ) : (
                        <>
                          Terminer
                          <CheckIcon />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Skip link */}
          {currentStep === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center mt-4">
              <button type="button" onClick={handleSkip} className="text-xs text-stadium-400 hover:text-stadium-500 transition-colors">
                Compléter plus tard
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
