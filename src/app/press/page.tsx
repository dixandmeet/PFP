import type { Metadata } from "next"
import Link from "next/link"
import { Newspaper, Download, Mail, Calendar, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Presse | Profoot Profile",
  description: "Espace presse de Profoot Profile. Communiqués, kit média et contacts presse.",
}

const pressReleases = [
  {
    date: "Février 2026",
    title: "Profoot Profile lève des fonds pour accélérer son développement en Europe",
    excerpt: "La plateforme de mise en relation du football professionnel annonce une levée de fonds pour étendre sa présence dans 10 nouveaux pays.",
  },
  {
    date: "Janvier 2026",
    title: "Lancement de l'assistant IA pour les agents sportifs",
    excerpt: "Profoot Profile dévoile son assistant IA dédié aux agents, capable d'analyser les profils de joueurs et de suggérer des opportunités de transfert.",
  },
  {
    date: "Décembre 2025",
    title: "Profoot Profile dépasse les 10 000 joueurs inscrits",
    excerpt: "En moins d'un an, la plateforme a su convaincre plus de 10 000 joueurs professionnels et amateurs de rejoindre le réseau.",
  },
]

export default function PressPage() {
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
            <Newspaper className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-stadium-900">Espace Presse</h1>
        </div>
        <p className="text-lg text-stadium-500 mb-12">
          Retrouvez nos communiqu&eacute;s de presse, notre kit m&eacute;dia et les contacts presse.
        </p>

        {/* Contact presse */}
        <section className="mb-16 bg-stadium-50 border border-stadium-200 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-stadium-900 mb-4">Contact presse</h2>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <a href="mailto:presse@profootprofile.com" className="text-primary hover:underline text-sm">
                presse@profootprofile.com
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-primary" />
              <span className="text-sm text-stadium-600">
                Kit m&eacute;dia disponible sur demande
              </span>
            </div>
          </div>
        </section>

        {/* Communiqués */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-stadium-900 mb-8">Communiqu&eacute;s de presse</h2>
          <div className="space-y-6">
            {pressReleases.map((pr) => (
              <article
                key={pr.title}
                className="group p-6 rounded-2xl border border-stadium-200 hover:border-primary/20 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-stadium-400" />
                  <span className="text-xs text-stadium-400 font-medium">{pr.date}</span>
                </div>
                <h3 className="text-lg font-semibold text-stadium-900 group-hover:text-primary transition-colors mb-2">
                  {pr.title}
                </h3>
                <p className="text-sm text-stadium-500 leading-relaxed">
                  {pr.excerpt}
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center gap-1.5 text-sm text-primary font-medium">
                    Lire la suite
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Chiffres clés */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-stadium-900 mb-6">Chiffres cl&eacute;s</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-6 rounded-2xl bg-stadium-50 border border-stadium-200">
              <div className="text-2xl font-bold text-primary">10K+</div>
              <div className="text-xs text-stadium-500 mt-1">Joueurs</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-stadium-50 border border-stadium-200">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-xs text-stadium-500 mt-1">Agents</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-stadium-50 border border-stadium-200">
              <div className="text-2xl font-bold text-primary">200+</div>
              <div className="text-xs text-stadium-500 mt-1">Clubs</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-stadium-50 border border-stadium-200">
              <div className="text-2xl font-bold text-primary">15</div>
              <div className="text-xs text-stadium-500 mt-1">Pays</div>
            </div>
          </div>
        </section>

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
