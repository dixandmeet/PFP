import type { Metadata } from "next"
import Link from "next/link"
import { FootballIcon } from "@/components/auth/icons"
import { Target, Shield, Users, Globe, Heart, Lightbulb } from "lucide-react"

export const metadata: Metadata = {
  title: "À propos | Profoot Profile",
  description: "Découvrez la mission et l'équipe derrière Profoot Profile, le réseau professionnel du football.",
}

const values = [
  {
    icon: Shield,
    title: "Transparence",
    description: "Chaque profil est vérifié, chaque mandat est traçable. Nous construisons la confiance dans le mercato.",
  },
  {
    icon: Users,
    title: "Accessibilité",
    description: "Du football amateur au plus haut niveau, nous donnons à chacun les mêmes outils professionnels.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "La technologie au service du football : assistants intelligents, rapports automatisés, matching avancé.",
  },
  {
    icon: Heart,
    title: "Passion",
    description: "Nous sommes des passionnés de football qui croient en un mercato plus juste et plus efficace.",
  },
]

const stats = [
  { value: "10K+", label: "Joueurs inscrits" },
  { value: "500+", label: "Agents vérifiés" },
  { value: "200+", label: "Clubs partenaires" },
  { value: "15", label: "Pays couverts" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-stadium-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/" className="flex items-center gap-2">
            <FootballIcon className="w-10 h-10 rounded-xl" />
            <span className="text-xl font-bold text-stadium-900">Profoot Profile</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-stadium-900 mb-4">
          &Agrave; propos de Profoot Profile
        </h1>
        <p className="text-lg text-stadium-500 mb-12 max-w-2xl">
          Nous r&eacute;inventons la mani&egrave;re dont le football professionnel 
          connecte ses acteurs.
        </p>

        {/* Mission */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-stadium-900">Notre mission</h2>
          </div>
          <div className="bg-stadium-50 border border-stadium-200 rounded-2xl p-8">
            <p className="text-stadium-600 leading-relaxed text-lg">
              Profoot Profile est n&eacute; d&rsquo;un constat simple : le march&eacute; des transferts manque 
              de transparence et d&rsquo;accessibilit&eacute;. Notre mission est de cr&eacute;er un &eacute;cosyst&egrave;me 
              num&eacute;rique s&eacute;curis&eacute; o&ugrave; joueurs, agents mandatés et clubs peuvent se connecter, 
              &eacute;changer et collaborer en toute confiance.
            </p>
            <p className="text-stadium-600 leading-relaxed text-lg mt-4">
              Gr&acirc;ce &agrave; l&rsquo;intelligence artificielle et &agrave; la v&eacute;rification des profils, 
              nous apportons structure et fiabilit&eacute; au mercato, du football amateur au plus haut niveau.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-2xl bg-stadium-50 border border-stadium-200">
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-stadium-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-stadium-900 mb-8">Nos valeurs</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value) => (
              <div key={value.title} className="p-6 rounded-2xl border border-stadium-200 hover:border-primary/20 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-stadium-900 mb-2">{value.title}</h3>
                <p className="text-stadium-500 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-stadium-900 mb-4">&Eacute;quipe</h2>
          <p className="text-stadium-600 leading-relaxed mb-6">
            Profoot Profile est port&eacute; par une &eacute;quipe pluridisciplinaire bas&eacute;e en France, 
            r&eacute;unissant des experts du football, de la tech et du droit du sport. 
            Nous partageons une vision commune : rendre le mercato plus juste, plus transparent 
            et plus accessible.
          </p>
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-primary" />
            <span className="text-stadium-500 text-sm">Bas&eacute;s en France, actifs dans 15 pays</span>
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
