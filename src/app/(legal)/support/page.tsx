// Support page
import Link from "next/link"

// Icône de ballon de foot
const FootballIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M12 4l-1.41 1.41L12 6.83l1.41-1.42L12 4zm0 14l1.41-1.41L12 15.17l-1.41 1.42L12 18zm6-6l-1.41-1.41L15.17 12l1.42 1.41L18 12zM6 12l1.41 1.41L8.83 12l-1.42-1.41L6 12zm6-2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
)

const supportTopics = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    title: "Problèmes de connexion",
    description: "Mot de passe oublié, compte bloqué, email non reconnu",
    link: "/forgot-password"
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: "Gestion du profil",
    description: "Modifier vos informations, supprimer votre compte"
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Sécurité et confidentialité",
    description: "Protection des données, paramètres de confidentialité"
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Questions fréquentes",
    description: "Consultez notre FAQ pour des réponses rapides"
  }
]

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-stadium-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-pitch-500 flex items-center justify-center">
              <FootballIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-stadium-900">Profoot Profile</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-stadium-900 mb-4">
            Centre d'aide
          </h1>
          <p className="text-lg text-stadium-500 max-w-2xl mx-auto">
            Besoin d'aide ? Nous sommes là pour vous aider à tirer le meilleur parti de Profoot Profile.
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {supportTopics.map((topic, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl border border-stadium-200 hover:border-pitch-300 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-pitch-50 text-pitch-600 flex items-center justify-center mb-4">
                {topic.icon}
              </div>
              <h3 className="text-lg font-semibold text-stadium-900 mb-2">
                {topic.title}
              </h3>
              <p className="text-stadium-500 text-sm mb-4">
                {topic.description}
              </p>
              {topic.link && (
                <Link 
                  href={topic.link}
                  className="text-pitch-600 hover:text-pitch-700 text-sm font-medium inline-flex items-center gap-1"
                >
                  En savoir plus
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-pitch-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-stadium-900 mb-4">
            Vous ne trouvez pas ce que vous cherchez ?
          </h2>
          <p className="text-stadium-600 mb-6 max-w-xl mx-auto">
            Notre équipe de support est disponible du lundi au vendredi, de 9h à 18h.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@profootprofile.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-pitch-500 text-white font-medium rounded-xl hover:bg-pitch-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Envoyer un email
            </a>
          </div>
          <p className="text-sm text-stadium-500 mt-4">
            Email : support@profootprofile.com
          </p>
        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-stadium-200">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-pitch-600 hover:text-pitch-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à la connexion
          </Link>
        </div>
      </main>
    </div>
  )
}
