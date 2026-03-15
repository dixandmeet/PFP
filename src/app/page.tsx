import type { Metadata } from "next"
import HomeContent from "./HomeContent"

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
  return <HomeContent />
}
