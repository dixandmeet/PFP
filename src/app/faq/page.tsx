"use client"

import { useState } from "react"
import Link from "next/link"
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react"

const faqs = [
  {
    category: "Général",
    questions: [
      {
        q: "Qu'est-ce que Profoot Profile ?",
        a: "Profoot Profile est une plateforme de mise en relation professionnelle dédiée au football. Elle connecte joueurs, agents mandatés et clubs dans un environnement sécurisé et structuré, du football amateur au plus haut niveau.",
      },
      {
        q: "La plateforme est-elle gratuite ?",
        a: "L'inscription et la création de profil sont gratuites. Certaines fonctionnalités avancées (messagerie illimitée, rapports détaillés, assistant IA) nécessitent des crédits ou un abonnement Pro/Elite.",
      },
      {
        q: "Dans quels pays Profoot Profile est-il disponible ?",
        a: "Profoot Profile est actuellement disponible dans 15 pays européens et africains. Nous étendons progressivement notre couverture géographique.",
      },
    ],
  },
  {
    category: "Joueurs",
    questions: [
      {
        q: "Comment créer mon profil joueur ?",
        a: "Inscrivez-vous en sélectionnant le rôle 'Joueur', puis complétez votre profil avec vos informations sportives (poste, statistiques, parcours). Vous pouvez ajouter des vidéos et des rapports de performance.",
      },
      {
        q: "Comment être visible auprès des clubs et agents ?",
        a: "Complétez votre profil à 100%, ajoutez des vidéos de qualité et maintenez vos statistiques à jour. Les profils vérifiés avec le badge apparaissent en priorité dans les recherches.",
      },
    ],
  },
  {
    category: "Agents",
    questions: [
      {
        q: "Comment vérifier mon statut d'agent ?",
        a: "Lors de l'inscription, vous devrez fournir votre licence d'agent (licence FIFA/fédérale). Notre équipe vérifie chaque document manuellement pour garantir l'authenticité.",
      },
      {
        q: "Puis-je gérer plusieurs joueurs ?",
        a: "Oui, vous pouvez ajouter et gérer l'ensemble de votre portefeuille de joueurs depuis votre tableau de bord agent. Chaque joueur peut avoir son propre profil détaillé.",
      },
    ],
  },
  {
    category: "Clubs",
    questions: [
      {
        q: "Comment publier une annonce de recrutement ?",
        a: "Depuis votre tableau de bord club, accédez à la section 'Annonces' et créez une nouvelle offre en précisant le poste recherché, les critères et les conditions.",
      },
      {
        q: "Comment gérer mes équipes sur la plateforme ?",
        a: "Vous pouvez créer et gérer plusieurs équipes (équipe première, réserve, U19, etc.) depuis votre espace club. Chaque équipe peut avoir son propre effectif et ses propres annonces.",
      },
    ],
  },
  {
    category: "Crédits & Paiement",
    questions: [
      {
        q: "Comment fonctionnent les crédits ?",
        a: "Les crédits sont une monnaie interne à la plateforme. Ils permettent de débloquer des fonctionnalités premium comme l'accès aux coordonnées, les rapports détaillés ou la visibilité améliorée. Ils n'ont aucune valeur monétaire extérieure.",
      },
      {
        q: "Quels moyens de paiement acceptez-vous ?",
        a: "Nous acceptons les cartes bancaires (Visa, Mastercard), les virements SEPA et PayPal pour l'achat de crédits et les abonnements.",
      },
    ],
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-stadium-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-stadium-50 transition-colors"
      >
        <span className="font-medium text-stadium-900 text-sm pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-stadium-400 shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-stadium-400 shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-0">
          <p className="text-sm text-stadium-500 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
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
            <HelpCircle className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-stadium-900">FAQ</h1>
        </div>
        <p className="text-lg text-stadium-500 mb-12">
          Les r&eacute;ponses aux questions les plus fr&eacute;quentes.
        </p>

        <div className="space-y-10">
          {faqs.map((section) => (
            <section key={section.category}>
              <h2 className="text-xl font-semibold text-stadium-900 mb-4">{section.category}</h2>
              <div className="space-y-3">
                {section.questions.map((faq) => (
                  <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 bg-stadium-50 border border-stadium-200 rounded-2xl p-8 text-center">
          <HelpCircle className="w-8 h-8 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-stadium-900 mb-2">
            Vous n&apos;avez pas trouv&eacute; votre r&eacute;ponse ?
          </h2>
          <p className="text-stadium-500 text-sm mb-6">
            Notre &eacute;quipe support est l&agrave; pour vous aider.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Nous contacter
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
