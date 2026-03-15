/**
 * Utilitaires pour générer les initiales des joueurs et clubs
 * Utilisés comme fallback quand aucune image n'est disponible
 */

/**
 * Génère les initiales d'un joueur à partir de son nom
 * @param name - Nom complet du joueur (ex: "Kylian Mbappé")
 * @returns Les initiales en majuscules (ex: "KM")
 */
export function getPlayerInitials(name: string): string {
  if (!name || typeof name !== "string") return "?"
  
  const cleanName = name.trim()
  if (!cleanName) return "?"
  
  // Séparer le nom en parties (gère les noms composés)
  const parts = cleanName.split(/[\s-]+/).filter(part => part.length > 0)
  
  if (parts.length === 0) return "?"
  
  if (parts.length === 1) {
    // Un seul mot : prendre les 2 premières lettres
    return parts[0].slice(0, 2).toUpperCase()
  }
  
  // Plusieurs mots : prendre la première lettre du premier et du dernier mot
  const firstInitial = parts[0][0] || ""
  const lastInitial = parts[parts.length - 1][0] || ""
  
  return (firstInitial + lastInitial).toUpperCase()
}

/**
 * Génère les initiales d'un club à partir de son nom ou shortName
 * @param name - Nom complet du club (ex: "Paris Saint-Germain")
 * @param shortName - Nom court optionnel (ex: "PSG")
 * @returns Les initiales en majuscules (ex: "PSG" ou "PAR")
 */
export function getClubInitials(name: string, shortName?: string | null): string {
  // Si un shortName existe et est valide, l'utiliser directement (max 4 caractères)
  if (shortName && typeof shortName === "string" && shortName.trim().length > 0) {
    return shortName.trim().slice(0, 4).toUpperCase()
  }
  
  if (!name || typeof name !== "string") return "?"
  
  const cleanName = name.trim()
  if (!cleanName) return "?"
  
  // Liste des préfixes courants à ignorer
  const prefixesToIgnore = ["FC", "AC", "AS", "SS", "SC", "CF", "CD", "RC", "US", "AJ", "OGC", "SM"]
  
  // Séparer le nom en mots
  const words = cleanName.split(/[\s-]+/).filter(word => word.length > 0)
  
  if (words.length === 0) return "?"
  
  // Filtrer les préfixes courants pour les initiales
  const significantWords = words.filter(word => 
    !prefixesToIgnore.includes(word.toUpperCase())
  )
  
  // Si après filtrage il ne reste rien, utiliser les mots originaux
  const wordsToUse = significantWords.length > 0 ? significantWords : words
  
  if (wordsToUse.length === 1) {
    // Un seul mot significatif : prendre les 3 premières lettres
    return wordsToUse[0].slice(0, 3).toUpperCase()
  }
  
  // Plusieurs mots : prendre la première lettre de chaque mot (max 3)
  const initials = wordsToUse
    .slice(0, 3)
    .map(word => word[0] || "")
    .join("")
  
  return initials.toUpperCase()
}

/**
 * Génère les initiales à partir d'un prénom et nom séparés
 * @param firstName - Prénom (ex: "Kylian")
 * @param lastName - Nom (ex: "Mbappé")
 * @returns Les initiales en majuscules (ex: "KM")
 */
export function getInitialsFromNames(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.trim() || ""
  const last = lastName?.trim() || ""
  
  if (!first && !last) return "?"
  
  const firstInitial = first[0] || ""
  const lastInitial = last[0] || ""
  
  if (!firstInitial && lastInitial) {
    // Pas de prénom, prendre 2 lettres du nom
    return last.slice(0, 2).toUpperCase()
  }
  
  if (firstInitial && !lastInitial) {
    // Pas de nom, prendre 2 lettres du prénom
    return first.slice(0, 2).toUpperCase()
  }
  
  return (firstInitial + lastInitial).toUpperCase()
}
