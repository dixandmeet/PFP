"use client"

import { motion } from "framer-motion"
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion/Reveal"
import { Megaphone, Target, TrendingUp, FileCheck, ArrowRight, MapPin, Calendar, Euro } from "lucide-react"

export function OpportunitiesSection() {
  const opportunities = [
    {
      icon: Megaphone,
      title: "Annonces Mercato",
      description: "Les clubs publient leurs besoins. Les joueurs et agents postulent directement avec leur profil vérifié.",
      gradient: "from-gold-500 to-gold-600",
    },
    {
      icon: Target,
      title: "Matching intelligent",
      description: "L'algorithme analyse les profils et suggère les meilleures opportunités pour chaque acteur du réseau.",
      gradient: "from-pitch-500 to-pitch-600",
    },
    {
      icon: TrendingUp,
      title: "Pipeline clair",
      description: "Suivez l'avancement de vos candidatures et négociations en temps réel, étape par étape.",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: FileCheck,
      title: "Tout est tracé",
      description: "Historique complet des échanges, documents et décisions pour une transparence totale.",
      gradient: "from-purple-500 to-purple-600",
    },
  ]

  // Mock listing data
  const mockListing = {
    club: "AS Monaco",
    position: "Latéral gauche",
    level: "Ligue 1",
    contract: "3 ans",
    salary: "Selon profil",
    deadline: "15 Fév 2026",
    applications: 24,
  }

  return (
    <section id="opportunites" className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(212,168,83,0.06),transparent)]" />
      
      <div className="container relative z-10 px-4 md:px-6">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 text-gold-700 text-sm font-medium mb-6">
              <Target className="w-4 h-4" />
              Marketplace Mercato
            </div>
          </Reveal>
          
          <Reveal delay={0.1}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stadium-900 mb-6">
              Des opportunités qui{" "}
              <span className="text-gradient-gold">trouvent leur match</span>
            </h2>
          </Reveal>
          
          <Reveal delay={0.2}>
            <p className="text-xl text-stadium-500 leading-relaxed">
              Connectez offres et demandes dans un environnement structuré 
              où chaque transaction est claire, rapide et sécurisée.
            </p>
          </Reveal>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left - Mock Listing Card */}
            <Reveal delay={0.2}>
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/20 to-pitch-500/20 rounded-3xl blur-2xl" />
                <div className="relative bg-white rounded-3xl border border-stadium-200 shadow-xl overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-stadium-900 to-stadium-800 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">ASM</span>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{mockListing.club}</h4>
                          <p className="text-white/60 text-sm">{mockListing.level}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-pitch-500 text-white text-xs font-semibold">
                        Active
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-stadium-900 mb-4">
                      {mockListing.position}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-sm text-stadium-600">
                        <Calendar className="w-4 h-4 text-stadium-400" />
                        <span>Contrat: {mockListing.contract}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-stadium-600">
                        <Euro className="w-4 h-4 text-stadium-400" />
                        <span>{mockListing.salary}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-stadium-600">
                        <MapPin className="w-4 h-4 text-stadium-400" />
                        <span>Monaco, France</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-stadium-600">
                        <Target className="w-4 h-4 text-stadium-400" />
                        <span>{mockListing.applications} candidatures</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-stadium-100">
                      <span className="text-sm text-stadium-500">
                        Clôture: {mockListing.deadline}
                      </span>
                      <motion.button 
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 text-stadium-900 text-sm font-semibold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Voir l&apos;annonce
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Reveal>

            {/* Right - Features */}
            <div>
              <StaggerContainer className="space-y-4">
                {opportunities.map((item, index) => (
                  <StaggerItem key={index}>
                    <motion.div 
                      className="group flex items-start gap-4 p-5 rounded-2xl bg-stadium-50 border border-transparent hover:bg-white hover:border-stadium-200 hover:shadow-lg transition-all duration-300"
                      whileHover={{ x: 4 }}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-stadium-900 mb-1 group-hover:text-stadium-800">
                          {item.title}
                        </h3>
                        <p className="text-sm text-stadium-500 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
