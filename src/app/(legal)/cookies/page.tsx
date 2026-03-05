import Link from "next/link"

const FootballIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M12 4l-1.41 1.41L12 6.83l1.41-1.42L12 4zm0 14l1.41-1.41L12 15.17l-1.41 1.42L12 18zm6-6l-1.41-1.41L15.17 12l1.42 1.41L18 12zM6 12l1.41 1.41L8.83 12l-1.42-1.41L6 12zm6-2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
)

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
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

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-stadium-900 mb-4">
          Politique Cookies
        </h1>
        <p className="text-stadium-500 mb-8">
          Derni&egrave;re mise &agrave; jour : F&eacute;vrier 2026
        </p>

        <div className="prose prose-stadium max-w-none">

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 1 &ndash; Qu&rsquo;est-ce qu&rsquo;un cookie ?</h2>
            <p className="text-stadium-600 leading-relaxed">
              Un cookie est un petit fichier texte d&eacute;pos&eacute; sur votre terminal (ordinateur, tablette, smartphone) lors de la consultation de la plateforme Profoot Profile. Le terme &laquo; cookies &raquo; englobe &eacute;galement les pixels, balises web, identifiants d&rsquo;appareil, stockage local et technologies similaires.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 2 &ndash; Types de cookies utilis&eacute;s</h2>

            <h3 className="text-lg font-medium text-stadium-800 mb-3 mt-6">2.1. Cookies strictement n&eacute;cessaires</h3>
            <p className="text-stadium-600 leading-relaxed mb-3">
              Indispensables au fonctionnement de la Plateforme, exempt&eacute;s de consentement.
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full text-sm text-stadium-600">
                <thead>
                  <tr className="border-b border-stadium-200">
                    <th className="text-left py-3 pr-4 font-semibold text-stadium-800">Cookie</th>
                    <th className="text-left py-3 pr-4 font-semibold text-stadium-800">Finalit&eacute;</th>
                    <th className="text-left py-3 font-semibold text-stadium-800">Dur&eacute;e</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stadium-100">
                  <tr><td className="py-3 pr-4">Session utilisateur</td><td className="py-3 pr-4">Maintien de la connexion</td><td className="py-3">Session</td></tr>
                  <tr><td className="py-3 pr-4">Pr&eacute;f&eacute;rences cookies</td><td className="py-3 pr-4">M&eacute;morisation du choix cookies</td><td className="py-3">13 mois</td></tr>
                  <tr><td className="py-3 pr-4">S&eacute;curit&eacute; (CSRF)</td><td className="py-3 pr-4">Protection contre les attaques CSRF</td><td className="py-3">Session</td></tr>
                  <tr><td className="py-3 pr-4">Transaction</td><td className="py-3 pr-4">Gestion du processus d&rsquo;achat</td><td className="py-3">Session</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium text-stadium-800 mb-3 mt-6">2.2. Cookies de performance et d&rsquo;analyse</h3>
            <p className="text-stadium-600 leading-relaxed mb-3">
              Permettent de mesurer l&rsquo;audience et d&rsquo;am&eacute;liorer les services. <strong>Soumis &agrave; votre consentement.</strong>
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full text-sm text-stadium-600">
                <thead>
                  <tr className="border-b border-stadium-200">
                    <th className="text-left py-3 pr-4 font-semibold text-stadium-800">Service</th>
                    <th className="text-left py-3 pr-4 font-semibold text-stadium-800">Finalit&eacute;</th>
                    <th className="text-left py-3 font-semibold text-stadium-800">Dur&eacute;e</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stadium-100">
                  <tr><td className="py-3 pr-4">Analyse d&rsquo;audience</td><td className="py-3 pr-4">Mesure du trafic et comportement de navigation</td><td className="py-3">13 mois</td></tr>
                  <tr><td className="py-3 pr-4">Exp&eacute;rience utilisateur</td><td className="py-3 pr-4">Analyse UX (heatmaps, sessions)</td><td className="py-3">13 mois</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium text-stadium-800 mb-3 mt-6">2.3. Cookies de fonctionnalit&eacute;</h3>
            <p className="text-stadium-600 leading-relaxed mb-3">
              Am&eacute;liorent l&rsquo;exp&eacute;rience en m&eacute;morisant vos pr&eacute;f&eacute;rences. <strong>Soumis &agrave; votre consentement.</strong>
            </p>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li>Langue et localisation pr&eacute;f&eacute;r&eacute;es (13 mois)</li>
              <li>Personnalisation de l&rsquo;interface (13 mois)</li>
            </ul>

            <h3 className="text-lg font-medium text-stadium-800 mb-3 mt-6">2.4. Cookies publicitaires et de ciblage</h3>
            <p className="text-stadium-600 leading-relaxed mb-3">
              Le cas &eacute;ch&eacute;ant, permettent d&rsquo;afficher des publicit&eacute;s cibl&eacute;es. <strong>Soumis &agrave; votre consentement.</strong>
            </p>

            <h3 className="text-lg font-medium text-stadium-800 mb-3 mt-6">2.5. Cookies tiers &ndash; Stripe</h3>
            <p className="text-stadium-600 leading-relaxed">
              Stripe peut d&eacute;poser des cookies pour la s&eacute;curit&eacute; et la pr&eacute;vention de la fraude lors des paiements. Voir la{" "}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-pitch-600 hover:underline">politique de confidentialit&eacute; de Stripe</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 3 &ndash; Consentement</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              Conform&eacute;ment &agrave; l&rsquo;article 82 de la loi Informatique et Libert&eacute;s et aux recommandations de la CNIL du 1er octobre 2020, le d&eacute;p&ocirc;t de cookies non strictement n&eacute;cessaires requiert votre <strong>consentement pr&eacute;alable</strong>.
            </p>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2">
              <li>Un bandeau de gestion des cookies est affich&eacute; lors de votre premi&egrave;re visite</li>
              <li>Vous pouvez accepter tout, refuser tout, ou param&eacute;trer par cat&eacute;gorie</li>
              <li>La simple poursuite de la navigation <strong>ne vaut pas acceptation</strong></li>
              <li>L&rsquo;acc&egrave;s &agrave; la Plateforme n&rsquo;est <strong>pas conditionn&eacute;</strong> &agrave; l&rsquo;acceptation des cookies non n&eacute;cessaires</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 4 &ndash; Gestion et retrait du consentement</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              Vous pouvez modifier vos pr&eacute;f&eacute;rences &agrave; tout moment :
            </p>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li>Via le <strong>module de gestion des cookies</strong> accessible en pied de page</li>
              <li>Via les <strong>param&egrave;tres de votre navigateur</strong></li>
            </ul>

            <h3 className="text-lg font-medium text-stadium-800 mb-2">Param&eacute;trage par navigateur :</h3>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2">
              <li><strong>Chrome</strong> : chrome://settings/cookies</li>
              <li><strong>Firefox</strong> : about:preferences#privacy</li>
              <li><strong>Safari</strong> : Pr&eacute;f&eacute;rences &gt; Confidentialit&eacute;</li>
              <li><strong>Edge</strong> : edge://settings/privacy</li>
            </ul>
            <p className="text-stadium-600 leading-relaxed mt-4">
              Le refus de certains cookies peut limiter l&rsquo;acc&egrave;s &agrave; certaines fonctionnalit&eacute;s. Les cookies strictement n&eacute;cessaires ne peuvent pas &ecirc;tre d&eacute;sactiv&eacute;s.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 5 &ndash; Dur&eacute;e de conservation</h2>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2">
              <li>Dur&eacute;e de vie maximale : <strong>13 mois</strong> &agrave; compter du d&eacute;p&ocirc;t (recommandation CNIL)</li>
              <li>Le consentement est recueilli pour une dur&eacute;e maximale de <strong>13 mois</strong>, puis sollicit&eacute; &agrave; nouveau</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 6 &ndash; Donn&eacute;es et transferts</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              Les donn&eacute;es collect&eacute;es via les cookies sont trait&eacute;es conform&eacute;ment &agrave; notre{" "}
              <Link href="/privacy" className="text-pitch-600 hover:underline">Politique de Confidentialit&eacute;</Link>.
              Les donn&eacute;es de performance et d&rsquo;analyse sont anonymis&eacute;es ou pseudonymis&eacute;es dans la mesure du possible.
            </p>
            <p className="text-stadium-600 leading-relaxed">
              Certains cookies tiers peuvent entra&icirc;ner un transfert de donn&eacute;es hors UE, encadr&eacute; par les garanties d&eacute;crites dans la Politique de Confidentialit&eacute;.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 7 &ndash; Contact</h2>
            <p className="text-stadium-600 leading-relaxed">
              Pour toute question relative aux cookies :{" "}
              <a href="mailto:privacy@profootprofile.com" className="text-pitch-600 hover:underline">privacy@profootprofile.com</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-stadium-200">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-pitch-600 hover:text-pitch-700 font-medium"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour &agrave; l&rsquo;accueil
          </Link>
        </div>
      </main>
    </div>
  )
}
