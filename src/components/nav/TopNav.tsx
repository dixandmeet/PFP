"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import { Menu, X, ChevronDown, Users, Building2, Briefcase, ArrowRight } from "lucide-react"
import { FootballIcon } from "@/components/auth/icons"
import { cn } from "@/lib/utils"

const navLinks = [
  { 
    href: "#for-who", 
    label: "Pour qui",
    hasDropdown: true,
    dropdownItems: [
      { href: "/register?role=player", label: "Joueurs", icon: Users, description: "Créez votre profil professionnel" },
      { href: "/register?role=agent", label: "Agents", icon: Briefcase, description: "Gérez vos joueurs efficacement" },
      { href: "/register?role=club", label: "Clubs", icon: Building2, description: "Recrutez les meilleurs talents" },
    ]
  },
  { href: "#how-it-works", label: "Comment ça marche" },
  { href: "#studio", label: "Studio", badge: "Nouveau" },
  { href: "#securite", label: "Sécurité" },
]

export function TopNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const { data: session, status } = useSession()
  const { scrollY } = useScroll()
  
  const navBg = useTransform(
    scrollY,
    [0, 80],
    ["rgba(250, 250, 250, 0)", "rgba(255, 255, 255, 0.8)"]
  )

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <motion.nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          isScrolled && "shadow-[0_1px_0_0_rgba(0,0,0,0.04)]"
        )}
        style={{
          backgroundColor: navBg,
          backdropFilter: isScrolled ? "blur(16px) saturate(180%)" : "none",
          WebkitBackdropFilter: isScrolled ? "blur(16px) saturate(180%)" : "none",
        }}
      >
        <div className="mx-auto max-w-[1200px] px-6 sm:px-10 lg:px-16">
          <div className="flex h-16 md:h-[68px] items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <FootballIcon className="w-8 h-8" variant="dark" />
              <span className="hidden sm:block text-[15px] font-bold text-base-content tracking-[-0.01em]">
                Profoot Profile
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <div 
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.href)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-medium rounded-lg text-base-content/50 hover:text-base-content transition-colors duration-200"
                  >
                    {link.label}
                    {link.badge && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">{link.badge}</span>
                    )}
                    {link.hasDropdown && (
                      <ChevronDown className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        activeDropdown === link.href && "rotate-180"
                      )} />
                    )}
                  </Link>

                  {/* Dropdown menu */}
                  {link.hasDropdown && (
                    <AnimatePresence>
                      {activeDropdown === link.href && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute top-full left-0 pt-2"
                        >
                          <div className="w-64 p-1.5 bg-white/95 backdrop-blur-xl rounded-2xl border border-black/[0.06] shadow-xl shadow-black/[0.06]">
                            {link.dropdownItems?.map((item, index) => (
                              <Link
                                key={index}
                                href={item.href}
                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-black/[0.03] transition-colors group"
                              >
                                <div className="w-9 h-9 rounded-lg bg-[#fafafa] border border-black/[0.04] flex items-center justify-center flex-shrink-0 group-hover:bg-primary/[0.06] group-hover:border-primary/[0.1] transition-colors">
                                  <item.icon className="w-4 h-4 text-base-content/30 group-hover:text-primary transition-colors" />
                                </div>
                                <div>
                                  <div className="text-[13px] font-semibold text-base-content">{item.label}</div>
                                  <div className="text-[11px] text-base-content/40">{item.description}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2.5">
              {status === "loading" ? (
                <div className="h-9 w-24 rounded-lg animate-pulse bg-base-content/[0.04]" />
              ) : session?.user ? (
                <Link href={session.user.role === 'ADMIN' ? '/admin' : `/${session.user.role?.toLowerCase() || 'player'}/dashboard`}>
                  <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-lg bg-base-content text-white hover:bg-base-content/90 transition-colors">
                    Mon espace
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="hidden md:block">
                    <button className="px-4 py-2 text-[13px] font-medium text-base-content/50 hover:text-base-content transition-colors">
                      Connexion
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-lg bg-base-content text-white hover:bg-base-content/90 transition-colors">
                      <span className="hidden sm:inline">Créer mon profil</span>
                      <span className="sm:hidden">S&apos;inscrire</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/[0.04] transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu panel */}
            <motion.div
              className="absolute top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.04]">
                <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
                  <FootballIcon className="w-8 h-8 rounded-lg" />
                  <span className="text-[15px] font-bold text-base-content">Profoot Profile</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/[0.04] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation links */}
              <div className="px-4 py-6 space-y-1">
                {navLinks.map((link) => (
                  <div key={link.href}>
                    {link.hasDropdown ? (
                      <div className="space-y-1">
                        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-base-content/30">
                          {link.label}
                        </div>
                        {link.dropdownItems?.map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-black/[0.03] transition-colors"
                          >
                            <div className="w-9 h-9 rounded-lg bg-[#fafafa] border border-black/[0.04] flex items-center justify-center flex-shrink-0">
                              <item.icon className="w-4 h-4 text-base-content/30" />
                            </div>
                            <div>
                              <div className="text-[13px] font-semibold text-base-content">{item.label}</div>
                              <div className="text-[11px] text-base-content/40">{item.description}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-3 text-base-content/70 hover:text-base-content hover:bg-black/[0.03] rounded-xl transition-colors"
                      >
                        <span className="text-[14px] font-medium">{link.label}</span>
                        {link.badge && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">{link.badge}</span>
                        )}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
                
              {/* CTA buttons */}
              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2.5 border-t border-black/[0.04] bg-white">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                  <button className="w-full px-5 py-3 text-[14px] font-medium rounded-xl border border-black/[0.08] text-base-content hover:bg-black/[0.03] transition-colors">
                    Connexion
                  </button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="block">
                  <button className="w-full flex items-center justify-center gap-2 px-5 py-3 text-[14px] font-semibold rounded-xl bg-base-content text-white hover:bg-base-content/90 transition-colors">
                    Créer mon profil gratuitement
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
