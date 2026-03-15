// Utilitaires pour les posts, mentions et hashtags

/**
 * Extrait toutes les mentions (@username) d'un contenu
 * @param content Le contenu du post
 * @returns Array de usernames sans le @
 */
export function extractMentions(content: string): string[] {
  const mentionRegex = /@(\w+)/g
  const matches = content.matchAll(mentionRegex)
  const mentions = new Set<string>()
  
  for (const match of matches) {
    mentions.add(match[1])
  }
  
  return Array.from(mentions)
}

/**
 * Extrait tous les hashtags (#tag) d'un contenu
 * @param content Le contenu du post
 * @returns Array de tags sans le #
 */
export function extractHashtags(content: string): string[] {
  const hashtagRegex = /#(\w+)/g
  const matches = content.matchAll(hashtagRegex)
  const hashtags = new Set<string>()
  
  for (const match of matches) {
    hashtags.add(match[1].toLowerCase()) // Normaliser en minuscules
  }
  
  return Array.from(hashtags)
}

/**
 * Formate le contenu d'un post en ajoutant des liens cliquables pour mentions et hashtags
 * @param content Le contenu du post
 * @returns Le contenu formaté en HTML
 */
export function formatPostContent(content: string): string {
  let formatted = content

  // Remplacer les mentions par des liens
  formatted = formatted.replace(
    /@(\w+)/g,
    '<a href="/profile/$1" class="text-pitch-600 hover:text-pitch-700 font-semibold hover:underline">@$1</a>'
  )

  // Remplacer les hashtags par des liens
  formatted = formatted.replace(
    /#(\w+)/g,
    '<a href="/feed?hashtag=$1" class="text-pitch-600 hover:text-pitch-700 font-semibold hover:underline">#$1</a>'
  )

  // Préserver les sauts de ligne
  formatted = formatted.replace(/\n/g, '<br />')

  return formatted
}

/**
 * Valide un fichier média pour l'upload
 * @param file Le fichier à valider
 * @param maxSizeMB Taille maximale en MB (défaut: 10)
 * @returns true si valide, false sinon
 */
export function validateMediaFile(file: File, maxSizeMB?: number): boolean {
  const isVideo = file.type.startsWith('video/')
  const effectiveMaxMB = maxSizeMB ?? (isVideo ? 100 : 10)
  const maxSize = effectiveMaxMB * 1024 * 1024

  if (file.size > maxSize) {
    return false
  }

  if (file.type.startsWith('image/')) return true
  if (file.type.startsWith('video/')) return true

  const allowedDocTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]

  return allowedDocTypes.includes(file.type)
}

/**
 * Détermine le type de média en fonction du MIME type
 * @param mimeType Le type MIME du fichier
 * @returns 'image', 'video' ou 'document'
 */
export function getMediaType(mimeType: string): 'image' | 'video' | 'document' {
  if (mimeType.startsWith('image/')) {
    return 'image'
  }
  if (mimeType.startsWith('video/')) {
    return 'video'
  }
  return 'document'
}

/**
 * Formate la taille d'un fichier en format lisible
 * @param bytes Taille en bytes
 * @returns Taille formatée (ex: "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Génère un nom de fichier unique pour éviter les collisions
 * @param originalFilename Le nom de fichier original
 * @returns Un nom de fichier unique
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalFilename.split('.').pop()
  const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, "")
  const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_')
  
  return `${cleanName}_${timestamp}_${random}.${extension}`
}

/**
 * Tronque le contenu d'un post pour un aperçu
 * @param content Le contenu complet
 * @param maxLength Longueur maximale (défaut: 200)
 * @returns Le contenu tronqué avec "..." si nécessaire
 */
export function truncateContent(content: string, maxLength: number = 200): string {
  if (content.length <= maxLength) {
    return content
  }
  return content.substring(0, maxLength).trim() + '...'
}

/**
 * Calcule le temps écoulé depuis une date (format relatif)
 * @param date La date à comparer
 * @returns Temps relatif (ex: "il y a 2 heures")
 */
export function getRelativeTime(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSeconds < 60) {
    return 'à l\'instant'
  } else if (diffMinutes < 60) {
    return `il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`
  } else if (diffHours < 24) {
    return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`
  } else if (diffDays < 7) {
    return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
  } else if (diffWeeks < 4) {
    return `il y a ${diffWeeks} semaine${diffWeeks > 1 ? 's' : ''}`
  } else if (diffMonths < 12) {
    return `il y a ${diffMonths} mois`
  } else {
    return `il y a ${diffYears} an${diffYears > 1 ? 's' : ''}`
  }
}
