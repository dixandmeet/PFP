import Link from "next/link"
import { FootballIcon } from "@/components/auth/icons"

export default function PrivacyPage() {
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
          Politique de Confidentialit&eacute;
        </h1>
        <p className="text-stadium-500 mb-8">
          Derni&egrave;re mise &agrave; jour : F&eacute;vrier 2026
        </p>

        <div className="prose prose-stadium max-w-none">

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 1 &ndash; Responsable du traitement</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              Le responsable du traitement des donn&eacute;es &agrave; caract&egrave;re personnel collect&eacute;es via la plateforme Profoot Profile est la soci&eacute;t&eacute; [D&Eacute;NOMINATION SOCIALE], soci&eacute;t&eacute; [forme juridique] au capital de [MONTANT] euros, immatricul&eacute;e au Registre du Commerce et des Soci&eacute;t&eacute;s de [VILLE] sous le num&eacute;ro [NUM&Eacute;RO RCS], dont le si&egrave;ge social est situ&eacute; [ADRESSE COMPL&Egrave;TE].
            </p>
            <p className="text-stadium-600 leading-relaxed mb-4">
              <strong>D&eacute;l&eacute;gu&eacute; &agrave; la protection des donn&eacute;es (DPO) :</strong>
            </p>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2">
              <li>Adresse &eacute;lectronique : <a href="mailto:privacy@profootprofile.com" className="text-pitch-600 hover:underline">privacy@profootprofile.com</a></li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 2 &ndash; Donn&eacute;es collect&eacute;es</h2>

            <h3 className="text-lg font-medium text-stadium-800 mb-2">2.1. Donn&eacute;es d&rsquo;identification et de contact</h3>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li>Nom et pr&eacute;nom</li>
              <li>Date de naissance</li>
              <li>Adresse &eacute;lectronique</li>
              <li>Num&eacute;ro de t&eacute;l&eacute;phone</li>
              <li>Adresse postale</li>
              <li>Photographie de profil</li>
            </ul>

            <h3 className="text-lg font-medium text-stadium-800 mb-2">2.2. Donn&eacute;es professionnelles et sportives</h3>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li>Poste de jeu, exp&eacute;rience sportive, palmar&egrave;s</li>
              <li>Informations relatives &agrave; la carri&egrave;re (clubs pr&eacute;c&eacute;dents, contrats, performances)</li>
              <li>CV sportif et vid&eacute;os de pr&eacute;sentation</li>
              <li>Num&eacute;ro de licence f&eacute;d&eacute;rale (le cas &eacute;ch&eacute;ant)</li>
              <li>Statut professionnel (joueur, agent, entra&icirc;neur, club)</li>
            </ul>

            <h3 className="text-lg font-medium text-stadium-800 mb-2">2.3. Donn&eacute;es d&rsquo;identification v&eacute;rifi&eacute;e (KYC)</h3>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li>Copie de la pi&egrave;ce d&rsquo;identit&eacute; (carte nationale d&rsquo;identit&eacute;, passeport, titre de s&eacute;jour)</li>
              <li>Justificatif de domicile</li>
              <li>Relev&eacute; d&rsquo;identit&eacute; bancaire (RIB)</li>
              <li>Pour les personnes morales : extrait K-bis, statuts, identit&eacute; du repr&eacute;sentant l&eacute;gal</li>
            </ul>

            <h3 className="text-lg font-medium text-stadium-800 mb-2">2.4. Donn&eacute;es de transaction et d&rsquo;utilisation</h3>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2 mb-4">
              <li>Historique des achats de Cr&eacute;dits et des souscriptions d&rsquo;Abonnements</li>
              <li>Solde et historique des Cr&eacute;dits (acquis, consomm&eacute;s, gagn&eacute;s, expir&eacute;s)</li>
              <li>Historique des retraits de Cr&eacute;dits Gagn&eacute;s</li>
              <li>Historique des candidatures et des consultations d&rsquo;annonces</li>
              <li>Historique des messages &eacute;chang&eacute;s sur la Plateforme</li>
              <li>Donn&eacute;es relatives aux followers (abonn&eacute;s et abonnements)</li>
            </ul>

            <h3 className="text-lg font-medium text-stadium-800 mb-2">2.5. Donn&eacute;es techniques et de connexion</h3>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2">
              <li>Adresse IP, type et version du navigateur, syst&egrave;me d&rsquo;exploitation</li>
              <li>Identifiant d&rsquo;appareil (device ID)</li>
              <li>Donn&eacute;es de connexion (dates, heures, dur&eacute;e)</li>
              <li>Pages consult&eacute;es et parcours de navigation</li>
              <li>Donn&eacute;es de cookies et de technologies similaires</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 3 &ndash; Finalit&eacute;s et bases juridiques du traitement</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              Conform&eacute;ment au R&egrave;glement (UE) 2016/679 (RGPD), vos donn&eacute;es sont trait&eacute;es pour les finalit&eacute;s suivantes :
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full text-sm text-stadium-600">
                <thead>
                  <tr className="border-b border-stadium-200">
                    <th className="text-left py-3 pr-4 font-semibold text-stadium-800">Finalit&eacute;</th>
                    <th className="text-left py-3 font-semibold text-stadium-800">Base juridique</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stadium-100">
                  <tr><td className="py-3 pr-4">Cr&eacute;ation et gestion du Compte Utilisateur</td><td className="py-3">Ex&eacute;cution du contrat (art. 6.1.b)</td></tr>
                  <tr><td className="py-3 pr-4">Fourniture des Services (mise en relation, annonces, candidatures)</td><td className="py-3">Ex&eacute;cution du contrat (art. 6.1.b)</td></tr>
                  <tr><td className="py-3 pr-4">Gestion du syst&egrave;me de Cr&eacute;dits</td><td className="py-3">Ex&eacute;cution du contrat (art. 6.1.b)</td></tr>
                  <tr><td className="py-3 pr-4">Traitement des transactions financi&egrave;res</td><td className="py-3">Ex&eacute;cution du contrat (art. 6.1.b)</td></tr>
                  <tr><td className="py-3 pr-4">V&eacute;rification d&rsquo;identit&eacute; (KYC) et conformit&eacute; LCB-FT</td><td className="py-3">Obligation l&eacute;gale (art. 6.1.c)</td></tr>
                  <tr><td className="py-3 pr-4">Pr&eacute;vention et d&eacute;tection de la fraude</td><td className="py-3">Int&eacute;r&ecirc;t l&eacute;gitime (art. 6.1.f)</td></tr>
                  <tr><td className="py-3 pr-4">D&eacute;tection des comptes multiples</td><td className="py-3">Int&eacute;r&ecirc;t l&eacute;gitime (art. 6.1.f)</td></tr>
                  <tr><td className="py-3 pr-4">Mod&eacute;ration des contenus</td><td className="py-3">Obligation l&eacute;gale / int&eacute;r&ecirc;t l&eacute;gitime</td></tr>
                  <tr><td className="py-3 pr-4">Communications commerciales et promotionnelles</td><td className="py-3">Consentement (art. 6.1.a)</td></tr>
                  <tr><td className="py-3 pr-4">Am&eacute;lioration de la Plateforme et des Services</td><td className="py-3">Int&eacute;r&ecirc;t l&eacute;gitime (art. 6.1.f)</td></tr>
                  <tr><td className="py-3 pr-4">Obligations comptables et fiscales</td><td className="py-3">Obligation l&eacute;gale (art. 6.1.c)</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 4 &ndash; Destinataires des donn&eacute;es</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              Vos donn&eacute;es peuvent &ecirc;tre communiqu&eacute;es aux cat&eacute;gories de destinataires suivantes :
            </p>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2">
              <li><strong>Personnel habilit&eacute;</strong> du responsable du traitement, dans la limite de leurs fonctions</li>
              <li><strong>Stripe Connect</strong> (prestataire de services de paiement) pour le traitement des transactions et la v&eacute;rification KYC</li>
              <li><strong>H&eacute;bergeur</strong>, pour le stockage des donn&eacute;es</li>
              <li><strong>Prestataires techniques</strong> (emailing, analyse, support client)</li>
              <li><strong>Autres Utilisateurs</strong>, dans le cadre des fonctionnalit&eacute;s de la Plateforme (profils publics, messages)</li>
              <li><strong>Autorit&eacute;s comp&eacute;tentes</strong> (TRACFIN, CNIL, autorit&eacute;s judiciaires) en cas d&rsquo;obligation l&eacute;gale</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 5 &ndash; Transferts hors Union europ&eacute;enne</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              Certaines donn&eacute;es peuvent &ecirc;tre transf&eacute;r&eacute;es vers des pays situ&eacute;s en dehors de l&rsquo;UE/EEE, notamment dans le cadre de l&rsquo;utilisation de Stripe (&Eacute;tats-Unis). Ces transferts sont encadr&eacute;s par :
            </p>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2">
              <li>Une d&eacute;cision d&rsquo;ad&eacute;quation de la Commission europ&eacute;enne (EU-U.S. Data Privacy Framework)</li>
              <li>Des clauses contractuelles types (CCT) adopt&eacute;es par la Commission europ&eacute;enne (art. 46.2(c) RGPD)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 6 &ndash; Dur&eacute;e de conservation</h2>
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full text-sm text-stadium-600">
                <thead>
                  <tr className="border-b border-stadium-200">
                    <th className="text-left py-3 pr-4 font-semibold text-stadium-800">Cat&eacute;gorie</th>
                    <th className="text-left py-3 font-semibold text-stadium-800">Dur&eacute;e</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stadium-100">
                  <tr><td className="py-3 pr-4">Donn&eacute;es du Compte Utilisateur</td><td className="py-3">Dur&eacute;e de l&rsquo;inscription + 3 ans apr&egrave;s suppression</td></tr>
                  <tr><td className="py-3 pr-4">Donn&eacute;es KYC</td><td className="py-3">5 ans apr&egrave;s la derni&egrave;re op&eacute;ration de retrait</td></tr>
                  <tr><td className="py-3 pr-4">Donn&eacute;es de transaction</td><td className="py-3">10 ans (obligation comptable)</td></tr>
                  <tr><td className="py-3 pr-4">Donn&eacute;es techniques et de connexion</td><td className="py-3">1 an (obligation LCEN)</td></tr>
                  <tr><td className="py-3 pr-4">Donn&eacute;es de facturation</td><td className="py-3">10 ans (obligation fiscale)</td></tr>
                  <tr><td className="py-3 pr-4">Messages entre Utilisateurs</td><td className="py-3">Dur&eacute;e de l&rsquo;inscription + 1 an</td></tr>
                  <tr><td className="py-3 pr-4">Donn&eacute;es de signalement et mod&eacute;ration</td><td className="py-3">5 ans</td></tr>
                  <tr><td className="py-3 pr-4">Prospection commerciale</td><td className="py-3">3 ans &agrave; compter du dernier contact actif</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 7 &ndash; S&eacute;curit&eacute; des donn&eacute;es</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              Nous mettons en &oelig;uvre des mesures techniques et organisationnelles appropri&eacute;es conform&eacute;ment &agrave; l&rsquo;article 32 du RGPD :
            </p>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2">
              <li>Chiffrement des donn&eacute;es sensibles en transit (TLS/SSL) et au repos</li>
              <li>Contr&ocirc;le d&rsquo;acc&egrave;s strict fond&eacute; sur le principe du moindre privil&egrave;ge</li>
              <li>Journalisation des acc&egrave;s et des actions</li>
              <li>Pare-feux et syst&egrave;mes de d&eacute;tection d&rsquo;intrusion</li>
              <li>Sauvegardes r&eacute;guli&egrave;res et proc&eacute;dures de reprise d&rsquo;activit&eacute;</li>
              <li>Audits de s&eacute;curit&eacute; et tests d&rsquo;intrusion p&eacute;riodiques</li>
            </ul>
            <p className="text-stadium-600 leading-relaxed mt-4">
              En cas de violation de donn&eacute;es, nous notifions la CNIL dans un d&eacute;lai de 72 heures (art. 33 RGPD) et informons les personnes concern&eacute;es si le risque est &eacute;lev&eacute;.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 8 &ndash; Vos droits</h2>
            <p className="text-stadium-600 leading-relaxed mb-4">
              Conform&eacute;ment au RGPD et &agrave; la loi Informatique et Libert&eacute;s, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 text-stadium-600 space-y-2">
              <li><strong>Droit d&rsquo;acc&egrave;s</strong> (art. 15 RGPD) : obtenir la confirmation que vos donn&eacute;es sont trait&eacute;es et en obtenir une copie</li>
              <li><strong>Droit de rectification</strong> (art. 16 RGPD) : corriger des donn&eacute;es inexactes ou incompl&egrave;tes</li>
              <li><strong>Droit &agrave; l&rsquo;effacement</strong> (art. 17 RGPD) : demander la suppression de vos donn&eacute;es, sous r&eacute;serve des obligations l&eacute;gales</li>
              <li><strong>Droit &agrave; la limitation</strong> (art. 18 RGPD) : suspendre le traitement dans certains cas</li>
              <li><strong>Droit &agrave; la portabilit&eacute;</strong> (art. 20 RGPD) : recevoir vos donn&eacute;es dans un format structur&eacute; et lisible par machine</li>
              <li><strong>Droit d&rsquo;opposition</strong> (art. 21 RGPD) : vous opposer au traitement fond&eacute; sur l&rsquo;int&eacute;r&ecirc;t l&eacute;gitime, y compris la prospection commerciale</li>
              <li><strong>Droit de retirer votre consentement</strong> &agrave; tout moment, sans affecter la lic&eacute;it&eacute; du traitement ant&eacute;rieur</li>
              <li><strong>Directives post mortem</strong> : d&eacute;finir des directives relatives au sort de vos donn&eacute;es apr&egrave;s votre d&eacute;c&egrave;s (art. 85 loi Informatique et Libert&eacute;s)</li>
            </ul>
            <p className="text-stadium-600 leading-relaxed mt-4">
              Exercez vos droits par email : <a href="mailto:privacy@profootprofile.com" className="text-pitch-600 hover:underline">privacy@profootprofile.com</a>. D&eacute;lai de r&eacute;ponse : un (1) mois, prorogeable de deux (2) mois en cas de complexit&eacute;.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-stadium-900 mb-4">Article 9 &ndash; R&eacute;clamation aupr&egrave;s de la CNIL</h2>
            <p className="text-stadium-600 leading-relaxed">
              Vous disposez du droit d&rsquo;introduire une r&eacute;clamation aupr&egrave;s de la Commission Nationale de l&rsquo;Informatique et des Libert&eacute;s (CNIL) &ndash; 3 Place de Fontenoy &ndash; TSA 80715 &ndash; 75334 PARIS CEDEX 07 &ndash;{" "}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-pitch-600 hover:underline">www.cnil.fr</a>
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
