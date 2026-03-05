import Link from "next/link"

const FootballIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M12 4l-1.41 1.41L12 6.83l1.41-1.42L12 4zm0 14l1.41-1.41L12 15.17l-1.41 1.42L12 18zm6-6l-1.41-1.41L15.17 12l1.42 1.41L18 12zM6 12l1.41 1.41L8.83 12l-1.42-1.41L6 12zm6-2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
)

export default function LegalPage() {
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
          Mentions L&eacute;gales
        </h1>
        <p className="text-stadium-500 mb-8">
          Derni&egrave;re mise &agrave; jour : F&eacute;vrier 2026
        </p>

        <div className="prose prose-stadium max-w-none">

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 1 &ndash; &Eacute;diteur du site</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              La plateforme Profoot Profile est &eacute;dit&eacute;e par :
            </p>
            <div className="bg-stadium-50 border border-stadium-200 rounded-xl p-6 mb-4">
              <p className="text-stadium-700 leading-relaxed">
                <strong>[D&Eacute;NOMINATION SOCIALE]</strong><br />
                Soci&eacute;t&eacute; [forme juridique] au capital de [MONTANT] euros<br />
                Si&egrave;ge social : [ADRESSE COMPL&Egrave;TE]<br />
                RCS de [VILLE] : [NUM&Eacute;RO RCS]<br />
                SIRET : [NUM&Eacute;RO SIRET]<br />
                TVA intracommunautaire : [NUM&Eacute;RO TVA]
              </p>
            </div>
            <p className="text-stadium-600 leading-relaxed">
              <strong>Directeur de la publication :</strong> [NOM ET PR&Eacute;NOM], [FONCTION]<br />
              <strong>Email :</strong> <a href="mailto:contact@profootprofile.com" className="text-pitch-600 hover:underline">contact@profootprofile.com</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 2 &ndash; H&eacute;bergeur</h2>
            <div className="bg-stadium-50 border border-stadium-200 rounded-xl p-6">
              <p className="text-stadium-700 leading-relaxed">
                <strong>[NOM DE L&rsquo;H&Eacute;BERGEUR]</strong><br />
                Si&egrave;ge social : [ADRESSE]<br />
                Site internet : [URL]
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 3 &ndash; Activit&eacute;</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              Profoot Profile est un service de mise en relation dans le secteur du football professionnel et amateur. La Plateforme permet la publication d&rsquo;annonces par des clubs, la consultation de profils et la mise en relation entre joueurs, agents, entra&icirc;neurs et clubs, au moyen d&rsquo;une &eacute;conomie interne fond&eacute;e sur des cr&eacute;dits num&eacute;riques.
            </p>
            <p className="text-stadium-600 leading-relaxed">
              La Plateforme <strong>n&rsquo;est ni un &eacute;tablissement de cr&eacute;dit, ni un &eacute;tablissement de monnaie &eacute;lectronique, ni un prestataire de services de paiement</strong> au sens du Code mon&eacute;taire et financier. Les cr&eacute;dits constituent exclusivement des droits d&rsquo;usage internes, sans valeur mon&eacute;taire ext&eacute;rieure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 4 &ndash; Propri&eacute;t&eacute; intellectuelle</h2>
            <p className="text-stadium-600 leading-relaxed">
              L&rsquo;ensemble du contenu de la Plateforme (textes, images, graphismes, logos, ic&ocirc;nes, logiciels, bases de donn&eacute;es, structure g&eacute;n&eacute;rale) est prot&eacute;g&eacute; par les dispositions du Code de la propri&eacute;t&eacute; intellectuelle et par les conventions internationales. Toute reproduction, repr&eacute;sentation, modification, publication ou adaptation, totale ou partielle, est interdite sans autorisation &eacute;crite pr&eacute;alable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 5 &ndash; Donn&eacute;es personnelles</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              La collecte et le traitement des donn&eacute;es personnelles sont r&eacute;alis&eacute;s conform&eacute;ment au R&egrave;glement (UE) 2016/679 (RGPD) et &agrave; la loi n&deg; 78-17 du 6 janvier 1978 modifi&eacute;e.
            </p>
            <p className="text-stadium-600 leading-relaxed mb-4">
              Pour plus d&rsquo;informations, consultez notre{" "}
              <Link href="/privacy" className="text-pitch-600 hover:underline">Politique de Confidentialit&eacute;</Link>.
            </p>
            <p className="text-stadium-600 leading-relaxed mb-4">
              <strong>DPO :</strong> <a href="mailto:privacy@profootprofile.com" className="text-pitch-600 hover:underline">privacy@profootprofile.com</a>
            </p>
            <p className="text-stadium-600 leading-relaxed">
              Vous disposez d&rsquo;un droit d&rsquo;acc&egrave;s, de rectification, d&rsquo;effacement, de limitation, de portabilit&eacute; et d&rsquo;opposition. R&eacute;clamation possible aupr&egrave;s de la{" "}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-pitch-600 hover:underline">CNIL</a>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 6 &ndash; Cookies</h2>
            <p className="text-stadium-600 leading-relaxed">
              La Plateforme utilise des cookies. Consultez notre{" "}
              <Link href="/cookies" className="text-pitch-600 hover:underline">Politique Cookies</Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 7 &ndash; Liens hypertextes</h2>
            <p className="text-stadium-600 leading-relaxed">
              La Plateforme peut contenir des liens vers des sites tiers. [D&Eacute;NOMINATION SOCIALE] n&rsquo;exerce aucun contr&ocirc;le sur ces sites et d&eacute;cline toute responsabilit&eacute; quant &agrave; leur contenu ou leurs pratiques.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 8 &ndash; M&eacute;diation</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              Conform&eacute;ment aux articles L.611-1 et suivants du Code de la consommation, tout consommateur peut recourir gratuitement &agrave; un m&eacute;diateur de la consommation.
            </p>
            <div className="bg-stadium-50 border border-stadium-200 rounded-xl p-6 mb-4">
              <p className="text-stadium-700 leading-relaxed">
                <strong>M&eacute;diateur d&eacute;sign&eacute; :</strong><br />
                [NOM DU M&Eacute;DIATEUR / ORGANISME]<br />
                [ADRESSE]<br />
                [SITE INTERNET]
              </p>
            </div>
            <p className="text-stadium-600 leading-relaxed">
              Plateforme europ&eacute;enne de r&egrave;glement en ligne des litiges :{" "}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-pitch-600 hover:underline">https://ec.europa.eu/consumers/odr</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 9 &ndash; Droit applicable</h2>
            <p className="text-stadium-600 leading-relaxed">
              Les pr&eacute;sentes mentions l&eacute;gales sont r&eacute;gies par le <strong>droit fran&ccedil;ais</strong>. Tout litige rel&egrave;ve de la comp&eacute;tence exclusive des juridictions fran&ccedil;aises, sous r&eacute;serve des dispositions imp&eacute;ratives applicables aux consommateurs r&eacute;sidant dans un &Eacute;tat membre de l&rsquo;UE.
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
