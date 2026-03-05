// Constantes pour les uploads d'images (logo, couverture, etc.)

/** Taille maximale de fichier en octets (2 MB) */
export const MAX_IMAGE_FILE_SIZE = 2 * 1024 * 1024

/** Types MIME acceptés pour les images */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const

/** Extensions affichées à l'utilisateur */
export const ACCEPTED_IMAGE_EXTENSIONS = "PNG, JPG, WebP"

/** Taille recommandée pour le logo du club */
export const LOGO_RECOMMENDED = {
  width: 512,
  height: 512,
  label: "512 × 512 px",
  ratio: "1:1",
} as const

/** Taille recommandée pour la photo de couverture */
export const COVER_RECOMMENDED = {
  width: 1600,
  height: 400,
  label: "1600 × 400 px",
  ratio: "4:1",
} as const

/** Formatte la taille max en texte lisible */
export function formatMaxSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(0)} Mo`
}

/** Valide un fichier côté client avant upload */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as typeof ACCEPTED_IMAGE_TYPES[number])) {
    return `Format non accepté. Utilisez ${ACCEPTED_IMAGE_EXTENSIONS}.`
  }
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return `Le fichier est trop volumineux (max ${formatMaxSize(MAX_IMAGE_FILE_SIZE)}).`
  }
  return null
}
