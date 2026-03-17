// Panneau gauche partagé pour les pages d'authentification
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { FootballIcon } from "./icons"

interface AuthBrandingProps {
  variant: "login" | "register"
}

export function AuthBranding({ variant }: AuthBrandingProps) {
  return (
    <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
      {/* Background avec gradient amélioré */}
      <div className="absolute inset-0 bg-gradient-to-br from-pitch-500 via-pitch-600 to-pitch-800" />
      
      {/* Overlay avec effet de lumière */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5" />

      {/* Motif de terrain amélioré */}
      <div className="absolute inset-0 opacity-[0.07]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
        {/* Cercle central du terrain */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border-[3px] border-white/30 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/30 rounded-full" />
        {/* Ligne médiane */}
        <div className="absolute top-1/2 left-0 right-0 h-[3px] bg-white/20" />
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-4">
            <FootballIcon className="w-12 h-12 rounded-2xl" variant="light" />
            <span className="text-2xl font-bold text-white tracking-tight">Profoot Profile</span>
          </Link>

          {variant === "login" ? <LoginContent /> : <RegisterContent />}
        </motion.div>
      </div>
    </div>
  )
}

function LoginContent() {
  return (
    <>
      {/* Titre principal */}
      <div className="space-y-4">
        <h1 className="text-4xl xl:text-[3.25rem] font-bold text-white leading-[1.15] tracking-tight">
          Connectez-vous à<br />
          <span className="text-gold-400">votre carrière</span>
        </h1>
        <p className="text-lg text-white/75 max-w-md leading-relaxed">
          Rejoignez la plateforme qui connecte joueurs, agents et clubs du monde entier.
        </p>
      </div>

    </>
  )
}

function RegisterContent() {
  return (
    <>
      {/* Titre principal */}
      <div className="space-y-4">
        <h1 className="text-4xl xl:text-[3.25rem] font-bold text-white leading-[1.15] tracking-tight">
          Lancez votre<br />
          <span className="text-gold-400">carrière aujourd&apos;hui</span>
        </h1>
        <p className="text-lg text-white/75 max-w-md leading-relaxed">
          Créez votre profil et connectez-vous avec les meilleurs clubs, agents et opportunités du football.
        </p>
      </div>

      {/* Avantages */}
      <div className="space-y-5 pt-8 border-t border-white/15">
        {[
          { text: "Profil professionnel complet", color: "from-pitch-400 to-pitch-500", delay: 0.3 },
          { text: "Réseau de professionnels vérifié", color: "from-gold-400 to-gold-500", delay: 0.4 },
          { text: "Opportunités personnalisées", color: "from-victory-400 to-victory-500", delay: 0.5 },
        ].map((item) => (
          <motion.div
            key={item.text}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: item.delay }}
            className="flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-white/90 font-medium">{item.text}</span>
          </motion.div>
        ))}
      </div>
    </>
  )
}
