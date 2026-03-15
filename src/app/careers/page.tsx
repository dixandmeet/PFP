import type { Metadata } from "next"
import Link from "next/link"
import { Briefcase, MapPin, Clock, ArrowRight, Heart, Rocket, Users, Code } from "lucide-react"
import { FootballIcon } from "@/components/auth/icons"

export const metadata: Metadata = {
  title: "Carrières | Profoot Profile",
  description: "Rejoignez l'équipe Profoot Profile et participez à la transformation du football professionnel.",
}

const openings = [
  {
    title: "Développeur Full-Stack Senior",
    department: "Engineering",
    location: "Paris / Remote",
    type: "CDI",
    icon: Code,
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Paris",
    type: "CDI",
    icon: Rocket,
  },
  {
    title: "Business Developer - Football",
    department: "Commercial",
    location: "Paris / Lyon",
    type: "CDI",
    icon: Users,
  },
  {
    title: "Data Scientist - Sport Analytics",
    department: "Data & Analytics",
    location: "Paris / Remote",
    type: "CDI",
    icon: Code,
  },
]

const perks = [
  "Télétravail flexible",
  "Tickets restaurant",
  "Mutuelle premium",
  "Places en tribunes pour les matchs",
  "Budget formation annuel",
  "Équipement au choix",
]

export default function CareersPage() {
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
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <Heart className="w-4 h-4" />
            On recrute
          </div>
          <h1 className="text-4xl font-bold text-stadium-900 mb-4">
            Rejoignez l&apos;&eacute;quipe
          </h1>
          <p className="text-lg text-stadium-500 max-w-2xl">
            Nous construisons le futur du mercato. Rejoignez une &eacute;quipe passionn&eacute;e 
            qui allie football et technologie pour transformer l&apos;industrie.
          </p>
        </div>

        {/* Avantages */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-stadium-900 mb-6">Pourquoi nous rejoindre ?</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-3 p-4 rounded-xl bg-stadium-50 border border-stadium-200">
                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <span className="text-sm text-stadium-700">{perk}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Postes ouverts */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold text-stadium-900 mb-6">Postes ouverts</h2>
          <div className="space-y-4">
            {openings.map((job) => (
              <div
                key={job.title}
                className="group p-6 rounded-2xl border border-stadium-200 hover:border-primary/20 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <job.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stadium-900 group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-sm text-stadium-500 mt-1">{job.department}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-stadium-400">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-stadium-400">
                          <Clock className="w-3.5 h-3.5" />
                          {job.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-stadium-300 group-hover:text-primary transition-colors shrink-0 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Candidature spontanée */}
        <section className="bg-stadium-50 border border-stadium-200 rounded-2xl p-8 text-center">
          <Briefcase className="w-8 h-8 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-stadium-900 mb-2">
            Candidature spontan&eacute;e
          </h2>
          <p className="text-stadium-500 text-sm mb-6 max-w-md mx-auto">
            Vous ne trouvez pas le poste id&eacute;al ? Envoyez-nous votre candidature, 
            nous sommes toujours &agrave; la recherche de talents.
          </p>
          <a
            href="mailto:careers@profootprofile.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Postuler
            <ArrowRight className="w-4 h-4" />
          </a>
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
