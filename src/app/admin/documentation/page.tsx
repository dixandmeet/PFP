"use client"

import { AdminHeader } from "@/components/admin/AdminHeader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  User,
  Briefcase,
  Building2,
  Shield,
  LayoutDashboard,
  UserCircle,
  Trophy,
  Users,
  Search,
  FileText,
  MessageCircle,
  Bell,
  Coins,
  Settings,
  Send,
  ClipboardList,
  Target,
  Film,
  KeyRound,
  Activity,
  BarChart3,
  Clock,
  BookOpen,
  MessageSquare,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  Wallet,
  CreditCard,
  ArrowDownUp,
  ShieldAlert,
  RefreshCw,
  Banknote,
  Fingerprint,
  Webhook,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function SectionIcon({ icon: Icon, color }: { icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${color} mr-3 shrink-0`}>
      <Icon className="h-4 w-4 text-white" />
    </span>
  )
}

function DocSection({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 text-sm text-slate-600 leading-relaxed">{children}</div>
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-600 ml-1">
      {steps.map((step, i) => (
        <li key={i}>{step}</li>
      ))}
    </ol>
  )
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-3">
      <p className="text-xs font-semibold text-blue-700 mb-1">{title}</p>
      <div className="text-xs text-blue-600">{children}</div>
    </div>
  )
}

// ─── JOUEUR ──────────────────────────────────────────────────────────

function PlayerDoc() {
  return (
    <Accordion type="multiple" className="space-y-2">
      {/* Inscription & Connexion */}
      <AccordionItem value="auth" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={LogIn} color="bg-slate-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Inscription et Connexion</p>
              <p className="text-xs text-slate-500 font-normal">Cr&eacute;er un compte et acc&eacute;der &agrave; la plateforme</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> L&apos;inscription te permet de cr&eacute;er ton espace personnel sur Profoot Profile pour g&eacute;rer ta carri&egrave;re, trouver des opportunit&eacute;s et te connecter avec des agents et des clubs.</p>

            <p className="font-medium text-slate-800 mt-3">Cr&eacute;er un compte :</p>
            <StepList steps={[
              "Rends-toi sur la page d'inscription",
              "S\u00e9lectionne le profil \"Joueur\"",
              "Renseigne ton adresse email et choisis un mot de passe s\u00e9curis\u00e9 (min. 8 caract\u00e8res, avec majuscule, chiffre et caract\u00e8re sp\u00e9cial)",
              "Accepte les conditions d'utilisation",
              "Clique sur \"S'inscrire\" \u2014 tu peux aussi t'inscrire via Google",
              "V\u00e9rifie ton email en cliquant sur le lien re\u00e7u (valide 1h)",
              "Compl\u00e8te l'onboarding : informations personnelles, donn\u00e9es sportives, puis situation actuelle",
            ]} />

            <p className="font-medium text-slate-800 mt-3">Se connecter :</p>
            <StepList steps={[
              "Va sur la page de connexion",
              "Entre ton email et mot de passe, ou connecte-toi via Google",
              "Tu es redirig\u00e9 vers ton tableau de bord",
            ]} />

            <InfoCard title="Mot de passe oubli\u00e9 ?">
              Clique sur &quot;Mot de passe oubli&eacute;&quot; depuis la page de connexion, entre ton email, puis suis le lien re&ccedil;u pour d&eacute;finir un nouveau mot de passe.
            </InfoCard>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Tableau de bord */}
      <AccordionItem value="dashboard" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={LayoutDashboard} color="bg-blue-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Tableau de bord</p>
              <p className="text-xs text-slate-500 font-normal">Vue d&apos;ensemble de ton activit&eacute;</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Le tableau de bord est ta page d&apos;accueil. Il te donne un aper&ccedil;u de l&apos;activit&eacute; de la plateforme et te permet d&apos;interagir avec la communaut&eacute;.</p>

            <p className="font-medium text-slate-800 mt-3">Ce que tu y trouves :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li><strong>Feed d&apos;activit&eacute;</strong> : les publications r&eacute;centes des joueurs, agents et clubs que tu suis</li>
              <li><strong>Suggestions</strong> : des profils et opportunit&eacute;s recommand&eacute;s pour toi</li>
            </ul>

            <p className="font-medium text-slate-800 mt-3">Ce que tu peux faire :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Cr&eacute;er une publication (texte, photos)</li>
              <li>Liker, commenter, partager ou sauvegarder des posts</li>
              <li>D&eacute;couvrir de nouveaux profils &agrave; suivre</li>
            </ul>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Profil */}
      <AccordionItem value="profile" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={UserCircle} color="bg-indigo-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Mon Profil</p>
              <p className="text-xs text-slate-500 font-normal">Cr&eacute;er et g&eacute;rer ton profil joueur</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Ton profil est ta vitrine professionnelle. C&apos;est ce que les clubs et agents voient en premier. Un profil complet augmente consid&eacute;rablement tes chances d&apos;&ecirc;tre rep&eacute;r&eacute;.</p>

            <p className="font-medium text-slate-800 mt-3">Compl&eacute;ter ton profil :</p>
            <StepList steps={[
              "Acc\u00e8de \u00e0 \"Mon Profil\" depuis la sidebar",
              "Clique sur \"Modifier mon profil\"",
              "Ajoute ta photo de profil et ta photo de couverture (max 5 Mo, formats JPG/PNG/WebP)",
              "Remplis tes informations personnelles : pr\u00e9nom, nom, date de naissance, nationalit\u00e9(s)",
              "Indique ta situation actuelle : club, type de championnat, division",
              "Renseigne tes caract\u00e9ristiques physiques : taille, poids, pied fort",
              "S\u00e9lectionne ta position principale (Gardien, D\u00e9fenseur, Milieu, Attaquant)",
              "R\u00e9dige ta biographie \u2014 c'est ta lettre d'introduction aupr\u00e8s des recruteurs",
              "Clique sur \"Enregistrer\"",
            ]} />

            <InfoCard title="Taux de compl&eacute;tude">
              Un indicateur de compl&eacute;tude appara&icirc;t dans la sidebar. Il t&apos;indique les &eacute;l&eacute;ments manquants. Vise 100% pour maximiser ta visibilit&eacute;.
            </InfoCard>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Parcours */}
      <AccordionItem value="career" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Trophy} color="bg-amber-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Parcours professionnel</p>
              <p className="text-xs text-slate-500 font-normal">Historique de carri&egrave;re et statistiques</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Ton parcours retrace l&apos;ensemble de ta carri&egrave;re. Chaque passage en club avec tes statistiques permet aux recruteurs d&apos;&eacute;valuer ton exp&eacute;rience.</p>

            <p className="font-medium text-slate-800 mt-3">Ajouter une exp&eacute;rience :</p>
            <StepList steps={[
              "Va dans \"Parcours\" depuis la sidebar",
              "Clique sur \"Ajouter une exp\u00e9rience\"",
              "Renseigne le club, la saison (ex: 2024/25), le poste, la ligue et le pays",
              "Indique les dates de d\u00e9but et de fin",
              "Ajoute tes statistiques : matchs jou\u00e9s, buts, passes d\u00e9cisives, minutes",
              "Valide en cliquant sur \"Ajouter\"",
            ]} />

            <p className="font-medium text-slate-800 mt-3">Ce que tu y vois :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Un r&eacute;sum&eacute; global : nombre de clubs, matchs, buts et passes d&eacute;cisives</li>
              <li>La liste de toutes tes exp&eacute;riences sous forme de timeline</li>
              <li>Un aper&ccedil;u d&eacute;taill&eacute; en cliquant sur chaque exp&eacute;rience</li>
            </ul>

            <InfoCard title="Conseil">
              Plus ton parcours est d&eacute;taill&eacute;, plus ton profil est cr&eacute;dible. N&apos;oublie pas d&apos;ajouter tes formations en acad&eacute;mie.
            </InfoCard>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Agents & Mandats */}
      <AccordionItem value="agents" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Briefcase} color="bg-purple-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Agents et Mandats</p>
              <p className="text-xs text-slate-500 font-normal">Trouver un agent et g&eacute;rer tes mandats</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Cette section te permet de chercher un agent sportif, de proposer ou accepter un mandat de repr&eacute;sentation. Un agent peut ensuite te soumettre &agrave; des clubs pour des opportunit&eacute;s.</p>

            <p className="font-medium text-slate-800 mt-3">Trouver un agent :</p>
            <StepList steps={[
              "Va dans \"Agents\" depuis la sidebar",
              "Utilise la barre de recherche ou les filtres (pays, sp\u00e9cialit\u00e9)",
              "Consulte les fiches agents : exp\u00e9rience, agence, licence, mandats actifs",
              "Clique sur \"Proposer un mandat\" pour envoyer une demande",
              "Renseigne les dates de d\u00e9but/fin et les conditions (commission, exclusivit\u00e9...)",
              "Envoie la proposition \u2014 l'agent recevra une notification",
            ]} />

            <p className="font-medium text-slate-800 mt-3">G&eacute;rer tes mandats :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li><strong>En attente</strong> : un agent t&apos;a propos&eacute; un mandat &rarr; tu peux <strong>Accepter</strong> ou <strong>Refuser</strong></li>
              <li><strong>Actif</strong> : le mandat est en cours &rarr; tu peux le <strong>R&eacute;silier</strong> &agrave; tout moment</li>
              <li><strong>Expir&eacute; / Termin&eacute; / Refus&eacute;</strong> : consultation uniquement</li>
            </ul>

            <InfoCard title="Bon &agrave; savoir">
              Tu ne peux avoir qu&apos;un seul mandat actif &agrave; la fois. Un agent avec un mandat actif peut te soumettre directement aux clubs.
            </InfoCard>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Opportunit&eacute;s */}
      <AccordionItem value="opportunities" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Target} color="bg-emerald-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Opportunit&eacute;s et Candidatures</p>
              <p className="text-xs text-slate-500 font-normal">D&eacute;couvrir des offres et postuler</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Les opportunit&eacute;s sont des annonces publi&eacute;es par les clubs qui recherchent des joueurs. Tu peux consulter ces offres et candidater directement.</p>

            <p className="font-medium text-slate-800 mt-3">Consulter les opportunit&eacute;s :</p>
            <StepList steps={[
              "Va dans \"Opportunit\u00e9s\" depuis la sidebar",
              "Parcours les annonces disponibles ou utilise les filtres (position, pays)",
              "Clique sur une annonce pour voir les d\u00e9tails : description du poste, exigences, contrat propos\u00e9",
            ]} />

            <p className="font-medium text-slate-800 mt-3">Candidater :</p>
            <StepList steps={[
              "Depuis les d\u00e9tails d'une annonce, clique sur \"Candidater\"",
              "Ajoute une lettre de motivation (optionnel mais recommand\u00e9)",
              "Soumets ta candidature",
            ]} />

            <p className="font-medium text-slate-800 mt-3">Suivre tes candidatures :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li><Badge variant="outline" className="text-xs">Soumise</Badge> Ta candidature a &eacute;t&eacute; envoy&eacute;e</li>
              <li><Badge variant="outline" className="text-xs">Consult&eacute;e</Badge> Le club a vu ta candidature</li>
              <li><Badge variant="outline" className="text-xs">Pr&eacute;s&eacute;lectionn&eacute;</Badge> Tu es dans la shortlist</li>
              <li><Badge variant="outline" className="text-xs">Accept&eacute;e</Badge> Le club souhaite aller plus loin</li>
              <li><Badge variant="outline" className="text-xs">Refus&eacute;e</Badge> Ta candidature n&apos;a pas &eacute;t&eacute; retenue</li>
            </ul>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Rapports */}
      <AccordionItem value="reports" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={FileText} color="bg-cyan-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Rapports</p>
              <p className="text-xs text-slate-500 font-normal">Cr&eacute;er et partager des rapports professionnels</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Les rapports te permettent de documenter et partager des analyses de performances. Ils peuvent &ecirc;tre utilis&eacute;s pour montrer ta progression ou &ecirc;tre joint &agrave; une soumission aupr&egrave;s d&apos;un club.</p>

            <p className="font-medium text-slate-800 mt-3">Cr&eacute;er un rapport :</p>
            <StepList steps={[
              "Va dans \"Rapports\" depuis la sidebar",
              "Clique sur \"Cr\u00e9er un rapport\"",
              "Donne un titre et s\u00e9lectionne le type d'auteur (Joueur, Agent, Recruteur, Entra\u00eeneur)",
              "Le rapport est cr\u00e9\u00e9 en brouillon \u2014 tu peux l'\u00e9diter pour ajouter du contenu",
              "Une fois pr\u00eat, publie-le ou partage-le via un lien",
            ]} />

            <p className="font-medium text-slate-800 mt-3">Statuts des rapports :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li><strong>Brouillon</strong> : en cours de r&eacute;daction, visible uniquement par toi</li>
              <li><strong>En attente d&apos;approbation</strong> : soumis pour validation</li>
              <li><strong>Approuv&eacute;</strong> : valid&eacute; et partageable</li>
              <li><strong>Refus&eacute;</strong> : non valid&eacute;, modifiable</li>
            </ul>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Reels */}
      <AccordionItem value="reels" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Film} color="bg-pink-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Reels</p>
              <p className="text-xs text-slate-500 font-normal">Partager des vid&eacute;os courtes</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Les Reels te permettent de mettre en avant tes meilleures actions, entra&icirc;nements et moments forts en vid&eacute;o. C&apos;est un excellent moyen de te d&eacute;marquer visuellement aupr&egrave;s des recruteurs.</p>

            <p className="font-medium text-slate-800 mt-3">Comment &ccedil;a marche :</p>
            <StepList steps={[
              "Acc\u00e8de \u00e0 la section \"Reels\" depuis la sidebar",
              "Publie des vid\u00e9os courtes de tes performances",
              "Les recruteurs et agents peuvent d\u00e9couvrir tes vid\u00e9os directement",
            ]} />
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Messages */}
      <AccordionItem value="messages" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={MessageCircle} color="bg-green-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Messages</p>
              <p className="text-xs text-slate-500 font-normal">Communiquer avec les agents et clubs</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> La messagerie te permet d&apos;&eacute;changer directement avec les agents et les clubs. Toutes tes conversations sont centralis&eacute;es au m&ecirc;me endroit.</p>

            <p className="font-medium text-slate-800 mt-3">Comment &ccedil;a marche :</p>
            <StepList steps={[
              "Acc\u00e8de \u00e0 \"Messages\" depuis la sidebar",
              "S\u00e9lectionne une conversation existante ou d\u00e9marre un nouveau message",
              "R\u00e9dige et envoie ton message",
            ]} />

            <InfoCard title="Notification">
              Un badge dans la sidebar t&apos;indique le nombre de messages non lus.
            </InfoCard>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Recherche */}
      <AccordionItem value="search" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Search} color="bg-slate-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Recherche</p>
              <p className="text-xs text-slate-500 font-normal">Trouver des opportunit&eacute;s, clubs et agents</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> La recherche avanc&eacute;e te permet de trouver des opportunit&eacute;s, des clubs et des agents selon des crit&egrave;res pr&eacute;cis.</p>

            <p className="font-medium text-slate-800 mt-3">3 onglets de recherche :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li><strong>Opportunit&eacute;s</strong> : filtre par position pour trouver les annonces qui te correspondent</li>
              <li><strong>Clubs</strong> : recherche par nom ou pays pour d&eacute;couvrir des clubs</li>
              <li><strong>Agents</strong> : recherche par nom, agence ou pays pour trouver un repr&eacute;sentant</li>
            </ul>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Cr&eacute;dits */}
      <AccordionItem value="credits" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Coins} color="bg-yellow-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Cr&eacute;dits et Abonnement</p>
              <p className="text-xs text-slate-500 font-normal">G&eacute;rer ton portefeuille et ton abonnement</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Les cr&eacute;dits sont la monnaie interne de Profoot Profile (1 cr&eacute;dit = 1&euro;). Ils servent &agrave; acc&eacute;der &agrave; certaines fonctionnalit&eacute;s premium de la plateforme.</p>

            <p className="font-medium text-slate-800 mt-3">Les onglets disponibles :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li><strong>Aper&ccedil;u</strong> : ton solde actuel et un r&eacute;sum&eacute; de tes transactions</li>
              <li><strong>Recharger</strong> : acheter des cr&eacute;dits suppl&eacute;mentaires via Stripe</li>
              <li><strong>Abonnement</strong> : g&eacute;rer ton forfait (Gratuit, Starter, Growth, Pro, Elite)</li>
              <li><strong>Retraits</strong> : demander un retrait de tes cr&eacute;dits (disponible &agrave; partir du plan Growth)</li>
              <li><strong>Transactions</strong> : historique complet de toutes tes op&eacute;rations</li>
            </ul>

            <p className="font-medium text-slate-800 mt-3">Vid&eacute;os foot &amp; gamification :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Uploader une vid&eacute;o au format pr&eacute;vu (type <code>VIDEO</code>) : le stockage compte contre ton quota de plan (voir onglet <strong>Cr&eacute;dits</strong> de la doc admin pour les d&eacute;tails techniques).</li>
              <li>Apr&egrave;s upload, la finalisation c&ocirc;t&eacute; app d&eacute;clenche l&apos;analyse qualit&eacute; ; tu peux gagner des cr&eacute;dits bonus si la vid&eacute;o est &eacute;ligible (pas de doublon, qualit&eacute; suffisante, limite quotidienne respect&eacute;e).</li>
              <li>Tu peux consulter ton niveau, ton XP et tes quotas via l&apos;API d&eacute;di&eacute;e (int&eacute;gration UI &agrave; pr&eacute;voir sur le profil / cr&eacute;dits).</li>
            </ul>

            <InfoCard title="Types de cr&eacute;dits">
              <ul className="list-disc list-inside space-y-0.5">
                <li><strong>Inclus dans l&apos;abonnement</strong> : allou&eacute;s chaque mois, expirent le 1er janvier</li>
                <li><strong>Achet&eacute;s</strong> : achet&eacute;s via recharge, n&apos;expirent jamais</li>
                <li><strong>Bonus</strong> (dont r&eacute;compenses vid&eacute;o) : soumis &agrave; la m&ecirc;me r&egrave;gle d&apos;expiration annuelle que l&apos;abonnement pour le wallet BONUS</li>
              </ul>
            </InfoCard>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Notifications */}
      <AccordionItem value="notifications" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Bell} color="bg-orange-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Notifications</p>
              <p className="text-xs text-slate-500 font-normal">Suivre les &eacute;v&eacute;nements importants</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Les notifications t&apos;informent en temps r&eacute;el de tout ce qui se passe sur ton compte : mandats, candidatures, interactions sociales, etc.</p>

            <p className="font-medium text-slate-800 mt-3">Types de notifications :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Demande ou r&eacute;ponse de mandat (accept&eacute;, refus&eacute;)</li>
              <li>Mise &agrave; jour d&apos;une candidature</li>
              <li>Nouveau like ou commentaire sur tes publications</li>
              <li>Nouveau follower</li>
              <li>Nouvelle opportunit&eacute; correspondant &agrave; ton profil</li>
              <li>Rapport partag&eacute;</li>
            </ul>

            <p className="font-medium text-slate-800 mt-3">Actions :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Clique sur une notification pour voir le d&eacute;tail</li>
              <li>Marque une notification comme lue individuellement</li>
              <li>Utilise &quot;Tout marquer comme lu&quot; pour tout effacer</li>
            </ul>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Param&egrave;tres */}
      <AccordionItem value="settings" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Settings} color="bg-slate-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Param&egrave;tres</p>
              <p className="text-xs text-slate-500 font-normal">G&eacute;rer ton compte et ta confidentialit&eacute;</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Les param&egrave;tres te permettent de g&eacute;rer les informations de ton compte, ta s&eacute;curit&eacute; et ta visibilit&eacute;.</p>

            <p className="font-medium text-slate-800 mt-3">Sections disponibles :</p>
            <ul className="list-disc list-inside space-y-2 ml-1">
              <li><strong>Email</strong> : modifier ton adresse email</li>
              <li><strong>Mot de passe</strong> : changer ton mot de passe (ancien + nouveau requis)</li>
              <li><strong>Confidentialit&eacute;</strong> : rendre ton profil public/priv&eacute;, appara&icirc;tre ou non dans les r&eacute;sultats de recherche</li>
              <li><strong>Suppression du compte</strong> : supprimer d&eacute;finitivement ton compte et toutes tes donn&eacute;es (profil, candidatures, mandats, publications, fichiers)</li>
            </ul>

            <InfoCard title="Attention">
              La suppression du compte est irr&eacute;versible. Toutes tes donn&eacute;es seront d&eacute;finitivement effac&eacute;es.
            </InfoCard>
          </DocSection>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

// ─── AGENT ──────────────────────────────────────────────────────────

function AgentDoc() {
  return (
    <Accordion type="multiple" className="space-y-2">
      {/* Inscription */}
      <AccordionItem value="auth" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={LogIn} color="bg-slate-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Inscription et Connexion</p>
              <p className="text-xs text-slate-500 font-normal">Cr&eacute;er un compte agent</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> L&apos;inscription te permet de cr&eacute;er ton espace agent sur Profoot Profile pour g&eacute;rer tes joueurs, d&eacute;couvrir des opportunit&eacute;s et soumettre des profils aux clubs.</p>

            <p className="font-medium text-slate-800 mt-3">Cr&eacute;er un compte :</p>
            <StepList steps={[
              "Rends-toi sur la page d'inscription",
              "S\u00e9lectionne le profil \"Agent\"",
              "Renseigne ton email et mot de passe",
              "Accepte les conditions et inscris-toi",
              "V\u00e9rifie ton email",
              "Compl\u00e8te l'onboarding : informations personnelles, agence, licence professionnelle",
            ]} />
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Dashboard */}
      <AccordionItem value="dashboard" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={LayoutDashboard} color="bg-blue-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Tableau de bord</p>
              <p className="text-xs text-slate-500 font-normal">Vue d&apos;ensemble de ton activit&eacute;</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Le tableau de bord est ton point d&apos;entr&eacute;e. Il affiche le feed d&apos;activit&eacute; de la communaut&eacute; et des suggestions personnalis&eacute;es.</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Consulte les publications des joueurs et clubs</li>
              <li>Publie du contenu, like, commente et partage</li>
              <li>D&eacute;couvre des profils recommand&eacute;s</li>
            </ul>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Profil */}
      <AccordionItem value="profile" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={UserCircle} color="bg-indigo-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Mon Profil</p>
              <p className="text-xs text-slate-500 font-normal">G&eacute;rer ton profil agent</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Ton profil est ta vitrine professionnelle. Les joueurs et clubs le consultent pour &eacute;valuer ta cr&eacute;dibilit&eacute; et ton exp&eacute;rience.</p>

            <p className="font-medium text-slate-800 mt-3">Compl&eacute;ter ton profil :</p>
            <StepList steps={[
              "Acc\u00e8de \u00e0 \"Mon Profil\" puis \"Modifier\"",
              "Ajoute ta photo de profil et ta photo de couverture",
              "Renseigne tes informations : pr\u00e9nom, nom, agence, t\u00e9l\u00e9phone",
              "Indique ton num\u00e9ro de licence et ton pays de licence",
              "Ajoute ton site web si tu en as un",
              "R\u00e9dige ta biographie professionnelle",
              "Enregistre tes modifications",
            ]} />
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Joueurs & Mandats */}
      <AccordionItem value="players" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Users} color="bg-purple-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Mes Joueurs et Mandats</p>
              <p className="text-xs text-slate-500 font-normal">G&eacute;rer tes joueurs sous mandat</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Cette section centralise tous tes joueurs sous mandat. Un mandat actif te permet de repr&eacute;senter un joueur et de le soumettre aux clubs.</p>

            <p className="font-medium text-slate-800 mt-3">Cr&eacute;er un mandat :</p>
            <StepList steps={[
              "Va dans \"Mes Joueurs\" depuis la sidebar",
              "Clique sur \"Nouveau mandat\"",
              "S\u00e9lectionne un joueur dans la liste d\u00e9roulante",
              "D\u00e9finis les dates de d\u00e9but et de fin",
              "Pr\u00e9cise les conditions (commission, exclusivit\u00e9, etc.)",
              "Envoie la demande \u2014 le joueur devra l'accepter",
            ]} />

            <p className="font-medium text-slate-800 mt-3">Vue &quot;Mes Joueurs&quot; :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Affiche uniquement les joueurs avec un mandat actif</li>
              <li>Pour chaque joueur : nom, position, &acirc;ge, club actuel, nationalit&eacute;</li>
              <li>Boutons rapides : &quot;Voir profil&quot; et &quot;Soumettre&quot; (envoyer &agrave; un club)</li>
            </ul>

            <p className="font-medium text-slate-800 mt-3">Vue &quot;Tous les Mandats&quot; :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Mandats group&eacute;s par statut : En attente, Actif, Expir&eacute;, R&eacute;sili&eacute;, Refus&eacute;</li>
              <li>D&eacute;tails de chaque mandat : dates, conditions, joueur concern&eacute;</li>
              <li>Possibilit&eacute; de r&eacute;silier un mandat actif</li>
            </ul>

            <InfoCard title="Statistiques">
              4 compteurs en haut de page : joueurs actifs, mandats en attente, mandats actifs, total mandats.
            </InfoCard>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Soumissions */}
      <AccordionItem value="submissions" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Send} color="bg-teal-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Soumissions</p>
              <p className="text-xs text-slate-500 font-normal">Proposer des joueurs aux clubs</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Les soumissions te permettent de proposer un de tes joueurs sous mandat &agrave; un club. Le profil complet du joueur (avec ses stats et son parcours) est automatiquement joint.</p>

            <p className="font-medium text-slate-800 mt-3">Soumettre un joueur :</p>
            <StepList steps={[
              "Va dans \"Soumissions\" depuis la sidebar",
              "Clique sur \"Nouvelle soumission\"",
              "S\u00e9lectionne le joueur parmi tes mandats actifs",
              "Choisis le club destinataire",
              "R\u00e9dige un message de pr\u00e9sentation pour accompagner la soumission",
              "Envoie \u2014 le club recevra la soumission avec un snapshot complet du profil joueur",
            ]} />

            <p className="font-medium text-slate-800 mt-3">Suivi des soumissions :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li><Badge variant="outline" className="text-xs">Soumise</Badge> Envoy&eacute;e au club</li>
              <li><Badge variant="outline" className="text-xs">En cours d&apos;examen</Badge> Le club &eacute;tudie le profil</li>
              <li><Badge variant="outline" className="text-xs">Shortlist&eacute;</Badge> Le joueur int&eacute;resse le club</li>
              <li><Badge variant="outline" className="text-xs">Essai</Badge> P&eacute;riode d&apos;essai propos&eacute;e</li>
              <li><Badge variant="outline" className="text-xs">Accept&eacute; / Sign&eacute;</Badge> Succ&egrave;s !</li>
              <li><Badge variant="outline" className="text-xs">Refus&eacute;</Badge> Non retenu</li>
            </ul>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Annonces Club */}
      <AccordionItem value="opportunities" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Target} color="bg-emerald-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Annonces Club</p>
              <p className="text-xs text-slate-500 font-normal">Consulter les offres et soumettre des joueurs</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Les annonces sont les offres publi&eacute;es par les clubs. En tant qu&apos;agent, tu peux les consulter et soumettre un de tes joueurs directement depuis l&apos;annonce.</p>

            <p className="font-medium text-slate-800 mt-3">Comment &ccedil;a marche :</p>
            <StepList steps={[
              "Va dans \"Annonces Club\" depuis la sidebar",
              "Parcours les annonces disponibles (filtre par position, recherche, tri)",
              "Les annonces non consult\u00e9es apparaissent verrouill\u00e9es \u2014 leur consultation co\u00fbte des cr\u00e9dits",
              "Clique sur \"Consulter\" pour d\u00e9bloquer les d\u00e9tails complets (titre, club, description, salaire, exigences)",
              "Depuis une annonce consult\u00e9e, clique sur \"Soumettre un joueur\" pour proposer un de tes joueurs",
            ]} />

            <InfoCard title="Co&ucirc;t en cr&eacute;dits">
              Consulter une annonce co&ucirc;te des cr&eacute;dits. Le nombre de cr&eacute;dits requis est affich&eacute; sur le badge de chaque annonce verrouill&eacute;e. Une fois consult&eacute;e, l&apos;annonce reste accessible.
            </InfoCard>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Rapports */}
      <AccordionItem value="reports" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={FileText} color="bg-cyan-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Rapports</p>
              <p className="text-xs text-slate-500 font-normal">Cr&eacute;er des rapports sur tes joueurs</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Les rapports permettent de documenter les performances de tes joueurs. Tu peux les partager avec des clubs ou les joindre &agrave; des soumissions.</p>

            <p className="font-medium text-slate-800 mt-3">Cr&eacute;er un rapport :</p>
            <StepList steps={[
              "Va dans \"Rapports\" depuis la sidebar",
              "Clique sur \"Cr\u00e9er un rapport\"",
              "Donne un titre, s\u00e9lectionne le type d'auteur et le joueur concern\u00e9 (parmi tes mandats actifs)",
              "Le rapport est cr\u00e9\u00e9 en brouillon",
              "Ajoute des sections et du contenu en \u00e9ditant le rapport",
              "Partage-le via un lien ou int\u00e8gre-le \u00e0 une soumission",
            ]} />
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Assistant IA */}
      <AccordionItem value="ai" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={MessageSquare} color="bg-violet-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Assistant IA</p>
              <p className="text-xs text-slate-500 font-normal">Un assistant intelligent pour t&apos;aider</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> L&apos;assistant IA est un outil conversationnel qui t&apos;aide &agrave; optimiser ton travail : g&eacute;n&eacute;rer des shortlists, trouver des opportunit&eacute;s, pr&eacute;parer des soumissions ou r&eacute;diger des messages.</p>

            <p className="font-medium text-slate-800 mt-3">Comment l&apos;utiliser :</p>
            <StepList steps={[
              "Acc\u00e8de \u00e0 l'assistant depuis la sidebar",
              "Choisis une suggestion rapide ou tape ton propre message",
              "L'assistant analyse ta demande et te propose une r\u00e9ponse ou une action",
              "Si une action est propos\u00e9e (ex: soumettre un joueur), une fen\u00eatre de confirmation appara\u00eet",
              "Confirme ou annule l'action propos\u00e9e",
            ]} />

            <InfoCard title="Suggestions rapides">
              <ul className="list-disc list-inside space-y-0.5">
                <li>G&eacute;n&eacute;rer une shortlist de joueurs</li>
                <li>Trouver des opportunit&eacute;s pour mes joueurs</li>
                <li>Pr&eacute;parer une soumission</li>
                <li>R&eacute;diger un message de relance</li>
              </ul>
            </InfoCard>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Recherche, Messages, Notifications, Cr&eacute;dits, Param&egrave;tres */}
      <AccordionItem value="other" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Settings} color="bg-slate-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Recherche, Messages, Notifications, Cr&eacute;dits et Param&egrave;tres</p>
              <p className="text-xs text-slate-500 font-normal">Fonctionnalit&eacute;s communes</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p>Ces fonctionnalit&eacute;s sont identiques &agrave; celles du profil Joueur :</p>
            <ul className="list-disc list-inside space-y-2 ml-1 mt-2">
              <li><strong>Recherche</strong> : 3 onglets (Annonces, Joueurs, Clubs) avec filtres avanc&eacute;s</li>
              <li><strong>Messages</strong> : messagerie centralis&eacute;e avec les joueurs et clubs</li>
              <li><strong>Notifications</strong> : alertes en temps r&eacute;el (mandats, soumissions, interactions)</li>
              <li><strong>Cr&eacute;dits</strong> : portefeuille, recharge, abonnement, retraits et historique</li>
              <li><strong>Param&egrave;tres</strong> : email, mot de passe, suppression de compte</li>
            </ul>
          </DocSection>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

// ─── CLUB ──────────────────────────────────────────────────────────

function ClubDoc() {
  return (
    <Accordion type="multiple" className="space-y-2">
      {/* Onboarding Club */}
      <AccordionItem value="onboarding" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={UserPlus} color="bg-emerald-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Inscription et Onboarding</p>
              <p className="text-xs text-slate-500 font-normal">Cr&eacute;er et faire valider son club</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> L&apos;onboarding club est le processus d&apos;inscription complet qui permet de cr&eacute;er ton club sur la plateforme. Il comprend 4 &eacute;tapes de v&eacute;rification avant activation.</p>

            <p className="font-medium text-slate-800 mt-3">Les 4 &eacute;tapes :</p>

            <div className="space-y-3 mt-2">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-medium text-slate-800">Etape 1 &mdash; V&eacute;rification du cr&eacute;ateur</p>
                <p className="text-slate-600 mt-1">Entre ton num&eacute;ro de t&eacute;l&eacute;phone et valide le code OTP re&ccedil;u par SMS. Cette &eacute;tape confirme ton identit&eacute;.</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-medium text-slate-800">Etape 2 &mdash; Informations du club</p>
                <p className="text-slate-600 mt-1">Renseigne les informations de ton club :</p>
                <ul className="list-disc list-inside text-slate-600 mt-1 space-y-0.5">
                  <li>Nom du club, pays, ville</li>
                  <li>Type (Professionnel / Amateur / Acad&eacute;mie)</li>
                  <li>Forme juridique (SA, SARL, Association)</li>
                  <li>Num&eacute;ro d&apos;immatriculation, f&eacute;d&eacute;ration</li>
                  <li>Email officiel, t&eacute;l&eacute;phone, adresse</li>
                </ul>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-medium text-slate-800">Etape 3 &mdash; Documents KYC</p>
                <p className="text-slate-600 mt-1">Upload au minimum 3 documents justificatifs :</p>
                <ul className="list-disc list-inside text-slate-600 mt-1 space-y-0.5">
                  <li>Pi&egrave;ce d&apos;identit&eacute; du cr&eacute;ateur</li>
                  <li>Statuts du club</li>
                  <li>Preuve d&apos;immatriculation ou affiliation &agrave; la f&eacute;d&eacute;ration</li>
                </ul>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-medium text-slate-800">Etape 4 &mdash; Soumission</p>
                <p className="text-slate-600 mt-1">V&eacute;rifie le r&eacute;capitulatif de tes informations et documents, puis clique sur &quot;Soumettre&quot;. Ton dossier passe en revue par l&apos;&eacute;quipe Profoot Profile (24 &agrave; 48h).</p>
              </div>
            </div>

            <InfoCard title="Apr&egrave;s la soumission">
              Tu re&ccedil;ois un email de confirmation. Un administrateur examine ton dossier et l&apos;approuve ou le refuse (avec motif). Une fois approuv&eacute;, tu acc&egrave;des &agrave; toutes les fonctionnalit&eacute;s.
            </InfoCard>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Dashboard */}
      <AccordionItem value="dashboard" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={LayoutDashboard} color="bg-blue-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Tableau de bord</p>
              <p className="text-xs text-slate-500 font-normal">Vue d&apos;ensemble du club</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Le tableau de bord est la page d&apos;accueil de ton club. Il donne acc&egrave;s au feed d&apos;activit&eacute; et aux suggestions personnalis&eacute;es.</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Consulte les publications de la communaut&eacute;</li>
              <li>Publie du contenu au nom du club</li>
              <li>D&eacute;couvre des profils de joueurs et agents recommand&eacute;s</li>
            </ul>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Profil Club */}
      <AccordionItem value="profile" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Building2} color="bg-indigo-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Profil du Club</p>
              <p className="text-xs text-slate-500 font-normal">G&eacute;rer l&apos;identit&eacute; du club</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Le profil club est la page publique de ton club. Il pr&eacute;sente ton identit&eacute;, tes &eacute;quipes et tes publications &agrave; la communaut&eacute;.</p>

            <p className="font-medium text-slate-800 mt-3">Modifier le profil :</p>
            <StepList steps={[
              "Acc\u00e8de \u00e0 \"Profil Club\" depuis la sidebar",
              "Clique sur \"Modifier\"",
              "Met \u00e0 jour les informations : nom, nom court, type de club, pays, ville",
              "Ajoute ou modifie le logo et la photo de couverture",
              "Renseigne la ligue, l'ann\u00e9e de fondation, le site web",
              "R\u00e9dige la biographie du club",
              "Enregistre",
            ]} />

            <InfoCard title="Compl&eacute;tude du profil">
              Un indicateur dans la sidebar affiche le pourcentage de compl&eacute;tude. Les &eacute;l&eacute;ments pris en compte : nom, nom court, type, logo, couverture, pays, ville, bio, ann&eacute;e de fondation.
            </InfoCard>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Equipes & Staff */}
      <AccordionItem value="teams" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Users} color="bg-purple-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Equipes et Staff</p>
              <p className="text-xs text-slate-500 font-normal">Organiser tes &eacute;quipes, joueurs et encadrement</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Cette section permet de structurer ton club en cr&eacute;ant des &eacute;quipes (pro, amateur, acad&eacute;mie) et d&apos;y rattacher joueurs et membres du staff.</p>

            <p className="font-medium text-slate-800 mt-3">Cr&eacute;er une &eacute;quipe :</p>
            <StepList steps={[
              "Va dans \"\u00c9quipes & Staff\" depuis la sidebar",
              "Clique sur \"Cr\u00e9er une \u00e9quipe\"",
              "Choisis le nom, le niveau (Pro / Amateur / Acad\u00e9mie) et la division",
              "Pour les acad\u00e9mies en France : s\u00e9lectionne aussi la cat\u00e9gorie et la comp\u00e9tition",
              "Valide la cr\u00e9ation",
            ]} />

            <p className="font-medium text-slate-800 mt-3">G&eacute;rer une &eacute;quipe :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li><strong>Ajouter un joueur</strong> : recherche par nom dans la base de donn&eacute;es, puis rattache-le &agrave; l&apos;&eacute;quipe</li>
              <li><strong>Ajouter un membre du staff</strong> : renseigne son nom, r&ocirc;le et email</li>
              <li><strong>Retirer</strong> un joueur ou un membre du staff</li>
              <li><strong>Supprimer</strong> une &eacute;quipe enti&egrave;re (apr&egrave;s confirmation)</li>
            </ul>

            <InfoCard title="Pr&eacute;requis">
              Tu dois avoir au moins une &eacute;quipe pour pouvoir cr&eacute;er des annonces.
            </InfoCard>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Membres */}
      <AccordionItem value="members" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={KeyRound} color="bg-rose-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Administration des Membres</p>
              <p className="text-xs text-slate-500 font-normal">Inviter et g&eacute;rer les acc&egrave;s au club</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> L&apos;administration des membres permet au propri&eacute;taire du club d&apos;inviter des collaborateurs et de g&eacute;rer leurs r&ocirc;les et acc&egrave;s.</p>

            <p className="font-medium text-slate-800 mt-3">Inviter un membre :</p>
            <StepList steps={[
              "Acc\u00e8de \u00e0 la section \"Membres\"",
              "Clique sur \"Inviter un membre\"",
              "Entre l'adresse email et s\u00e9lectionne le r\u00f4le (Propri\u00e9taire, Admin, Staff)",
              "Un email d'invitation est envoy\u00e9 avec un lien unique",
              "L'invit\u00e9 clique sur le lien, cr\u00e9e un compte si n\u00e9cessaire, et rejoint le club",
            ]} />

            <p className="font-medium text-slate-800 mt-3">G&eacute;rer les membres :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li><strong>Changer le r&ocirc;le</strong> : seul le propri&eacute;taire peut modifier les r&ocirc;les</li>
              <li><strong>Retirer un membre</strong> : le propri&eacute;taire ou un admin peut retirer un membre</li>
              <li><strong>Renvoyer l&apos;invitation</strong> : relancer un email d&apos;invitation non accept&eacute;</li>
            </ul>

            <InfoCard title="R&ocirc;les">
              <ul className="list-disc list-inside space-y-0.5">
                <li><strong>Propri&eacute;taire</strong> : acc&egrave;s total, gestion des r&ocirc;les et membres</li>
                <li><strong>Admin</strong> : gestion courante, peut inviter et retirer des membres</li>
                <li><strong>Staff</strong> : acc&egrave;s limit&eacute; (dashboard, messages, profil)</li>
              </ul>
            </InfoCard>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Annonces */}
      <AccordionItem value="listings" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={ClipboardList} color="bg-amber-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Annonces</p>
              <p className="text-xs text-slate-500 font-normal">Publier des offres pour recruter des joueurs</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Les annonces te permettent de publier des offres pour recruter des joueurs. Les joueurs et agents peuvent les consulter et y r&eacute;pondre.</p>

            <p className="font-medium text-slate-800 mt-3">Cr&eacute;er une annonce :</p>
            <StepList steps={[
              "Va dans \"Annonces\" depuis la sidebar",
              "Clique sur \"Nouvelle annonce\" (n\u00e9cessite au moins une \u00e9quipe)",
              "S\u00e9lectionne l'\u00e9quipe concern\u00e9e",
              "Renseigne : titre, description, position recherch\u00e9e (GK/DF/MF/FW)",
              "Optionnel : fourchette d'\u00e2ge, fourchette salariale, type de contrat, date de d\u00e9but",
              "L'annonce est cr\u00e9\u00e9e en brouillon",
            ]} />

            <p className="font-medium text-slate-800 mt-3">G&eacute;rer les annonces :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li><strong>Publier</strong> : rend l&apos;annonce visible aux joueurs et agents</li>
              <li><strong>Modifier</strong> : met &agrave; jour le contenu de l&apos;annonce</li>
              <li><strong>Fermer</strong> : retire l&apos;annonce des r&eacute;sultats (les candidatures existantes restent)</li>
            </ul>

            <InfoCard title="Compteurs">
              Chaque annonce affiche le nombre de candidatures directes et de soumissions d&apos;agents re&ccedil;ues.
            </InfoCard>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Candidatures */}
      <AccordionItem value="applications" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={ClipboardList} color="bg-blue-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Candidatures re&ccedil;ues</p>
              <p className="text-xs text-slate-500 font-normal">G&eacute;rer le pipeline de recrutement</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Cette section centralise toutes les candidatures de joueurs qui ont postul&eacute; &agrave; tes annonces. Tu peux les &eacute;valuer et faire progresser chaque candidature dans le pipeline.</p>

            <p className="font-medium text-slate-800 mt-3">Pipeline de recrutement :</p>
            <div className="space-y-1.5 mt-1 ml-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700 text-xs">Nouvelle</Badge>
                <span>&rarr; Le joueur vient de postuler</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-700 text-xs">En cours</Badge>
                <span>&rarr; Tu examines le profil</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-100 text-purple-700 text-xs">Shortlist&eacute;</Badge>
                <span>&rarr; Le joueur t&apos;int&eacute;resse</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-100 text-orange-700 text-xs">Essai</Badge>
                <span>&rarr; P&eacute;riode d&apos;essai propos&eacute;e</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700 text-xs">Accept&eacute; / Sign&eacute;</Badge>
                <span>&rarr; Recrutement finalis&eacute;</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-100 text-red-700 text-xs">Refus&eacute;</Badge>
                <span>&rarr; Candidature non retenue</span>
              </div>
            </div>

            <p className="font-medium text-slate-800 mt-3">Pour chaque candidature :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Consulte le profil du joueur (position, &acirc;ge, nationalit&eacute;, club actuel)</li>
              <li>Lis la lettre de motivation</li>
              <li>Change le statut pour faire avancer la candidature</li>
            </ul>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Soumissions agents */}
      <AccordionItem value="submissions" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Send} color="bg-teal-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Soumissions d&apos;agents</p>
              <p className="text-xs text-slate-500 font-normal">Propositions de joueurs par les agents</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Les soumissions sont des propositions envoy&eacute;es par des agents sportifs qui te recommandent un de leurs joueurs. Chaque soumission inclut un profil complet du joueur.</p>

            <p className="font-medium text-slate-800 mt-3">Ce que tu re&ccedil;ois :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Le profil complet du joueur (position, nationalit&eacute;, stats, parcours)</li>
              <li>Les informations de l&apos;agent (nom, agence, licence)</li>
              <li>Le message de pr&eacute;sentation de l&apos;agent</li>
              <li>Le parcours r&eacute;cent du joueur (clubs, saisons, statistiques)</li>
            </ul>

            <p className="font-medium text-slate-800 mt-3">G&eacute;rer les soumissions :</p>
            <p>Le m&ecirc;me pipeline que les candidatures s&apos;applique : tu peux faire progresser chaque soumission du statut &quot;Soumise&quot; jusqu&apos;&agrave; &quot;Sign&eacute;&quot; ou &quot;Refus&eacute;&quot;.</p>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Onboarding Staff */}
      <AccordionItem value="staff-onboarding" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={UserPlus} color="bg-cyan-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Onboarding Staff</p>
              <p className="text-xs text-slate-500 font-normal">Int&eacute;gration des membres du staff invit&eacute;s</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Lorsqu&apos;un membre du staff est invit&eacute; et accepte l&apos;invitation, il doit compl&eacute;ter un onboarding en 2 &eacute;tapes avant d&apos;acc&eacute;der au club.</p>

            <p className="font-medium text-slate-800 mt-3">Les &eacute;tapes :</p>
            <div className="space-y-2 mt-2">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-medium text-slate-800">Etape 1 &mdash; Profil personnel</p>
                <p className="text-slate-600 mt-1">Renseigne ton pr&eacute;nom, nom, titre/fonction, biographie et t&eacute;l&eacute;phone.</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-medium text-slate-800">Etape 2 &mdash; Documents KYC</p>
                <p className="text-slate-600 mt-1">Upload au minimum 2 documents : pi&egrave;ce d&apos;identit&eacute; et preuve d&apos;adresse.</p>
              </div>
            </div>

            <InfoCard title="Important">
              Tant que l&apos;onboarding n&apos;est pas termin&eacute;, le membre du staff est automatiquement redirig&eacute; vers cette page.
            </InfoCard>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Autres */}
      <AccordionItem value="other" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Settings} color="bg-slate-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Recherche, Messages, Cr&eacute;dits et Param&egrave;tres</p>
              <p className="text-xs text-slate-500 font-normal">Fonctionnalit&eacute;s communes</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p>Ces fonctionnalit&eacute;s sont communes &agrave; tous les profils :</p>
            <ul className="list-disc list-inside space-y-2 ml-1 mt-2">
              <li><strong>Recherche</strong> : trouver des joueurs par nom, position ou nationalit&eacute;</li>
              <li><strong>Messages</strong> : communiquer avec les joueurs et agents</li>
              <li><strong>Cr&eacute;dits</strong> : portefeuille, recharge, abonnement et historique des transactions</li>
              <li><strong>Param&egrave;tres</strong> : modifier l&apos;email, le mot de passe, ou supprimer le compte (supprime le club et toutes les donn&eacute;es associ&eacute;es)</li>
            </ul>
          </DocSection>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

// ─── ADMIN ──────────────────────────────────────────────────────────

function AdminDoc() {
  return (
    <Accordion type="multiple" className="space-y-2">
      {/* Dashboard */}
      <AccordionItem value="dashboard" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={LayoutDashboard} color="bg-blue-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Tableau de bord</p>
              <p className="text-xs text-slate-500 font-normal">Vue d&apos;ensemble de la plateforme</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Le tableau de bord admin donne une vue globale de l&apos;activit&eacute; de la plateforme avec les indicateurs cl&eacute;s.</p>

            <p className="font-medium text-slate-800 mt-3">Ce que tu y trouves :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li><strong>KPIs principaux</strong> : total utilisateurs, nouveaux inscrits (7j), posts actifs, listings actifs</li>
              <li><strong>R&eacute;partition par r&ocirc;le</strong> : nombre de joueurs, agents, clubs et admins</li>
              <li><strong>Mod&eacute;ration</strong> : candidatures en attente, soumissions, actions automatis&eacute;es</li>
              <li><strong>Activit&eacute; r&eacute;cente</strong> : derniers inscrits, derniers posts, actions AI r&eacute;centes</li>
            </ul>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Utilisateurs */}
      <AccordionItem value="users" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Users} color="bg-indigo-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Utilisateurs</p>
              <p className="text-xs text-slate-500 font-normal">G&eacute;rer tous les comptes de la plateforme</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Cette section permet de consulter, rechercher et g&eacute;rer tous les utilisateurs de la plateforme.</p>

            <p className="font-medium text-slate-800 mt-3">Liste des utilisateurs :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Tableau avec nom, email, r&ocirc;le, statut de v&eacute;rification, nombre de posts, date d&apos;inscription</li>
              <li>Filtres par r&ocirc;le (Joueurs, Agents, Clubs, Admins) et recherche par nom/email</li>
              <li>Pagination (20 utilisateurs par page)</li>
            </ul>

            <p className="font-medium text-slate-800 mt-3">Fiche utilisateur d&eacute;taill&eacute;e :</p>
            <p>En cliquant sur un utilisateur, tu acc&egrave;des &agrave; sa fiche compl&egrave;te avec plusieurs onglets :</p>
            <ul className="list-disc list-inside space-y-1 ml-1 mt-1">
              <li><strong>Profil</strong> : toutes les informations du profil, modifiables en mode &eacute;dition</li>
              <li><strong>Carri&egrave;re</strong> (joueurs) : historique des clubs et statistiques</li>
              <li><strong>Posts</strong> : publications avec possibilit&eacute; de suppression</li>
              <li><strong>Messages</strong> : conversations de l&apos;utilisateur</li>
              <li><strong>Candidatures / Mandats / Annonces</strong> : selon le r&ocirc;le</li>
              <li><strong>Documents KYC</strong> : certificats et pi&egrave;ces justificatives</li>
              <li><strong>Membres</strong> (clubs) : staff du club</li>
              <li><strong>Cr&eacute;dits</strong> : portefeuilles, transactions, abonnement, connexions Stripe</li>
              <li><strong>Activit&eacute;</strong> : logs d&apos;audit, emails envoy&eacute;s, notifications</li>
            </ul>

            <p className="font-medium text-slate-800 mt-3">Actions disponibles :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li><strong>Editer</strong> le profil et la carri&egrave;re</li>
              <li><strong>V&eacute;rifier l&apos;email</strong> manuellement</li>
              <li><strong>Envoyer un message</strong> directement</li>
              <li><strong>Supprimer</strong> l&apos;utilisateur (apr&egrave;s confirmation)</li>
            </ul>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Clubs */}
      <AccordionItem value="clubs" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Building2} color="bg-green-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Clubs</p>
              <p className="text-xs text-slate-500 font-normal">Base de donn&eacute;es des clubs et import externe</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> G&eacute;rer la base de donn&eacute;es des clubs de la plateforme et importer des clubs depuis des sources externes.</p>

            <p className="font-medium text-slate-800 mt-3">Onglet &quot;Base de donn&eacute;es&quot; :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Liste de tous les clubs avec logo, nom, pays, ligue, nombre de joueurs</li>
              <li>Modifier les informations d&apos;un club (nom, pays, ligue, logo, stade...)</li>
              <li>Voir les joueurs rattach&eacute;s et les dissocier si n&eacute;cessaire</li>
              <li>Synchroniser les joueurs depuis TheSportsDB</li>
              <li>Supprimer un club</li>
            </ul>

            <p className="font-medium text-slate-800 mt-3">Onglet &quot;Recherche externe&quot; :</p>
            <StepList steps={[
              "Tape le nom d'un club dans la barre de recherche",
              "Les r\u00e9sultats proviennent de TheSportsDB (base mondiale)",
              "Clique sur \"Importer\" pour ajouter un club \u00e0 ta base",
              "Ou \"Mettre \u00e0 jour\" si le club existe d\u00e9j\u00e0 pour rafra\u00eechir ses donn\u00e9es",
            ]} />
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Clubs &agrave; valider */}
      <AccordionItem value="clubs-pending" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Clock} color="bg-amber-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Clubs &agrave; valider</p>
              <p className="text-xs text-slate-500 font-normal">Examiner et approuver les inscriptions</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Quand un club termine son onboarding et soumet son dossier, il arrive ici pour &ecirc;tre examin&eacute; par un administrateur.</p>

            <p className="font-medium text-slate-800 mt-3">Examiner un club :</p>
            <StepList steps={[
              "Filtre par statut (En attente, Actif, Refus\u00e9, Brouillon)",
              "Clique sur \"Examiner\" sur un club en attente",
              "V\u00e9rifie les informations du cr\u00e9ateur (identit\u00e9, email v\u00e9rifi\u00e9, OTP valid\u00e9)",
              "V\u00e9rifie les informations du club (nom, type, localisation, immatriculation)",
              "Examine les documents KYC upload\u00e9s (pi\u00e8ce d'identit\u00e9, statuts, immatriculation)",
              "D\u00e9cide : Approuver (le club passe en ACTIF) ou Refuser (avec un motif obligatoire)",
            ]} />

            <InfoCard title="Notification automatique">
              Le cr&eacute;ateur du club re&ccedil;oit un email et une notification &agrave; chaque changement de statut.
            </InfoCard>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* R&eacute;cup&eacute;rations */}
      <AccordionItem value="recoveries" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={KeyRound} color="bg-rose-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">R&eacute;cup&eacute;rations</p>
              <p className="text-xs text-slate-500 font-normal">Demandes de r&eacute;cup&eacute;ration de profils</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Quand un utilisateur demande &agrave; r&eacute;cup&eacute;rer un profil existant (joueur, agent ou club), la demande arrive ici pour validation.</p>

            <p className="font-medium text-slate-800 mt-3">Traiter une demande :</p>
            <StepList steps={[
              "Consulte la liste des demandes (filtre par statut et type)",
              "Clique sur \"Voir d\u00e9tails\" pour examiner la demande",
              "V\u00e9rifie l'identit\u00e9 du demandeur et le profil demand\u00e9",
              "Lis le message de justification",
              "Approuve ou rejette la demande (avec une note admin optionnelle)",
            ]} />
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Contenu */}
      <AccordionItem value="content" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={FileText} color="bg-cyan-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Contenu</p>
              <p className="text-xs text-slate-500 font-normal">Mod&eacute;ration des posts et commentaires</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> La mod&eacute;ration de contenu permet de surveiller et supprimer les publications et commentaires inappropri&eacute;s.</p>

            <p className="font-medium text-slate-800 mt-3">Onglet &quot;Posts&quot; :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Liste de tous les posts : auteur, contenu, engagement (likes, commentaires, partages), date</li>
              <li>Recherche par contenu</li>
              <li>Supprimer un post (apr&egrave;s confirmation)</li>
            </ul>

            <p className="font-medium text-slate-800 mt-3">Onglet &quot;Commentaires&quot; :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Liste de tous les commentaires : auteur, contenu, post associ&eacute;, date</li>
              <li>Supprimer un commentaire (apr&egrave;s confirmation)</li>
            </ul>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Listings */}
      <AccordionItem value="listings" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Briefcase} color="bg-purple-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Listings</p>
              <p className="text-xs text-slate-500 font-normal">G&eacute;rer les annonces de la plateforme</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Vue d&apos;ensemble de toutes les annonces publi&eacute;es par les clubs, avec possibilit&eacute; de changer leur statut.</p>

            <p className="font-medium text-slate-800 mt-3">Ce que tu y vois :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Compteurs : total, publi&eacute;es, brouillons, ferm&eacute;es</li>
              <li>Tableau : titre, position, club, pays, salaire, candidatures re&ccedil;ues, statut, date</li>
              <li>Filtre par statut</li>
            </ul>

            <p className="font-medium text-slate-800 mt-3">Actions :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Changer le statut d&apos;une annonce (Brouillon / Publi&eacute;e / Ferm&eacute;e) via le dropdown</li>
              <li>Voir le d&eacute;tail d&apos;une annonce</li>
            </ul>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Candidatures */}
      <AccordionItem value="applications" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={ClipboardList} color="bg-teal-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Candidatures</p>
              <p className="text-xs text-slate-500 font-normal">Suivi global des candidatures et soumissions</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Vue globale de toutes les candidatures directes (joueurs) et soumissions (agents) de la plateforme.</p>

            <p className="font-medium text-slate-800 mt-3">Onglet &quot;Candidatures directes&quot; :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Joueur, annonce, statut, date</li>
              <li>Possibilit&eacute; de changer le statut directement dans le tableau</li>
            </ul>

            <p className="font-medium text-slate-800 mt-3">Onglet &quot;Soumissions agents&quot; :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Agent, joueur propos&eacute;, club destinataire, statut, date</li>
              <li>Possibilit&eacute; de changer le statut directement dans le tableau</li>
            </ul>

            <p className="font-medium text-slate-800 mt-3">Statuts disponibles :</p>
            <p>Brouillon &rarr; Soumise &rarr; En cours &rarr; Pr&eacute;s&eacute;lection &rarr; Essai &rarr; Accept&eacute;e / Refus&eacute;e &rarr; Sign&eacute;e</p>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Cr&eacute;dits */}
      <AccordionItem value="credits" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Coins} color="bg-yellow-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Cr&eacute;dits</p>
              <p className="text-xs text-slate-500 font-normal">Transactions et portefeuilles</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Vue compl&egrave;te de toutes les transactions de cr&eacute;dits sur la plateforme. Permet de surveiller les flux financiers.</p>

            <p className="font-medium text-slate-800 mt-3">Statistiques affich&eacute;es :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Solde total en circulation</li>
              <li>Total cr&eacute;dits entrants (+) et sortants (-)</li>
              <li>Expirations</li>
              <li>R&eacute;partition par type de portefeuille (abonnement, achet&eacute;s, gagn&eacute;s, bonus)</li>
            </ul>

            <p className="font-medium text-slate-800 mt-3">Filtres avanc&eacute;s :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Recherche par nom, email ou description</li>
              <li>Filtre par type de portefeuille</li>
              <li>Filtre par type de transaction (allocation, achat, bonus, follow, consultation annonce ou profil, retrait, expiration, r&eacute;compense vid&eacute;o <code>CREDIT_VIDEO_UPLOAD_REWARD</code>, sinks gamification <code>DEBIT_VIDEO_BOOST</code>, <code>DEBIT_PROFILE_HIGHLIGHT</code>, etc.)</li>
              <li>Filtre par date</li>
            </ul>

            <p className="font-medium text-slate-800 mt-3">Tableau des transactions :</p>
            <p>Chaque transaction affiche : utilisateur, type, portefeuille, montant, solde avant/apr&egrave;s, statut, description et date. Clique sur une ligne pour acc&eacute;der au profil de l&apos;utilisateur.</p>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Audit */}
      <AccordionItem value="audit" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Activity} color="bg-orange-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Audit AI</p>
              <p className="text-xs text-slate-500 font-normal">Journal des actions et traces IA</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Le journal d&apos;audit enregistre toutes les actions effectu&eacute;es sur la plateforme, avec un focus sp&eacute;cial sur les actions g&eacute;n&eacute;r&eacute;es par l&apos;IA.</p>

            <p className="font-medium text-slate-800 mt-3">Fonctionnalit&eacute;s :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Filtrer pour voir uniquement les actions AI</li>
              <li>Filtrer par type d&apos;action (top 15 actions les plus fr&eacute;quentes)</li>
              <li>Chaque entr&eacute;e affiche : utilisateur, action, cible, date</li>
              <li>Clique sur &quot;D&eacute;tails&quot; pour voir les m&eacute;tadonn&eacute;es compl&egrave;tes (donn&eacute;es JSON, IP, user agent)</li>
            </ul>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Rapports */}
      <AccordionItem value="reports" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={BarChart3} color="bg-slate-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Rapports</p>
              <p className="text-xs text-slate-500 font-normal">Statistiques globales de la plateforme</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Les rapports fournissent des statistiques d&eacute;taill&eacute;es sur l&apos;ensemble de la plateforme pour suivre la croissance et l&apos;activit&eacute;.</p>

            <p className="font-medium text-slate-800 mt-3">Sections :</p>
            <ul className="list-disc list-inside space-y-2 ml-1">
              <li><strong>Utilisateurs</strong> : total, r&eacute;partition par r&ocirc;le (%), nouveaux inscrits (7j et 30j)</li>
              <li><strong>Contenu</strong> : total posts, publications r&eacute;centes, commentaires, moyenne par post/jour</li>
              <li><strong>Activit&eacute; commerciale</strong> : annonces totales et actives, candidatures, soumissions, taux de candidature par annonce, taux de compl&eacute;tion</li>
              <li><strong>Activit&eacute; plateforme</strong> : total actions enregistr&eacute;es, moyenne quotidienne</li>
            </ul>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Param&egrave;tres */}
      <AccordionItem value="settings" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Settings} color="bg-slate-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Param&egrave;tres</p>
              <p className="text-xs text-slate-500 font-normal">Configuration de la plateforme</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>A quoi &ccedil;a sert ?</strong> Les param&egrave;tres permettent de configurer le comportement g&eacute;n&eacute;ral de la plateforme.</p>

            <p className="font-medium text-slate-800 mt-3">Sections :</p>
            <ul className="list-disc list-inside space-y-2 ml-1">
              <li><strong>Param&egrave;tres g&eacute;n&eacute;raux</strong> : mode maintenance, inscriptions ouvertes</li>
              <li><strong>Notifications admin</strong> : activer/d&eacute;sactiver les alertes (nouvel utilisateur, v&eacute;rification, signalement)</li>
              <li><strong>S&eacute;curit&eacute;</strong> : limite d&apos;actions IA par heure, validation 2 &eacute;tapes pour les actions IA</li>
              <li><strong>Base de donn&eacute;es</strong> : statut de connexion, provider utilis&eacute;</li>
            </ul>
          </DocSection>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

// ─── CRÉDITS (SYSTÈME COMPLET) ──────────────────────────────────────

function CreditsDoc() {
  return (
    <Accordion type="multiple" className="space-y-2">
      {/* Architecture des Wallets */}
      <AccordionItem value="wallets" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Wallet} color="bg-yellow-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Architecture des Wallets</p>
              <p className="text-xs text-slate-500 font-normal">Les 4 portefeuilles et l&apos;ordre de d&eacute;bit</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p>Chaque utilisateur poss&egrave;de <strong>4 portefeuilles</strong> distincts :</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="font-semibold text-blue-800 text-xs">SUBSCRIPTION</p>
                <p className="text-xs text-blue-600 mt-0.5">Cr&eacute;dits allou&eacute;s mensuellement par l&apos;abonnement</p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                <p className="font-semibold text-green-800 text-xs">PURCHASED</p>
                <p className="text-xs text-green-600 mt-0.5">Cr&eacute;dits achet&eacute;s &agrave; l&apos;unit&eacute; (1&euro; = 1 cr&eacute;dit)</p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                <p className="font-semibold text-amber-800 text-xs">EARNED</p>
                <p className="text-xs text-amber-600 mt-0.5">Cr&eacute;dits gagn&eacute;s (follows, consultations, signatures)</p>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                <p className="font-semibold text-purple-800 text-xs">BONUS</p>
                <p className="text-xs text-purple-600 mt-0.5">Cr&eacute;dits promotionnels : bonus admin <strong>et</strong> r&eacute;compenses gamification (uploads vid&eacute;o foot qualifi&eacute;s)</p>
              </div>
            </div>

            <p className="font-medium text-slate-800 mt-4">Ordre de d&eacute;bit (priorit&eacute; haute &rarr; basse) :</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge className="bg-purple-100 text-purple-700">BONUS</Badge>
              <span>&rarr;</span>
              <Badge className="bg-blue-100 text-blue-700">SUBSCRIPTION</Badge>
              <span>&rarr;</span>
              <Badge className="bg-green-100 text-green-700">PURCHASED</Badge>
              <span>&rarr;</span>
              <Badge className="bg-amber-100 text-amber-700">EARNED</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">Cet ordre pr&eacute;serve les cr&eacute;dits EARNED pour le retrait.</p>

            <InfoCard title="S&eacute;curit&eacute; technique">
              <ul className="list-disc list-inside space-y-0.5">
                <li><strong>Optimistic locking</strong> : champ <code>version</code> sur chaque wallet pour &eacute;viter les race conditions</li>
                <li><strong>Cl&eacute;s d&apos;idempotence</strong> : chaque transaction porte un <code>idempotencyKey</code> pour emp&ecirc;cher les doubles d&eacute;bits</li>
              </ul>
            </InfoCard>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Plans d'abonnement */}
      <AccordionItem value="plans" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={CreditCard} color="bg-indigo-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Plans d&apos;abonnement</p>
              <p className="text-xs text-slate-500 font-normal">Les 5 forfaits et leurs avantages</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse mt-1">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left p-2 font-semibold text-slate-700">Plan</th>
                    <th className="text-right p-2 font-semibold text-slate-700">Prix/mois</th>
                    <th className="text-right p-2 font-semibold text-slate-700">Cr&eacute;dits/mois</th>
                    <th className="text-right p-2 font-semibold text-slate-700">Stockage*</th>
                    <th className="text-right p-2 font-semibold text-slate-700">Vid&eacute;os r&eacute;comp./jour**</th>
                    <th className="text-right p-2 font-semibold text-slate-700">Redistribution</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="p-2">FREE</td><td className="p-2 text-right">0&euro;</td><td className="p-2 text-right">0</td><td className="p-2 text-right">500 Mo</td><td className="p-2 text-right">2</td><td className="p-2 text-right">0%</td></tr>
                  <tr className="border-b"><td className="p-2">STARTER</td><td className="p-2 text-right">10&euro;</td><td className="p-2 text-right">10</td><td className="p-2 text-right">5 Go</td><td className="p-2 text-right">5</td><td className="p-2 text-right">25%</td></tr>
                  <tr className="border-b"><td className="p-2">GROWTH</td><td className="p-2 text-right">50&euro;</td><td className="p-2 text-right">50</td><td className="p-2 text-right">15 Go</td><td className="p-2 text-right">8</td><td className="p-2 text-right">30%</td></tr>
                  <tr className="border-b"><td className="p-2">PRO</td><td className="p-2 text-right">200&euro;</td><td className="p-2 text-right">200</td><td className="p-2 text-right">40 Go</td><td className="p-2 text-right">15</td><td className="p-2 text-right">40%</td></tr>
                  <tr><td className="p-2">ELITE</td><td className="p-2 text-right">500&euro;</td><td className="p-2 text-right">500</td><td className="p-2 text-right">100 Go</td><td className="p-2 text-right">20</td><td className="p-2 text-right">50%</td></tr>
                </tbody>
              </table>
            </div>

            <p className="font-medium text-slate-800 mt-4">Statuts d&apos;abonnement :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li><strong>ACTIVE</strong> : abonnement en cours</li>
              <li><strong>CANCELLED</strong> : annul&eacute; (actif jusqu&apos;&agrave; la fin de la p&eacute;riode)</li>
              <li><strong>PAST_DUE</strong> : paiement &eacute;chou&eacute;</li>
              <li><strong>TRIALING</strong> : p&eacute;riode d&apos;essai</li>
            </ul>

            <InfoCard title="Comportement">
              Chaque nouvel utilisateur re&ccedil;oit automatiquement un abonnement FREE. Les cr&eacute;dits mensuels sont allou&eacute;s dans le wallet SUBSCRIPTION via le webhook Stripe <code>invoice.paid</code>.
            </InfoCard>
            <p className="text-xs text-slate-500 mt-2">
              * Quota stockage fichiers joueur (vid&eacute;os type <code>VIDEO</code>) + bonus Go achet&eacute;s en cr&eacute;dits (<code>User.gamificationStorageBonusBytes</code>). ** Nombre maximum de vid&eacute;os pouvant &ecirc;tre <strong>r&eacute;compens&eacute;es en cr&eacute;dits</strong> par jour (anti-spam), d&eacute;fini dans <code>PLAN_CONFIG.maxRewardedUploadsPerDay</code>.
            </p>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Gamification vidéos foot */}
      <AccordionItem value="player-gamification" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Film} color="bg-rose-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Gamification vid&eacute;os foot (joueurs)</p>
              <p className="text-xs text-slate-500 font-normal">Score qualit&eacute;, r&eacute;compenses, sinks, progression, stockage</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p><strong>Objectif.</strong> Encourager les joueurs &agrave; uploader des vid&eacute;os de qualit&eacute; : alimenter l&apos;IA, enrichir le profil et la visibilit&eacute; recruteurs, tout en limitant le spam.</p>

            <p className="font-medium text-slate-800 mt-3">Flux c&ocirc;t&eacute; client</p>
            <StepList steps={[
              "Upload vid\u00e9o en tant que joueur avec type de fichier VIDEO (ex. POST /api/files/upload-proxy) : calcul du hash SHA-256 (contentHash), contr\u00f4le du quota de stockage, incr\u00e9ment de UserStorageUsage.",
              "Finalisation : POST /api/player/gamification/videos/finalize avec fileAssetId et id\u00e9alement durationSeconds, width, height, context (MATCH | TRAINING | UNKNOWN) et/ou skillCategory (extraits match, technique, gardien, etc. ; d\u00e9duit le contexte si absent).",
              "Liste : GET /api/player/gamification/videos \u2014 vid\u00e9os du joueur + pourcentage de compl\u00e9tion du profil vid\u00e9o.",
              "La plateforme calcule un score 0\u2013100 (mock d\u00e9terministe rempla\u00e7able par l'IA), applique les r\u00e8gles d'\u00e9ligibilit\u00e9, cr\u00e9dite le wallet BONUS si AWARDED (CREDIT_VIDEO_UPLOAD_REWARD), met \u00e0 jour XP et niveau de progression.",
              "D\u00e9penses optionnelles : POST /api/player/gamification/spend (idempotencyKey obligatoire) pour les sinks list\u00e9s ci-dessous.",
            ]} />

            <p className="font-medium text-slate-800 mt-3">Mod&egrave;les Prisma (aper&ccedil;u)</p>
            <ul className="list-disc list-inside space-y-1 ml-1 text-xs">
              <li><code>PlayerFootballVideo</code> + <code>PlayerFootballVideoScore</code> : lien utilisateur &harr; <code>FileAsset</code>, statut, cr&eacute;dits accord&eacute;s, d&eacute;tail des points (technique, d&eacute;tection, actions, contexte)</li>
              <li><code>UserStorageUsage</code> : <code>bytesUsed</code> agr&eacute;g&eacute; par joueur</li>
              <li><code>User</code> : <code>playerProgressionLevel</code>, <code>gamificationXp</code>, <code>gamificationStorageBonusBytes</code></li>
              <li><code>FileAsset.contentHash</code> : anti-doublon par contenu pour un m&ecirc;me joueur</li>
            </ul>

            <p className="font-medium text-slate-800 mt-3">R&egrave;gles de r&eacute;compense (r&eacute;sum&eacute;)</p>
            <ul className="list-disc list-inside space-y-1 ml-1 text-xs">
              <li><strong>Rejet</strong> : pas de joueur d&eacute;tect&eacute; (mock), score &lt; 50, vid&eacute;o en doublon (m&ecirc;me <code>contentHash</code>), quota journalier de vid&eacute;os r&eacute;compens&eacute;es atteint selon le plan</li>
              <li><strong>Cr&eacute;dits</strong> : base 2 + palier selon score (0 / 2 / 4 / 6 si score &ge; 50), bonus % selon le niveau de progression (0&ndash;20 %), <strong>plafond 8 cr&eacute;dits</strong> par vid&eacute;o</li>
              <li><strong>XP</strong> : gain &agrave; chaque vid&eacute;o r&eacute;compens&eacute;e (ex. 10 + cr&eacute;dits accord&eacute;s) ; niveaux ROOKIE &rarr; PRO d&eacute;riv&eacute;s de l&apos;XP</li>
            </ul>

            <p className="font-medium text-slate-800 mt-3">Sinks gamification (co&ucirc;ts en cr&eacute;dits)</p>
            <div className="overflow-x-auto mt-1">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left p-2 font-semibold text-slate-700">Action API</th>
                    <th className="text-right p-2 font-semibold text-slate-700">Co&ucirc;t</th>
                    <th className="text-left p-2 font-semibold text-slate-700">Type transaction</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="p-2"><code>VIDEO_BOOST</code></td><td className="p-2 text-right">5</td><td className="p-2"><code>DEBIT_VIDEO_BOOST</code></td></tr>
                  <tr className="border-b"><td className="p-2"><code>PROFILE_HIGHLIGHT</code></td><td className="p-2 text-right">15</td><td className="p-2"><code>DEBIT_PROFILE_HIGHLIGHT</code></td></tr>
                  <tr className="border-b"><td className="p-2"><code>RECRUITER_VIDEO_SEND</code></td><td className="p-2 text-right">20</td><td className="p-2"><code>DEBIT_RECRUITER_VIDEO_SEND</code></td></tr>
                  <tr className="border-b"><td className="p-2"><code>ADVANCED_ANALYSIS</code></td><td className="p-2 text-right">5</td><td className="p-2"><code>DEBIT_ADVANCED_ANALYSIS</code></td></tr>
                  <tr className="border-b"><td className="p-2"><code>FULL_PLAYER_REPORT</code></td><td className="p-2 text-right">10</td><td className="p-2"><code>DEBIT_FULL_PLAYER_REPORT</code></td></tr>
                  <tr className="border-b"><td className="p-2"><code>CLUB_APPLICATION</code></td><td className="p-2 text-right">5</td><td className="p-2"><code>DEBIT_CLUB_APPLICATION</code></td></tr>
                  <tr className="border-b"><td className="p-2"><code>PLAYER_RECOMMENDATION</code></td><td className="p-2 text-right">15</td><td className="p-2"><code>DEBIT_PLAYER_RECOMMENDATION</code></td></tr>
                  <tr className="border-b"><td className="p-2"><code>DIRECT_RECRUITER_ACCESS</code></td><td className="p-2 text-right">25</td><td className="p-2"><code>DEBIT_DIRECT_RECRUITER_ACCESS</code></td></tr>
                  <tr><td className="p-2"><code>STORAGE_GB_1</code></td><td className="p-2 text-right">10</td><td className="p-2"><code>DEBIT_STORAGE_GB_PURCHASE</code> (+1 Go sur <code>gamificationStorageBonusBytes</code>)</td></tr>
                </tbody>
              </table>
            </div>

            <p className="font-medium text-slate-800 mt-3">Code source</p>
            <p className="text-xs text-slate-600"><code>src/lib/gamification/</code> (score mock, quotas, sinks, <code>PlayerGamificationService</code>), extensions <code>PLAN_CONFIG</code> et <code>PROGRESSION_CREDIT_BONUS_PCT</code> dans <code>src/lib/services/credits/types.ts</code>.</p>

            <InfoCard title="Effets produit">
              Les appels <code>spend</code> d&eacute;bitent les cr&eacute;dits et tracent les transactions ; les effets m&eacute;tier concrets (boost d&apos;une vid&eacute;o, envoi recruteur, etc.) doivent &ecirc;tre branch&eacute;s dans les modules concern&eacute;s apr&egrave;s un d&eacute;bit r&eacute;ussi.
            </InfoCard>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Comment gagner des crédits */}
      <AccordionItem value="earning" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={ArrowDownUp} color="bg-emerald-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Comment gagner des cr&eacute;dits</p>
              <p className="text-xs text-slate-500 font-normal">Abonnement, achat, follows, consultations, signatures, bonus, vid&eacute;os foot</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-slate-800">1. Abonnement (CREDIT_SUBSCRIPTION)</p>
                <p>Allocation mensuelle automatique dans le wallet <strong>SUBSCRIPTION</strong> &agrave; chaque renouvellement via Stripe.</p>
              </div>

              <div>
                <p className="font-medium text-slate-800">2. Achat ponctuel / Top-up (CREDIT_PURCHASE)</p>
                <p>Via Stripe Checkout. Min : <strong>1 cr&eacute;dit</strong>, max : <strong>10 000 cr&eacute;dits</strong>. Tarif : <strong>1 cr&eacute;dit = 1&euro;</strong>. Cr&eacute;dit&eacute; dans le wallet <strong>PURCHASED</strong>.</p>
                <p className="text-xs text-slate-500 mt-1">Montants pr&eacute;d&eacute;finis dans l&apos;UI : 10, 25, 50, 100, 200, 500 ou montant libre.</p>
              </div>

              <div>
                <p className="font-medium text-slate-800">3. Redistribution de follow (CREDIT_EARNED_FOLLOW)</p>
                <p>Quand un utilisateur te suit, tu re&ccedil;ois une part de son co&ucirc;t mensuel dans le wallet <strong>EARNED</strong>.</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1 mt-1">
                  <li>Taux : 0% (FREE) &agrave; 50% (ELITE) selon le plan du follower</li>
                  <li>Minimum 1 cr&eacute;dit redistribu&eacute; si le taux est sup&eacute;rieur &agrave; 0</li>
                  <li>Exception : si le d&eacute;bit provient uniquement du wallet BONUS, aucune redistribution</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-slate-800">4. Consultation de listing (CREDIT_EARNED_LISTING)</p>
                <p>Quand un utilisateur consulte une annonce de ton club, tu re&ccedil;ois <strong>25%</strong> du co&ucirc;t dans le wallet <strong>EARNED</strong>.</p>
              </div>

              <div>
                <p className="font-medium text-slate-800">5. Validation de signature (CREDIT_EARNED_SIGNATURE)</p>
                <p>Si une preuve de signature est approuv&eacute;e par un admin <strong>ET</strong> que l&apos;annonce a re&ccedil;u au minimum <strong>20 candidatures</strong>, le club re&ccedil;oit un compl&eacute;ment jusqu&apos;&agrave; <strong>50%</strong> du co&ucirc;t total.</p>
              </div>

              <div>
                <p className="font-medium text-slate-800">6. Bonus admin (CREDIT_BONUS)</p>
                <p>Un admin peut cr&eacute;diter directement n&apos;importe quel wallet d&apos;un utilisateur via la fiche admin.</p>
              </div>

              <div>
                <p className="font-medium text-slate-800">7. R&eacute;compense upload vid&eacute;o foot (CREDIT_VIDEO_UPLOAD_REWARD)</p>
                <p>R&eacute;serv&eacute; aux <strong>joueurs</strong>. Apr&egrave;s upload (<code>FileAsset</code> vid&eacute;o) et appel &agrave; <code>POST /api/player/gamification/videos/finalize</code>, si la vid&eacute;o est &eacute;ligible, les cr&eacute;dits sont vers&eacute;s dans le wallet <strong>BONUS</strong> (voir section &laquo; Gamification vid&eacute;os foot &raquo;). Cl&eacute; d&apos;idempotence <code>video_upload_[fileAssetId]</code>.</p>
              </div>
            </div>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Comment dépenser des crédits */}
      <AccordionItem value="spending" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Coins} color="bg-orange-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Comment d&eacute;penser des cr&eacute;dits</p>
              <p className="text-xs text-slate-500 font-normal">Follows, listings, gamification joueur, retraits</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-slate-800">Follow &mdash; 1 cr&eacute;dit</p>
                <p>Deux flux distincts :</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1 mt-1">
                  <li><strong>Follow standard</strong> (<code>/api/follow/[id]</code>) : validation + cr&eacute;ation du follow. La facturation mensuelle est g&eacute;r&eacute;e par le CRON (1er du mois, 3h UTC)</li>
                  <li><strong>Follow avec d&eacute;bit imm&eacute;diat</strong> (<code>/api/credits/follow-spend</code>) : d&eacute;bite 1 cr&eacute;dit imm&eacute;diatement puis enregistre pour la facturation mensuelle</li>
                </ul>
                <p className="text-xs text-slate-500 mt-1">Si le solde est insuffisant au renouvellement &rarr; <strong>auto-unfollow</strong> automatique.</p>
              </div>

              <div>
                <p className="font-medium text-slate-800">Consultation de listing &mdash; co&ucirc;t variable par division</p>
                <div className="overflow-x-auto mt-1">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="text-left p-2 font-semibold text-slate-700">Division</th>
                        <th className="text-right p-2 font-semibold text-slate-700">Co&ucirc;t</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b"><td className="p-2">D1 (Pro)</td><td className="p-2 text-right">20 cr&eacute;dits</td></tr>
                      <tr className="border-b"><td className="p-2">D2 (Amateur)</td><td className="p-2 text-right">10 cr&eacute;dits</td></tr>
                      <tr className="border-b"><td className="p-2">D3 (Acad&eacute;mie)</td><td className="p-2 text-right">5 cr&eacute;dits</td></tr>
                      <tr><td className="p-2">Autre</td><td className="p-2 text-right">2 cr&eacute;dits</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-slate-500 mt-1">Paiement unique par listing (pas de re-facturation). V&eacute;rifiable via <code>GET /api/credits/listings/[id]/check</code>.</p>
              </div>

              <div>
                <p className="font-medium text-slate-800">Gamification joueur &mdash; visibilit&eacute;, IA, opportunit&eacute;s, stockage</p>
                <p><code>POST /api/player/gamification/spend</code> avec <code>action</code>, <code>idempotencyKey</code> (unique par intention de paiement) et optionnellement <code>referenceId</code>. D&eacute;bite selon l&apos;ordre BONUS &rarr; SUBSCRIPTION &rarr; PURCHASED &rarr; EARNED ; enregistre <code>referenceType: GAMIFICATION_SPEND</code> pour l&apos;idempotence c&ocirc;t&eacute; serveur.</p>
                <p className="text-xs text-slate-500 mt-1">D&eacute;tail des actions et co&ucirc;ts : section &laquo; Gamification vid&eacute;os foot (joueurs) &raquo;. Consultation profil payante (<code>DEBIT_PROFILE_VIEW</code>) reste sur les routes cr&eacute;dits listings/profil existantes.</p>
              </div>
            </div>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Retraits */}
      <AccordionItem value="withdrawals" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Banknote} color="bg-green-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Retraits (Withdrawals)</p>
              <p className="text-xs text-slate-500 font-normal">Conditions, commission, cycle de vie</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p className="font-medium text-slate-800">Conditions d&apos;&eacute;ligibilit&eacute; :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Plan minimum : <strong>GROWTH</strong> ou sup&eacute;rieur</li>
              <li>KYC : statut <strong>VERIFIED</strong> requis</li>
              <li>Stripe Connect : <code>payoutsEnabled</code> doit &ecirc;tre <code>true</code></li>
              <li>Solde minimum : <strong>100 cr&eacute;dits</strong> dans le wallet EARNED</li>
              <li>Maximum <strong>1 retrait</strong> en cours (PENDING_REVIEW, APPROVED ou PROCESSING)</li>
            </ul>

            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-slate-800">100</p>
                <p className="text-xs text-slate-500">Minimum cr&eacute;dits</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-slate-800">20%</p>
                <p className="text-xs text-slate-500">Commission</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                <p className="text-lg font-bold text-slate-800">7j</p>
                <p className="text-xs text-slate-500">D&eacute;lai de s&eacute;curit&eacute;</p>
              </div>
            </div>

            <p className="font-medium text-slate-800 mt-4">Cycle de vie :</p>
            <div className="space-y-1.5 mt-1 ml-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-700 text-xs">PENDING_REVIEW</Badge>
                <span className="text-xs">&rarr; En attente de revue admin</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700 text-xs">APPROVED</Badge>
                <span className="text-xs">&rarr; Valid&eacute;, en attente du d&eacute;lai de 7 jours</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-100 text-indigo-700 text-xs">PROCESSING</Badge>
                <span className="text-xs">&rarr; Transfert Stripe en cours</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700 text-xs">COMPLETED</Badge>
                <span className="text-xs">&rarr; Virement effectu&eacute;</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-100 text-red-700 text-xs">REJECTED</Badge>
                <span className="text-xs">&rarr; Rejet&eacute; par un admin (avec note)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-slate-100 text-slate-700 text-xs">CANCELLED</Badge>
                <span className="text-xs">&rarr; Annul&eacute; par l&apos;utilisateur</span>
              </div>
            </div>

            <InfoCard title="Calcul du montant net">
              Montant net = montant &times; 0.80 (apr&egrave;s commission de 20%). Le <code>netAmount</code> est stock&eacute; en centimes EUR.
            </InfoCard>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Expiration */}
      <AccordionItem value="expiration" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={RefreshCw} color="bg-red-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Expiration annuelle</p>
              <p className="text-xs text-slate-500 font-normal">Remise &agrave; z&eacute;ro au 1er janvier</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p>Chaque <strong>1er janvier &agrave; 00:00 UTC</strong>, les wallets suivants sont remis &agrave; z&eacute;ro :</p>
            <ul className="list-disc list-inside space-y-1 ml-1 mt-2">
              <li><Badge className="bg-blue-100 text-blue-700 text-xs">SUBSCRIPTION</Badge> &rarr; remis &agrave; z&eacute;ro</li>
              <li><Badge className="bg-purple-100 text-purple-700 text-xs">BONUS</Badge> &rarr; remis &agrave; z&eacute;ro</li>
              <li><Badge className="bg-green-100 text-green-700 text-xs">PURCHASED</Badge> &rarr; <strong>pr&eacute;serv&eacute;</strong></li>
              <li><Badge className="bg-amber-100 text-amber-700 text-xs">EARNED</Badge> &rarr; <strong>pr&eacute;serv&eacute;</strong></li>
            </ul>
            <p className="text-xs text-slate-500 mt-2">Un enregistrement <code>CreditExpiration</code> est cr&eacute;&eacute; pour chaque wallet r&eacute;initialis&eacute; (tra&ccedil;abilit&eacute;). D&eacute;clenchement manuel possible via <code>POST /api/credits/admin/expirations/trigger</code>.</p>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Anti-fraude */}
      <AccordionItem value="fraud" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={ShieldAlert} color="bg-red-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Anti-fraude</p>
              <p className="text-xs text-slate-500 font-normal">Rate limiting, d&eacute;tection de boucles, multi-comptes</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p className="font-medium text-slate-800">Limites de d&eacute;bit :</p>
            <div className="overflow-x-auto mt-1">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left p-2 font-semibold text-slate-700">M&eacute;canisme</th>
                    <th className="text-right p-2 font-semibold text-slate-700">Limite</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="p-2">Follows par heure</td><td className="p-2 text-right">50</td></tr>
                  <tr className="border-b"><td className="p-2">Op&eacute;rations cr&eacute;dits par minute</td><td className="p-2 text-right">10</td></tr>
                  <tr className="border-b"><td className="p-2">Utilisateurs par IP (24h)</td><td className="p-2 text-right">3</td></tr>
                  <tr className="border-b"><td className="p-2">Profondeur d&eacute;tection boucles (BFS)</td><td className="p-2 text-right">5</td></tr>
                  <tr className="border-b"><td className="p-2"><code>VIDEO_FINALIZE</code> (finalisation vid&eacute;o joueur)</td><td className="p-2 text-right">10 / min (m&ecirc;me compteur que op&eacute;rations cr&eacute;dits)</td></tr>
                  <tr><td className="p-2"><code>GAMIFICATION_SPEND</code></td><td className="p-2 text-right">10 / min</td></tr>
                </tbody>
              </table>
            </div>

            <p className="font-medium text-slate-800 mt-4">Types de flags :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li><strong>MULTI_ACCOUNT</strong> : plusieurs comptes sur le m&ecirc;me device</li>
              <li><strong>ARTIFICIAL_LOOP</strong> : boucle de follow d&eacute;tect&eacute;e (A&rarr;B&rarr;C&rarr;A)</li>
              <li><strong>RATE_LIMIT_EXCEEDED</strong> : limite de d&eacute;bit d&eacute;pass&eacute;e</li>
              <li><strong>SUSPICIOUS_PATTERN</strong> : pattern suspect</li>
              <li><strong>IP_ANOMALY</strong> : anomalie d&apos;adresse IP</li>
              <li><strong>DEVICE_ANOMALY</strong> : anomalie d&apos;appareil</li>
            </ul>

            <p className="font-medium text-slate-800 mt-4">Niveaux de s&eacute;v&eacute;rit&eacute; :</p>
            <div className="space-y-1.5 mt-1 ml-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-slate-100 text-slate-700 text-xs">LOW</Badge>
                <Badge className="bg-yellow-100 text-yellow-700 text-xs">MEDIUM</Badge>
                <span className="text-xs">&rarr; Informatif, aucun blocage</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-100 text-orange-700 text-xs">HIGH</Badge>
                <Badge className="bg-red-100 text-red-700 text-xs">CRITICAL</Badge>
                <span className="text-xs">&rarr; <strong>Bloque</strong> les retraits et les follows</span>
              </div>
            </div>

            <InfoCard title="R&eacute;solution">
              Un admin peut r&eacute;soudre un flag via le service <code>FraudService.resolveFlag</code>. Tant qu&apos;un flag HIGH ou CRITICAL est non r&eacute;solu, l&apos;utilisateur est bloqu&eacute;.
            </InfoCard>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Permissions par rôle */}
      <AccordionItem value="roles" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Users} color="bg-indigo-500" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Permissions par r&ocirc;le</p>
              <p className="text-xs text-slate-500 font-normal">Qui peut acheter, d&eacute;penser, gagner, retirer</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse mt-1">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left p-2 font-semibold text-slate-700">R&ocirc;le</th>
                    <th className="text-center p-2 font-semibold text-slate-700">Acheter</th>
                    <th className="text-center p-2 font-semibold text-slate-700">D&eacute;penser</th>
                    <th className="text-center p-2 font-semibold text-slate-700">Gagner</th>
                    <th className="text-center p-2 font-semibold text-slate-700">Retirer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-medium">PLAYER</td>
                    <td className="p-2 text-center text-green-600">Oui</td>
                    <td className="p-2 text-center">Follows, consultations</td>
                    <td className="p-2 text-center">Limit&eacute;</td>
                    <td className="p-2 text-center text-red-500">Non</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">AGENT</td>
                    <td className="p-2 text-center text-green-600">Oui</td>
                    <td className="p-2 text-center">Follows</td>
                    <td className="p-2 text-center">Limit&eacute;</td>
                    <td className="p-2 text-center text-red-500">Non</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">CLUB</td>
                    <td className="p-2 text-center text-green-600">Oui</td>
                    <td className="p-2 text-center">&mdash;</td>
                    <td className="p-2 text-center">Consultations, follows, signatures</td>
                    <td className="p-2 text-center text-green-600">Oui (GROWTH+)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 font-medium">CLUB_STAFF</td>
                    <td className="p-2 text-center text-green-600">Oui</td>
                    <td className="p-2 text-center">&mdash;</td>
                    <td className="p-2 text-center">Via le club</td>
                    <td className="p-2 text-center">Via le club</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-medium">ADMIN</td>
                    <td className="p-2 text-center" colSpan={4}>Contr&ocirc;le total (cr&eacute;diter/d&eacute;biter n&apos;importe quel wallet)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Routes API */}
      <AccordionItem value="api" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Webhook} color="bg-slate-700" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Routes API (cr&eacute;dits + gamification)</p>
              <p className="text-xs text-slate-500 font-normal">Wallets, abonnement, listings, retraits, vid&eacute;os foot joueur</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-slate-800">Wallets et transactions</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1 text-xs">
                  <li><code>GET /api/credits/wallets</code> &mdash; Soldes des 4 wallets</li>
                  <li><code>GET /api/credits/transactions</code> &mdash; Historique filtrable</li>
                  <li><code>POST /api/credits/topup</code> &mdash; Achat de cr&eacute;dits via Stripe</li>
                  <li><code>POST /api/credits/follow-spend</code> &mdash; D&eacute;bit imm&eacute;diat pour follow</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-slate-800">Gamification joueur (vid&eacute;os foot)</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1 text-xs">
                  <li><code>GET /api/player/gamification/status</code> &mdash; Niveau, XP, quotas stockage, uploads r&eacute;compens&eacute;s aujourd&apos;hui, soldes, tarifs des sinks</li>
                  <li><code>GET /api/player/gamification/videos</code> &mdash; Vid&eacute;os scouting du joueur, jauge de compl&eacute;tion profil vid&eacute;o</li>
                  <li><code>POST /api/player/gamification/videos/finalize</code> &mdash; Score, cr&eacute;dits BONUS si &eacute;ligible, XP / progression (<code>skillCategory</code> optionnel)</li>
                  <li><code>POST /api/player/gamification/spend</code> &mdash; D&eacute;penses gamification (idempotencyKey requis)</li>
                  <li><code>POST /api/files/upload-proxy</code> &mdash; Si joueur + VIDEO : quota stockage, <code>contentHash</code>, <code>UserStorageUsage</code> ; r&eacute;ponse <code>403 STORAGE_QUOTA_EXCEEDED</code> si d&eacute;passement</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-slate-800">Abonnement</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1 text-xs">
                  <li><code>GET/POST /api/credits/subscription</code> &mdash; R&eacute;cup&eacute;rer / cr&eacute;er</li>
                  <li><code>POST /api/credits/subscription/change</code> &mdash; Changer de plan</li>
                  <li><code>POST /api/credits/subscription/cancel</code> &mdash; Annuler</li>
                  <li><code>POST /api/credits/subscription/sync-session</code> &mdash; Synchro apr&egrave;s Checkout</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-slate-800">Listings</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1 text-xs">
                  <li><code>GET /api/credits/listings/[id]/check</code> &mdash; V&eacute;rifier consultation + co&ucirc;t</li>
                  <li><code>POST /api/credits/listings/[id]/consult</code> &mdash; Payer la consultation</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-slate-800">Retraits</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1 text-xs">
                  <li><code>GET/POST /api/credits/withdrawals</code> &mdash; Lister / demander</li>
                  <li><code>DELETE /api/credits/withdrawals/[id]</code> &mdash; Annuler</li>
                  <li><code>POST /api/credits/withdrawals/[id]/review</code> &mdash; Revue admin</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-slate-800">Signatures</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1 text-xs">
                  <li><code>POST /api/credits/signatures</code> &mdash; Soumettre une preuve</li>
                  <li><code>POST /api/credits/signatures/[id]/review</code> &mdash; Revue admin</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-slate-800">Stripe Connect</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1 text-xs">
                  <li><code>POST /api/credits/connect/onboarding</code> &mdash; Lancer l&apos;onboarding</li>
                  <li><code>GET /api/credits/connect/dashboard</code> &mdash; Lien dashboard Express</li>
                  <li><code>GET /api/credits/connect/status</code> &mdash; Statut du compte</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-slate-800">Anti-fraude</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1 text-xs">
                  <li><code>POST /api/credits/fraud/fingerprint</code> &mdash; Enregistrer empreinte device</li>
                  <li><code>GET /api/credits/fraud/flags</code> &mdash; Liste des flags (admin)</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-slate-800">Admin</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1 text-xs">
                  <li><code>GET /api/credits/admin/stats</code> &mdash; Stats globales</li>
                  <li><code>POST /api/credits/admin/expirations/trigger</code> &mdash; D&eacute;clencher expiration</li>
                  <li><code>GET /api/admin/credits</code> &mdash; Transactions admin avec filtres</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-slate-800">Webhooks et CRON</p>
                <ul className="list-disc list-inside space-y-0.5 ml-1 text-xs">
                  <li><code>POST /api/webhooks/stripe</code> &mdash; Webhook Stripe (5 &eacute;v&eacute;nements)</li>
                  <li><code>POST /api/webhooks/cron?job=follow-billing|expiration|withdrawal-processing</code></li>
                </ul>
              </div>
            </div>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Jobs CRON et Webhooks */}
      <AccordionItem value="cron" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Clock} color="bg-slate-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Jobs CRON et Webhooks Stripe</p>
              <p className="text-xs text-slate-500 font-normal">Traitements automatiques r&eacute;currents</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p className="font-medium text-slate-800">Jobs CRON :</p>
            <div className="overflow-x-auto mt-1">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left p-2 font-semibold text-slate-700">Job</th>
                    <th className="text-left p-2 font-semibold text-slate-700">Horaire</th>
                    <th className="text-left p-2 font-semibold text-slate-700">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="p-2"><code>follow-billing</code></td><td className="p-2">1er du mois, 03:00 UTC</td><td className="p-2">Facturation mensuelle des follows</td></tr>
                  <tr className="border-b"><td className="p-2"><code>expiration</code></td><td className="p-2">1er janvier, 00:00 UTC</td><td className="p-2">Expiration annuelle SUBSCRIPTION + BONUS</td></tr>
                  <tr><td className="p-2"><code>withdrawal-processing</code></td><td className="p-2">Quotidien, 04:00 UTC</td><td className="p-2">Traitement des retraits approuv&eacute;s</td></tr>
                </tbody>
              </table>
            </div>

            <p className="font-medium text-slate-800 mt-4">Webhook Stripe &mdash; &eacute;v&eacute;nements trait&eacute;s :</p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li><code>checkout.session.completed</code> &rarr; Synchro abonnement ou cr&eacute;dit top-up</li>
              <li><code>invoice.paid</code> &rarr; Allocation des cr&eacute;dits mensuels</li>
              <li><code>invoice.payment_failed</code> &rarr; Passage en PAST_DUE</li>
              <li><code>customer.subscription.deleted</code> &rarr; Annulation abonnement</li>
              <li><code>account.updated</code> &rarr; Mise &agrave; jour statut Stripe Connect</li>
            </ul>
          </DocSection>
        </AccordionContent>
      </AccordionItem>

      {/* Services backend */}
      <AccordionItem value="services" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center">
            <SectionIcon icon={Fingerprint} color="bg-cyan-600" />
            <div className="text-left">
              <p className="font-semibold text-slate-900">Services backend</p>
              <p className="text-xs text-slate-500 font-normal">Cr&eacute;dits (<code>src/lib/services/credits/</code>) + gamification (<code>src/lib/gamification/</code>)</p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <DocSection>
            <p>Tous les services sont dans <code>src/lib/services/credits/</code> :</p>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left p-2 font-semibold text-slate-700">Fichier</th>
                    <th className="text-left p-2 font-semibold text-slate-700">Responsabilit&eacute;</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="p-2"><code>wallet.service.ts</code></td><td className="p-2">Initialisation, soldes, cr&eacute;dit, d&eacute;bit avec priorit&eacute;, reset</td></tr>
                  <tr className="border-b"><td className="p-2"><code>subscription.service.ts</code></td><td className="p-2">Activation, allocation mensuelle, changement, annulation</td></tr>
                  <tr className="border-b"><td className="p-2"><code>follow-billing.service.ts</code></td><td className="p-2">Validation follow, facturation mensuelle, redistribution</td></tr>
                  <tr className="border-b"><td className="p-2"><code>listing-billing.service.ts</code></td><td className="p-2">Co&ucirc;t par division, consultation, redistribution, signature</td></tr>
                  <tr className="border-b"><td className="p-2"><code>withdrawal.service.ts</code></td><td className="p-2">Demande, revue, annulation, traitement des retraits</td></tr>
                  <tr className="border-b"><td className="p-2"><code>stripe.service.ts</code></td><td className="p-2">Checkouts, Connect, webhooks, synchronisation</td></tr>
                  <tr className="border-b"><td className="p-2"><code>transaction.service.ts</code></td><td className="p-2">Logging, historique pagin&eacute;, idempotence</td></tr>
                  <tr className="border-b"><td className="p-2"><code>expiration.service.ts</code></td><td className="p-2">Expiration annuelle SUBSCRIPTION + BONUS</td></tr>
                  <tr className="border-b"><td className="p-2"><code>fraud.service.ts</code></td><td className="p-2">Fingerprinting, boucles, multi-comptes, rate limiting</td></tr>
                  <tr className="border-b"><td className="p-2"><code>signature.service.ts</code></td><td className="p-2">Soumission, revue, compl&eacute;ment</td></tr>
                  <tr className="border-b"><td className="p-2"><code>types.ts</code></td><td className="p-2">Constantes, <code>PLAN_CONFIG</code> (stockage, limites upload/jour), bonus progression, erreurs</td></tr>
                  <tr><td className="p-2"><code>index.ts</code></td><td className="p-2">Barrel export</td></tr>
                </tbody>
              </table>
            </div>

            <p className="font-medium text-slate-800 mt-4">Gamification (<code>src/lib/gamification/</code>) :</p>
            <ul className="list-disc list-inside space-y-0.5 ml-1 text-xs mt-1">
              <li><code>player-gamification.service.ts</code> &mdash; Finalisation vid&eacute;o, spend, statut agr&eacute;g&eacute;</li>
              <li><code>video-quality-score.ts</code> &mdash; Score mock 0&ndash;100 et calcul de r&eacute;compense</li>
              <li><code>storage-quota.ts</code> &mdash; Quota effectif plan + bonus Go, assert avant upload</li>
              <li><code>sink-costs.ts</code>, <code>player-progression.ts</code> &mdash; Co&ucirc;ts API et niveaux XP</li>
            </ul>
          </DocSection>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

// ─── PAGE PRINCIPALE ────────────────────────────────────────────────

export default function DocumentationPage() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <AdminHeader
        title="Documentation"
        description="Guide complet de la plateforme Profoot Profile"
      />

      <div className="mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-6 pb-6 border-b">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Bienvenue dans la documentation</h2>
                <p className="text-sm text-slate-500 mt-1">
                  S&eacute;lectionne un profil ci-dessous pour d&eacute;couvrir toutes ses fonctionnalit&eacute;s.
                  Chaque section explique &agrave; quoi sert la fonctionnalit&eacute; et comment l&apos;utiliser &eacute;tape par &eacute;tape.
                </p>
              </div>
            </div>

            <Tabs defaultValue="player" className="w-full">
              <TabsList className="w-full grid grid-cols-5 mb-6">
                <TabsTrigger value="player" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Joueur</span>
                </TabsTrigger>
                <TabsTrigger value="agent" className="gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden sm:inline">Agent</span>
                </TabsTrigger>
                <TabsTrigger value="club" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Club</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </TabsTrigger>
                <TabsTrigger value="credits" className="gap-2">
                  <Coins className="h-4 w-4" />
                  <span className="hidden sm:inline">Cr&eacute;dits</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="player">
                <PlayerDoc />
              </TabsContent>
              <TabsContent value="agent">
                <AgentDoc />
              </TabsContent>
              <TabsContent value="club">
                <ClubDoc />
              </TabsContent>
              <TabsContent value="admin">
                <AdminDoc />
              </TabsContent>
              <TabsContent value="credits">
                <CreditsDoc />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
