"use client"

import { motion } from "framer-motion"
import { Shield, Lock, Eye, BadgeCheck, ShieldCheck, ClipboardList, CheckCircle2, Server, Globe } from "lucide-react"

const securityFeatures = [
  {
    icon: BadgeCheck,
    title: "Profils vérifiés",
    description: "Chaque joueur, agent et club est vérifié manuellement avant d'accéder à la plateforme.",
  },
  {
    icon: ShieldCheck,
    title: "Contrôle d'accès par rôle",
    description: "Permissions adaptées : joueur, agent, club, admin. Chacun voit ce qu'il doit voir.",
  },
  {
    icon: Eye,
    title: "Visibilité paramétrable",
    description: "Vous décidez qui voit quoi. Profil public, restreint ou privé.",
  },
  {
    icon: Lock,
    title: "Données sécurisées",
    description: "Chiffrement AES-256, hébergement européen, conformité RGPD totale.",
  },
  {
    icon: ClipboardList,
    title: "Audit des actions",
    description: "Historique complet et traçabilité de toutes les actions utilisateurs.",
  },
]

const certifications = [
  { label: "RGPD", icon: Shield },
  { label: "AES-256", icon: Lock },
  { label: "EU Hosted", icon: Server },
  { label: "ISO 27001", icon: Globe },
]

export function TrustSecurity() {
  return (
    <section id="securite" className="relative py-24 sm:py-28 md:py-36 overflow-hidden bg-[#0a0a0a]">
      {/* Subtle gradient accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,rgba(34,197,94,0.08),transparent)]" />
      
      {/* Dot grid */}
      <div 
        className="absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="container relative z-10 px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
          {/* Left - Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[13px] font-medium text-white/30 uppercase tracking-wide mb-4">Sécurité & Confiance</p>
              <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-white leading-[1.1] tracking-[-0.02em] mb-5">
                Un environnement{" "}
                <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                  de confiance
                </span>
              </h2>
              <p className="text-[15px] text-white/35 leading-relaxed mb-10 max-w-md">
                Le football professionnel exige de la confiance. Nous avons construit Profoot Profile avec la sécurité comme priorité absolue.
              </p>
            </motion.div>

            {/* Features list */}
            <div className="space-y-2">
              {securityFeatures.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="group flex items-start gap-4 p-4 rounded-2xl border border-white/[0.04] hover:bg-white/[0.02] hover:border-white/[0.08] transition-all duration-300"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-300">
                    <feature.icon className="w-5 h-5 text-white/30 group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-white/80 mb-0.5">
                      {feature.title}
                    </h3>
                    <p className="text-[13px] text-white/30 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Certifications */}
            <motion.div 
              className="flex flex-wrap gap-2.5 mt-8"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/[0.1] transition-all duration-300"
                >
                  <cert.icon className="w-3.5 h-3.5 text-primary/60" />
                  <span className="text-[12px] font-medium">{cert.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right - Visual mockup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative rounded-3xl bg-white/[0.02] border border-white/[0.06] p-6 sm:p-8 overflow-hidden">
              {/* Shield visual */}
              <div className="flex flex-col items-center text-center mb-8">
                <motion.div 
                  className="relative w-20 h-20 mb-5"
                  animate={{ y: [-3, 3, -3] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-emerald-400 rounded-2xl rotate-45 opacity-20" />
                  <div className="absolute inset-1.5 bg-[#0a0a0a] rounded-xl rotate-45" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                </motion.div>
                <h3 className="text-lg font-bold text-white/80 mb-1.5">Protection maximale</h3>
                <p className="text-[13px] text-white/30">Vos données sont protégées 24/7</p>
              </div>

              {/* Security stats */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-white/[0.02] rounded-2xl p-4 text-center border border-white/[0.04]">
                  <div className="text-2xl font-bold text-primary mb-0.5 tabular-nums">99.9%</div>
                  <div className="text-[11px] text-white/30 font-medium">Uptime garanti</div>
                </div>
                <div className="bg-white/[0.02] rounded-2xl p-4 text-center border border-white/[0.04]">
                  <div className="text-2xl font-bold text-amber-400 mb-0.5">256-bit</div>
                  <div className="text-[11px] text-white/30 font-medium">Chiffrement</div>
                </div>
              </div>

              {/* Activity log mockup */}
              <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/[0.04]">
                <div className="flex items-center gap-2 mb-3.5">
                  <ClipboardList className="w-4 h-4 text-white/20" />
                  <span className="text-[12px] font-semibold text-white/50">Journal d&apos;audit</span>
                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { action: "Connexion sécurisée", time: "il y a 2 min" },
                    { action: "Profil mis à jour", time: "il y a 15 min" },
                    { action: "Mandat créé", time: "il y a 1h" },
                  ].map((log, i) => (
                    <motion.div 
                      key={i}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02]"
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/60" />
                      <span className="text-[12px] text-white/40 flex-1">{log.action}</span>
                      <span className="text-[10px] text-white/20">{log.time}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
