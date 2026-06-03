// Modèles de rapports prêts à l'emploi pour agents et clubs.
// Définis en code (pas de table DB) : un modèle pré-remplit les sections
// d'un rapport (titre + trame de contenu) que le rédacteur édite ensuite.

import {
  ClipboardList,
  Search,
  Target,
  UserCheck,
  Trophy,
  Briefcase,
  TrendingUp,
  GraduationCap,
  type LucideIcon,
} from "lucide-react"

export type ReportTemplateAudience = "AGENT" | "CLUB"
export type ReportTemplateKind = "PLAYER" | "MATCH" | "ANY"
export type ReportTemplateCategory =
  | "SCOUTING"
  | "RECRUITMENT"
  | "COACHING"
  | "MATCH"
  | "AGENT"

export interface ReportTemplateSection {
  title: string
  /** Trame markdown pré-remplie — guide le rédacteur, à compléter/remplacer. */
  content: string
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  /** Accroche courte affichée sur la carte. */
  summary: string
  category: ReportTemplateCategory
  categoryLabel: string
  icon: LucideIcon
  iconClassName: string
  highlights: string[]
  popular?: boolean
  /** Titre suggéré lors de la création à partir du modèle. */
  suggestedTitle?: string
  /** Rôles qui voient ce modèle. */
  audience: ReportTemplateAudience[]
  /** Type de rapport ciblé (filtrage optionnel). */
  kind: ReportTemplateKind
  sections: ReportTemplateSection[]
}

export const REPORT_TEMPLATE_CATEGORY_STYLES: Record<
  ReportTemplateCategory,
  { badge: string; accent: string }
> = {
  SCOUTING: {
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    accent: "from-sky-500/10 to-transparent",
  },
  RECRUITMENT: {
    badge: "bg-pitch-50 text-pitch-700 border-pitch-200",
    accent: "from-pitch-500/10 to-transparent",
  },
  COACHING: {
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    accent: "from-violet-500/10 to-transparent",
  },
  MATCH: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    accent: "from-amber-500/10 to-transparent",
  },
  AGENT: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    accent: "from-blue-500/10 to-transparent",
  },
}

