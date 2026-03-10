"use client"

import { motion } from "framer-motion"
import { UserPlus, Users, Rocket, Zap } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Crée ton profil",
    description: "Un profil structuré, professionnel, avec contrôle de visibilité.",
    accentColor: "text-blue-600",
    accentBg: "bg-blue-50",
    dotColor: "bg-blue-600",
  },
  {
    number: "02",
    icon: Users,
    title: "Connecte-toi au réseau",
    description: "Suis, découvre, échange. Un réseau pensé pour le football, pas pour le bruit.",
    accentColor: "text-primary",
    accentBg: "bg-emerald-50",
    dotColor: "bg-primary",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Passe à l'action",
    description: "Clubs et centres de formation publient des opportunités. Joueurs et agents candidatent.",
    accentColor: "text-amber-600",
    accentBg: "bg-amber-50",
    dotColor: "bg-amber-500",
  },
  {
    number: "04",
    icon: Zap,
    title: "Accélère ta carrière",
    description: "La plateforme analyse et propose. Tu valides toujours.",
    accentColor: "text-purple-600",
    accentBg: "bg-purple-50",
    dotColor: "bg-purple-600",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-28 md:py-36 overflow-hidden bg-white">
      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-base-content/[0.06] to-transparent" />
      
      <div className="container relative z-10 px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[13px] font-medium text-base-content/40 uppercase tracking-wide mb-4">Comment ça marche</p>
            <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] lg:text-5xl font-bold text-base-content leading-[1.1] tracking-[-0.02em]">
              Quatre étapes pour{" "}
              <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                démarrer
              </span>
            </h2>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Desktop view - horizontal */}
          <div className="hidden md:block relative">
            {/* Connection line */}
            <div className="absolute top-[56px] left-[12.5%] right-[12.5%] h-px overflow-hidden">
              <div className="absolute inset-0 bg-base-content/[0.06]" />
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-blue-500 via-primary via-amber-500 to-purple-500 opacity-40"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "left" }}
              />
            </div>
            
            <div className="grid grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div 
                  key={index}
                  className="relative group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div 
                    className="relative flex flex-col items-center text-center"
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  >
                    {/* Icon */}
                    <div className={`relative w-14 h-14 rounded-2xl ${step.accentBg} flex items-center justify-center mb-6 z-10 transition-all duration-300 group-hover:shadow-lg`}>
                      <step.icon className={`w-6 h-6 ${step.accentColor}`} />
                      {/* Dot on the line */}
                      <div className={`absolute -bottom-[26px] w-2.5 h-2.5 rounded-full ${step.dotColor} border-[3px] border-white shadow-sm`} />
                    </div>
                    
                    {/* Number */}
                    <div className="text-[40px] font-bold text-base-content/[0.06] leading-none mb-2 tracking-tight">
                      {step.number}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-[16px] font-bold text-base-content mb-2 tracking-[-0.01em]">
                      {step.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-[13px] text-base-content/45 leading-relaxed max-w-[200px]">
                      {step.description}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile view - vertical cards */}
          <div className="md:hidden space-y-3">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative rounded-2xl bg-white border border-black/[0.04] shadow-sm hover:shadow-md transition-all duration-300 p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${step.accentBg} flex items-center justify-center flex-shrink-0`}>
                      <step.icon className={`w-5 h-5 ${step.accentColor}`} />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-base-content/20">{step.number}</span>
                        <h3 className="text-[15px] font-bold text-base-content tracking-[-0.01em]">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-[13px] text-base-content/45 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
