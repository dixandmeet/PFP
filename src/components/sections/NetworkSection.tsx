"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Reveal, StaggerContainer, StaggerItem } from "@/components/motion/Reveal"
import { BorderBeam } from "@/components/ui/border-beam"
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text"
import { User, Briefcase, Building2, MessageSquare, Heart, Share2, Users, TrendingUp, Bookmark } from "lucide-react"

export function NetworkSection() {
  const [likedPosts, setLikedPosts] = useState<number[]>([])
  
  const mockPosts = [
    {
      id: 1,
      author: "Marcus Laurent",
      role: "Milieu offensif • FC Nantes",
      content: "Excellente performance hier soir. 2 passes décisives et une clean sheet défensive. Merci au staff et aux supporters !",
      avatar: "ML",
      color: "from-blue-500 to-blue-600",
      likes: 47,
      comments: 12,
      time: "2h",
    },
    {
      id: 2,
      author: "Sophie Arnaud",
      role: "Agent FIFA • Paris",
      content: "Ravie d'annoncer la signature de Karim avec le FC Bordeaux. Belle étape dans sa carrière. #Mercato #Transfert",
      avatar: "SA",
      color: "from-pitch-500 to-pitch-600",
      likes: 89,
      comments: 23,
      time: "4h",
    },
    {
      id: 3,
      author: "AS Monaco",
      role: "Club professionnel • Ligue 1",
      content: "Nous recherchons un latéral gauche expérimenté pour la saison prochaine. Profil international souhaité.",
      avatar: "ASM",
      color: "from-red-500 to-red-600",
      likes: 156,
      comments: 45,
      time: "6h",
      isOpportunity: true,
    },
  ]

  const toggleLike = (postId: number) => {
    setLikedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    )
  }

  return (
    <section id="reseau" className="relative py-24 md:py-32 bg-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,197,94,0.04),transparent)]" />
      
      <div className="container relative z-10 px-4 md:px-6">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pitch-500/10 text-pitch-600 text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              Le LinkedIn du football
            </div>
          </Reveal>
          
          <Reveal delay={0.1}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stadium-900 mb-6">
              Un profil. Une réputation.{" "}
              <AnimatedGradientText>Une visibilité.</AnimatedGradientText>
            </h2>
          </Reveal>
          
          <Reveal delay={0.2}>
            <p className="text-xl text-stadium-500 leading-relaxed">
              Construisez votre présence professionnelle avec un profil structuré, 
              des connexions vérifiées et un feed où chaque publication compte.
            </p>
          </Reveal>
        </div>

        {/* Bento Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Large card - Main feature */}
            <Reveal delay={0.1}>
              <motion.div 
                className="lg:col-span-2 lg:row-span-2 relative bento-item p-8 md:p-10 overflow-hidden"
                whileHover={{ scale: 1.005 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <BorderBeam size={300} duration={12} delay={0} />
                
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pitch-500 to-pitch-600 flex items-center justify-center shadow-lg shadow-pitch-500/20">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-stadium-900">Feed professionnel</h3>
                      <p className="text-sm text-stadium-500">Actualités du réseau en temps réel</p>
                    </div>
                  </div>
                  
                  {/* Mock Feed */}
                  <div className="flex-1 space-y-4">
                    {mockPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        className={`p-4 rounded-xl bg-stadium-50/80 border transition-all duration-300 ${
                          post.isOpportunity 
                            ? 'border-gold-200 bg-gradient-to-r from-gold-50/50 to-transparent' 
                            : 'border-stadium-100 hover:border-stadium-200'
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + index * 0.15 }}
                        whileHover={{ y: -2, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
                      >
                        <div className="flex items-start gap-3">
                          <motion.div 
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${post.color} flex items-center justify-center flex-shrink-0 shadow-md`}
                            whileHover={{ scale: 1.1 }}
                          >
                            <span className="text-xs font-bold text-white">{post.avatar}</span>
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-stadium-900">{post.author}</h4>
                                {post.isOpportunity && (
                                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-gold-100 text-gold-700 rounded-full">
                                    Opportunité
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-stadium-400">{post.time}</span>
                            </div>
                            <p className="text-xs text-stadium-500 mb-2">{post.role}</p>
                            <p className="text-sm text-stadium-700 mb-3 leading-relaxed">{post.content}</p>
                            <div className="flex items-center gap-4 text-xs text-stadium-400">
                              <motion.button 
                                className={`flex items-center gap-1 transition-colors ${
                                  likedPosts.includes(post.id) ? 'text-red-500' : 'hover:text-red-500'
                                }`}
                                onClick={() => toggleLike(post.id)}
                                whileTap={{ scale: 0.9 }}
                              >
                                <motion.div
                                  animate={likedPosts.includes(post.id) ? { scale: [1, 1.3, 1] } : {}}
                                  transition={{ duration: 0.3 }}
                                >
                                  <Heart className={`w-3.5 h-3.5 ${likedPosts.includes(post.id) ? 'fill-current' : ''}`} />
                                </motion.div>
                                {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
                              </motion.button>
                              <button className="flex items-center gap-1 hover:text-pitch-500 transition-colors">
                                <MessageSquare className="w-3.5 h-3.5" /> {post.comments}
                              </button>
                              <button className="flex items-center gap-1 hover:text-pitch-500 transition-colors">
                                <Share2 className="w-3.5 h-3.5" /> Partager
                              </button>
                              <button className="flex items-center gap-1 hover:text-gold-500 transition-colors ml-auto">
                                <Bookmark className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </Reveal>

            {/* Feature card 1 - Profile */}
            <Reveal delay={0.2}>
              <motion.div 
                className="bento-item group relative overflow-hidden"
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/10 transition-all duration-300">
                    <User className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold text-stadium-900 mb-2">Profil structuré</h3>
                  <p className="text-sm text-stadium-500 leading-relaxed">
                    Parcours, statistiques, vidéos et documents dans un dossier professionnel complet.
                  </p>
                </div>
              </motion.div>
            </Reveal>

            {/* Feature card 2 - Connections */}
            <Reveal delay={0.3}>
              <motion.div 
                className="bento-item group relative overflow-hidden"
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pitch-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pitch-500/10 to-pitch-500/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-pitch-500/10 transition-all duration-300">
                    <Users className="w-6 h-6 text-pitch-500" />
                  </div>
                  <h3 className="text-lg font-bold text-stadium-900 mb-2">Connexions vérifiées</h3>
                  <p className="text-sm text-stadium-500 leading-relaxed">
                    Réseau fermé de professionnels : joueurs, agents mandatés et clubs certifiés.
                  </p>
                </div>
              </motion.div>
            </Reveal>

            {/* Feature card 3 - Agents */}
            <Reveal delay={0.4}>
              <motion.div 
                className="bento-item group relative overflow-hidden"
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500/10 to-gold-500/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-gold-500/10 transition-all duration-300">
                    <Briefcase className="w-6 h-6 text-gold-600" />
                  </div>
                  <h3 className="text-lg font-bold text-stadium-900 mb-2">Mandats sécurisés</h3>
                  <p className="text-sm text-stadium-500 leading-relaxed">
                    Système de mandats numériques avec traçabilité et vérification automatique.
                  </p>
                </div>
              </motion.div>
            </Reveal>

            {/* Feature card 4 - Clubs */}
            <Reveal delay={0.5}>
              <motion.div 
                className="bento-item group relative overflow-hidden"
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-purple-500/10 transition-all duration-300">
                    <Building2 className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-bold text-stadium-900 mb-2">Clubs certifiés</h3>
                  <p className="text-sm text-stadium-500 leading-relaxed">
                    Accès exclusif aux clubs vérifiés avec leurs besoins et opportunités mercato.
                  </p>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
