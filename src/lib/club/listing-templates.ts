import {
  Shield,
  BrickWall,
  HeartPulse,
  Clipboard,
  type LucideIcon,
} from "lucide-react"
import { LISTING_POSITIONS } from "@/lib/club/listings"

export interface ListingTemplateFormSeed {
  title?: string
  description?: string
  position?: string
  minAge?: string
  maxAge?: string
  contractType?: string
  currency?: string
}

export type ListingTemplateCategory = "YOUTH" | "PLAYER" | "STAFF"

export interface ListingTemplate {
  id: string
  category: ListingTemplateCategory
  categoryLabel: string
  /** Titre affiché sur la carte */
  title: string
  /** Accroche courte sur la carte */
  summary: string
  /** Titre prérempli dans le formulaire */
  listingTitle: string
  /** Description complète préremplie (≥ 20 caractères) */
  listingDescription: string
  position: string
  icon: LucideIcon
  iconClassName: string
  highlights: string[]
  minAge?: string
  maxAge?: string
  contractType?: string
  popular?: boolean
}

export const LISTING_TEMPLATE_CATEGORY_STYLES: Record<
  ListingTemplateCategory,
  { badge: string; accent: string }
> = {
  YOUTH: {
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    accent: "from-sky-500/10 to-transparent",
  },
  PLAYER: {
    badge: "bg-pitch-50 text-pitch-700 border-pitch-200",
    accent: "from-pitch-500/10 to-transparent",
  },
  STAFF: {
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    accent: "from-violet-500/10 to-transparent",
  },
}

export const LISTING_TEMPLATES: ListingTemplate[] = [
  {
    id: "gk-u17-national",
    category: "YOUTH",
    categoryLabel: "Jeunes · National",
    title: "Gardien U17",
    summary:
      "Effectif championnat national U17 — relance, placement et leadership défensif.",
    listingTitle:
      "Gardien U17 — relance courte et communication avec la défense",
    listingDescription: `Notre structure recherche un gardien de but pour l'équipe U17 évoluant en championnat national.

Profil attendu :
• Né en 2008 ou 2009, disponible pour l'ensemble de la saison
• Jeu au pied solide (relance courte et longue), placement et sorties au premier ballon
• Capacité à organiser le mur et la défense sur CPA
• Esprit de compétition et sérieux dans la préparation

Environnement : entraînements spécifiques gardiens, suivi vidéo, matchs officiels hebdomadaires. Parcours en centre de formation ou sélection régionale apprécié.`,
    position: "GK",
    icon: Shield,
    iconClassName: "bg-sky-50 text-sky-600",
    highlights: ["U17", "National", "Essai possible"],
    minAge: "15",
    maxAge: "17",
    contractType: "Trial",
    popular: true,
  },
  {
    id: "cb-senior-r1",
    category: "PLAYER",
    categoryLabel: "Joueur · Senior",
    title: "Défenseur central",
    summary:
      "Renfort défensif pour la saison 2026/27 — jeu aérien, relance et leadership.",
    listingTitle:
      "Défenseur central expérimenté — équipe première (saison 2026/27)",
    listingDescription: `Le club recrute un défenseur central pour intégrer l'effectif senior dès la pré-saison.

Vos atouts :
• Maîtrise du jeu de tête et du duel dans les duels aériens
• Anticipation, gestion de la profondeur et relance propre
• Communication et leadership sur la ligne défensive
• Minimum 2 saisons au même niveau (Régional 1 ou équivalent) ou supérieur

Conditions : convocations match chaque week-end, préparation physique collective, analyse vidéo adversaire. Contrat saisonnier ou période d'essai de 4 à 6 semaines selon profil.`,
    position: "DF",
    icon: BrickWall,
    iconClassName: "bg-pitch-50 text-pitch-600",
    highlights: ["Régional 1+", "Saison complète", "Essai 4-6 sem."],
    minAge: "20",
    maxAge: "32",
    contractType: "Permanent",
    popular: true,
  },
  {
    id: "physio-staff",
    category: "STAFF",
    categoryLabel: "Staff · Performance",
    title: "Préparateur physique",
    summary:
      "Staff performance : planification de charge, prévention et préparation match.",
    listingTitle:
      "Préparateur physique — performance, prévention et suivi de charge",
    listingDescription: `Dans le cadre du renforcement de notre staff performance, nous recrutons un préparateur physique.

Missions principales :
• Construire et piloter la planification annuelle (macro / méso / microcycles)
• Suivi de charge (GPS ou équivalent), tests physiques et renforcement préventif
• Préparation spécifique avant match et protocoles de récupération
• Collaboration quotidienne avec l'encadrement technique et le staff médical

Profil : diplôme STAPS, DEJEPS ou équivalent ; expérience confirmée en football (pro, National 2/3 ou Régional 1). Maîtrise des outils de suivi et pédagogie auprès des joueurs.`,
    position: "PHYSIO",
    icon: HeartPulse,
    iconClassName: "bg-rose-50 text-rose-600",
    highlights: ["CDI / freelance", "GPS & charge", "Encadrement pro"],
    contractType: "Permanent",
  },
  {
    id: "assistant-coach",
    category: "STAFF",
    categoryLabel: "Staff · Encadrement",
    title: "Entraîneur adjoint",
    summary:
      "Soutien tactique, préparation des séances et analyse vidéo pour l'équipe première.",
    listingTitle:
      "Entraîneur adjoint — préparation séances et analyse adversaire",
    listingDescription: `Nous recrutons un entraîneur adjoint pour accompagner l'équipe première sur la saison 2026/27.

Rôle :
• Co-construction des séances avec l'entraîneur principal
• Analyse vidéo des adversaires et briefings pré-match
• Encadrement de l'échauffement, consignes individuelles et matchs amicaux si délégation
• Lien quotidien avec les joueurs et le staff (performance, gardiens)

Profil recherché : diplôme UEFA B (ou équivalent) minimum, expérience d'encadrement en Régional 1 ou niveau supérieur. Capacité à travailler en binôme, rigueur et sens pédagogique.`,
    position: "COACH",
    icon: Clipboard,
    iconClassName: "bg-violet-50 text-violet-600",
    highlights: ["UEFA B+", "Vidéo & tactique", "Saison 2026/27"],
    contractType: "Permanent",
  },
]

export function getListingPositionLabel(position: string): string {
  return (
    LISTING_POSITIONS.find((p) => p.value === position)?.label ?? position
  )
}

export function listingTemplateToFormSeed(
  template: ListingTemplate
): ListingTemplateFormSeed {
  return {
    title: template.listingTitle,
    description: template.listingDescription,
    position: template.position,
    minAge: template.minAge,
    maxAge: template.maxAge,
    contractType: template.contractType,
    currency: "EUR",
  }
}
