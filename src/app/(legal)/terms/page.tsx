import Link from "next/link"

const FootballIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M12 4l-1.41 1.41L12 6.83l1.41-1.42L12 4zm0 14l1.41-1.41L12 15.17l-1.41 1.42L12 18zm6-6l-1.41-1.41L15.17 12l1.42 1.41L18 12zM6 12l1.41 1.41L8.83 12l-1.42-1.41L6 12zm6-2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
)

export default function TermsPage() {
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
          Conditions G&eacute;n&eacute;rales d&rsquo;Utilisation
        </h1>
        <p className="text-stadium-500 mb-8">
          Derni&egrave;re mise &agrave; jour : F&eacute;vrier 2026
        </p>

        <div className="prose prose-stadium max-w-none">

          {/* TITRE I */}
          <h2 className="text-2xl font-bold text-stadium-900 mb-6 mt-10 border-b border-stadium-200 pb-3">TITRE I &ndash; DISPOSITIONS G&Eacute;N&Eacute;RALES</h2>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 1 &ndash; Objet</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              Les pr&eacute;sentes Conditions G&eacute;n&eacute;rales d&rsquo;Utilisation (CGU) d&eacute;finissent les modalit&eacute;s et conditions d&rsquo;acc&egrave;s et d&rsquo;utilisation de la plateforme Profoot Profile, service de mise en relation dans le secteur du football int&eacute;grant une &eacute;conomie interne fond&eacute;e sur des cr&eacute;dits num&eacute;riques.
            </p>
            <p className="text-stadium-600 leading-relaxed">
              L&rsquo;acc&egrave;s et l&rsquo;utilisation de la Plateforme sont subordonn&eacute;s &agrave; l&rsquo;acceptation pleine et enti&egrave;re des pr&eacute;sentes CGU. Elles sont compl&eacute;t&eacute;es par les Conditions G&eacute;n&eacute;rales de Vente (CGV), la Politique de Confidentialit&eacute; et la Politique Cookies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 2 &ndash; R&ocirc;le de la Plateforme</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              La Plateforme agit exclusivement en qualit&eacute; d&rsquo;<strong>interm&eacute;diaire technique</strong> de mise en relation entre les Utilisateurs. Elle ne se substitue en aucun cas &agrave; un agent sportif, un mandataire, un employeur ou un courtier.
            </p>
            <p className="text-stadium-600 leading-relaxed mb-4">
              La Plateforme <strong>n&rsquo;est pas un &eacute;tablissement de cr&eacute;dit, ni un &eacute;tablissement de monnaie &eacute;lectronique, ni un prestataire de services de paiement</strong> au sens du Code mon&eacute;taire et financier. Les transactions financi&egrave;res sont trait&eacute;es par Stripe Connect.
            </p>
            <p className="text-stadium-600 leading-relaxed">
              La Plateforme ne garantit pas la conclusion d&rsquo;un contrat, d&rsquo;un transfert ou d&rsquo;une embauche entre Utilisateurs.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 3 &ndash; Inscription et Compte</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              L&rsquo;acc&egrave;s est ouvert &agrave; toute personne physique majeure (18 ans r&eacute;volus) ou personne morale l&eacute;galement constitu&eacute;e. L&rsquo;acc&egrave;s aux mineurs est strictement interdit.
            </p>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li>Les informations fournies doivent &ecirc;tre exactes, compl&egrave;tes et &agrave; jour</li>
              <li><strong>Chaque Utilisateur ne peut d&eacute;tenir qu&rsquo;un seul et unique Compte</strong>. La cr&eacute;ation de comptes multiples est strictement interdite et entra&icirc;ne la suppression sans pr&eacute;avis de tous les comptes concern&eacute;s et l&rsquo;annulation de l&rsquo;ensemble des Cr&eacute;dits associ&eacute;s, sans remboursement</li>
              <li>L&rsquo;Utilisateur est seul responsable de la confidentialit&eacute; de ses identifiants</li>
            </ul>
          </section>

          {/* TITRE II */}
          <h2 className="text-2xl font-bold text-stadium-900 mb-6 mt-10 border-b border-stadium-200 pb-3">TITRE II &ndash; SYST&Egrave;ME DE CR&Eacute;DITS INTERNES</h2>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 4 &ndash; Qualification juridique des Cr&eacute;dits</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              Les Cr&eacute;dits constituent des <strong>droits d&rsquo;usage strictement internes</strong> &agrave; la Plateforme. Un (1) Cr&eacute;dit correspond &agrave; une valeur faciale d&rsquo;un (1) euro, exclusivement aux fins de tarification interne.
            </p>
            <p className="text-stadium-600 leading-relaxed mb-4">Les Cr&eacute;dits ne constituent en aucun cas :</p>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li>De la monnaie &eacute;lectronique au sens de l&rsquo;article L.315-1 du Code mon&eacute;taire et financier</li>
              <li>Un instrument de paiement au sens de l&rsquo;article L.133-4 du Code mon&eacute;taire et financier</li>
              <li>Un actif num&eacute;rique ou jeton au sens de l&rsquo;article L.54-10-1 du Code mon&eacute;taire et financier</li>
              <li>Un instrument financier ou un titre de cr&eacute;ance</li>
            </ul>
            <p className="text-stadium-600 leading-relaxed">
              Les Cr&eacute;dits sont strictement personnels, incessibles, intransmissibles et ne peuvent &ecirc;tre vendus, &eacute;chang&eacute;s ou transf&eacute;r&eacute;s entre Utilisateurs.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 5 &ndash; Cat&eacute;gories de Cr&eacute;dits</h2>

            <h3 className="text-lg font-medium text-stadium-800 mb-2">5.1. Cr&eacute;dits Inclus dans l&rsquo;Abonnement</h3>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li>Allou&eacute;s mensuellement dans le cadre de l&rsquo;Abonnement souscrit</li>
              <li><strong>Expirent le 1er janvier</strong> de chaque ann&eacute;e civile &agrave; 00h00, sans report ni remboursement</li>
              <li><strong>Non &eacute;ligibles au retrait</strong> en euros</li>
              <li>Consomm&eacute;s en priorit&eacute;</li>
            </ul>

            <h3 className="text-lg font-medium text-stadium-800 mb-2">5.2. Cr&eacute;dits Achet&eacute;s</h3>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li>Acquis via recharge flexible (1 cr&eacute;dit = 1 euro)</li>
              <li><strong>N&rsquo;expirent jamais</strong></li>
              <li><strong>Non &eacute;ligibles au retrait</strong> en euros</li>
              <li>Achat d&eacute;finitif et non remboursable</li>
            </ul>

            <h3 className="text-lg font-medium text-stadium-800 mb-2">5.3. Cr&eacute;dits Gagn&eacute;s</h3>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li>Acquis via la redistribution (followers, candidatures, signatures)</li>
              <li><strong>N&rsquo;expirent jamais</strong></li>
              <li><strong>Seuls Cr&eacute;dits &eacute;ligibles au retrait</strong> en euros (sous conditions)</li>
            </ul>

            <h3 className="text-lg font-medium text-stadium-800 mb-2">5.4. Cr&eacute;dits Bonus</h3>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li>Attribu&eacute;s &agrave; titre promotionnel par la Plateforme</li>
              <li><strong>Expirent le 1er janvier</strong> de chaque ann&eacute;e civile &agrave; 00h00</li>
              <li><strong>Non &eacute;ligibles au retrait</strong> en euros</li>
            </ul>

            <div className="overflow-x-auto mb-4">
              <table className="min-w-full text-sm text-stadium-600">
                <thead>
                  <tr className="border-b border-stadium-200">
                    <th className="text-left py-3 pr-4 font-semibold text-stadium-800">Cat&eacute;gorie</th>
                    <th className="text-left py-3 pr-4 font-semibold text-stadium-800">Expiration</th>
                    <th className="text-left py-3 font-semibold text-stadium-800">Retrait</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stadium-100">
                  <tr><td className="py-3 pr-4">Cr&eacute;dits Inclus</td><td className="py-3 pr-4">1er janvier</td><td className="py-3">Non</td></tr>
                  <tr><td className="py-3 pr-4">Cr&eacute;dits Achet&eacute;s</td><td className="py-3 pr-4">Jamais</td><td className="py-3">Non</td></tr>
                  <tr><td className="py-3 pr-4">Cr&eacute;dits Gagn&eacute;s</td><td className="py-3 pr-4">Jamais</td><td className="py-3">Oui (sous conditions)</td></tr>
                  <tr><td className="py-3 pr-4">Cr&eacute;dits Bonus</td><td className="py-3 pr-4">1er janvier</td><td className="py-3">Non</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 6 &ndash; Utilisation des Cr&eacute;dits</h2>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li><strong>Suivre un profil</strong> : 1 cr&eacute;dit / mois par profil suivi</li>
              <li><strong>Consulter une Annonce Club</strong> : 2 &agrave; 20 cr&eacute;dits selon la division</li>
              <li><strong>Candidater &agrave; une Annonce</strong> : selon le tarif indiqu&eacute; sur l&rsquo;annonce</li>
              <li><strong>Envoyer des messages</strong> : selon les conditions tarifaires en vigueur</li>
            </ul>
            <p className="text-stadium-600 leading-relaxed">
              Les Cr&eacute;dits sont consomm&eacute;s dans l&rsquo;ordre suivant : Bonus &rarr; Inclus &rarr; Achet&eacute;s &rarr; Gagn&eacute;s. Une fois consomm&eacute;s, les Cr&eacute;dits ne sont pas remboursables.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 7 &ndash; Retrait des Cr&eacute;dits Gagn&eacute;s</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              Seuls les Cr&eacute;dits Gagn&eacute;s sont &eacute;ligibles au retrait en euros, sous r&eacute;serve des conditions cumulatives suivantes :
            </p>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li><strong>Seuil minimum</strong> : 100 Cr&eacute;dits Gagn&eacute;s</li>
              <li><strong>Commission plateforme</strong> : 20 % du montant retir&eacute; (exemple : retrait de 100 cr&eacute;dits = 80 &euro; per&ccedil;us)</li>
              <li><strong>KYC valid&eacute;</strong> : proc&eacute;dure de v&eacute;rification d&rsquo;identit&eacute; compl&egrave;te et valid&eacute;e</li>
              <li><strong>D&eacute;lai de s&eacute;curit&eacute;</strong> : appliqu&eacute; entre la validation de la demande et le virement effectif (maximum 30 jours ouvr&eacute;s)</li>
              <li><strong>Paiement</strong> : virement bancaire via Stripe Connect</li>
            </ul>
            <p className="text-stadium-600 leading-relaxed mb-4">
              L&rsquo;&Eacute;diteur peut refuser ou suspendre un retrait en cas de suspicion de fraude, compte sous enqu&ecirc;te, KYC invalide, informations bancaires erron&eacute;es, ou obligation l&eacute;gale.
            </p>
            <p className="text-stadium-600 leading-relaxed">
              Les revenus issus des retraits sont susceptibles d&rsquo;&ecirc;tre soumis &agrave; l&rsquo;imp&ocirc;t. L&rsquo;Utilisateur est seul responsable de ses obligations fiscales.
            </p>
          </section>

          {/* TITRE III */}
          <h2 className="text-2xl font-bold text-stadium-900 mb-6 mt-10 border-b border-stadium-200 pb-3">TITRE III &ndash; ABONNEMENTS ET REDISTRIBUTION</h2>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 8 &ndash; Formules d&rsquo;Abonnement</h2>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full text-sm text-stadium-600">
                <thead>
                  <tr className="border-b border-stadium-200">
                    <th className="text-left py-3 pr-4 font-semibold text-stadium-800">Formule</th>
                    <th className="text-left py-3 pr-4 font-semibold text-stadium-800">Tarif</th>
                    <th className="text-left py-3 font-semibold text-stadium-800">Redistribution followers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stadium-100">
                  <tr><td className="py-3 pr-4">Starter</td><td className="py-3 pr-4">10 &euro; / mois</td><td className="py-3">25 %</td></tr>
                  <tr><td className="py-3 pr-4">Growth</td><td className="py-3 pr-4">50 &euro; / mois</td><td className="py-3">30 %</td></tr>
                  <tr><td className="py-3 pr-4">Pro</td><td className="py-3 pr-4">200 &euro; / mois</td><td className="py-3">40 %</td></tr>
                  <tr><td className="py-3 pr-4">Elite</td><td className="py-3 pr-4">500 &euro; / mois</td><td className="py-3">50 %</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-stadium-600 leading-relaxed">
              L&rsquo;Abonnement est &agrave; dur&eacute;e ind&eacute;termin&eacute;e avec renouvellement automatique mensuel. R&eacute;siliation possible &agrave; tout moment depuis le Compte, effective en fin de p&eacute;riode. Les Cr&eacute;dits Inclus non consomm&eacute;s sont perdus &agrave; la r&eacute;siliation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 9 &ndash; Redistribution</h2>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li><strong>Followers</strong> : 1 cr&eacute;dit/mois pr&eacute;lev&eacute; sur le follower, redistribu&eacute; au titulaire du profil suivi selon son taux d&rsquo;Abonnement</li>
              <li><strong>Annonces Club</strong> : le Club per&ccedil;oit 25 % des cr&eacute;dits g&eacute;n&eacute;r&eacute;s par la consultation de ses annonces</li>
              <li><strong>Signature prouv&eacute;e</strong> : le Club per&ccedil;oit 50 % si la signature d&rsquo;un joueur ayant candidat&eacute; via la Plateforme est valid&eacute;e</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 10 &ndash; Preuve de signature</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">Conditions cumulatives :</p>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li>Le joueur doit avoir candidat&eacute; &agrave; l&rsquo;Annonce Club via la Plateforme</li>
              <li>L&rsquo;Annonce doit avoir re&ccedil;u un nombre minimum de candidatures</li>
              <li>Le Club doit produire une <strong>preuve contractuelle officielle</strong> (contrat de travail, homologation, licence f&eacute;d&eacute;rale)</li>
            </ul>
            <p className="text-stadium-600 leading-relaxed">
              Toute falsification entra&icirc;ne le rejet, l&rsquo;annulation des Cr&eacute;dits, la suppression du compte et le signalement aux autorit&eacute;s.
            </p>
          </section>

          {/* TITRE IV */}
          <h2 className="text-2xl font-bold text-stadium-900 mb-6 mt-10 border-b border-stadium-200 pb-3">TITRE IV &ndash; COMPORTEMENT ET MOD&Eacute;RATION</h2>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 11 &ndash; Obligations des Utilisateurs</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">L&rsquo;Utilisateur s&rsquo;interdit notamment de :</p>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2">
              <li>Cr&eacute;er plusieurs comptes ou utiliser le compte d&rsquo;un tiers</li>
              <li>Fournir des informations fausses ou frauduleuses</li>
              <li>Contourner les m&eacute;canismes de Cr&eacute;dits (followers fictifs, candidatures artificielles)</li>
              <li>Utiliser des proc&eacute;d&eacute;s automatis&eacute;s (robots, scripts, scraping)</li>
              <li>Publier des contenus illicites, diffamatoires ou discriminatoires</li>
              <li>Harc&egrave;ler ou menacer d&rsquo;autres Utilisateurs</li>
              <li>Transf&eacute;rer, vendre ou commercialiser son Compte ou ses Cr&eacute;dits</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 12 &ndash; Lutte contre la fraude et sanctions</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              En cas de suspicion de fraude, la Plateforme peut sans pr&eacute;avis :
            </p>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li>Suspendre temporairement l&rsquo;acc&egrave;s au Compte</li>
              <li>Geler les Cr&eacute;dits et suspendre les retraits en cours</li>
            </ul>
            <p className="text-stadium-600 leading-relaxed mb-4">
              Apr&egrave;s examen, en cas de fraude confirm&eacute;e :
            </p>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2">
              <li>Suppression d&eacute;finitive du Compte</li>
              <li>Annulation de l&rsquo;int&eacute;gralit&eacute; des Cr&eacute;dits (y compris Achet&eacute;s et Gagn&eacute;s), sans remboursement</li>
              <li>R&eacute;siliation de l&rsquo;Abonnement sans remboursement</li>
              <li>Interdiction de cr&eacute;er un nouveau Compte</li>
              <li>Signalement aux autorit&eacute;s comp&eacute;tentes</li>
            </ul>
          </section>

          {/* TITRE V */}
          <h2 className="text-2xl font-bold text-stadium-900 mb-6 mt-10 border-b border-stadium-200 pb-3">TITRE V &ndash; RESPONSABILIT&Eacute;</h2>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 13 &ndash; Responsabilit&eacute; de la Plateforme</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              La Plateforme est soumise &agrave; une obligation de moyens. Elle ne saurait &ecirc;tre tenue responsable :
            </p>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li>Des dommages directs ou indirects r&eacute;sultant de l&rsquo;utilisation de la Plateforme</li>
              <li>De l&rsquo;exactitude des informations publi&eacute;es par les Utilisateurs</li>
              <li>Du comportement des Utilisateurs ou de l&rsquo;issue des mises en relation</li>
              <li>De la non-conclusion d&rsquo;un contrat ou d&rsquo;un transfert</li>
              <li>Des d&eacute;cisions de Stripe Connect ou de tout prestataire tiers</li>
            </ul>
            <p className="text-stadium-600 leading-relaxed">
              La responsabilit&eacute; totale de la Plateforme est plafonn&eacute;e au montant total des sommes vers&eacute;es par l&rsquo;Utilisateur au cours des 12 derniers mois.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 14 &ndash; KYC et LCB-FT</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              La proc&eacute;dure KYC est obligatoire pour tout retrait. Documents requis :
            </p>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li>Pi&egrave;ce d&rsquo;identit&eacute; en cours de validit&eacute;</li>
              <li>Justificatif de domicile de moins de 3 mois</li>
              <li>RIB au nom de l&rsquo;Utilisateur</li>
              <li>Pour les personnes morales : K-bis, statuts, identit&eacute; du repr&eacute;sentant l&eacute;gal</li>
            </ul>
            <p className="text-stadium-600 leading-relaxed">
              La Plateforme met en &oelig;uvre des mesures de vigilance LCB-FT et peut geler les Cr&eacute;dits et proc&eacute;der &agrave; une d&eacute;claration de soup&ccedil;on aupr&egrave;s de TRACFIN en cas de soup&ccedil;on de blanchiment.
            </p>
          </section>

          {/* TITRE VI */}
          <h2 className="text-2xl font-bold text-stadium-900 mb-6 mt-10 border-b border-stadium-200 pb-3">TITRE VI &ndash; DISPOSITIONS FINALES</h2>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 15 &ndash; Droit applicable et litiges</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              Les pr&eacute;sentes CGU sont r&eacute;gies par le <strong>droit fran&ccedil;ais</strong>.
            </p>
            <p className="text-stadium-600 leading-relaxed mb-4">
              En cas de litige, une r&eacute;clamation pr&eacute;alable est obligatoire &agrave; l&rsquo;adresse <a href="mailto:legal@profootprofile.com" className="text-pitch-600 hover:underline">legal@profootprofile.com</a>. R&eacute;ponse sous 30 jours.
            </p>
            <p className="text-stadium-600 leading-relaxed mb-4">
              M&eacute;diation gratuite accessible conform&eacute;ment aux articles L.611-1 et suivants du Code de la consommation. Plateforme europ&eacute;enne : <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-pitch-600 hover:underline">https://ec.europa.eu/consumers/odr</a>
            </p>
            <p className="text-stadium-600 leading-relaxed">
              Entre professionnels : comp&eacute;tence exclusive du Tribunal de Commerce de [VILLE].
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 16 &ndash; Contact</h2>
            <p className="text-stadium-600 leading-relaxed">
              Pour toute question :{" "}
              <a href="mailto:legal@profootprofile.com" className="text-pitch-600 hover:underline">legal@profootprofile.com</a>
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
