"use client"

import { useState, useRef } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play, Pause, Download, ZoomIn, Maximize2, Volume2, VolumeX, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getSupportedFormatsMessage } from "@/lib/utils/video-utils"

// Lazy load ReelsViewer (composant lourd, ouvert uniquement au clic)
const ReelsViewer = dynamic(() => import("./ReelsViewer").then(m => ({ default: m.ReelsViewer })), { ssr: false })

interface MediaItem {
  url: string
  type: 'image' | 'video' | 'document'
}

interface MediaGalleryProps {
  mediaUrls: string[]
  className?: string
  postId?: string
  postContent?: string
  postUser?: any
  postCreatedAt?: string
  postCounts?: { likes: number; comments: number; shares: number }
}

export function MediaGallery({ mediaUrls, className, postId, postContent, postUser, postCreatedAt, postCounts }: MediaGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [reelsOpen, setReelsOpen] = useState(false)
  const [reelsVideoIndex, setReelsVideoIndex] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playingVideos, setPlayingVideos] = useState<Record<number, boolean>>({})
  const [mutedVideos, setMutedVideos] = useState<Record<number, boolean>>({})
  const [lightboxVideoError, setLightboxVideoError] = useState(false)
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({})

  if (!mediaUrls || mediaUrls.length === 0) {
    return null
  }

  // Normaliser les URLs protocol-relative (//) en https://
  const normalizeUrl = (url: string): string => {
    if (url.startsWith('//')) return `https:${url}`
    return url
  }

  const getMediaType = (url: string): 'image' | 'video' | 'document' => {
    const lowerUrl = url.toLowerCase()
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/)) return 'image'
    if (lowerUrl.match(/\.(mp4|webm|mov|avi|mkv|flv|wmv|3gp|m4v|ogv)(\?|$)/)) return 'video'
    if (lowerUrl.match(/video/)) return 'video'
    return 'document'
  }

  const media: MediaItem[] = mediaUrls.map(url => ({
    url: normalizeUrl(url),
    type: getMediaType(url)
  }))

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxVideoError(false)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const openReels = (videoIndex: number) => {
    setReelsVideoIndex(videoIndex)
    setReelsOpen(true)
    // Mettre en pause la vidéo dans le feed
    Object.values(videoRefs.current).forEach(v => v?.pause())
  }

  const closeReels = () => {
    setReelsOpen(false)
  }

  const nextMedia = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length)
    setLightboxVideoError(false)
  }

  const prevMedia = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length)
    setLightboxVideoError(false)
  }

  const togglePlay = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const video = videoRefs.current[index]
    if (!video) return
    if (video.paused) {
      video.play()
      setPlayingVideos(prev => ({ ...prev, [index]: true }))
    } else {
      video.pause()
      setPlayingVideos(prev => ({ ...prev, [index]: false }))
    }
  }

  const toggleMute = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const video = videoRefs.current[index]
    if (!video) return
    video.muted = !video.muted
    setMutedVideos(prev => ({ ...prev, [index]: !video.muted }))
  }

  const hasVideos = media.some(m => m.type === 'video')
  const videos = media.filter(m => m.type === 'video')
  const images = media.filter(m => m.type === 'image')
  const documents = media.filter(m => m.type === 'document')

  const getGridLayout = () => {
    if (hasVideos && images.length === 0) {
      return videos.length === 1 ? "grid-cols-1" : "grid-cols-2"
    }
    switch (images.length) {
      case 1:
        return "grid-cols-1"
      case 2:
        return "grid-cols-2"
      case 3:
        return "grid-cols-2 sm:grid-cols-3"
      default:
        return "grid-cols-2"
    }
  }

  return (
    <>
      {/* Videos en format vertical */}
      {videos.length > 0 && (
        <div className={cn("grid gap-2 mb-2", videos.length === 1 ? "grid-cols-1" : "grid-cols-2", className)}>
          {videos.map((item, index) => {
            const globalIndex = media.indexOf(item)
            const isPlaying = playingVideos[globalIndex] ?? false
            const isUnmuted = mutedVideos[globalIndex] ?? false
            return (
              <div
                key={`video-${index}`}
                className={cn(
                  "relative rounded-xl overflow-hidden bg-black group w-full",
                  videos.length === 1 ? "aspect-[9/14] sm:aspect-[9/16] max-h-[60vh] sm:max-h-[70vh]" : "aspect-[9/14] sm:aspect-[9/16]"
                )}
              >
                <video
                  ref={(el) => { videoRefs.current[globalIndex] = el }}
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload="none"
                  onPlay={() => setPlayingVideos(prev => ({ ...prev, [globalIndex]: true }))}
                  onPause={() => setPlayingVideos(prev => ({ ...prev, [globalIndex]: false }))}
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    const fb = e.currentTarget.parentElement?.querySelector("[data-video-fallback]") as HTMLElement
                    if (fb) fb.style.display = "flex"
                  }}
                />

                {/* Fallback si format vidéo non supporté */}
                <div data-video-fallback className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-4 text-center" style={{ display: "none" }}>
                  <Film className="h-12 w-12 text-white/60 mb-3 flex-shrink-0" />
                  <p className="text-sm text-white/70 font-medium">Format vidéo non supporté par le navigateur</p>
                  <p className="text-xs text-white/50 mt-2 max-w-sm">{getSupportedFormatsMessage()}</p>
                  <a href={item.url} download className="mt-4 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs hover:bg-white/20 transition-colors">
                    Télécharger la vidéo
                  </a>
                </div>

                {/* Overlay controles */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {/* Bouton play/pause au centre */}
                  <button
                    onClick={(e) => togglePlay(globalIndex, e)}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="p-4 rounded-full bg-black/50 backdrop-blur-sm">
                      {isPlaying ? (
                        <Pause className="h-8 w-8 text-white fill-white" />
                      ) : (
                        <Play className="h-8 w-8 text-white fill-white" />
                      )}
                    </div>
                  </button>

                  {/* Controles bas */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-between">
                    <button
                      onClick={(e) => toggleMute(globalIndex, e)}
                      className="p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
                    >
                      {isUnmuted ? (
                        <Volume2 className="h-4 w-4 text-white" />
                      ) : (
                        <VolumeX className="h-4 w-4 text-white" />
                      )}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); openReels(index) }}
                      className="p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
                    >
                      <Maximize2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Indicateur mute visible quand pas de hover */}
                {!isUnmuted && (
                  <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 backdrop-blur-sm group-hover:opacity-0 transition-opacity">
                    <VolumeX className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Images */}
      {images.length > 0 && (
        <div className={cn("grid gap-2", getGridLayout(), !hasVideos && className)}>
        {images.slice(0, 4).map((item, index) => {
          const globalIndex = media.indexOf(item)
          return (
          <div
            key={index}
            className={cn(
              "relative aspect-video rounded-lg overflow-hidden bg-stadium-100 cursor-pointer group",
              images.length === 1 && "aspect-[16/10]",
              images.length === 3 && index === 0 && "col-span-2"
            )}
            onClick={() => openLightbox(globalIndex)}
          >
            <Image
              src={item.url}
              alt={`Média ${index + 1}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8" />
            </div>

            {index === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-3xl font-black">
                  +{images.length - 4}
                </span>
              </div>
            )}
          </div>
          )
        })}
        </div>
      )}

      {/* Documents — pièces jointes compactes */}
      {documents.length > 0 && (
        <div className={cn("flex flex-col gap-2", className)}>
          {documents.map((item, index) => {
            const fileName = item.url.split('/').pop()?.split('?')[0] || 'Document'
            return (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-stadium-100 bg-stadium-50 hover:bg-stadium-100 transition-colors group"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex-shrink-0 p-2 rounded-lg bg-white shadow-sm group-hover:shadow-md transition-shadow">
                  <Download className="h-5 w-5 text-pitch-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stadium-800 truncate">{fileName}</p>
                  <p className="text-xs text-stadium-500">Cliquer pour ouvrir</p>
                </div>
              </a>
            )
          })}
        </div>
      )}

      {/* Reels Viewer - Mode plein écran pour les vidéos */}
      <AnimatePresence>
        {reelsOpen && (
          <ReelsViewer
            reels={videos.map((item, idx) => ({
              id: postId || `video-${idx}`,
              content: postContent || "",
              videoUrl: item.url,
              createdAt: postCreatedAt || new Date().toISOString(),
              user: postUser || { id: "", email: "", role: "PLAYER" },
              _count: postCounts || { likes: 0, comments: 0, shares: 0 },
            }))}
            initialIndex={reelsVideoIndex}
            onClose={closeReels}
          />
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent z-10">
              <span className="text-white font-semibold">
                {currentIndex + 1} / {media.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10"
                onClick={(e) => {
                  e.stopPropagation()
                  closeLightbox()
                }}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Contenu principal */}
            <div
              className="max-w-7xl max-h-[90vh] w-full mx-auto px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                {media[currentIndex].type === 'image' && (
                  <img
                    src={media[currentIndex].url}
                    alt={`Média ${currentIndex + 1}`}
                    className="w-full h-auto max-h-[85vh] object-contain mx-auto rounded-lg"
                  />
                )}

                {media[currentIndex].type === 'video' && (
                  <div className="flex flex-col items-center justify-center max-h-[85vh] min-h-[200px]">
                    {!lightboxVideoError ? (
                      <video
                        src={media[currentIndex].url}
                        controls
                        autoPlay
                        playsInline
                        className="max-w-lg w-full h-auto max-h-[85vh] object-contain mx-auto rounded-xl"
                        onError={() => setLightboxVideoError(true)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center bg-slate-900 rounded-xl p-6 max-w-md text-center">
                        <Film className="h-14 w-14 text-white/60 mb-4 flex-shrink-0" />
                        <p className="text-sm font-medium text-white/80">Format vidéo non supporté par le navigateur</p>
                        <p className="text-xs text-white/50 mt-2">{getSupportedFormatsMessage()}</p>
                        <a
                          href={media[currentIndex].url}
                          download
                          className="mt-4 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm hover:bg-white/20 transition-colors inline-flex"
                        >
                          Télécharger la vidéo
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {media[currentIndex].type === 'document' && (
                  <div className="bg-white rounded-lg p-8 text-center max-w-md mx-auto">
                    <Download className="h-16 w-16 text-pitch-600 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-stadium-900 mb-4">
                      Document
                    </h3>
                    <Button
                      onClick={() => window.open(media[currentIndex].url, '_blank')}
                      className="bg-gradient-to-r from-pitch-600 to-pitch-700"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </Button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Navigation */}
            {media.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 h-12 w-12"
                  onClick={(e) => {
                    e.stopPropagation()
                    prevMedia()
                  }}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 h-12 w-12"
                  onClick={(e) => {
                    e.stopPropagation()
                    nextMedia()
                  }}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
