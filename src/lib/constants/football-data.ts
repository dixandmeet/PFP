// Constantes pour les données football

// Liste des nationalités
export const NATIONALITIES = [
  "Française",
  "Allemande",
  "Anglaise",
  "Espagnole",
  "Italienne",
  "Portugaise",
  "Belge",
  "Néerlandaise",
  "Suisse",
  "Autrichienne",
  "Polonaise",
  "Croate",
  "Serbe",
  "Ukrainienne",
  "Russe",
  "Turque",
  "Grecque",
  "Danoise",
  "Suédoise",
  "Norvégienne",
  "Finlandaise",
  "Tchèque",
  "Hongroise",
  "Roumaine",
  "Bulgare",
  "Slovaque",
  "Slovène",
  "Bosniaque",
  "Albanaise",
  "Macédonienne",
  "Monténégrine",
  "Kosovare",
  "Luxembourgeoise",
  "Irlandaise",
  "Écossaise",
  "Galloise",
  "Nord-Irlandaise",
  "Islandaise",
  "Brésilienne",
  "Argentine",
  "Uruguayenne",
  "Chilienne",
  "Colombienne",
  "Péruvienne",
  "Équatorienne",
  "Vénézuélienne",
  "Paraguayenne",
  "Bolivienne",
  "Mexicaine",
  "Américaine",
  "Canadienne",
  "Japonaise",
  "Coréenne (Sud)",
  "Chinoise",
  "Australienne",
  "Marocaine",
  "Algérienne",
  "Tunisienne",
  "Égyptienne",
  "Sénégalaise",
  "Ivoirienne",
  "Camerounaise",
  "Nigériane",
  "Ghanéenne",
  "Malienne",
  "Guinéenne",
  "Burkinabè",
  "Congolaise (RDC)",
  "Congolaise (Congo)",
  "Gabonaise",
  "Sud-Africaine",
  "Zambienne",
  "Zimbabwéenne",
  "Togolaise",
  "Béninoise",
  "Nigérienne",
  "Centrafricaine",
  "Cap-Verdienne",
  "Comorienne",
  "Malgache",
  "Mauricienne",
  "Autre",
].sort((a, b) => {
  // Mettre "Française" en premier, puis trier alphabétiquement
  if (a === "Française") return -1
  if (b === "Française") return 1
  if (a === "Autre") return 1
  if (b === "Autre") return -1
  return a.localeCompare(b)
})

// Types de championnats
export const LEAGUE_TYPES = [
  { value: "pro", label: "Professionnel" },
  { value: "amateur", label: "Amateur" },
]