const PLAYER_FULL_SECTIONS: ReportTemplateSection[] = [
  {
    title: "Contexte d'observation",
    content:
      "- Date(s) et match(s) observé(s) :\n- Compétition / niveau :\n- Poste occupé / rôle :\n- Conditions (météo, enjeu, adversaire) :",
  },
  {
    title: "Aspects techniques",
    content:
      "- Qualité de la première touche et du contrôle :\n- Jeu court / jeu long, qualité de passe :\n- Frappe et finition :\n- Jeu de tête :\n- Pied faible :",
  },
  {
    title: "Aspects tactiques",
    content:
      "- Compréhension du jeu et placement :\n- Prise de décision sous pression :\n- Comportement avec / sans ballon :\n- Apport défensif et pressing :\n- Adaptabilité aux systèmes :",
  },
  {
    title: "Physique & athlétique",
    content:
      "- Vitesse et explosivité :\n- Endurance sur la durée du match :\n- Puissance et duels :\n- Détente / jeu aérien :\n- Profil de blessures éventuel :",
  },
  {
    title: "Mental & comportement",
    content:
      "- Attitude et leadership :\n- Réaction face à l'adversité :\n- Communication avec les coéquipiers :\n- Discipline et fair-play :",
  },
  {
    title: "Synthèse & recommandation",
    content:
      "- Forces principales :\n- Axes de progression :\n- Potentiel / projection :\n- Recommandation :",
  },
]

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "agent-player-complete",
    name: "Rapport joueur complet",
    summary:
      "Analyse terrain complète : technique, tactique, physique, mental et projection.",
    description:
      "Analyse détaillée d'un joueur sur tous les plans : technique, tactique, physique, mental et projection.",
    category: "SCOUTING",
    categoryLabel: "Scouting · Terrain",
    icon: ClipboardList,
    iconClassName: "bg-sky-50 text-sky-600",
    highlights: ["6 sections", "Terrain", "Projection"],
    popular: true,
    suggestedTitle: "Rapport joueur complet",
    audience: ["AGENT", "CLUB"],
    kind: "PLAYER",
    sections: PLAYER_FULL_SECTIONS,
  },
  {
    id: "agent-player-flash",
    name: "Note de scouting express",
    summary:
      "Première observation rapide : constat clé et suite à donner en 3 sections.",
    description:
      "Format court pour une première observation : l'essentiel en trois sections.",
    category: "SCOUTING",
    categoryLabel: "Scouting · Express",
    icon: Search,
    iconClassName: "bg-sky-50 text-sky-600",
    highlights: ["3 sections", "Premier regard", "Décision rapide"],
    popular: true,
    suggestedTitle: "Note de scouting express",
    audience: ["AGENT", "CLUB"],
    kind: "PLAYER",
    sections: [
      {
        title: "Contexte",
        content:
          "- Match / date :\n- Poste et rôle :\n- Niveau de l'opposition :",
      },
      {
        title: "Constat clé",
        content:
          "- Ce qui ressort (forces immédiates) :\n- Limites observées :\n- Moments marquants :",
      },
      {
        title: "Avis & suite à donner",
        content:
          "- Intérêt (oui / à suivre / non) :\n- Prochaine étape (revoir, contacter, dossier) :",
      },
    ],
  },
  {
    id: "agent-mercato-dossier",
    name: "Dossier mercato",
    summary:
      "Présentation structurée d'un joueur à destination des clubs intéressés.",
    description:
      "Pour les agents : dossier de présentation mercato avec profil, stats clés et proposition.",
    category: "AGENT",
    categoryLabel: "Agent · Mercato",
    icon: Briefcase,
    iconClassName: "bg-blue-50 text-blue-600",
    highlights: ["Présentation club", "Valorisation", "Disponibilité"],
    popular: true,
    suggestedTitle: "Dossier mercato — [Joueur]",
    audience: ["AGENT"],
    kind: "PLAYER",
    sections: [
      {
        title: "Profil & contexte",
        content:
          "- Identité, âge, nationalité :\n- Poste(s) et pied fort :\n- Club actuel, contrat et statut :\n- Mandat agent :",
      },
      {
        title: "Forces & style de jeu",
        content:
          "- Qualités principales :\n- Style de jeu et rôle tactique :\n- Statistiques clés (saison en cours) :\n- Vidéos / références :",
      },
      {
        title: "Historique & progression",
        content:
          "- Parcours récent (3 dernières saisons) :\n- Niveau(x) pratiqué(s) :\n- Sélections / distinctions :",
      },
      {
        title: "Proposition & conditions",
        content:
          "- Type de transfert recherché :\n- Niveau de club cible :\n- Valorisation / conditions financières :\n- Disponibilité pour essai ou visite :",
      },
    ],
  },
  {
    id: "agent-midseason",
    name: "Bilan mi-saison",
    summary:
      "Point d'étape sur la saison : performances, objectifs et axes de travail.",
    description:
      "Pour les agents : bilan intermédiaire de la saison d'un joueur mandaté.",
    category: "AGENT",
    categoryLabel: "Agent · Suivi",
    icon: TrendingUp,
    iconClassName: "bg-blue-50 text-blue-600",
    highlights: ["Mi-saison", "Objectifs", "Suivi mandat"],
    suggestedTitle: "Bilan mi-saison — [Joueur]",
    audience: ["AGENT"],
    kind: "PLAYER",
    sections: [
      {
        title: "Contexte de la saison",
        content:
          "- Club, compétition et temps de jeu :\n- Rôle dans l'effectif :\n- Blessures ou absences :",
      },
      {
        title: "Performances",
        content:
          "- Statistiques clés (matchs, buts, passes, etc.) :\n- Moments marquants :\n- Évolution par rapport à la saison passée :",
      },
      {
        title: "Analyse qualitative",
        content:
          "- Points forts confirmés :\n- Axes de progression identifiés :\n- Retours du staff / entraîneur :",
      },
      {
        title: "Objectifs & suite",
        content:
          "- Objectifs restants sur la saison :\n- Opportunités mercato à anticiper :\n- Actions recommandées :",
      },
    ],
  },
  {
    id: "club-recruitment",
    name: "Rapport de recrutement",
    summary:
      "Évaluation d'une cible et adéquation au projet sportif du club.",
    description:
      "Pour les recruteurs : évaluation d'une cible et adéquation au projet du club.",
    category: "RECRUITMENT",
    categoryLabel: "Recrutement · Club",
    icon: Target,
    iconClassName: "bg-pitch-50 text-pitch-600",
    highlights: ["Adéquation projet", "7 sections", "Recommandation"],
    popular: true,
    suggestedTitle: "Rapport de recrutement",
    audience: ["CLUB"],
    kind: "PLAYER",
    sections: [
      {
        title: "Contexte d'observation",
        content:
          "- Date(s) et match(s) :\n- Compétition / niveau :\n- Poste et système :",
      },
      {
        title: "Aspects techniques",
        content:
          "- Maîtrise technique :\n- Qualité de passe et de frappe :\n- Points techniques distinctifs :",
      },
      {
        title: "Aspects tactiques",
        content:
          "- Intelligence de jeu :\n- Positionnement et déplacements :\n- Apport dans les deux phases :",
      },
      {
        title: "Physique",
        content:
          "- Profil athlétique :\n- Résistance et constance :\n- Duels et impact :",
      },
      {
        title: "Mental & personnalité",
        content:
          "- Attitude, investissement :\n- Comportement dans les moments clés :\n- Marge de progression mentale :",
      },
      {
        title: "Adéquation au projet",
        content:
          "- Correspondance au système et au besoin de poste :\n- Niveau attendu vs effectif actuel :\n- Contexte (âge, contrat, valorisation estimée) :",
      },
      {
        title: "Conclusion & recommandation",
        content:
          "- Note globale :\n- Recommandation (prioritaire / à suivre / écarter) :\n- Risques et points de vigilance :",
      },
    ],
  },
  {
    id: "club-coach-evaluation",
    name: "Évaluation joueur (entraîneur)",
    summary:
      "Suivi d'un joueur de l'effectif : performance, progression et objectifs.",
    description:
      "Pour les entraîneurs : suivi d'un joueur de l'effectif et plan de progression.",
    category: "COACHING",
    categoryLabel: "Encadrement · Effectif",
    icon: UserCheck,
    iconClassName: "bg-violet-50 text-violet-600",
    highlights: ["Effectif", "Progression", "Objectifs"],
    popular: true,
    suggestedTitle: "Évaluation joueur",
    audience: ["CLUB"],
    kind: "PLAYER",
    sections: [
      {
        title: "Performance globale",
        content:
          "- Période évaluée :\n- Temps de jeu et régularité :\n- Niveau de performance général :",
      },
      {
        title: "Points forts",
        content:
          "- Qualités sur lesquelles s'appuyer :\n- Situations où le joueur fait la différence :",
      },
      {
        title: "Axes de progression",
        content:
          "- Aspects techniques à travailler :\n- Aspects tactiques / physiques :\n- Exercices ou consignes ciblés :",
      },
      {
        title: "Intégration & attitude",
        content:
          "- Comportement à l'entraînement :\n- Relation au groupe et au staff :\n- Réceptivité aux consignes :",
      },
      {
        title: "Objectifs",
        content:
          "- Objectifs court terme :\n- Objectifs moyen / long terme :\n- Échéance de revue :",
      },
    ],
  },
  {
    id: "club-youth",
    name: "Suivi jeune talent",
    summary:
      "Observation d'un jeune : potentiel, maturité et recommandation de filière.",
    description:
      "Pour les recruteurs et encadrants : suivi d'un jeune joueur en centre ou en sélection.",
    category: "RECRUITMENT",
    categoryLabel: "Jeunes · Détection",
    icon: GraduationCap,
    iconClassName: "bg-sky-50 text-sky-600",
    highlights: ["U17-U21", "Potentiel", "Filière"],
    suggestedTitle: "Suivi jeune talent",
    audience: ["CLUB"],
    kind: "PLAYER",
    sections: [
      {
        title: "Contexte & profil",
        content:
          "- Âge, catégorie, club / centre :\n- Poste et morphologie :\n- Match(s) ou séance(s) observé(s) :",
      },
      {
        title: "Qualités observées",
        content:
          "- Technique et maîtrise du ballon :\n- Lecture de jeu et intelligence :\n- Profil athlétique pour l'âge :",
      },
      {
        title: "Maturité & comportement",
        content:
          "- Maturité physique et mentale :\n- Attitude en match et à l'entraînement :\n- Capacité d'adaptation au niveau :",
      },
      {
        title: "Potentiel & recommandation",
        content:
          "- Projection (1 à 3 ans) :\n- Comparaison avec le niveau attendu :\n- Recommandation (essai, suivi, intégration) :",
      },
    ],
  },
  {
    id: "club-match",
    name: "Rapport de match",
    summary:
      "Analyse collective : animation, temps forts et joueurs observés.",
    description:
      "Analyse d'une rencontre : animation collective, temps forts et joueurs observés.",
    category: "MATCH",
    categoryLabel: "Match · Analyse",
    icon: Trophy,
    iconClassName: "bg-amber-50 text-amber-600",
    highlights: ["Collectif", "Temps forts", "Joueurs clés"],
    popular: true,
    suggestedTitle: "Rapport de match",
    audience: ["CLUB", "AGENT"],
    kind: "MATCH",
    sections: [
      {
        title: "Contexte du match",
        content:
          "- Compétition et enjeu :\n- Adversaire :\n- Score et faits marquants :\n- Conditions de jeu :",
      },
      {
        title: "Système & animation",
        content:
          "- Schéma de départ et ajustements :\n- Animation offensive :\n- Animation défensive :\n- Transitions :",
      },
      {
        title: "Temps forts / temps faibles",
        content:
          "- Séquences réussies :\n- Séquences subies :\n- Moments-clés du match :",
      },
      {
        title: "Joueurs observés",
        content:
          "- Joueur(s) marquant(s) et pourquoi :\n- Prestations individuelles notables :\n- Joueurs à revoir :",
      },
      {
        title: "Conclusion",
        content:
          "- Enseignements principaux :\n- Recommandations / suites à donner :",
      },
    ],
  },
  {
    id: "club-pre-match",
    name: "Analyse pré-match",
    summary:
      "Préparation tactique avant rencontre : adversaire, points clés et consignes.",
    description:
      "Pour l'encadrement : analyse de l'adversaire et préparation tactique avant match.",
    category: "MATCH",
    categoryLabel: "Match · Préparation",
    icon: ClipboardList,
    iconClassName: "bg-amber-50 text-amber-600",
    highlights: ["Adversaire", "Tactique", "Consignes"],
    suggestedTitle: "Analyse pré-match",
    audience: ["CLUB"],
    kind: "MATCH",
    sections: [
      {
        title: "Contexte & enjeu",
        content:
          "- Compétition, date et lieu :\n- Adversaire et classement :\n- Enjeu pour notre équipe :",
      },
      {
        title: "Analyse adversaire",
        content:
          "- Système de jeu habituel :\n- Forces et faiblesses identifiées :\n- Joueurs clés à neutraliser / exploiter :",
      },
      {
        title: "Plan de jeu proposé",
        content:
          "- Schéma et consignes collectives :\n- Consignes individuelles par poste :\n- CPA offensifs et défensifs :",
      },
      {
        title: "Points de vigilance",
        content:
          "- Risques identifiés :\n- Scénarios probables :\n- Ajustements possibles en cours de match :",
      },
    ],
  },
]

/** Modèles disponibles pour un rôle, optionnellement filtrés par type de rapport. */
export function getReportTemplates(
  audience: ReportTemplateAudience,
  kind?: ReportTemplateKind
): ReportTemplate[] {
  return REPORT_TEMPLATES.filter((t) => {
    if (!t.audience.includes(audience)) return false
    if (kind && kind !== "ANY" && t.kind !== "ANY" && t.kind !== kind) return false
    return true
  })
}

export function getReportTemplateById(id: string): ReportTemplate | undefined {
  return REPORT_TEMPLATES.find((t) => t.id === id)
}
