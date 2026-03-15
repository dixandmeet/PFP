/**
 * Utilitaires pour la lecture vidéo dans le navigateur.
 * Les formats réellement supportés dépendent du navigateur (Safari, Chrome, Firefox, etc.).
 */

/** MIME types courants et libellés pour affichage */
const VIDEO_FORMATS: { mime: string; label: string }[] = [
  { mime: 'video/mp4', label: 'MP4 (H.264)' },
  { mime: 'video/webm; codecs="vp8,vp9"', label: 'WebM (VP8/VP9)' },
  { mime: 'video/ogg; codecs="theora"', label: 'OGG (Theora)' },
  { mime: 'video/mp4; codecs="avc1.42E01E"', label: 'MP4 (H.264 baseline)' },
]

/** Formats recommandés pour une compatibilité maximale (message statique) */
export const RECOMMENDED_VIDEO_FORMATS_LABEL =
  'MP4 (H.264), WebM, OGG. Privilégiez le MP4 pour la meilleure compatibilité.'

/**
 * Détecte les formats vidéo que le navigateur peut lire (côté client uniquement).
 * À appeler dans un composant "use client" ou après mount.
 */
export function getSupportedVideoFormats(): string[] {
  if (typeof document === 'undefined' || !document.createElement) {
    return ['MP4 (H.264)', 'WebM', 'OGG']
  }
  const video = document.createElement('video')
  const supported: string[] = []
  for (const { mime, label } of VIDEO_FORMATS) {
    const can = video.canPlayType(mime)
    if (can === 'probably' || can === 'maybe') {
      if (!supported.includes(label)) supported.push(label)
    }
  }
  return supported.length > 0 ? supported : ['MP4 (H.264)', 'WebM', 'OGG']
}

/**
 * Message court à afficher quand une vidéo ne peut pas être lue :
 * "Formats acceptés par ce navigateur : …"
 */
export function getSupportedFormatsMessage(): string {
  const formats = getSupportedVideoFormats()
  return `Formats acceptés par ce navigateur : ${formats.join(', ')}.`
}
