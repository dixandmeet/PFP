export interface LeagueOption {
  value: string
  label: string
  /** Division associée (D1-D12) — utilisée pour le calcul des crédits */
  division: string
}

/**
 * Championnats disponibles par type de structure (ClubType).
 * Chaque championnat est associé à sa division (D1, D2, D3…)
 * qui détermine le coût en crédits (cf. LISTING_COST_BY_DIVISION).
 *
 * Grille de coûts :
 *   D1 = 20 crédits | D2 = 10 crédits | D3 = 5 crédits | D4+ = 2 crédits (défaut)
 */
export const LEAGUES_BY_CLUB_TYPE: Record<string, LeagueOption[]> = {
  PRO: [
    // ─── France ──────────────────────────────────────────────
    { value: "Ligue 1", label: "Ligue 1 (France)", division: "D1" },
    { value: "Ligue 2", label: "Ligue 2 (France)", division: "D2" },

    // ─── Angleterre ──────────────────────────────────────────
    { value: "Premier League", label: "Premier League (Angleterre)", division: "D1" },
    { value: "EFL Championship", label: "EFL Championship (Angleterre)", division: "D2" },
    { value: "EFL League One", label: "EFL League One (Angleterre)", division: "D3" },
    { value: "EFL League Two", label: "EFL League Two (Angleterre)", division: "D4" },

    // ─── Espagne ─────────────────────────────────────────────
    { value: "La Liga", label: "La Liga (Espagne)", division: "D1" },
    { value: "La Liga 2", label: "La Liga 2 (Espagne)", division: "D2" },

    // ─── Allemagne ───────────────────────────────────────────
    { value: "Bundesliga", label: "Bundesliga (Allemagne)", division: "D1" },
    { value: "2. Bundesliga", label: "2. Bundesliga (Allemagne)", division: "D2" },
    { value: "3. Liga", label: "3. Liga (Allemagne)", division: "D3" },

    // ─── Italie ──────────────────────────────────────────────
    { value: "Serie A", label: "Serie A (Italie)", division: "D1" },
    { value: "Serie B", label: "Serie B (Italie)", division: "D2" },

    // ─── Portugal ────────────────────────────────────────────
    { value: "Liga Portugal", label: "Liga Portugal (Portugal)", division: "D1" },
    { value: "Liga Portugal 2", label: "Liga Portugal 2 (Portugal)", division: "D2" },

    // ─── Pays-Bas ────────────────────────────────────────────
    { value: "Eredivisie", label: "Eredivisie (Pays-Bas)", division: "D1" },
    { value: "Eerste Divisie", label: "Eerste Divisie (Pays-Bas)", division: "D2" },

    // ─── Belgique ────────────────────────────────────────────
    { value: "Pro League", label: "Pro League (Belgique)", division: "D1" },
    { value: "Challenger Pro League", label: "Challenger Pro League (Belgique)", division: "D2" },

    // ─── Turquie ─────────────────────────────────────────────
    { value: "Süper Lig", label: "Süper Lig (Turquie)", division: "D1" },
    { value: "1. Lig", label: "1. Lig (Turquie)", division: "D2" },

    // ─── Écosse ──────────────────────────────────────────────
    { value: "Scottish Premiership", label: "Scottish Premiership (Écosse)", division: "D1" },

    // ─── Suisse ──────────────────────────────────────────────
    { value: "Super League", label: "Super League (Suisse)", division: "D1" },
    { value: "Challenge League", label: "Challenge League (Suisse)", division: "D2" },

    // ─── Autriche ────────────────────────────────────────────
    { value: "Bundesliga Autriche", label: "Bundesliga (Autriche)", division: "D1" },

    // ─── Grèce ───────────────────────────────────────────────
    { value: "Super League Grèce", label: "Super League (Grèce)", division: "D1" },

    // ─── Russie ──────────────────────────────────────────────
    { value: "Premier Liga", label: "Premier Liga (Russie)", division: "D1" },

    // ─── USA / Canada ────────────────────────────────────────
    { value: "MLS", label: "MLS (États-Unis / Canada)", division: "D1" },
    { value: "USL Championship", label: "USL Championship (États-Unis)", division: "D2" },

    // ─── Arabie Saoudite ─────────────────────────────────────
    { value: "Saudi Pro League", label: "Saudi Pro League (Arabie Saoudite)", division: "D1" },

    // ─── Brésil ──────────────────────────────────────────────
    { value: "Brasileirão Série A", label: "Brasileirão Série A (Brésil)", division: "D1" },
    { value: "Brasileirão Série B", label: "Brasileirão Série B (Brésil)", division: "D2" },

    // ─── Argentine ───────────────────────────────────────────
    { value: "Liga Profesional", label: "Liga Profesional (Argentine)", division: "D1" },

    // ─── Afrique ─────────────────────────────────────────────
    { value: "Botola Pro", label: "Botola Pro (Maroc)", division: "D1" },
    { value: "Botola Pro 2", label: "Botola Pro 2 (Maroc)", division: "D2" },
    { value: "Ligue 1 Tunisie", label: "Ligue 1 (Tunisie)", division: "D1" },
    { value: "Ligue 2 Tunisie", label: "Ligue 2 (Tunisie)", division: "D2" },
    { value: "Ligue 1 Algérie", label: "Ligue 1 (Algérie)", division: "D1" },
    { value: "Ligue 2 Algérie", label: "Ligue 2 (Algérie)", division: "D2" },
    { value: "Egyptian Premier League", label: "Egyptian Premier League (Égypte)", division: "D1" },
    { value: "Ligue 1 Sénégal", label: "Ligue 1 (Sénégal)", division: "D1" },
    { value: "Ligue 1 Côte d'Ivoire", label: "Ligue 1 (Côte d'Ivoire)", division: "D1" },
    { value: "Ligue 1 Cameroun", label: "Ligue 1 (Cameroun)", division: "D1" },
    { value: "South African Premier Division", label: "Premier Division (Afrique du Sud)", division: "D1" },

    // ─── Asie ────────────────────────────────────────────────
    { value: "J1 League", label: "J1 League (Japon)", division: "D1" },
    { value: "K League 1", label: "K League 1 (Corée du Sud)", division: "D1" },
    { value: "Chinese Super League", label: "Chinese Super League (Chine)", division: "D1" },

    // ─── Autre ───────────────────────────────────────────────
    { value: "Autre championnat pro D1", label: "Autre — 1ère division professionnelle", division: "D1" },
    { value: "Autre championnat pro D2", label: "Autre — 2ème division professionnelle", division: "D2" },
    { value: "Autre championnat pro D3", label: "Autre — 3ème division professionnelle", division: "D3" },
    { value: "Autre championnat pro D4", label: "Autre — 4ème division professionnelle", division: "D4" },
  ],

  AMATEUR: [
    // ─── France ──────────────────────────────────────────────
    { value: "National", label: "National (France)", division: "D3" },
    { value: "National 2", label: "National 2 (France)", division: "D4" },
    { value: "National 3", label: "National 3 (France)", division: "D5" },
    { value: "Régional 1", label: "Régional 1 (France)", division: "D6" },
    { value: "Régional 2", label: "Régional 2 (France)", division: "D7" },
    { value: "Régional 3", label: "Régional 3 (France)", division: "D8" },
    { value: "Départemental 1", label: "Départemental 1 (France)", division: "D9" },
    { value: "Départemental 2", label: "Départemental 2 (France)", division: "D10" },
    { value: "Départemental 3", label: "Départemental 3 (France)", division: "D11" },

    // ─── International amateur ───────────────────────────────
    { value: "Serie C", label: "Serie C (Italie)", division: "D3" },
    { value: "Serie D", label: "Serie D (Italie)", division: "D4" },
    { value: "Tercera División", label: "Tercera División (Espagne)", division: "D4" },
    { value: "Regionalliga", label: "Regionalliga (Allemagne)", division: "D4" },
    { value: "Non-League (Angleterre)", label: "Non-League (Angleterre)", division: "D5" },
    { value: "Championnat amateur Belgique", label: "Divisions amateurs (Belgique)", division: "D5" },
    { value: "Championnat amateur Suisse", label: "Divisions amateurs (Suisse)", division: "D5" },

    // ─── Afrique amateur ─────────────────────────────────────
    { value: "Division amateur Maroc", label: "Division amateur (Maroc)", division: "D5" },
    { value: "Division amateur Tunisie", label: "Division amateur (Tunisie)", division: "D5" },
    { value: "Division amateur Algérie", label: "Division amateur (Algérie)", division: "D5" },
    { value: "Division amateur Sénégal", label: "Division amateur (Sénégal)", division: "D5" },
    { value: "Division amateur Côte d'Ivoire", label: "Division amateur (Côte d'Ivoire)", division: "D5" },
    { value: "Division amateur Cameroun", label: "Division amateur (Cameroun)", division: "D5" },

    // ─── Autre ───────────────────────────────────────────────
    { value: "Autre amateur D3", label: "Autre — 3ème division", division: "D3" },
    { value: "Autre amateur D4", label: "Autre — 4ème division", division: "D4" },
    { value: "Autre amateur D5", label: "Autre — 5ème division", division: "D5" },
    { value: "Autre amateur D6", label: "Autre — 6ème division et +", division: "D6" },
  ],

  ACADEMY: [
    // ─── France ──────────────────────────────────────────────
    { value: "U19 National", label: "U19 National (France)", division: "D1" },
    { value: "U17 National", label: "U17 National (France)", division: "D1" },
    { value: "U19 Régional", label: "U19 Régional (France)", division: "D3" },
    { value: "U17 Régional", label: "U17 Régional (France)", division: "D3" },
    { value: "Gambardella", label: "Coupe Gambardella (France)", division: "D2" },

    // ─── International jeunes ────────────────────────────────
    { value: "Youth League", label: "UEFA Youth League", division: "D1" },
    { value: "Premier League 2", label: "Premier League 2 (Angleterre)", division: "D1" },
    { value: "U18 Premier League", label: "U18 Premier League (Angleterre)", division: "D2" },
    { value: "Junioren Bundesliga", label: "Junioren Bundesliga (Allemagne)", division: "D2" },
    { value: "Primavera", label: "Primavera (Italie)", division: "D2" },
    { value: "División de Honor Juvenil", label: "División de Honor Juvenil (Espagne)", division: "D2" },

    // ─── Autre ───────────────────────────────────────────────
    { value: "Autre formation D1", label: "Autre — Centre de formation élite", division: "D1" },
    { value: "Autre formation D2", label: "Autre — Centre de formation intermédiaire", division: "D2" },
    { value: "Autre formation D3", label: "Autre — Centre de formation régional", division: "D3" },
  ],
} as const

/**
 * Retourne la liste des championnats pour un type de club donné.
 * Si aucun type n'est sélectionné, retourne toutes les options combinées.
 */
export function getLeaguesForClubType(clubType?: string): LeagueOption[] {
  if (!clubType || !LEAGUES_BY_CLUB_TYPE[clubType]) {
    const all = Object.values(LEAGUES_BY_CLUB_TYPE).flat()
    const seen = new Set<string>()
    return all.filter((opt) => {
      if (seen.has(opt.value)) return false
      seen.add(opt.value)
      return true
    })
  }
  return LEAGUES_BY_CLUB_TYPE[clubType] as LeagueOption[]
}

/**
 * Retourne la division (D1, D2, D3…) associée à un championnat donné.
 * Utilisé pour le calcul automatique des crédits.
 * Retourne null si le championnat n'est pas trouvé.
 */
export function getDivisionForLeague(leagueValue: string): string | null {
  for (const options of Object.values(LEAGUES_BY_CLUB_TYPE)) {
    const found = options.find((opt) => opt.value === leagueValue)
    if (found) return found.division
  }
  return null
}
