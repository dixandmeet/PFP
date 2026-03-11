"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle, Shield, Zap, Play } from "lucide-react"

const benefits = [
  { icon: CheckCircle, label: "Gratuit pour démarrer" },
  { icon: Shield, label: "Sans engagement" },
  { icon: Zap, label: "Configuration en 2 min" },
]

export function FinalCTA() {
  return (
    <section id="final-cta" className="relative py-24 sm:py-28 md:py-36 overflow-hidden bg-white">
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-base-content/[0.06] to-transparent" />
      
      <div className="container relative z-10 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Main CTA Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative rounded-[2rem] bg-[#0a0a0a] overflow-hidden">
              {/* Subtle gradient accents */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,rgba(34,197,94,0.1),transparent)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_50%_110%,rgba(34,197,94,0.06),transparent)]" />
              
              {/* Dot grid */}
              <div 
                className="absolute inset-0 opacity-[0.2]"
                style={{
                  backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }}
              />
              
              <div className="relative px-8 py-14 md:px-16 md:py-20 text-center">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.06] mb-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[13px] font-medium text-white/50">Rejoignez +500 professionnels</span>
                  </div>
                </motion.div>
                
                {/* Heading */}
                <motion.h2 
                  className="text-3xl md:text-4xl lg:text-5xl xl:text-[3.5rem] font-bold text-white leading-[1.1] tracking-[-0.02em] mb-5"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  Du premier club amateur
                  <br />
                  au{" "}
                  <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                    haut niveau
                  </span>
                </motion.h2>

                {/* Description */}
                <motion.p 
                  className="text-[16px] md:text-[17px] text-white/35 mb-10 max-w-lg mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  Profoot Profile accompagne joueurs, agents, clubs
                  <br className="hidden sm:block" />
                  et centres de formation à chaque étape.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div 
                  className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link href="/register">
                    <motion.button
                      className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 text-[15px] font-semibold rounded-2xl bg-white text-[#0a0a0a] hover:bg-white/90 transition-colors"
                      whileHover={{ y: -2, boxShadow: "0 20px 40px -12px rgba(255,255,255,0.15)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Créer mon profil gratuitement
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </motion.button>
                  </Link>

                  <motion.button
                    onClick={() => {
                      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-[15px] font-semibold rounded-2xl bg-white/[0.06] border border-white/[0.06] text-white/60 hover:text-white/80 hover:bg-white/[0.08] transition-all"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Play className="w-4 h-4" />
                    Voir la démo
                  </motion.button>
                </motion.div>

                {/* Benefits */}
                <motion.div 
                  className="flex flex-wrap justify-center gap-6"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                >
                  {benefits.map((benefit, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 text-white/30"
                    >
                      <benefit.icon className="w-3.5 h-3.5 text-primary/60" />
                      <span className="text-[13px]">{benefit.label}</span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Bottom avatars social proof */}
          <motion.div 
            className="flex flex-col items-center mt-10"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex -space-x-2.5 mb-3.5">
              {[
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
              ].map((src, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-white overflow-hidden"
                >
                  <Image src={src} alt="" width={36} height={36} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
              <div className="w-9 h-9 rounded-full border-2 border-white bg-base-content flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">+500</span>
              </div>
            </div>
            <p className="text-[13px] text-base-content/35">
              Rejoignez la communauté des professionnels du football
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
