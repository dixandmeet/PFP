import type { Metadata } from "next"
import Link from "next/link"
import { Check, ArrowRight, Sparkles, Zap, Crown } from "lucide-react"

export const metadata: Metadata = {
  title: "Tarifs | Profoot Profile",
  description: "Découvrez nos offres et tarifs pour joueurs, agents et clubs sur Profoot Profile.",
}

const plans = [
  {
    name: "Starter",
    description: "Pour commencer sur la plateforme",
    price: "Gratuit",
    period: "",
    icon: Zap,
    color: "bg-stadium-100 text-stadium-600",
    features: [
      "Profil vérifié",
      "Recherche de base",
      "5 crédits offerts",
      "Messagerie limitée",
      "Accès au fil d'actualité",
    ],
    cta: "Commencer gratuitement",
    href: "/register",
    popular: false,
  },
  {
    name: "Pro",
    description: "Pour les professionnels actifs",
    price: "29€",
    period: "/mois",
    icon: Sparkles,
    color: "bg-primary/10 text-primary",
    features: [
      "Tout Starter inclus",
      "50 crédits/mois",
      "Messagerie illimitée",
      "Assistant IA basique",
      "Rapports de performance",
      "Visibilité améliorée",
      "Alertes mercato",
    ],
    cta: "Essai gratuit 14 jours",
    href: "/register",
    popular: true,
  },
  {
    name: "Elite",
    description: "Pour les acteurs majeurs du mercato",
    price: "99€",
    period: "/mois",
    icon: Crown,
    color: "bg-amber-100 text-amber-600",
    features: [
      "Tout Pro inclus",
      "200 crédits/mois",
      "Assistant IA avancé",
      "Rapports détaillés illimités",
      "Accès prioritaire aux annonces",
      "Badge vérifié premium",
      "Support dédié",
      "API access",
    ],
    cta: "Contacter l'équipe",
    href: "/contact",
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-stadium-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-pitch-500 flex items-center justify-center">
              <span className="text-sm font-bold text-white">PF</span>
            </div>
            <span className="text-xl font-bold text-stadium-900">Profoot Profile</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-stadium-900 mb-4">
            Des tarifs simples et transparents
          </h1>
          <p className="text-lg text-stadium-500 max-w-2xl mx-auto">
            Choisissez l&apos;offre adapt&eacute;e &agrave; votre activit&eacute;. 
            Tous les plans incluent un profil v&eacute;rifi&eacute; et l&apos;acc&egrave;s &agrave; la plateforme.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border ${
                plan.popular
                  ? "border-primary shadow-lg shadow-primary/10 scale-105"
                  : "border-stadium-200"
              } bg-white p-8 flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                  Le plus populaire
                </div>
              )}

              <div className={`w-12 h-12 rounded-xl ${plan.color} flex items-center justify-center mb-4`}>
                <plan.icon className="w-6 h-6" />
              </div>

              <h2 className="text-2xl font-bold text-stadium-900">{plan.name}</h2>
              <p className="text-stadium-500 text-sm mt-1 mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-stadium-900">{plan.price}</span>
                {plan.period && (
                  <span className="text-stadium-400 text-sm">{plan.period}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-stadium-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  plan.popular
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-stadium-100 text-stadium-700 hover:bg-stadium-200"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-stadium-400 text-sm">
            Tous les prix sont HT. TVA applicable selon votre pays de r&eacute;sidence.
          </p>
          <p className="text-stadium-400 text-sm mt-2">
            Besoin d&apos;une offre sur mesure ?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contactez-nous
            </Link>
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-stadium-200">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-pitch-600 hover:text-pitch-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour &agrave; l&apos;accueil
          </Link>
        </div>
      </main>
    </div>
  )
}
