// Modèles de rapports prêts à l'emploi pour agents et clubs.
// Définis en code (pas de table DB) : un modèle pré-remplit les sections
// d'un rapport (titre + trame de contenu) que le rédacteur édite ensuite.

export type ReportTemplateAudience = "AGENT" | "CLUB"
export type ReportTemplateKind = "PLAYER" | "MATCH" | "ANY"

export interface ReportTemplateSection {
  title: string
  /** Trame markdown pré-remplie — guide le rédacteur, à compléter/remplacer. */
  content: string
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  /** Rôles qui voient ce modèle. */
  audience: ReportTemplateAudience[]
  /** Type de rapport ciblé (filtrage optionnel). */
  kind: ReportTemplateKind
  sections: ReportTemplateSection[]
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
    description:
      "Analyse détaillée d'un joueur sur tous les plans : technique, tactique, physique, mental et projection.",
    audience: ["AGENT", "CLUB"],
    kind: "PLAYER",
    sections: PLAYER_FULL_SECTIONS,
  },
  {
    id: "agent-player-flash",
    name: "Note de scouting express",
    description:
      "Format court pour une première observation : l'essentiel en trois sections.",
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
    id: "club-recruitment",
    name: "Rapport de recrutement",
    description:
      "Pour les recruteurs : évaluation d'une cible et adéquation au projet du club.",
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
    description:
      "Pour les entraîneurs : suivi d'un joueur de l'effectif et plan de progression.",
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
    id: "club-match",
    name: "Rapport de match",
    description:
      "Analyse d'une rencontre : animation collective, temps forts et joueurs observés.",
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
