"use client"

import dynamic from "next/dynamic"
import { TopNav } from "@/components/nav/TopNav"
import { Hero } from "@/components/sections/Hero"
import { MotionProvider } from "@/components/motion/MotionProvider"

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

export default function HomeContent() {
  return (
    <MotionProvider>
      <div className="min-h-screen">
        <TopNav />
        
        <main>
          <Hero />
          <TrustStrip />
          <ForWho />
          <HowItWorks />
          <CorePillars />
          <AIStudio />
          <TrustSecurity />
          <FinalCTA />
        </main>

        <Footer />
        <ScrollToTop />
        <CookieConsent />
      </div>
    </MotionProvider>
  )
}
