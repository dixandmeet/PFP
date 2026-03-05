"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stadium-950 relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-stadium" />

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(34,197,94,0.3) 40px, rgba(34,197,94,0.3) 41px),
            repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(34,197,94,0.3) 40px, rgba(34,197,94,0.3) 41px)`,
        }}
      />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-pitch-500/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-pitch-500/20" />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-pitch-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gold-500/5 rounded-full blur-[100px]" />

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="relative inline-block mb-8">
            <span className="text-[10rem] md:text-[14rem] font-bold leading-none bg-gradient-to-b from-pitch-400 via-pitch-500 to-pitch-700 bg-clip-text text-transparent select-none">
              404
            </span>
            <div className="absolute inset-0 text-[10rem] md:text-[14rem] font-bold leading-none text-pitch-500/10 blur-2xl select-none">
              404
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-victory-500/10 border border-victory-500/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-victory-500 animate-pulse-soft" />
            <span className="text-victory-400 text-sm font-medium tracking-wide uppercase">
              Hors-jeu
            </span>
          </div>
        </motion.div>

        <motion.h1
          className="text-2xl md:text-3xl font-semibold text-white mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Cette page est hors du terrain
        </motion.h1>

        <motion.p
          className="text-stadium-400 text-base md:text-lg mb-10 max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          La page que vous cherchez n&apos;existe pas ou a ete deplacee.
          Retournez sur le terrain.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link
            href="/"
            className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 bg-pitch-500 hover:bg-pitch-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-pitch-500/25 hover:shadow-pitch-500/40"
          >
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour a l&apos;accueil
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/5 hover:bg-white/10 text-stadium-300 hover:text-white font-medium rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            Se connecter
          </Link>
        </motion.div>

        <motion.div
          className="mt-16 flex items-center justify-center gap-6 text-sm text-stadium-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-pitch-500" />
            Profoot Profile
          </span>
          <span className="w-px h-4 bg-stadium-700" />
          <span>Le reseau du football pro</span>
        </motion.div>
      </div>
    </div>
  )
}