// Championnats professionnels par pays (Top 20 ligues européennes + autres)
export const PRO_LEAGUES = [
  // 🇬🇧 Angleterre
  { country: "Angleterre", name: "Premier League", level: 1 },
  { country: "Angleterre", name: "EFL Championship", level: 2 },
  { country: "Angleterre", name: "EFL League One", level: 3 },
  { country: "Angleterre", name: "EFL League Two", level: 4 },
  
  // 🇪🇸 Espagne
  { country: "Espagne", name: "La Liga", level: 1 },
  { country: "Espagne", name: "LaLiga 2", level: 2 },
  { country: "Espagne", name: "Primera Federación", level: 3 },
  
  // 🇩🇪 Allemagne
  { country: "Allemagne", name: "Bundesliga", level: 1 },
  { country: "Allemagne", name: "2. Bundesliga", level: 2 },
  { country: "Allemagne", name: "3. Liga", level: 3 },
  
  // 🇮🇹 Italie
  { country: "Italie", name: "Serie A", level: 1 },
  { country: "Italie", name: "Serie B", level: 2 },
  { country: "Italie", name: "Serie C", level: 3 },
  
  // 🇫🇷 France
  { country: "France", name: "Ligue 1", level: 1 },
  { country: "France", name: "Ligue 2", level: 2 },
  { country: "France", name: "National", level: 3 },
  
  // 🇵🇹 Portugal
  { country: "Portugal", name: "Primeira Liga", level: 1 },
  { country: "Portugal", name: "Liga Portugal 2", level: 2 },
  { country: "Portugal", name: "Liga 3", level: 3 },
  
  // 🇳🇱 Pays-Bas
  { country: "Pays-Bas", name: "Eredivisie", level: 1 },
  { country: "Pays-Bas", name: "Eerste Divisie", level: 2 },
  { country: "Pays-Bas", name: "Tweede Divisie", level: 3 },
  
  // 🇧🇪 Belgique
  { country: "Belgique", name: "Pro League", level: 1 },
  { country: "Belgique", name: "Challenger Pro League", level: 2 },
  
  // 🇹🇷 Turquie
  { country: "Turquie", name: "Süper Lig", level: 1 },
  { country: "Turquie", name: "TFF 1. Lig", level: 2 },
  { country: "Turquie", name: "TFF 2. Lig", level: 3 },
  { country: "Turquie", name: "TFF 3. Lig", level: 4 },
  
  // 🇦🇹 Autriche
  { country: "Autriche", name: "Austrian Bundesliga", level: 1 },
  { country: "Autriche", name: "2. Liga", level: 2 },
  
  // 🇨🇭 Suisse
  { country: "Suisse", name: "Swiss Super League", level: 1 },
  { country: "Suisse", name: "Challenge League", level: 2 },
  
  // 🇨🇿 République tchèque
  { country: "République tchèque", name: "Czech First League", level: 1 },
  { country: "République tchèque", name: "FNL (2e div.)", level: 2 },
  
  // 🇬🇷 Grèce
  { country: "Grèce", name: "Super League Greece", level: 1 },
  { country: "Grèce", name: "Super League 2", level: 2 },
  
  // 🇩🇰 Danemark
  { country: "Danemark", name: "Danish Superliga", level: 1 },
  { country: "Danemark", name: "1st Division", level: 2 },
  { country: "Danemark", name: "2nd Division", level: 3 },
  
  // 🇷🇺 Russie
  { country: "Russie", name: "Russian Premier League", level: 1 },
  { country: "Russie", name: "First League", level: 2 },
  { country: "Russie", name: "Second League", level: 3 },
  
  // 🇺🇦 Ukraine
  { country: "Ukraine", name: "Ukrainian Premier League", level: 1 },
  { country: "Ukraine", name: "Persha Liga", level: 2 },
  { country: "Ukraine", name: "Druha Liga", level: 3 },
  
  // 🇵🇱 Pologne
  { country: "Pologne", name: "Ekstraklasa", level: 1 },
  { country: "Pologne", name: "I Liga", level: 2 },
  { country: "Pologne", name: "II Liga", level: 3 },
  
  // 🇸🇪 Suède
  { country: "Suède", name: "Allsvenskan", level: 1 },
  { country: "Suède", name: "Superettan", level: 2 },
  { country: "Suède", name: "Ettan", level: 3 },
  
  // 🇳🇴 Norvège
  { country: "Norvège", name: "Eliteserien", level: 1 },
  { country: "Norvège", name: "OBOS-ligaen", level: 2 },
  { country: "Norvège", name: "PostNord-ligaen", level: 3 },
  
  // 🇷🇸 Serbie
  { country: "Serbie", name: "Serbian SuperLiga", level: 1 },
  { country: "Serbie", name: "Prva Liga", level: 2 },
  { country: "Serbie", name: "Srpska Liga", level: 3 },
  
  // 🇭🇷 Croatie
  { country: "Croatie", name: "HNL", level: 1 },
  
  // 🏴󠁧󠁢󠁳󠁣󠁴󠁿 Écosse
  { country: "Écosse", name: "Scottish Premiership", level: 1 },
  
  // 🇧🇷 Brésil
  { country: "Brésil", name: "Brasileirão Série A", level: 1 },
  { country: "Brésil", name: "Brasileirão Série B", level: 2 },
  
  // 🇦🇷 Argentine
  { country: "Argentine", name: "Liga Profesional", level: 1 },
  
  // 🇲🇽 Mexique
  { country: "Mexique", name: "Liga MX", level: 1 },
  
  // 🇺🇸 États-Unis
  { country: "États-Unis", name: "MLS", level: 1 },
  
  // 🇯🇵 Japon
  { country: "Japon", name: "J1 League", level: 1 },
  { country: "Japon", name: "J2 League", level: 2 },
  
  // 🇰🇷 Corée du Sud
  { country: "Corée du Sud", name: "K League 1", level: 1 },
  
  // 🇨🇳 Chine
  { country: "Chine", name: "Chinese Super League", level: 1 },
  
  // 🇸🇦 Arabie Saoudite
  { country: "Arabie Saoudite", name: "Saudi Pro League", level: 1 },
  
  // 🇶🇦 Qatar
  { country: "Qatar", name: "Qatar Stars League", level: 1 },
  
  // 🇦🇪 Émirats Arabes Unis
  { country: "Émirats Arabes Unis", name: "UAE Pro League", level: 1 },
  
  // 🇦🇺 Australie
  { country: "Australie", name: "A-League", level: 1 },
  
  // 🇲🇦 Maroc
  { country: "Maroc", name: "Botola Pro", level: 1 },
  
  // 🇪🇬 Égypte
  { country: "Égypte", name: "Egyptian Premier League", level: 1 },
  
  // 🇿🇦 Afrique du Sud
  { country: "Afrique du Sud", name: "Premier Soccer League", level: 1 },
].sort((a, b) => {
  // Trier d'abord par pays, puis par niveau
  if (a.country !== b.country) {
    return a.country.localeCompare(b.country)
  }
  return a.level - b.level
})

