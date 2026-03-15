// Liste des pays pour le sélecteur du profil club
// Dédupliquée à partir de PRO_LEAGUES, AMATEUR_LEAGUES, CLUBS + pays courants supplémentaires
// Format compatible avec le composant Combobox

export interface CountryOption {
  value: string
  label: string
  /** Code ISO 3166-1 alpha-2 pour la restriction Google Places */
  isoCode?: string
}

export const COUNTRIES: CountryOption[] = [
  // Europe
  { value: "France", label: "France", isoCode: "fr" },
  { value: "Allemagne", label: "Allemagne", isoCode: "de" },
  { value: "Angleterre", label: "Angleterre", isoCode: "gb" },
  { value: "Espagne", label: "Espagne", isoCode: "es" },
  { value: "Italie", label: "Italie", isoCode: "it" },
  { value: "Portugal", label: "Portugal", isoCode: "pt" },
  { value: "Belgique", label: "Belgique", isoCode: "be" },
  { value: "Pays-Bas", label: "Pays-Bas", isoCode: "nl" },
  { value: "Suisse", label: "Suisse", isoCode: "ch" },
  { value: "Autriche", label: "Autriche", isoCode: "at" },
  { value: "Turquie", label: "Turquie", isoCode: "tr" },
  { value: "Grèce", label: "Grèce", isoCode: "gr" },
  { value: "Danemark", label: "Danemark", isoCode: "dk" },
  { value: "Suède", label: "Suède", isoCode: "se" },
  { value: "Norvège", label: "Norvège", isoCode: "no" },
  { value: "Finlande", label: "Finlande", isoCode: "fi" },
  { value: "Pologne", label: "Pologne", isoCode: "pl" },
  { value: "République tchèque", label: "République tchèque", isoCode: "cz" },
  { value: "Croatie", label: "Croatie", isoCode: "hr" },
  { value: "Serbie", label: "Serbie", isoCode: "rs" },
  { value: "Ukraine", label: "Ukraine", isoCode: "ua" },
  { value: "Russie", label: "Russie", isoCode: "ru" },
  { value: "Roumanie", label: "Roumanie", isoCode: "ro" },
  { value: "Hongrie", label: "Hongrie", isoCode: "hu" },
  { value: "Bulgarie", label: "Bulgarie", isoCode: "bg" },
  { value: "Slovaquie", label: "Slovaquie", isoCode: "sk" },
  { value: "Slovénie", label: "Slovénie", isoCode: "si" },
  { value: "Bosnie-Herzégovine", label: "Bosnie-Herzégovine", isoCode: "ba" },
  { value: "Albanie", label: "Albanie", isoCode: "al" },
  { value: "Macédoine du Nord", label: "Macédoine du Nord", isoCode: "mk" },
  { value: "Monténégro", label: "Monténégro", isoCode: "me" },
  { value: "Kosovo", label: "Kosovo", isoCode: "xk" },
  { value: "Luxembourg", label: "Luxembourg", isoCode: "lu" },
  { value: "Irlande", label: "Irlande", isoCode: "ie" },
  { value: "Écosse", label: "Écosse", isoCode: "gb" },
  { value: "Pays de Galles", label: "Pays de Galles", isoCode: "gb" },
  { value: "Islande", label: "Islande", isoCode: "is" },
  { value: "Chypre", label: "Chypre", isoCode: "cy" },
  { value: "Malte", label: "Malte", isoCode: "mt" },
  { value: "Géorgie", label: "Géorgie", isoCode: "ge" },
  { value: "Arménie", label: "Arménie", isoCode: "am" },
  { value: "Azerbaïdjan", label: "Azerbaïdjan", isoCode: "az" },
  // Amérique du Sud
  { value: "Brésil", label: "Brésil", isoCode: "br" },
  { value: "Argentine", label: "Argentine", isoCode: "ar" },
  { value: "Uruguay", label: "Uruguay", isoCode: "uy" },
  { value: "Chili", label: "Chili", isoCode: "cl" },
  { value: "Colombie", label: "Colombie", isoCode: "co" },
  { value: "Pérou", label: "Pérou", isoCode: "pe" },
  { value: "Équateur", label: "Équateur", isoCode: "ec" },
  { value: "Venezuela", label: "Venezuela", isoCode: "ve" },
  { value: "Paraguay", label: "Paraguay", isoCode: "py" },
  { value: "Bolivie", label: "Bolivie", isoCode: "bo" },
  // Amérique du Nord & Centrale
  { value: "États-Unis", label: "États-Unis", isoCode: "us" },
  { value: "Mexique", label: "Mexique", isoCode: "mx" },
  { value: "Canada", label: "Canada", isoCode: "ca" },
  { value: "Costa Rica", label: "Costa Rica", isoCode: "cr" },
  { value: "Honduras", label: "Honduras", isoCode: "hn" },
  { value: "Panama", label: "Panama", isoCode: "pa" },
  { value: "Jamaïque", label: "Jamaïque", isoCode: "jm" },
  // Asie
  { value: "Japon", label: "Japon", isoCode: "jp" },
  { value: "Corée du Sud", label: "Corée du Sud", isoCode: "kr" },
  { value: "Chine", label: "Chine", isoCode: "cn" },
  { value: "Arabie Saoudite", label: "Arabie Saoudite", isoCode: "sa" },
  { value: "Qatar", label: "Qatar", isoCode: "qa" },
  { value: "Émirats Arabes Unis", label: "Émirats Arabes Unis", isoCode: "ae" },
  { value: "Iran", label: "Iran", isoCode: "ir" },
  { value: "Irak", label: "Irak", isoCode: "iq" },
  { value: "Inde", label: "Inde", isoCode: "in" },
  { value: "Thaïlande", label: "Thaïlande", isoCode: "th" },
  { value: "Indonésie", label: "Indonésie", isoCode: "id" },
  // Afrique
  { value: "Maroc", label: "Maroc", isoCode: "ma" },
  { value: "Algérie", label: "Algérie", isoCode: "dz" },
  { value: "Tunisie", label: "Tunisie", isoCode: "tn" },
  { value: "Égypte", label: "Égypte", isoCode: "eg" },
  { value: "Sénégal", label: "Sénégal", isoCode: "sn" },
  { value: "Côte d'Ivoire", label: "Côte d'Ivoire", isoCode: "ci" },
  { value: "Cameroun", label: "Cameroun", isoCode: "cm" },
  { value: "Nigeria", label: "Nigeria", isoCode: "ng" },
  { value: "Ghana", label: "Ghana", isoCode: "gh" },
  { value: "Mali", label: "Mali", isoCode: "ml" },
  { value: "Guinée", label: "Guinée", isoCode: "gn" },
  { value: "Burkina Faso", label: "Burkina Faso", isoCode: "bf" },
  { value: "RD Congo", label: "RD Congo", isoCode: "cd" },
  { value: "Congo", label: "Congo", isoCode: "cg" },
  { value: "Gabon", label: "Gabon", isoCode: "ga" },
  { value: "Afrique du Sud", label: "Afrique du Sud", isoCode: "za" },
  { value: "Zambie", label: "Zambie", isoCode: "zm" },
  { value: "Zimbabwe", label: "Zimbabwe", isoCode: "zw" },
  { value: "Togo", label: "Togo", isoCode: "tg" },
  { value: "Bénin", label: "Bénin", isoCode: "bj" },
  { value: "Niger", label: "Niger", isoCode: "ne" },
  { value: "Madagascar", label: "Madagascar", isoCode: "mg" },
  { value: "Comores", label: "Comores", isoCode: "km" },
  { value: "Cap-Vert", label: "Cap-Vert", isoCode: "cv" },
  { value: "Maurice", label: "Maurice", isoCode: "mu" },
  // Océanie
  { value: "Australie", label: "Australie", isoCode: "au" },
  { value: "Nouvelle-Zélande", label: "Nouvelle-Zélande", isoCode: "nz" },
].sort((a, b) => {
  // France en premier, puis tri alphabétique
  if (a.value === "France") return -1
  if (b.value === "France") return 1
  return a.label.localeCompare(b.label, "fr")
})

/** Retourne le code ISO d'un pays à partir de son nom */
export function getCountryIsoCode(countryName: string): string | undefined {
  return COUNTRIES.find((c) => c.value === countryName)?.isoCode
}
