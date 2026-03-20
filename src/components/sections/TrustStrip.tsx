"use client"

import { motion } from "framer-motion"
import { ShieldCheck, FileCheck, Globe, Layers } from "lucide-react"

const pillars = [
  { label: "Identité vérifiée", description: "Chaque profil est authentifié", icon: ShieldCheck },
  { label: "Mandats conformes", description: "Processus encadré et sécurisé", icon: FileCheck },
  { label: "Réseau ouvert", description: "Du football amateur au haut niveau", icon: Globe },
  { label: "Fonctionnalités pro", description: "Matching et filtrage pour cibler les bons profils", icon: Layers },
]

export function TrustStrip() {
  return (
    <section className="relative py-20 md:py-24 overflow-hidden bg-white">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-base-content/[0.06] to-transparent" />

      <div className="container relative z-10 px-4 md:px-6">
        <motion.p
          className="text-center text-[13px] md:text-sm text-base-content/40 font-medium tracking-wide uppercase mb-14 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Une plateforme pensée pour structurer vos opportunités
        </motion.p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              className="group text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="w-12 h-12 rounded-2xl bg-base-content/[0.03] border border-base-content/[0.06] flex items-center justify-center mx-auto mb-4 transition-colors duration-300 group-hover:bg-primary/[0.06] group-hover:border-primary/[0.12]"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <pillar.icon className="w-5 h-5 text-base-content/30 group-hover:text-primary transition-colors duration-300" />
              </motion.div>

              <div className="text-[15px] md:text-base font-semibold text-base-content tracking-tight mb-1.5">
                {pillar.label}
              </div>

              <div className="text-[13px] text-base-content/40 font-medium">
                {pillar.description}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-base-content/[0.06] to-transparent" />
    </section>
  )
}
