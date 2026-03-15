import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tarifs | Profoot Profile",
  description: "Découvrez nos offres et tarifs pour joueurs, agents et clubs sur Profoot Profile.",
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