// Championnats amateurs (Semi-pro et amateur)
export const AMATEUR_LEAGUES = [
  // 🇬🇧 Angleterre - Semi-pro et Amateur
  { country: "Angleterre", name: "National League", level: 5 },
  { country: "Angleterre", name: "National League North", level: 6 },
  { country: "Angleterre", name: "National League South", level: 6 },
  { country: "Angleterre", name: "Isthmian League", level: 7 },
  { country: "Angleterre", name: "Northern Premier League", level: 7 },
  { country: "Angleterre", name: "Southern League", level: 7 },
  { country: "Angleterre", name: "Divisions régionales (Step 5-11)", level: 8 },
  
  // 🇪🇸 Espagne - Semi-pro et Amateur
  { country: "Espagne", name: "Segunda Federación", level: 4 },
  { country: "Espagne", name: "Tercera Federación", level: 5 },
  { country: "Espagne", name: "Divisions régionales autonomes", level: 6 },
  
  // 🇩🇪 Allemagne - Semi-pro et Amateur
  { country: "Allemagne", name: "Regionalliga Nord", level: 4 },
  { country: "Allemagne", name: "Regionalliga West", level: 4 },
  { country: "Allemagne", name: "Regionalliga Südwest", level: 4 },
  { country: "Allemagne", name: "Regionalliga Bayern", level: 4 },
  { country: "Allemagne", name: "Regionalliga Nordost", level: 4 },
  { country: "Allemagne", name: "Oberliga", level: 5 },
  { country: "Allemagne", name: "Verbandsliga", level: 6 },
  { country: "Allemagne", name: "Landesliga", level: 7 },
  { country: "Allemagne", name: "Bezirksliga", level: 8 },
  
  // 🇮🇹 Italie - Semi-pro et Amateur
  { country: "Italie", name: "Serie D", level: 4 },
  { country: "Italie", name: "Eccellenza", level: 5 },
  { country: "Italie", name: "Promozione", level: 6 },
  { country: "Italie", name: "Prima Categoria", level: 7 },
  { country: "Italie", name: "Seconda Categoria", level: 8 },
  { country: "Italie", name: "Terza Categoria", level: 9 },
  
  // 🇫🇷 France - Semi-pro et Amateur
  { country: "France", name: "National 2", level: 4 },
  { country: "France", name: "National 3", level: 5 },
  { country: "France", name: "Régional 1", level: 6 },
  { country: "France", name: "Régional 2", level: 7 },
  { country: "France", name: "Régional 3", level: 8 },
  { country: "France", name: "Départemental 1", level: 9 },
  { country: "France", name: "Départemental 2", level: 10 },
  { country: "France", name: "Départemental 3", level: 11 },
  { country: "France", name: "Départemental 4", level: 12 },
  { country: "France", name: "Départemental 5", level: 13 },
  
  // 🇵🇹 Portugal - Semi-pro et Amateur
  { country: "Portugal", name: "Campeonato de Portugal", level: 4 },
  { country: "Portugal", name: "Divisions régionales", level: 5 },
  
  // 🇳🇱 Pays-Bas - Semi-pro et Amateur
  { country: "Pays-Bas", name: "Derde Divisie", level: 4 },
  { country: "Pays-Bas", name: "Hoofdklasse", level: 5 },
  { country: "Pays-Bas", name: "Divisions amateurs régionales", level: 6 },
  
  // 🇧🇪 Belgique - Semi-pro et Amateur
  { country: "Belgique", name: "Nationale 1", level: 3 },
  { country: "Belgique", name: "Nationale 2", level: 4 },
  { country: "Belgique", name: "Nationale 3", level: 5 },
  { country: "Belgique", name: "Divisions provinciales", level: 6 },
  
  // 🇹🇷 Turquie - Amateur
  { country: "Turquie", name: "Ligues régionales amateurs", level: 5 },
  
  // 🇦🇹 Autriche - Semi-pro et Amateur
  { country: "Autriche", name: "Regionalliga", level: 3 },
  { country: "Autriche", name: "Landesliga", level: 4 },
  { country: "Autriche", name: "Divisions amateurs", level: 5 },
  
  // 🇨🇭 Suisse - Semi-pro et Amateur
  { country: "Suisse", name: "Promotion League", level: 3 },
  { country: "Suisse", name: "1re Ligue", level: 4 },
  { country: "Suisse", name: "2e Ligue inter", level: 5 },
  { country: "Suisse", name: "Ligues cantonales", level: 6 },
  
  // 🇨🇿 République tchèque - Amateur
  { country: "République tchèque", name: "CFL", level: 3 },
  { country: "République tchèque", name: "MSFL", level: 3 },
  { country: "République tchèque", name: "Divisions régionales", level: 4 },
  
  // 🇬🇷 Grèce - Amateur
  { country: "Grèce", name: "Gamma Ethniki", level: 3 },
  { country: "Grèce", name: "Ligues régionales", level: 4 },
  
  // 🇩🇰 Danemark - Amateur
  { country: "Danemark", name: "Denmark Series", level: 4 },
  { country: "Danemark", name: "Ligues locales", level: 5 },
  
  // 🇷🇺 Russie - Amateur
  { country: "Russie", name: "Divisions amateurs régionales", level: 4 },
  
  // 🇺🇦 Ukraine - Amateur
  { country: "Ukraine", name: "Championnats régionaux", level: 4 },
  
  // 🇵🇱 Pologne - Amateur
  { country: "Pologne", name: "III Liga", level: 4 },
  { country: "Pologne", name: "IV Liga", level: 5 },
  { country: "Pologne", name: "Ligues régionales", level: 6 },
  
  // 🇸🇪 Suède - Amateur
  { country: "Suède", name: "Division 2", level: 4 },
  { country: "Suède", name: "Division 3", level: 5 },
  { country: "Suède", name: "Division 4", level: 6 },
  { country: "Suède", name: "Division 5", level: 7 },
  { country: "Suède", name: "Division 6", level: 8 },
  
  // 🇳🇴 Norvège - Amateur
  { country: "Norvège", name: "Division 4", level: 4 },
  { country: "Norvège", name: "Division 5", level: 5 },
  { country: "Norvège", name: "Division 6", level: 6 },
  { country: "Norvège", name: "Division 7", level: 7 },
  
  // Championnats jeunes France
  { country: "France", name: "U19 National", level: 1 },
  { country: "France", name: "U19 Régional", level: 2 },
  { country: "France", name: "U17 National", level: 1 },
  { country: "France", name: "U17 Régional", level: 2 },
].sort((a, b) => {
  // Trier d'abord par pays, puis par niveau
  if (a.country !== b.country) {
    return a.country.localeCompare(b.country)
  }
  return a.level - b.level
})

