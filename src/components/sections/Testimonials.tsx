"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Star, Users, TrendingUp, Zap } from "lucide-react"

const testimonials = [
  {
    quote: "Enfin une plateforme pensée pour les vrais échanges entre agents et clubs. Les workflows de mandats ont révolutionné ma façon de travailler.",
    author: "Marc Lefebvre",
    role: "Agent FIFA licencié",
    company: "Sports Management Group",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    rating: 5,
  },
  {
    quote: "J'ai pu structurer mon profil professionnel et être visible auprès des bons clubs sans spam ni sollicitations non désirées.",
    author: "Karim Benzema Jr.",
    role: "Milieu offensif • 24 ans",
    company: "Ex-Ligue 2, en recherche Ligue 1",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    rating: 5,
  },
  {
    quote: "Les candidatures sont enfin comparables et exploitables. L'assistant IA nous fait gagner un temps précieux en période de mercato.",
    author: "Sophie Martin",
    role: "Responsable recrutement",
    company: "Club Ligue 1",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    rating: 5,
  },
]

const stats = [
  { value: "4.9", suffix: "/5", label: "Note moyenne", icon: Star },
  { value: "500", suffix: "+", label: "Utilisateurs actifs", icon: Users },
  { value: "98", suffix: "%", label: "Satisfaction", icon: TrendingUp },
  { value: "24", suffix: "h", label: "Support réactif", icon: Zap },
]

export function Testimonials() {
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
            <p className="text-[13px] font-medium text-base-content/40 uppercase tracking-wide mb-4">Témoignages</p>
            <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] lg:text-5xl font-bold text-base-content leading-[1.1] tracking-[-0.02em] mb-5">
              Ils nous font{" "}
              <span className="bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                confiance
              </span>
            </h2>
            <p className="text-[15px] text-base-content/40 max-w-md mx-auto">
              Découvrez ce que nos utilisateurs pensent de Profoot Profile
            </p>
          </motion.div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="relative h-full rounded-3xl bg-white border border-black/[0.04] shadow-sm overflow-hidden transition-all duration-500 hover:shadow-lg hover:shadow-black/[0.06] hover:border-black/[0.08]"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              >
                <div className="p-6 md:p-7 flex flex-col h-full">
                  {/* Rating */}
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-[15px] text-base-content/60 leading-[1.7] mb-6 flex-1">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-3.5 pt-5 border-t border-black/[0.04]">
                    <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-black/[0.04]">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.author}
                        width={44}
                        height={44}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-base-content truncate">
                        {testimonial.author}
                      </div>
                      <div className="text-[12px] text-base-content/40 truncate">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-3xl bg-white border border-black/[0.04] shadow-sm p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.06 * index, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="text-2xl md:text-3xl font-bold text-base-content tracking-tight mb-1">
                    {stat.value}
                    <span className="text-primary">{stat.suffix}</span>
                  </div>
                  <div className="text-[12px] text-base-content/35 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
