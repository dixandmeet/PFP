/**
 * Vérifie si une chaîne est un CUID (identifiant unique)
 * Les CUIDs commencent par 'c' et font 25 caractères alphanumériques
 */
export function isCuid(str: string): boolean {
  return /^c[a-z0-9]{24}$/.test(str)
}

/**
 * Génère un slug à partir d'un nom (ex: "Amadou Diallo" → "amadou-diallo")
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

