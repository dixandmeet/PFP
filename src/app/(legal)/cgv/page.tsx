import Link from "next/link"

const FootballIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M12 4l-1.41 1.41L12 6.83l1.41-1.42L12 4zm0 14l1.41-1.41L12 15.17l-1.41 1.42L12 18zm6-6l-1.41-1.41L15.17 12l1.42 1.41L18 12zM6 12l1.41 1.41L8.83 12l-1.42-1.41L6 12zm6-2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
)

export default function CgvPage() {
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
          Conditions G&eacute;n&eacute;rales de Vente
        </h1>
        <p className="text-stadium-500 mb-8">
          Derni&egrave;re mise &agrave; jour : F&eacute;vrier 2026
        </p>

        <div className="prose prose-stadium max-w-none">

          {/* TITRE I */}
          <h2 className="text-2xl font-bold text-stadium-900 mb-6 mt-10 border-b border-stadium-200 pb-3">TITRE I &ndash; PRODUITS ET SERVICES</h2>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 1 &ndash; Description</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              Les pr&eacute;sentes CGV r&eacute;gissent les achats effectu&eacute;s sur la plateforme Profoot Profile, &eacute;dit&eacute;e par [D&Eacute;NOMINATION SOCIALE], et compl&egrave;tent les CGU. En cas de contradiction, les CGV pr&eacute;valent pour les transactions commerciales.
            </p>
            <p className="text-stadium-600 leading-relaxed mb-4">
              La Plateforme commercialise :
            </p>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2">
              <li><strong>Cr&eacute;dits par recharge flexible</strong> : unit&eacute;s d&rsquo;usage internes. 1 Cr&eacute;dit = 1 euro.</li>
              <li><strong>Abonnements</strong> : formules p&eacute;riodiques (Starter, Growth, Pro, Elite) incluant des fonctionnalit&eacute;s et des Cr&eacute;dits Inclus mensuels.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 2 &ndash; Prix</h2>
            <h3 className="text-lg font-medium text-stadium-800 mb-2">Cr&eacute;dits</h3>
            <p className="text-stadium-600 leading-relaxed mb-4">
              1 Cr&eacute;dit = 1 euro TTC (TVA incluse au taux en vigueur).
            </p>
            <h3 className="text-lg font-medium text-stadium-800 mb-2">Abonnements</h3>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full text-sm text-stadium-600">
                <thead>
                  <tr className="border-b border-stadium-200">
                    <th className="text-left py-3 pr-4 font-semibold text-stadium-800">Formule</th>
                    <th className="text-left py-3 font-semibold text-stadium-800">Prix mensuel TTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stadium-100">
                  <tr><td className="py-3 pr-4">Starter</td><td className="py-3">10 &euro; / mois</td></tr>
                  <tr><td className="py-3 pr-4">Growth</td><td className="py-3">50 &euro; / mois</td></tr>
                  <tr><td className="py-3 pr-4">Pro</td><td className="py-3">200 &euro; / mois</td></tr>
                  <tr><td className="py-3 pr-4">Elite</td><td className="py-3">500 &euro; / mois</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-stadium-600 leading-relaxed">
              Les prix peuvent &ecirc;tre modifi&eacute;s &agrave; tout moment. Pour les Abonnements en cours, toute modification est notifi&eacute;e 30 jours avant son entr&eacute;e en vigueur.
            </p>
          </section>

          {/* TITRE II */}
          <h2 className="text-2xl font-bold text-stadium-900 mb-6 mt-10 border-b border-stadium-200 pb-3">TITRE II &ndash; COMMANDES ET PAIEMENT</h2>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 3 &ndash; Processus de commande</h2>
            <ol className="list-decimal pl-6 text-stadium-600 space-y-2 mb-4">
              <li>S&eacute;lection du produit ou service</li>
              <li>V&eacute;rification du r&eacute;capitulatif de la commande</li>
              <li>Acceptation des CGV par case &agrave; cocher</li>
              <li>Saisie des informations de paiement</li>
              <li>Confirmation et validation d&eacute;finitive</li>
            </ol>
            <p className="text-stadium-600 leading-relaxed">
              Un email de confirmation est adress&eacute; au Client apr&egrave;s validation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 4 &ndash; Paiement</h2>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li>Paiement en euros via <strong>Stripe Connect</strong> (cartes bancaires Visa, Mastercard, etc.)</li>
              <li>Paiement exigible en totalit&eacute; au moment de la validation</li>
              <li>Abonnements : pr&eacute;l&egrave;vement mensuel automatique</li>
              <li>Transactions s&eacute;curis&eacute;es (Stripe certifi&eacute; PCI-DSS)</li>
            </ul>
            <p className="text-stadium-600 leading-relaxed">
              En cas d&rsquo;&eacute;chec de paiement d&rsquo;un Abonnement, l&rsquo;acc&egrave;s aux avantages est suspendu. Sans r&eacute;gularisation sous 7 jours, l&rsquo;Abonnement est r&eacute;sili&eacute; de plein droit.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 5 &ndash; Livraison</h2>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2">
              <li><strong>Cr&eacute;dits</strong> : livraison instantan&eacute;e apr&egrave;s validation du paiement</li>
              <li><strong>Abonnement</strong> : activation imm&eacute;diate avec attribution des Cr&eacute;dits Inclus</li>
            </ul>
          </section>

          {/* TITRE III */}
          <h2 className="text-2xl font-bold text-stadium-900 mb-6 mt-10 border-b border-stadium-200 pb-3">TITRE III &ndash; DROIT DE R&Eacute;TRACTATION</h2>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 6 &ndash; Exclusion du droit de r&eacute;tractation</h2>

            <div className="bg-stadium-50 border border-stadium-200 rounded-xl p-6 mb-4">
              <p className="text-stadium-700 font-medium mb-3">Information importante</p>
              <p className="text-stadium-600 leading-relaxed">
                Conform&eacute;ment &agrave; l&rsquo;article L.221-28, 13&deg; du Code de la consommation, le droit de r&eacute;tractation <strong>ne peut &ecirc;tre exerc&eacute;</strong> pour les contrats de fourniture de contenu num&eacute;rique non fourni sur un support mat&eacute;riel dont l&rsquo;ex&eacute;cution a commenc&eacute; apr&egrave;s accord pr&eacute;alable expr&egrave;s du consommateur et renoncement expr&egrave;s &agrave; son droit de r&eacute;tractation.
              </p>
            </div>

            <h3 className="text-lg font-medium text-stadium-800 mb-2">Achats de Cr&eacute;dits</h3>
            <p className="text-stadium-600 leading-relaxed mb-4">
              Lors de l&rsquo;achat, le Client donne son accord expr&egrave;s pour que les Cr&eacute;dits soient livr&eacute;s instantan&eacute;ment et reconna&icirc;t renoncer &agrave; son droit de r&eacute;tractation d&egrave;s la livraison. <strong>Aucun achat de Cr&eacute;dits ne peut faire l&rsquo;objet d&rsquo;une r&eacute;tractation.</strong>
            </p>

            <h3 className="text-lg font-medium text-stadium-800 mb-2">Abonnements</h3>
            <p className="text-stadium-600 leading-relaxed">
              La souscription emporte accord expr&egrave;s d&rsquo;ex&eacute;cution imm&eacute;diate et renonciation au droit de r&eacute;tractation d&egrave;s l&rsquo;activation et la livraison des Cr&eacute;dits Inclus. Le consentement est recueilli par case &agrave; cocher d&eacute;di&eacute;e avant validation.
            </p>
          </section>

          {/* TITRE IV */}
          <h2 className="text-2xl font-bold text-stadium-900 mb-6 mt-10 border-b border-stadium-200 pb-3">TITRE IV &ndash; POLITIQUE DE REMBOURSEMENT</h2>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 7 &ndash; Principe de non-remboursement</h2>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li><strong>Cr&eacute;dits Achet&eacute;s</strong> : non remboursables</li>
              <li><strong>Abonnements</strong> : non remboursables, y compris en cas de r&eacute;siliation en cours de p&eacute;riode</li>
              <li><strong>Cr&eacute;dits consomm&eacute;s</strong> : non remboursables</li>
              <li><strong>Cr&eacute;dits expir&eacute;s</strong> : non remboursables</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 8 &ndash; Exceptions</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">Un remboursement est possible uniquement en cas de :</p>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li><strong>Dysfonctionnement technique</strong> imputable &agrave; la Plateforme ayant emp&ecirc;ch&eacute; la d&eacute;livrance du Service</li>
              <li><strong>Double facturation</strong> av&eacute;r&eacute;e (remboursement sous 14 jours)</li>
              <li><strong>Obligation l&eacute;gale</strong> imp&eacute;rative</li>
            </ul>
            <p className="text-stadium-600 leading-relaxed">
              R&eacute;clamation par email &agrave; <a href="mailto:support@profootprofile.com" className="text-pitch-600 hover:underline">support@profootprofile.com</a> avec r&eacute;f&eacute;rences du compte, de la transaction et justificatifs. R&eacute;ponse sous 30 jours.
            </p>
          </section>

          {/* TITRE V */}
          <h2 className="text-2xl font-bold text-stadium-900 mb-6 mt-10 border-b border-stadium-200 pb-3">TITRE V &ndash; GARANTIES</h2>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 9 &ndash; Garantie l&eacute;gale de conformit&eacute;</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              Conform&eacute;ment aux articles L.224-25-12 et suivants du Code de la consommation, le contenu num&eacute;rique doit &ecirc;tre conforme au contrat. En cas de d&eacute;faut de conformit&eacute; constat&eacute; dans un d&eacute;lai de 2 ans, le Client peut exiger la mise en conformit&eacute;, une r&eacute;duction du prix ou la r&eacute;solution du contrat.
            </p>
            <p className="text-stadium-600 leading-relaxed">
              Le Client est dispens&eacute; de prouver le d&eacute;faut pendant les 12 premiers mois.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 10 &ndash; Limitation de garantie</h2>
            <p className="text-stadium-600 leading-relaxed">
              La Plateforme est fournie &laquo; en l&rsquo;&eacute;tat &raquo;. Le Vendeur ne garantit pas que la Plateforme sera exempte d&rsquo;erreurs ni que l&rsquo;Utilisateur trouvera un club, un joueur ou une opportunit&eacute; professionnelle.
            </p>
          </section>

          {/* TITRE VI */}
          <h2 className="text-2xl font-bold text-stadium-900 mb-6 mt-10 border-b border-stadium-200 pb-3">TITRE VI &ndash; DISPOSITIONS FINALES</h2>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 11 &ndash; Droit applicable</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              Les pr&eacute;sentes CGV sont r&eacute;gies par le <strong>droit fran&ccedil;ais</strong>. En cas de litige, les parties s&rsquo;engagent &agrave; rechercher une solution amiable. &Agrave; d&eacute;faut, comp&eacute;tence des tribunaux selon les r&egrave;gles de droit commun. Entre professionnels : Tribunal de Commerce de [VILLE].
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 12 &ndash; Contact</h2>
            <p className="text-stadium-600 leading-relaxed">
              Pour toute question :{" "}
              <a href="mailto:support@profootprofile.com" className="text-pitch-600 hover:underline">support@profootprofile.com</a>
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