// Liste des clubs (principaux clubs européens et africains)
// Logos des clubs via l'API football-data.org (gratuit) ou URLs directes
// Format: https://crests.football-data.org/{id}.png
export const CLUBS = [
  // France - Ligue 1
  { name: "Paris Saint-Germain", country: "France", league: "Ligue 1", logo: "https://crests.football-data.org/524.png" },
  { name: "Olympique de Marseille", country: "France", league: "Ligue 1", logo: "https://crests.football-data.org/516.png" },
  { name: "AS Monaco", country: "France", league: "Ligue 1", logo: "https://crests.football-data.org/548.png" },
  { name: "Olympique Lyonnais", country: "France", league: "Ligue 1", logo: "https://crests.football-data.org/523.png" },
  { name: "LOSC Lille", country: "France", league: "Ligue 1", logo: "https://crests.football-data.org/521.png" },
  { name: "Stade Rennais", country: "France", league: "Ligue 1", logo: "https://crests.football-data.org/529.png" },
  { name: "OGC Nice", country: "France", league: "Ligue 1", logo: "https://crests.football-data.org/522.png" },
  { name: "RC Lens", country: "France", league: "Ligue 1", logo: "https://crests.football-data.org/546.png" },
  { name: "Stade Brestois", country: "France", league: "Ligue 1", logo: "https://crests.football-data.org/512.png" },
  { name: "Stade de Reims", country: "France", league: "Ligue 1", logo: "https://crests.football-data.org/547.png" },
  { name: "Montpellier HSC", country: "France", league: "Ligue 1", logo: "https://crests.football-data.org/518.png" },
  { name: "FC Nantes", country: "France", league: "Ligue 1", logo: "https://crests.football-data.org/543.png" },
  { name: "RC Strasbourg", country: "France", league: "Ligue 1", logo: "https://crests.football-data.org/532.png" },
  { name: "Toulouse FC", country: "France", league: "Ligue 1", logo: "https://crests.football-data.org/511.png" },
  { name: "Le Havre AC", country: "France", league: "Ligue 1", logo: "https://crests.football-data.org/549.png" },
  { name: "FC Lorient", country: "France", league: "Ligue 1", logo: "https://crests.football-data.org/525.png" },
  { name: "Clermont Foot", country: "France", league: "Ligue 1", logo: "https://crests.football-data.org/541.png" },
  { name: "FC Metz", country: "France", league: "Ligue 1", logo: "https://crests.football-data.org/545.png" },
  // France - Ligue 2
  { name: "AS Saint-Étienne", country: "France", league: "Ligue 2", logo: "https://crests.football-data.org/527.png" },
  { name: "Girondins de Bordeaux", country: "France", league: "Ligue 2", logo: "https://crests.football-data.org/526.png" },
  { name: "SM Caen", country: "France", league: "Ligue 2", logo: "https://crests.football-data.org/514.png" },
  { name: "Paris FC", country: "France", league: "Ligue 2", logo: "https://crests.football-data.org/1045.png" },
  { name: "AJ Auxerre", country: "France", league: "Ligue 2", logo: "https://crests.football-data.org/519.png" },
  { name: "Amiens SC", country: "France", league: "Ligue 2", logo: "https://crests.football-data.org/1044.png" },
  { name: "Angers SCO", country: "France", league: "Ligue 2", logo: "https://crests.football-data.org/532.png" },
  { name: "EA Guingamp", country: "France", league: "Ligue 2", logo: "https://crests.football-data.org/538.png" },
  { name: "Grenoble Foot 38", country: "France", league: "Ligue 2", logo: "https://crests.football-data.org/1046.png" },
  { name: "USL Dunkerque", country: "France", league: "Ligue 2", logo: "https://crests.football-data.org/1047.png" },
  // Angleterre - Premier League
  { name: "Manchester City", country: "Angleterre", league: "Premier League", logo: "https://crests.football-data.org/65.png" },
  { name: "Arsenal", country: "Angleterre", league: "Premier League", logo: "https://crests.football-data.org/57.png" },
  { name: "Liverpool", country: "Angleterre", league: "Premier League", logo: "https://crests.football-data.org/64.png" },
  { name: "Manchester United", country: "Angleterre", league: "Premier League", logo: "https://crests.football-data.org/66.png" },
  { name: "Chelsea", country: "Angleterre", league: "Premier League", logo: "https://crests.football-data.org/61.png" },
  { name: "Tottenham Hotspur", country: "Angleterre", league: "Premier League", logo: "https://crests.football-data.org/73.png" },
  { name: "Newcastle United", country: "Angleterre", league: "Premier League", logo: "https://crests.football-data.org/67.png" },
  { name: "Aston Villa", country: "Angleterre", league: "Premier League", logo: "https://crests.football-data.org/58.png" },
  { name: "Brighton", country: "Angleterre", league: "Premier League", logo: "https://crests.football-data.org/397.png" },
  { name: "West Ham United", country: "Angleterre", league: "Premier League", logo: "https://crests.football-data.org/563.png" },
  { name: "Everton", country: "Angleterre", league: "Premier League", logo: "https://crests.football-data.org/62.png" },
  { name: "Fulham", country: "Angleterre", league: "Premier League", logo: "https://crests.football-data.org/63.png" },
  { name: "Crystal Palace", country: "Angleterre", league: "Premier League", logo: "https://crests.football-data.org/354.png" },
  { name: "Wolverhampton", country: "Angleterre", league: "Premier League", logo: "https://crests.football-data.org/76.png" },
  { name: "Brentford", country: "Angleterre", league: "Premier League", logo: "https://crests.football-data.org/402.png" },
  { name: "Nottingham Forest", country: "Angleterre", league: "Premier League", logo: "https://crests.football-data.org/351.png" },
  { name: "Bournemouth", country: "Angleterre", league: "Premier League", logo: "https://crests.football-data.org/1044.png" },
  { name: "Luton Town", country: "Angleterre", league: "Premier League", logo: "https://crests.football-data.org/389.png" },
  { name: "Burnley", country: "Angleterre", league: "Premier League", logo: "https://crests.football-data.org/328.png" },
  { name: "Sheffield United", country: "Angleterre", league: "Premier League", logo: "https://crests.football-data.org/356.png" },
  // Espagne - La Liga
  { name: "Real Madrid", country: "Espagne", league: "La Liga", logo: "https://crests.football-data.org/86.png" },
  { name: "FC Barcelona", country: "Espagne", league: "La Liga", logo: "https://crests.football-data.org/81.png" },
  { name: "Atlético Madrid", country: "Espagne", league: "La Liga", logo: "https://crests.football-data.org/78.png" },
  { name: "Sevilla FC", country: "Espagne", league: "La Liga", logo: "https://crests.football-data.org/559.png" },
  { name: "Real Sociedad", country: "Espagne", league: "La Liga", logo: "https://crests.football-data.org/92.png" },
  { name: "Athletic Bilbao", country: "Espagne", league: "La Liga", logo: "https://crests.football-data.org/77.png" },
  { name: "Villarreal CF", country: "Espagne", league: "La Liga", logo: "https://crests.football-data.org/94.png" },
  { name: "Real Betis", country: "Espagne", league: "La Liga", logo: "https://crests.football-data.org/90.png" },
  { name: "Valencia CF", country: "Espagne", league: "La Liga", logo: "https://crests.football-data.org/95.png" },
  { name: "Getafe CF", country: "Espagne", league: "La Liga", logo: "https://crests.football-data.org/82.png" },
  { name: "Celta Vigo", country: "Espagne", league: "La Liga", logo: "https://crests.football-data.org/558.png" },
  { name: "Osasuna", country: "Espagne", league: "La Liga", logo: "https://crests.football-data.org/79.png" },
  { name: "Rayo Vallecano", country: "Espagne", league: "La Liga", logo: "https://crests.football-data.org/87.png" },
  { name: "Mallorca", country: "Espagne", league: "La Liga", logo: "https://crests.football-data.org/89.png" },
  { name: "Girona FC", country: "Espagne", league: "La Liga", logo: "https://crests.football-data.org/298.png" },
  { name: "Las Palmas", country: "Espagne", league: "La Liga", logo: "https://crests.football-data.org/275.png" },
  { name: "Alavés", country: "Espagne", league: "La Liga", logo: "https://crests.football-data.org/263.png" },
  { name: "Cadiz CF", country: "Espagne", league: "La Liga", logo: "https://crests.football-data.org/264.png" },
  { name: "Granada CF", country: "Espagne", league: "La Liga", logo: "https://crests.football-data.org/83.png" },
  { name: "Almería", country: "Espagne", league: "La Liga", logo: "https://crests.football-data.org/267.png" },
  // Allemagne - Bundesliga
  { name: "Bayern Munich", country: "Allemagne", league: "Bundesliga", logo: "https://crests.football-data.org/5.png" },
  { name: "Borussia Dortmund", country: "Allemagne", league: "Bundesliga", logo: "https://crests.football-data.org/4.png" },
  { name: "RB Leipzig", country: "Allemagne", league: "Bundesliga", logo: "https://crests.football-data.org/721.png" },
  { name: "Bayer Leverkusen", country: "Allemagne", league: "Bundesliga", logo: "https://crests.football-data.org/3.png" },
  { name: "Eintracht Frankfurt", country: "Allemagne", league: "Bundesliga", logo: "https://crests.football-data.org/19.png" },
  { name: "VfB Stuttgart", country: "Allemagne", league: "Bundesliga", logo: "https://crests.football-data.org/10.png" },
  { name: "Borussia Mönchengladbach", country: "Allemagne", league: "Bundesliga", logo: "https://crests.football-data.org/18.png" },
  { name: "VfL Wolfsburg", country: "Allemagne", league: "Bundesliga", logo: "https://crests.football-data.org/11.png" },
  { name: "SC Freiburg", country: "Allemagne", league: "Bundesliga", logo: "https://crests.football-data.org/17.png" },
  { name: "TSG Hoffenheim", country: "Allemagne", league: "Bundesliga", logo: "https://crests.football-data.org/2.png" },
  { name: "1. FC Union Berlin", country: "Allemagne", league: "Bundesliga", logo: "https://crests.football-data.org/28.png" },
  { name: "1. FC Köln", country: "Allemagne", league: "Bundesliga", logo: "https://crests.football-data.org/1.png" },
  { name: "Werder Bremen", country: "Allemagne", league: "Bundesliga", logo: "https://crests.football-data.org/12.png" },
  { name: "FC Augsburg", country: "Allemagne", league: "Bundesliga", logo: "https://crests.football-data.org/16.png" },
  { name: "Mainz 05", country: "Allemagne", league: "Bundesliga", logo: "https://crests.football-data.org/15.png" },
  { name: "Heidenheim", country: "Allemagne", league: "Bundesliga", logo: "https://crests.football-data.org/44.png" },
  { name: "Darmstadt 98", country: "Allemagne", league: "Bundesliga", logo: "https://crests.football-data.org/55.png" },
  { name: "Bochum", country: "Allemagne", league: "Bundesliga", logo: "https://crests.football-data.org/36.png" },
  // Italie - Serie A
  { name: "Inter Milan", country: "Italie", league: "Serie A", logo: "https://crests.football-data.org/108.png" },
  { name: "AC Milan", country: "Italie", league: "Serie A", logo: "https://crests.football-data.org/98.png" },
  { name: "Juventus", country: "Italie", league: "Serie A", logo: "https://crests.football-data.org/109.png" },
  { name: "SSC Napoli", country: "Italie", league: "Serie A", logo: "https://crests.football-data.org/113.png" },
  { name: "AS Roma", country: "Italie", league: "Serie A", logo: "https://crests.football-data.org/100.png" },
  { name: "SS Lazio", country: "Italie", league: "Serie A", logo: "https://crests.football-data.org/110.png" },
  { name: "Atalanta", country: "Italie", league: "Serie A", logo: "https://crests.football-data.org/102.png" },
  { name: "Fiorentina", country: "Italie", league: "Serie A", logo: "https://crests.football-data.org/99.png" },
  { name: "Bologna", country: "Italie", league: "Serie A", logo: "https://crests.football-data.org/103.png" },
  { name: "Torino", country: "Italie", league: "Serie A", logo: "https://crests.football-data.org/586.png" },
  { name: "Monza", country: "Italie", league: "Serie A", logo: "https://crests.football-data.org/5911.png" },
  { name: "Udinese", country: "Italie", league: "Serie A", logo: "https://crests.football-data.org/115.png" },
  { name: "Sassuolo", country: "Italie", league: "Serie A", logo: "https://crests.football-data.org/471.png" },
  { name: "Empoli", country: "Italie", league: "Serie A", logo: "https://crests.football-data.org/445.png" },
  { name: "Lecce", country: "Italie", league: "Serie A", logo: "https://crests.football-data.org/5890.png" },
  { name: "Genoa", country: "Italie", league: "Serie A", logo: "https://crests.football-data.org/107.png" },
  { name: "Cagliari", country: "Italie", league: "Serie A", logo: "https://crests.football-data.org/104.png" },
  { name: "Hellas Verona", country: "Italie", league: "Serie A", logo: "https://crests.football-data.org/450.png" },
  { name: "Frosinone", country: "Italie", league: "Serie A", logo: "https://crests.football-data.org/470.png" },
  { name: "Salernitana", country: "Italie", league: "Serie A", logo: "https://crests.football-data.org/455.png" },
  // Portugal - Primeira Liga
  { name: "SL Benfica", country: "Portugal", league: "Primeira Liga", logo: "https://crests.football-data.org/1903.png" },
  { name: "FC Porto", country: "Portugal", league: "Primeira Liga", logo: "https://crests.football-data.org/503.png" },
  { name: "Sporting CP", country: "Portugal", league: "Primeira Liga", logo: "https://crests.football-data.org/498.png" },
  { name: "Sporting Braga", country: "Portugal", league: "Primeira Liga", logo: "https://crests.football-data.org/5531.png" },
  { name: "Vitória Guimarães", country: "Portugal", league: "Primeira Liga", logo: "https://crests.football-data.org/5543.png" },
  { name: "Rio Ave", country: "Portugal", league: "Primeira Liga", logo: "https://crests.football-data.org/5533.png" },
  // Belgique - Pro League
  { name: "Club Brugge", country: "Belgique", league: "Pro League", logo: "https://crests.football-data.org/851.png" },
  { name: "RSC Anderlecht", country: "Belgique", league: "Pro League", logo: "https://crests.football-data.org/674.png" },
  { name: "KRC Genk", country: "Belgique", league: "Pro League", logo: "https://crests.football-data.org/673.png" },
  { name: "Royal Antwerp", country: "Belgique", league: "Pro League", logo: "https://crests.football-data.org/678.png" },
  { name: "Standard de Liège", country: "Belgique", league: "Pro League", logo: "https://crests.football-data.org/675.png" },
  { name: "KAA Gent", country: "Belgique", league: "Pro League", logo: "https://crests.football-data.org/676.png" },
  { name: "Union Saint-Gilloise", country: "Belgique", league: "Pro League", logo: "https://crests.football-data.org/681.png" },
  // Pays-Bas - Eredivisie
  { name: "Ajax Amsterdam", country: "Pays-Bas", league: "Eredivisie", logo: "https://crests.football-data.org/678.png" },
  { name: "PSV Eindhoven", country: "Pays-Bas", league: "Eredivisie", logo: "https://crests.football-data.org/674.png" },
  { name: "Feyenoord", country: "Pays-Bas", league: "Eredivisie", logo: "https://crests.football-data.org/675.png" },
  { name: "AZ Alkmaar", country: "Pays-Bas", league: "Eredivisie", logo: "https://crests.football-data.org/682.png" },
  { name: "FC Twente", country: "Pays-Bas", league: "Eredivisie", logo: "https://crests.football-data.org/666.png" },
  { name: "FC Utrecht", country: "Pays-Bas", league: "Eredivisie", logo: "https://crests.football-data.org/676.png" },
  // Turquie - Süper Lig
  { name: "Galatasaray", country: "Turquie", league: "Süper Lig", logo: "https://crests.football-data.org/610.png" },
  { name: "Fenerbahçe", country: "Turquie", league: "Süper Lig", logo: "https://crests.football-data.org/611.png" },
  { name: "Beşiktaş", country: "Turquie", league: "Süper Lig", logo: "https://crests.football-data.org/612.png" },
  { name: "Trabzonspor", country: "Turquie", league: "Süper Lig", logo: "https://crests.football-data.org/614.png" },
  { name: "İstanbul Başakşehir", country: "Turquie", league: "Süper Lig", logo: "https://crests.football-data.org/616.png" },
  // Arabie Saoudite - Saudi Pro League
  { name: "Al-Hilal", country: "Arabie Saoudite", league: "Saudi Pro League", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0b/Al-Hilal_FC_logo.svg/200px-Al-Hilal_FC_logo.svg.png" },
  { name: "Al-Nassr", country: "Arabie Saoudite", league: "Saudi Pro League", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Al-Nassr_FC_Logo.svg/200px-Al-Nassr_FC_Logo.svg.png" },
  { name: "Al-Ittihad", country: "Arabie Saoudite", league: "Saudi Pro League", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/1/12/Ittihad_FC_logo.svg/200px-Ittihad_FC_logo.svg.png" },
  { name: "Al-Ahli", country: "Arabie Saoudite", league: "Saudi Pro League", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Al-Ahli_Saudi_FC_logo.svg/200px-Al-Ahli_Saudi_FC_logo.svg.png" },
  // Afrique
  { name: "Al Ahly", country: "Égypte", league: "Egyptian Premier League", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1f/Al_Ahly_SC_logo.svg/200px-Al_Ahly_SC_logo.svg.png" },
  { name: "Zamalek SC", country: "Égypte", league: "Egyptian Premier League", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8d/Zamalek_SC_logo.svg/200px-Zamalek_SC_logo.svg.png" },
  { name: "Wydad Casablanca", country: "Maroc", league: "Botola Pro", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/81/Wydad_AC_logo.svg/200px-Wydad_AC_logo.svg.png" },
  { name: "Raja Casablanca", country: "Maroc", league: "Botola Pro", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d5/Raja_CA_logo.svg/200px-Raja_CA_logo.svg.png" },
  { name: "TP Mazembe", country: "RD Congo", league: "Linafoot", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d2/TP_Mazembe_logo.svg/200px-TP_Mazembe_logo.svg.png" },
  { name: "Mamelodi Sundowns", country: "Afrique du Sud", league: "Premier Soccer League", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/ad/Mamelodi_Sundowns_logo.svg/200px-Mamelodi_Sundowns_logo.svg.png" },
  { name: "Espérance de Tunis", country: "Tunisie", league: "Ligue 1 Tunisienne", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Esperance_Sportive_de_Tunis_%28logo%29.svg/200px-Esperance_Sportive_de_Tunis_%28logo%29.svg.png" },
  // Écosse
  { name: "Celtic FC", country: "Écosse", league: "Scottish Premiership", logo: "https://crests.football-data.org/732.png" },
  { name: "Rangers FC", country: "Écosse", league: "Scottish Premiership", logo: "https://crests.football-data.org/746.png" },
  // Autriche
  { name: "Red Bull Salzburg", country: "Autriche", league: "Austrian Bundesliga", logo: "https://crests.football-data.org/1877.png" },
  { name: "Sturm Graz", country: "Autriche", league: "Austrian Bundesliga", logo: "https://crests.football-data.org/1878.png" },
  { name: "Rapid Wien", country: "Autriche", league: "Austrian Bundesliga", logo: "https://crests.football-data.org/1876.png" },
  // Suisse
  { name: "Young Boys", country: "Suisse", league: "Swiss Super League", logo: "https://crests.football-data.org/1871.png" },
  { name: "FC Bâle", country: "Suisse", league: "Swiss Super League", logo: "https://crests.football-data.org/1866.png" },
  { name: "FC Zurich", country: "Suisse", league: "Swiss Super League", logo: "https://crests.football-data.org/1869.png" },
  { name: "Servette FC", country: "Suisse", league: "Swiss Super League", logo: "https://crests.football-data.org/1864.png" },
  // Ukraine
  { name: "Shakhtar Donetsk", country: "Ukraine", league: "Ukrainian Premier League", logo: "https://crests.football-data.org/1887.png" },
  { name: "Dynamo Kyiv", country: "Ukraine", league: "Ukrainian Premier League", logo: "https://crests.football-data.org/1884.png" },
  // Pologne
  { name: "Legia Varsovie", country: "Pologne", league: "Ekstraklasa", logo: "https://crests.football-data.org/1893.png" },
  { name: "Lech Poznań", country: "Pologne", league: "Ekstraklasa", logo: "https://crests.football-data.org/1891.png" },
  // Grèce
  { name: "Olympiacos", country: "Grèce", league: "Super League Greece", logo: "https://crests.football-data.org/1893.png" },
  { name: "Panathinaïkos", country: "Grèce", league: "Super League Greece", logo: "https://crests.football-data.org/1894.png" },
  { name: "PAOK", country: "Grèce", league: "Super League Greece", logo: "https://crests.football-data.org/1892.png" },
  { name: "AEK Athènes", country: "Grèce", league: "Super League Greece", logo: "https://crests.football-data.org/1890.png" },
  // Danemark
  { name: "FC Copenhague", country: "Danemark", league: "Danish Superliga", logo: "https://crests.football-data.org/445.png" },
  { name: "FC Midtjylland", country: "Danemark", league: "Danish Superliga", logo: "https://crests.football-data.org/446.png" },
  // Norvège
  { name: "Bodø/Glimt", country: "Norvège", league: "Eliteserien", logo: "https://crests.football-data.org/6956.png" },
  { name: "Rosenborg", country: "Norvège", league: "Eliteserien", logo: "https://crests.football-data.org/319.png" },
  // Suède
  { name: "Malmö FF", country: "Suède", league: "Allsvenskan", logo: "https://crests.football-data.org/319.png" },
  { name: "AIK", country: "Suède", league: "Allsvenskan", logo: "https://crests.football-data.org/320.png" },
  // Serbie
  { name: "Étoile Rouge Belgrade", country: "Serbie", league: "Serbian SuperLiga", logo: "https://crests.football-data.org/7283.png" },
  { name: "Partizan Belgrade", country: "Serbie", league: "Serbian SuperLiga", logo: "https://crests.football-data.org/7284.png" },
  // Croatie
  { name: "Dinamo Zagreb", country: "Croatie", league: "HNL", logo: "https://crests.football-data.org/755.png" },
  { name: "Hajduk Split", country: "Croatie", league: "HNL", logo: "https://crests.football-data.org/756.png" },
  // République Tchèque
  { name: "Sparta Prague", country: "République tchèque", league: "Czech First League", logo: "https://crests.football-data.org/7147.png" },
  { name: "Slavia Prague", country: "République tchèque", league: "Czech First League", logo: "https://crests.football-data.org/7146.png" },
  // Russie
  { name: "Zenit Saint-Pétersbourg", country: "Russie", league: "Russian Premier League", logo: "https://crests.football-data.org/7408.png" },
  { name: "Spartak Moscou", country: "Russie", league: "Russian Premier League", logo: "https://crests.football-data.org/7409.png" },
  { name: "CSKA Moscou", country: "Russie", league: "Russian Premier League", logo: "https://crests.football-data.org/7407.png" },
  // Amérique du Sud
  { name: "River Plate", country: "Argentine", league: "Liga Profesional", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/River_Plate_logo.svg/200px-River_Plate_logo.svg.png" },
  { name: "Boca Juniors", country: "Argentine", league: "Liga Profesional", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Boca_Juniors_logo.svg/200px-Boca_Juniors_logo.svg.png" },
  { name: "Flamengo", country: "Brésil", league: "Brasileirão Série A", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Flamengo_logo.svg/200px-Flamengo_logo.svg.png" },
  { name: "Palmeiras", country: "Brésil", league: "Brasileirão Série A", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Palmeiras_logo.svg/200px-Palmeiras_logo.svg.png" },
  { name: "São Paulo FC", country: "Brésil", league: "Brasileirão Série A", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Sao_Paulo_FC_logo.svg/200px-Sao_Paulo_FC_logo.svg.png" },
  { name: "Corinthians", country: "Brésil", league: "Brasileirão Série A", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Sport_Club_Corinthians_Paulista_crest.svg/200px-Sport_Club_Corinthians_Paulista_crest.svg.png" },
  // MLS
  { name: "Inter Miami", country: "États-Unis", league: "MLS", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Inter_Miami_CF_logo.svg/200px-Inter_Miami_CF_logo.svg.png" },
  { name: "LA Galaxy", country: "États-Unis", league: "MLS", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e4/Los_Angeles_Galaxy_logo.svg/200px-Los_Angeles_Galaxy_logo.svg.png" },
  { name: "LAFC", country: "États-Unis", league: "MLS", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d6/LAFC_logo.svg/200px-LAFC_logo.svg.png" },
  { name: "Atlanta United", country: "États-Unis", league: "MLS", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/dc/Atlanta_United_FC_logo.svg/200px-Atlanta_United_FC_logo.svg.png" },
].sort((a, b) => a.name.localeCompare(b.name))

// Positions détaillées sur le terrain
export const POSITIONS = [
  // Gardien
  { code: "GK", name: "Gardien", category: "Gardien" },
  // Défenseurs
  { code: "DC", name: "Défenseur central", category: "Défenseur" },
  { code: "DG", name: "Arrière gauche", category: "Défenseur" },
  { code: "DD", name: "Arrière droit", category: "Défenseur" },
  { code: "LIB", name: "Libéro", category: "Défenseur" },
  // Milieux défensifs
  { code: "MDC", name: "Milieu défensif central", category: "Milieu" },
  { code: "MDF", name: "Milieu défensif", category: "Milieu" },
  // Milieux centraux
  { code: "MC", name: "Milieu central", category: "Milieu" },
  { code: "MOC", name: "Milieu offensif central", category: "Milieu" },
  { code: "MR", name: "Milieu relayeur", category: "Milieu" },
  // Milieux latéraux
  { code: "MG", name: "Milieu gauche", category: "Milieu" },
  { code: "MD", name: "Milieu droit", category: "Milieu" },
  // Ailiers
  { code: "AG", name: "Ailier gauche", category: "Attaquant" },
  { code: "AD", name: "Ailier droit", category: "Attaquant" },
  // Attaquants
  { code: "ATT", name: "Attaquant", category: "Attaquant" },
  { code: "BU", name: "Avant-centre / Buteur", category: "Attaquant" },
  { code: "SS", name: "Second attaquant", category: "Attaquant" },
  { code: "AP", name: "Attaquant de pointe", category: "Attaquant" },
]

// Position mapping pour le terrain (pour l'animation)
export const POSITION_ON_FIELD_MAP: Record<string, { x: number; y: number }> = {
  GK: { x: 50, y: 82 },
  DC: { x: 50, y: 68 },
  DG: { x: 20, y: 68 },
  DD: { x: 80, y: 68 },
  LIB: { x: 50, y: 72 },
  MDC: { x: 50, y: 58 },
  MDF: { x: 50, y: 55 },
  MC: { x: 50, y: 50 },
  MOC: { x: 50, y: 42 },
  MR: { x: 50, y: 48 },
  MG: { x: 20, y: 50 },
  MD: { x: 80, y: 50 },
  AG: { x: 20, y: 32 },
  AD: { x: 80, y: 32 },
  ATT: { x: 50, y: 28 },
  BU: { x: 50, y: 22 },
  SS: { x: 50, y: 30 },
  AP: { x: 50, y: 25 },
}

// Animation de déplacement selon le poste
export const POSITION_MOVEMENTS_MAP: Record<string, { x: number[]; y: number[] }> = {
  GK: { x: [40, 60, 50, 40], y: [82, 80, 84, 82] },
  DC: { x: [40, 60, 50, 40], y: [70, 65, 68, 70] },
  DG: { x: [15, 35, 25, 15], y: [70, 60, 65, 70] },
  DD: { x: [65, 85, 75, 65], y: [70, 60, 65, 70] },
  LIB: { x: [40, 60, 50, 40], y: [74, 68, 72, 74] },
  MDC: { x: [35, 65, 50, 35], y: [60, 52, 58, 60] },
  MDF: { x: [35, 65, 50, 35], y: [58, 50, 55, 58] },
  MC: { x: [30, 70, 50, 30], y: [52, 45, 50, 52] },
  MOC: { x: [30, 70, 50, 30], y: [45, 35, 42, 45] },
  MR: { x: [35, 65, 50, 35], y: [52, 42, 48, 52] },
  MG: { x: [15, 40, 25, 15], y: [55, 42, 50, 55] },
  MD: { x: [60, 85, 75, 60], y: [55, 42, 50, 55] },
  AG: { x: [10, 35, 20, 10], y: [38, 25, 32, 38] },
  AD: { x: [65, 90, 80, 65], y: [38, 25, 32, 38] },
  ATT: { x: [35, 65, 50, 35], y: [32, 22, 28, 32] },
  BU: { x: [40, 60, 50, 40], y: [28, 18, 22, 28] },
  SS: { x: [30, 70, 50, 30], y: [35, 25, 30, 35] },
  AP: { x: [35, 65, 50, 35], y: [30, 20, 25, 30] },
}
