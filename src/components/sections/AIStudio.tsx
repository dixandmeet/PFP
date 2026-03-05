"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, TrendingUp, Building2, ShieldCheck, User, Send, CheckCircle2, Zap } from "lucide-react"

export function AIStudio() {
  const [activeTab, setActiveTab] = useState(0)
  const [showTyping, setShowTyping] = useState(false)
  const [showResponse, setShowResponse] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const assistants = [
    {
      id: "player",
      icon: User,
      title: "IA Joueur",
      subtitle: "Coach carrière personnel",
      accentColor: "text-blue-600",
      accentBg: "bg-blue-50",
      accentBgDark: "bg-blue-600",
      features: [
        "Analyse de profil et valorisation",
        "Génération de dossiers professionnels",
        "Recommandations d'opportunités",
      ],
      demo: {
        question: "Quelles opportunités correspondent à mon profil ?",
        response: "Basé sur votre profil de milieu offensif avec 12 buts cette saison, j'ai identifié 3 clubs en Ligue 1. Voulez-vous que je prépare une candidature ?",
        actions: ["Voir les clubs", "Préparer candidature", "Affiner"],
      }
    },
    {
      id: "agent",
      icon: TrendingUp,
      title: "IA Agent",
      subtitle: "Copilot business",
      accentColor: "text-primary",
      accentBg: "bg-emerald-50",
      accentBgDark: "bg-primary",
      features: [
        "Génération de messages ciblés",
        "Scoring et comparaison de joueurs",
        "Rapports automatisés",
      ],
      demo: {
        question: "Compare mes 3 joueurs pour le poste à Monaco",
        response: "Analyse effectuée. Karim présente le meilleur fit : 87% de compatibilité tactique, expérience européenne. Lucas 72%, Thomas 68%.",
        actions: ["Voir rapport", "Préparer soumission", "Contacter"],
      }
    },
    {
      id: "club",
      icon: Building2,
      title: "IA Club",
      subtitle: "Assistant recrutement",
      accentColor: "text-purple-600",
      accentBg: "bg-purple-50",
      accentBgDark: "bg-purple-600",
      features: [
        "Comparaison multi-critères",
        "Shortlists intelligentes",
        "Analytics avancées",
      ],
      demo: {
        question: "Génère une shortlist pour notre poste de latéral gauche",
        response: "J'ai analysé 47 profils. Voici 5 candidats classés par pertinence, âge moyen 23 ans, expérience Ligue 1/Ligue 2.",
        actions: ["Voir shortlist", "Exporter", "Ajuster"],
      }
    },
  ]

  useEffect(() => {
    setShowTyping(false)
    setShowResponse(false)
    setShowActions(false)
    
    const timer1 = setTimeout(() => setShowTyping(true), 600)
    const timer2 = setTimeout(() => {
      setShowTyping(false)
      setShowResponse(true)
    }, 1800)
    const timer3 = setTimeout(() => setShowActions(true), 2200)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [activeTab])

  const activeAssistant = assistants[activeTab]

  return (
    <section id="ia" className="relative py-24 sm:py-28 md:py-36 overflow-hidden bg-white">
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
            <p className="text-[13px] font-medium text-base-content/40 uppercase tracking-wide mb-4">AI Studio</p>
            <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] lg:text-5xl font-bold text-base-content leading-[1.1] tracking-[-0.02em] mb-5">
              L&apos;IA au service du{" "}
              <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                recrutement
              </span>
            </h2>
            <p className="text-[15px] sm:text-[16px] text-base-content/45 leading-relaxed max-w-lg mx-auto">
              Scoring de profils, comparaison de joueurs, shortlists intelligentes. Plus de vitesse, zéro perte de contrôle.
            </p>
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Tabs */}
          <motion.div 
            className="flex overflow-x-auto sm:flex-wrap sm:justify-center gap-2 mb-10 sm:mb-14 pb-2 sm:pb-0 scrollbar-hide"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {assistants.map((assistant, index) => (
              <button
                key={assistant.id}
                onClick={() => setActiveTab(index)}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[14px] font-semibold rounded-xl transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                  activeTab === index
                    ? 'bg-base-content text-white shadow-md'
                    : 'bg-base-content/[0.04] border border-base-content/[0.06] text-base-content/60 hover:text-base-content hover:bg-base-content/[0.07]'
                }`}
              >
                <assistant.icon className="w-4 h-4" />
                {assistant.title}
              </button>
            ))}
          </motion.div>

          {/* Content */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start">
            {/* Left - Features */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${activeAssistant.accentBg} flex items-center justify-center`}>
                      <activeAssistant.icon className={`w-6 h-6 ${activeAssistant.accentColor}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-base-content tracking-[-0.01em]">{activeAssistant.title}</h3>
                      <p className="text-[14px] text-base-content/45">{activeAssistant.subtitle}</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {activeAssistant.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="flex items-center gap-3 p-3.5 rounded-xl bg-[#fafafa] border border-black/[0.04] transition-all duration-300 hover:border-black/[0.08]"
                      >
                        <CheckCircle2 className={`w-4 h-4 ${activeAssistant.accentColor} opacity-60`} />
                        <span className="text-[14px] text-base-content/60">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Validation 2 étapes */}
                  <div className="rounded-2xl bg-base-content p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <h4 className="text-[14px] font-semibold text-white flex items-center gap-2">
                        Validation en 2 étapes
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                      </h4>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-primary">1</div>
                        <span className="text-[13px] text-white/60">L&apos;IA propose</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-amber-400">2</div>
                        <span className="text-[13px] text-white/60">Vous validez</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Right - Demo Chat */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="rounded-3xl bg-white border border-black/[0.06] shadow-xl shadow-black/[0.06] overflow-hidden">
                    {/* Chat header */}
                    <div className="bg-base-content px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                            <Brain className="w-4 h-4 text-white" />
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-base-content rounded-full" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold text-[13px]">{activeAssistant.title}</h4>
                          <p className="text-white/40 text-[11px] flex items-center gap-1">
                            <span className="w-1 h-1 bg-emerald-400 rounded-full" />
                            En ligne
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Chat content */}
                    <div className="p-5 space-y-3.5 min-h-[240px] sm:min-h-[260px]">
                      {/* User message */}
                      <motion.div 
                        className="flex justify-end"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="bg-[#fafafa] border border-black/[0.04] rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%]">
                          <p className="text-[13px] text-base-content/70">
                            {activeAssistant.demo.question}
                          </p>
                        </div>
                      </motion.div>

                      {/* Typing indicator */}
                      <AnimatePresence>
                        {showTyping && (
                          <motion.div 
                            className="flex justify-start"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                          >
                            <div className={`${activeAssistant.accentBg} rounded-2xl rounded-tl-sm px-4 py-3`}>
                              <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-base-content/20 animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-base-content/20 animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 rounded-full bg-base-content/20 animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* AI response */}
                      <AnimatePresence>
                        {showResponse && (
                          <motion.div 
                            className="flex justify-start"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <div className={`${activeAssistant.accentBg} rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[90%]`}>
                              <p className="text-[13px] text-base-content/70 leading-relaxed">
                                {activeAssistant.demo.response}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Action buttons */}
                      <AnimatePresence>
                        {showActions && (
                          <motion.div 
                            className="flex flex-wrap gap-2 pt-1"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          >
                            {activeAssistant.demo.actions.map((action, index) => (
                              <motion.span
                                key={index}
                                className="text-[12px] font-medium px-3 py-1.5 rounded-lg bg-base-content/[0.04] border border-base-content/[0.06] text-base-content/50 cursor-pointer hover:bg-base-content/[0.07] transition-colors"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.08, duration: 0.3 }}
                              >
                                {action}
                              </motion.span>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Chat input */}
                    <div className="border-t border-black/[0.04] px-4 py-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Posez votre question..."
                          className="flex-1 text-[13px] bg-transparent placeholder:text-base-content/25 outline-none"
                          disabled
                        />
                        <div className="w-8 h-8 rounded-lg bg-base-content flex items-center justify-center">
                          <Send className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
