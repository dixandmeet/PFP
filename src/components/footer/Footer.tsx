"use client"

import { useState } from "react"
import Link from "next/link"
import { Send, Linkedin, Twitter, Instagram, Shield, MapPin, Mail, ArrowRight, ArrowUpRight, Heart, Sparkles } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState("")

  const footerSections: { title: string; links: { label: string; href: string; external?: boolean; badge?: string }[] }[] = [
    {
      title: "Plateforme",
      links: [
        { label: "Joueurs", href: "/register?role=player" },
        { label: "Agents", href: "/register?role=agent" },
        { label: "Clubs", href: "/register?role=club" },
        { label: "Tarifs", href: "/pricing" },
      ],
    },
    {
      title: "Ressources",
      links: [
        { label: "Guide démarrage", href: "/guide" },
        { label: "FAQ", href: "/faq" },
        { label: "Blog", href: "/blog" },
        { label: "API", href: "/api-docs", external: true },
      ],
    },
    {
      title: "Entreprise",
      links: [
        { label: "À propos", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Carrières", href: "/careers", badge: "On recrute" },
        { label: "Presse", href: "/press" },
      ],
    },
    {
      title: "Légal",
      links: [
        { label: "Mentions légales", href: "/legal" },
        { label: "CGU", href: "/terms" },
        { label: "CGV", href: "/cgv" },
        { label: "Confidentialité", href: "/privacy" },
        { label: "Cookies", href: "/cookies" },
      ],
    },
  ]

  const socialLinks = [
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  ]

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: implémenter l'inscription newsletter
    setEmail("")
  }

  return (
    <footer className="relative bg-[#0a0a0a] text-white overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      
      <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16">
        {/* Newsletter section */}
        <div className="py-12 md:py-14 border-b border-white/[0.06]">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1.5 tracking-[-0.01em]">
                Restez informé
              </h3>
              <p className="text-[14px] text-white/30">
                Les dernières actualités du mercato et de la plateforme
              </p>
            </div>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row w-full lg:w-auto gap-2.5">
              <div className="relative flex-1 lg:w-72">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre email"
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-[14px] text-white placeholder:text-white/25 focus:border-white/[0.12] focus:outline-none transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 text-[13px] font-semibold rounded-xl bg-white text-[#0a0a0a] hover:bg-white/90 transition-colors"
              >
                S&apos;inscrire
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Main footer content */}
        <div className="py-12 md:py-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <span className="text-[11px] font-bold text-[#0a0a0a]">PF</span>
              </div>
              <span className="text-[15px] font-bold text-white">
                Profoot Profile
              </span>
            </Link>
            
            <p className="text-[13px] text-white/30 leading-relaxed mb-6 max-w-xs">
              Le réseau professionnel du football. Connectez joueurs, agents mandatés 
              et clubs dans un environnement sécurisé et structuré.
            </p>

            {/* Social links */}
            <div className="flex gap-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:bg-white/[0.08] hover:text-white/60 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-[12px] font-semibold text-white/50 uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-white/30 hover:text-white/60 transition-colors inline-flex items-center gap-1.5 group"
                      {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {link.label}
                      {link.badge && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-primary/15 text-primary">{link.badge}</span>
                      )}
                      {link.external && (
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/[0.06]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[12px] text-white/20 flex items-center gap-1">
              © {currentYear} Profoot Profile. Fait avec{" "}
              <Heart className="w-3 h-3 text-red-500/60 fill-red-500/60 inline" />{" "}
              en France.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-white/20">
                <Shield className="w-3 h-3 text-primary/40" />
                <span>RGPD</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-white/20">
                <Sparkles className="w-3 h-3 text-amber-400/40" />
                <span>IA Responsable</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-white/20">
                <MapPin className="w-3 h-3 text-primary/40" />
                <span>Made in France</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
