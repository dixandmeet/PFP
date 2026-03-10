import type { Metadata } from "next"
import dynamic from "next/dynamic"
import { TopNav } from "@/components/nav/TopNav"
import { Hero } from "@/components/sections/Hero"
import { MotionProvider } from "@/components/motion/MotionProvider"

// Lazy load des sections below-the-fold
const TrustStrip = dynamic(() => import("@/components/sections/TrustStrip").then(m => ({ default: m.TrustStrip })))
const ForWho = dynamic(() => import("@/components/sections/ForWho").then(m => ({ default: m.ForWho })))
const HowItWorks = dynamic(() => import("@/components/sections/HowItWorks").then(m => ({ default: m.HowItWorks })))
const CorePillars = dynamic(() => import("@/components/sections/CorePillars").then(m => ({ default: m.CorePillars })))
const AIStudio = dynamic(() => import("@/components/sections/AIStudio").then(m => ({ default: m.AIStudio })))
const TrustSecurity = dynamic(() => import("@/components/sections/TrustSecurity").then(m => ({ default: m.TrustSecurity })))
const FinalCTA = dynamic(() => import("@/components/sections/FinalCTA").then(m => ({ default: m.FinalCTA })))
const Footer = dynamic(() => import("@/components/footer/Footer").then(m => ({ default: m.Footer })))
const ScrollToTop = dynamic(() => import("@/components/ui/ScrollToTop").then(m => ({ default: m.ScrollToTop })))
const CookieConsent = dynamic(() => import("@/components/ui/CookieConsent").then(m => ({ default: m.CookieConsent })))

export const metadata: Metadata = {
  title: "Profoot Profile | Le réseau professionnel du football",
  description: "Profils vérifiés, mandats, marketplace mercato et outils intelligents — pour connecter joueurs, agents et clubs, du football amateur au haut niveau.",
  keywords: ["football", "mercato", "agent", "joueur", "club", "transfert", "mandat", "recrutement", "centre de formation", "académie"],
  authors: [{ name: "Profoot Profile" }],
  openGraph: {
    title: "Profoot Profile | Le réseau professionnel du football",
    description: "Profils vérifiés, mandats, marketplace mercato et outils intelligents — pour connecter joueurs, agents et clubs, du football amateur au haut niveau.",
    type: "website",
    locale: "fr_FR",
    siteName: "Profoot Profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "Profoot Profile | Le réseau professionnel du football",
    description: "Profils vérifiés, mandats, marketplace mercato et outils intelligents — pour connecter joueurs, agents et clubs, du football amateur au haut niveau.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function HomePage() {
  return (
    <MotionProvider>
      <div className="min-h-screen">
        <TopNav />
        
        <main>
          {/* Hero - Promise + Proof + CTA */}
          <Hero />
          
          {/* Trust Strip - Stats */}
          <TrustStrip />
          
          {/* For Who - 3 Personas (Joueur/Agent/Club) */}
          <ForWho />
          
          {/* How It Works - 4 Steps */}
          <HowItWorks />
          
          {/* Core Pillars - 5 Features Bento Grid */}
          <CorePillars />
          
          {/* Studio - Interactive Demo */}
          <AIStudio />
          
          {/* Trust & Security - Dark section */}
          <TrustSecurity />
          
          {/* Final CTA - Premium call to action */}
          <FinalCTA />
        </main>

        <Footer />
        <ScrollToTop />
        <CookieConsent />
      </div>
    </MotionProvider>
  )
}
