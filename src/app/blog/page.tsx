import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, Calendar, ArrowRight, Tag } from "lucide-react"

export const metadata: Metadata = {
  title: "Blog | Profoot Profile",
  description: "Actualités du mercato, conseils pour joueurs et agents, et nouveautés de la plateforme Profoot Profile.",
}

const articles = [
  {
    title: "Comment optimiser votre profil joueur pour attirer les recruteurs",
    excerpt: "Découvrez les meilleures pratiques pour créer un profil joueur attractif et maximiser votre visibilité auprès des clubs et agents.",
    date: "12 février 2026",
    category: "Conseils",
    readTime: "5 min",
  },
  {
    title: "Mercato hivernal 2026 : les tendances à suivre",
    excerpt: "Analyse des grandes tendances du mercato hivernal 2026 et leur impact sur le marché des transferts en Europe.",
    date: "5 février 2026",
    category: "Mercato",
    readTime: "8 min",
  },
  {
    title: "Le digital au service du recrutement sportif",
    excerpt: "Comment la technologie transforme le scouting et le recrutement dans le football professionnel.",
    date: "28 janvier 2026",
    category: "Innovation",
    readTime: "6 min",
  },
  {
    title: "Guide complet : devenir agent sportif en 2026",
    excerpt: "Tout ce qu'il faut savoir sur la licence d'agent, la réglementation FIFA et les étapes pour démarrer votre carrière.",
    date: "20 janvier 2026",
    category: "Guide",
    readTime: "10 min",
  },
  {
    title: "Les centres de formation qui misent sur le digital",
    excerpt: "Portrait de clubs qui utilisent les outils numériques pour repérer et développer les jeunes talents.",
    date: "15 janvier 2026",
    category: "Portrait",
    readTime: "7 min",
  },
  {
    title: "Nouveauté : les rapports de performance automatisés",
    excerpt: "Profoot Profile lance une nouvelle fonctionnalité permettant de générer des rapports de performance détaillés automatiquement.",
    date: "8 janvier 2026",
    category: "Produit",
    readTime: "4 min",
  },
]

const categoryColors: Record<string, string> = {
  "Conseils": "bg-blue-50 text-blue-600",
  "Mercato": "bg-green-50 text-green-600",
  "Innovation": "bg-purple-50 text-purple-600",
  "Guide": "bg-amber-50 text-amber-600",
  "Portrait": "bg-pink-50 text-pink-600",
  "Produit": "bg-primary/10 text-primary",
}

export default function BlogPage() {
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
          <h1 className="text-4xl font-bold text-stadium-900">Blog</h1>
        </div>
        <p className="text-lg text-stadium-500 mb-12">
          Actualit&eacute;s du mercato, conseils et nouveaut&eacute;s de la plateforme.
        </p>

        <div className="space-y-6">
          {articles.map((article) => (
            <article
              key={article.title}
              className="group p-6 rounded-2xl border border-stadium-200 hover:border-primary/20 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[article.category] || "bg-stadium-100 text-stadium-600"}`}>
                  <Tag className="w-3 h-3" />
                  {article.category}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-stadium-400">
                  <Calendar className="w-3.5 h-3.5" />
                  {article.date}
                </span>
                <span className="text-xs text-stadium-400">
                  {article.readTime} de lecture
                </span>
              </div>
              <h2 className="text-lg font-semibold text-stadium-900 group-hover:text-primary transition-colors mb-2">
                {article.title}
              </h2>
              <p className="text-sm text-stadium-500 leading-relaxed mb-4">
                {article.excerpt}
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm text-primary font-medium">
                Lire l&apos;article
                <ArrowRight className="w-4 h-4" />
              </span>
            </article>
          ))}
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
