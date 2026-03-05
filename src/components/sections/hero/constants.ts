import type { Variants } from "framer-motion"

export const HERO_COPY = {
  badge: "Le réseau du football pro",
  title: {
    before: "Le réseau",
    accent: "professionnel",
    after: "du football",
  },
  subtitle:
    "Profils vérifiés, mandats sécurisés, marketplace mercato et assistants IA — pour connecter joueurs, agents et clubs, du football amateur au haut niveau.",
  ctaPrimary: "Créer mon profil gratuitement",
  ctaSecondary: "Voir comment ça marche",
  microcopy: "Gratuit • 2 min • Sans engagement",
  metrics: [
    { value: 1200, suffix: "+", label: "Joueurs vérifiés" },
    { value: 85, suffix: "", label: "Clubs actifs" },
    { value: 340, suffix: "", label: "Mandats en cours" },
  ],
  features: [
    { label: "Joueurs vérifiés", icon: "Users" as const },
    { label: "Mandats sécurisés", icon: "Shield" as const },
    { label: "Clubs certifiés", icon: "Building2" as const },
    { label: "IA assistée", icon: "Sparkles" as const },
  ],
  clubs: [
    { name: "PSG", color: "from-blue-600 to-red-600" },
    { name: "OL", color: "from-blue-500 to-red-500" },
    { name: "OM", color: "from-sky-400 to-white" },
    { name: "ASM", color: "from-red-500 to-white" },
  ],
} as const

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
}

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

export const floatVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-6, 6, -6],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
  },
}

export const glowVariants: Variants = {
  initial: { opacity: 0.4 },
  animate: {
    opacity: [0.4, 0.8, 0.4],
    scale: [1, 1.03, 1],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
}

export const shimmerVariants: Variants = {
  initial: { x: "-100%" },
  animate: {
    x: "100%",
    transition: { duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" },
  },
}

export const pulseScaleVariants: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.02, 1],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
}
