"use client"

import { motion } from "framer-motion"
import { 
  MessageSquare,
  FileSignature,
  ShoppingBag,
  Users,
  Database,
  CheckCircle2,
  BarChart3
} from "lucide-react"

const pillars = [
  {
    id: "ai",
    icon: MessageSquare,
    title: "Assistant intelligent",
    description: "Trois assistants spécialisés (Joueur, Agent, Club). Aucune action automatique : la plateforme propose, l'humain décide.",
    accentColor: "text-purple-600",
    accentBg: "bg-purple-50",
    large: true,
    mockup: true,
  },
  {
    id: "mandates",
    icon: FileSignature,
    title: "Mandats & workflows",
    description: "Demandes, acceptations, statuts, documents. Tout est clair, traçable et structuré.",
    accentColor: "text-primary",
    accentBg: "bg-emerald-50",
  },
  {
    id: "marketplace",
    icon: ShoppingBag,
    title: "Marketplace Mercato",
    description: "Recrutement pro & amateur. Détection de jeunes talents. Opportunités de formation.",
    accentColor: "text-amber-600",
    accentBg: "bg-amber-50",
  },
  {
    id: "network",
    icon: Users,
    title: "Réseau social football",
    description: "Un feed professionnel, orienté opportunités, pas divertissement.",
    accentColor: "text-blue-600",
    accentBg: "bg-blue-50",
  },
  {
    id: "data",
    icon: Database,
    title: "Données football enrichies",
    description: "Clubs, ligues, joueurs, stats et infos intégrées automatiquement.",
    accentColor: "text-teal-600",
    accentBg: "bg-teal-50",
  },
]

export function CorePillars() {
  return (
    <section className="relative py-24 sm:py-28 md:py-36 overflow-hidden bg-[#fafafa]">
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-base-content/[0.06] to-transparent" />
      
      <div className="container relative z-10 px-4 md:px-6">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[13px] font-medium text-base-content/40 uppercase tracking-wide mb-4">Ce qui fait la différence</p>
            <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] lg:text-5xl font-bold text-base-content leading-[1.1] tracking-[-0.02em]">
              Les piliers de{" "}
              <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                Profoot Profile
              </span>
            </h2>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {/* Large Card with mockup */}
            <motion.div 
              className="lg:col-span-2 group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div 
                className="relative h-full rounded-3xl bg-white border border-black/[0.04] shadow-sm overflow-hidden transition-all duration-500 hover:shadow-lg hover:shadow-black/[0.06] hover:border-black/[0.08]"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              >
                <div className="p-7 md:p-8">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-purple-600" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-base-content mb-2 tracking-[-0.01em]">
                        {pillars[0].title}
                      </h3>
                      <p className="text-[15px] text-base-content/50 leading-relaxed mb-6">
                        {pillars[0].description}
                      </p>
                      
                      {/* Mini chat mockup */}
                      <div className="rounded-2xl bg-[#fafafa] border border-black/[0.04] p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                            <MessageSquare className="w-3 h-3 text-purple-600" />
                          </div>
                          <span className="text-[12px] font-semibold text-base-content/70">Assistant Agent</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                            En ligne
                          </span>
                        </div>
                        <div className="space-y-2.5">
                          <div className="bg-purple-50 rounded-xl rounded-tl-sm px-3.5 py-2.5 max-w-[85%]">
                            <p className="text-[13px] text-base-content/70 leading-relaxed">
                              J&apos;ai identifié 3 clubs correspondant au profil de Karim. Voulez-vous voir les détails ?
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-[12px] font-medium px-3 py-1.5 rounded-lg bg-base-content/[0.04] border border-base-content/[0.06] text-base-content/60">Voir les clubs</span>
                            <span className="text-[12px] font-medium px-3 py-1.5 rounded-lg text-base-content/40">Affiner</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Smaller cards */}
            {pillars.slice(1).map((pillar, index) => (
              <motion.div 
                key={pillar.id}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * (index + 1), duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div 
                  className="relative h-full rounded-3xl bg-white border border-black/[0.04] shadow-sm overflow-hidden transition-all duration-500 hover:shadow-lg hover:shadow-black/[0.06] hover:border-black/[0.08]"
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                >
                  <div className="p-6">
                    <div className={`w-10 h-10 rounded-xl ${pillar.accentBg} flex items-center justify-center mb-4`}>
                      <pillar.icon className={`w-5 h-5 ${pillar.accentColor}`} />
                    </div>
                    
                    <h3 className="text-[16px] font-bold text-base-content mb-2 tracking-[-0.01em]">
                      {pillar.title}
                    </h3>
                    
                    <p className="text-[13px] text-base-content/45 leading-relaxed">
                      {pillar.description}
                    </p>

                    {/* Mini visual for each card */}
                    {pillar.id === "mandates" && (
                      <div className="mt-4 flex gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" /> Actif
                        </span>
                        <span className="inline-flex text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
                          En attente
                        </span>
                      </div>
                    )}
                    {pillar.id === "marketplace" && (
                      <div className="mt-4 flex items-center gap-2 text-[12px] text-base-content/40">
                        <BarChart3 className="w-4 h-4 text-amber-500" />
                        <span>12 nouvelles annonces</span>
                      </div>
                    )}
                    {pillar.id === "network" && (
                      <div className="mt-4 flex items-center gap-2 text-[12px] text-base-content/40">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <span>Feed professionnel</span>
                      </div>
                    )}
                    {pillar.id === "data" && (
                      <div className="mt-4 flex items-center gap-2 text-[12px] text-base-content/40">
                        <Database className="w-4 h-4 text-teal-500" />
                        <span>500+ clubs indexés</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
