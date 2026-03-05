import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, UserPlus, Search, MessageSquare, FileText, CreditCard, ArrowRight, CheckCircle2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Guide de démarrage | Profoot Profile",
  description: "Apprenez à utiliser Profoot Profile en quelques étapes simples. Guide complet pour joueurs, agents et clubs.",
}

const steps = [
  {
    icon: UserPlus,
    title: "1. Créez votre profil",
    description: "Inscrivez-vous en tant que joueur, agent ou club. Remplissez votre profil avec vos informations professionnelles et vérifiez votre identité.",
    tips: [
      "Ajoutez une photo professionnelle",
      "Complétez toutes les sections de votre profil",
      "Vérifiez votre identité pour obtenir le badge vérifié",
    ],
  },
  {
    icon: Search,
    title: "2. Explorez la plateforme",
    description: "Utilisez la recherche avancée pour trouver des joueurs, agents ou clubs correspondant à vos critères. Filtrez par position, âge, expérience et plus.",
    tips: [
      "Utilisez les filtres avancés pour affiner vos recherches",
      "Sauvegardez vos recherches favorites",
      "Activez les alertes pour être notifié des nouveaux profils",
    ],
  },
  {
    icon: MessageSquare,
    title: "3. Connectez-vous",
    description: "Envoyez des messages aux profils qui vous intéressent. La messagerie intégrée permet des échanges sécurisés et traçables.",
    tips: [
      "Personnalisez vos messages d'approche",
      "Répondez rapidement pour maximiser vos chances",
      "Utilisez les crédits pour débloquer les contacts",
    ],
  },
  {
    icon: FileText,
    title: "4. Publiez et postulez",
    description: "Les clubs peuvent publier des annonces, les joueurs peuvent postuler et les agents peuvent proposer leurs joueurs.",
    tips: [
      "Rédigez des annonces détaillées et attractives",
      "Joignez des rapports de performance",
      "Suivez l'état de vos candidatures en temps réel",
    ],
  },
  {
    icon: CreditCard,
    title: "5. Gérez vos crédits",
    description: "Les crédits vous permettent d'accéder aux fonctionnalités premium : contacts, rapports détaillés, visibilité améliorée.",
    tips: [
      "Chaque inscription offre des crédits gratuits",
      "Rechargez vos crédits selon vos besoins",
      "Les abonnements Pro et Elite incluent des crédits mensuels",
    ],
  },
]

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-stadium-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-pitch-500 flex items-center justify-center">
              <span className="text-sm font-bold text-white">PF</span>
            </div>
            <span className="text-xl font-bold text-stadium-900">Profoot Profile</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-stadium-900">Guide de d&eacute;marrage</h1>
        </div>
        <p className="text-lg text-stadium-500 mb-12">
          Prenez en main Profoot Profile en 5 &eacute;tapes simples.
        </p>

        <div className="space-y-10">
          {steps.map((step) => (
            <section
              key={step.title}
              className="p-8 rounded-2xl border border-stadium-200 hover:border-primary/20 transition-colors"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-stadium-900">{step.title}</h2>
                  <p className="text-stadium-500 mt-2 leading-relaxed">{step.description}</p>
                </div>
              </div>
              <div className="ml-16 space-y-2">
                {step.tips.map((tip) => (
                  <div key={tip} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-stadium-600">{tip}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-semibold text-stadium-900 mb-2">Pr&ecirc;t &agrave; commencer ?</h2>
          <p className="text-stadium-500 text-sm mb-6">
            Cr&eacute;ez votre profil gratuitement et rejoignez le r&eacute;seau professionnel du football.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Cr&eacute;er mon profil
            <ArrowRight className="w-4 h-4" />
          </Link>
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
