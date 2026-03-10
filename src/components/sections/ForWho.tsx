"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { User, Briefcase, Building2, CheckCircle2, ArrowRight, Star } from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function ForWho() {
  const personas = [
    {
      icon: User,
      title: "Joueurs",
      subtitle: "Présente-toi comme un professionnel.",
      tagline: "Passe de l'ombre à la visibilité.",
      accentColor: "text-blue-600",
      accentBg: "bg-blue-600",
      accentBgLight: "bg-blue-50",
      features: [
        "Profil football complet (parcours, stats, vidéos)",
        "Contrôle total de la visibilité",
        "Postule directement aux opportunités",
        "Améliore ton profil avec l'assistant",
      ],
      cta: "Je suis joueur",
      href: "/register?role=player",
      badge: null,
      featured: false,
    },
    {
      icon: Briefcase,
      title: "Agents",
      subtitle: "Gère tes joueurs comme un pro.",
      tagline: "Moins de friction. Plus d'efficacité.",
      accentColor: "text-primary",
      accentBg: "bg-primary",
      accentBgLight: "bg-emerald-50",
      features: [
        "Mandats clairs et traçables",
        "Soumissions structurées aux clubs",
        "Shortlists intelligentes",
        "Gain de temps (sans perdre le contrôle)",
      ],
      cta: "Je suis agent",
      href: "/register?role=agent",
      badge: null,
      featured: true,
    },
    {
      icon: Building2,
      title: "Clubs & académies",
      subtitle: "Recrute, détecte et valorise les talents.",
      tagline: "Un outil commun pour le recrutement.",
      accentColor: "text-purple-600",
      accentBg: "bg-purple-600",
      accentBgLight: "bg-purple-50",
      features: [
        "Publie des annonces pour équipes seniors ou jeunes",
        "Reçois candidatures et profils qualifiés",
        "Suis l'évolution des joueurs dans le temps",
        "Compare les profils facilement",
      ],
      cta: "Je représente un club",
      href: "/register?role=club",
      badge: null,
      featured: false,
    },
  ]

  return (
    <section className="relative py-24 sm:py-28 md:py-36 overflow-hidden bg-[#fafafa]">
      <div className="container relative z-10 px-4 md:px-6">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[13px] font-medium text-base-content/40 uppercase tracking-wide mb-4">Pour qui</p>
            <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] lg:text-5xl font-bold text-base-content leading-[1.1] tracking-[-0.02em]">
              À qui s&apos;adresse{" "}
              <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                la plateforme ?
              </span>
            </h2>
          </motion.div>
        </div>

        {/* Cards */}
        <motion.div 
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {personas.map((persona, index) => (
            <motion.div key={index} variants={itemVariants} className="relative group">
              {/* Card */}
              <motion.div
                className={`relative h-full rounded-3xl bg-white border overflow-hidden transition-all duration-500 ${
                  persona.featured 
                    ? 'border-primary/20 shadow-lg shadow-primary/[0.06]' 
                    : 'border-black/[0.04] shadow-sm hover:shadow-lg hover:shadow-black/[0.06] hover:border-black/[0.08]'
                }`}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              >
                {/* Top accent line for featured */}
                {persona.featured && (
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-emerald-400" />
                )}
                
                <div className="p-6 sm:p-7 flex flex-col h-full">
                  {/* Badge */}
                  {persona.badge && (
                    <div className="absolute top-5 right-5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                        <Star className="w-3 h-3" />
                        {persona.badge}
                      </span>
                    </div>
                  )}
                  
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-2xl ${persona.accentBgLight} flex items-center justify-center mb-5`}>
                    <persona.icon className={`w-6 h-6 ${persona.accentColor}`} />
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-xl font-bold text-base-content mb-1.5 tracking-[-0.01em]">
                    {persona.title}
                  </h3>
                  <p className="text-[15px] text-base-content/55 mb-6">
                    {persona.subtitle}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-6 flex-1">
                    {persona.features.map((feature, featureIndex) => (
                      <li 
                        key={featureIndex} 
                        className="flex items-start gap-2.5"
                      >
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${persona.accentColor} opacity-60`} />
                        <span className="text-[14px] text-base-content/60 leading-snug">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Tagline */}
                  <p className={`text-[13px] font-semibold mb-5 ${persona.accentColor}`}>
                    {persona.tagline}
                  </p>

                  {/* CTA */}
                  <Link href={persona.href} className="block mt-auto">
                    <motion.button 
                      className={`group/btn inline-flex items-center justify-center w-full gap-2 px-5 py-3 text-[14px] font-semibold rounded-xl transition-all duration-300 ${
                        persona.featured 
                          ? 'bg-base-content text-white hover:bg-base-content/90' 
                          : 'bg-base-content/[0.04] border border-base-content/[0.08] text-base-content hover:bg-base-content/[0.07]'
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {persona.cta}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
