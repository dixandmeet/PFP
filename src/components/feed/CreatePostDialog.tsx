"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { 
  Loader2, 
  Send, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  X,
  Plus,
} from "lucide-react"
import { validateMediaFile, getMediaType, formatFileSize } from "@/lib/utils/post-utils"
import { RECOMMENDED_VIDEO_FORMATS_LABEL } from "@/lib/utils/video-utils"

interface MediaPreview {
  file: File
  url: string
  type: 'image' | 'video' | 'document'
}

interface CreatePostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPostCreated: (post: any) => void
}

export function CreatePostDialog({ open, onOpenChange, onPostCreated }: CreatePostDialogProps) {
  const { toast } = useToast()
  const [posting, setPosting] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<MediaPreview[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, watch } = useForm<{ content: string }>()
  const content = watch("content", "")

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    addFiles(files)
  }

  const addFiles = async (files: File[]) => {
    const maxFiles = 5
    
    if (mediaFiles.length + files.length > maxFiles) {
      toast({
        title: "Limite atteinte",
        description: `Vous ne pouvez ajouter que ${maxFiles} fichiers maximum`,
        variant: "destructive",
      })
      return
    }

    const validFiles: MediaPreview[] = []
    
    for (const file of files) {
      if (!validateMediaFile(file)) {
        const isVideo = file.type.startsWith('video/')
        toast({
          title: "Fichier non valide",
          description: isVideo
            ? `${file.name} dépasse la limite de 100MB`
            : `${file.name} n'est pas un type de fichier supporté ou dépasse 10MB`,
          variant: "destructive",
        })
        continue
      }

      const preview: MediaPreview = {
        file,
        url: URL.createObjectURL(file),
        type: getMediaType(file.type)
      }
      validFiles.push(preview)
    }

    setMediaFiles([...mediaFiles, ...validFiles])
  }

  const removeFile = (index: number) => {
    const newFiles = [...mediaFiles]
    URL.revokeObjectURL(newFiles[index].url)
    newFiles.splice(index, 1)
    setMediaFiles(newFiles)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    addFiles(files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const uploadMediaFiles = async (): Promise<string[]> => {
    if (mediaFiles.length === 0) return []

    const uploadedUrls: string[] = []

    for (const media of mediaFiles) {
      try {
        // Upload via proxy serveur — raw body (évite les erreurs FormData de Next.js)
        const uploadResponse = await fetch("/api/files/upload-proxy", {
          method: "POST",
          headers: {
            "Content-Type": media.file.type,
            "x-file-name": media.file.name,
            "x-file-type": "POST_MEDIA",
            "x-is-public": "true",
          },
          body: media.file,
        })

        const data = await uploadResponse.json()

        if (!uploadResponse.ok) {
          throw new Error(data.error || `Erreur lors de l'upload`)
        }

        uploadedUrls.push(data.fileAsset.url)
      } catch (error: any) {
        console.error("Erreur upload:", error)
        throw new Error(error.message || `Impossible d'uploader ${media.file.name}`)
      }
    }

    return uploadedUrls
  }

  const onSubmit = async (data: { content: string }) => {
    if (!data.content.trim() && mediaFiles.length === 0) {
      toast({
        title: "Contenu requis",
        description: "Veuillez ajouter du texte ou des médias",
        variant: "destructive",
      })
      return
    }

    setPosting(true)
    setUploading(true)

    try {
      // Upload des médias
      const mediaUrls = await uploadMediaFiles()
      setUploading(false)

      // Créer le post
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: data.content,
          mediaUrls,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur")
      }

      const newPost = await response.json()
      onPostCreated(newPost)

      toast({
        title: "Succès",
        description: "Post publié avec succès",
      })

      // Reset
      reset()
      setMediaFiles([])
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setPosting(false)
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-pitch-200 max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-pitch-500 to-pitch-600 rounded-lg">
              <ImageIcon className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black text-stadium-900">
              Créer un post
            </DialogTitle>
          </div>
          <DialogDescription className="text-stadium-600">
            Partagez une actualité, une réussite, une réflexion avec la communauté...
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Textarea */}
          <Textarea
            {...register("content", {
              maxLength: 5000,
            })}
            placeholder="Quoi de neuf ? Partagez vos pensées, succès, objectifs...
            
Utilisez @ pour mentionner quelqu'un
Utilisez # pour ajouter un hashtag"
            rows={6}
            className="border-2 border-pitch-100 focus:border-pitch-300 resize-none"
          />
          <div className="text-xs text-stadium-500 text-right">
            {content.length}/5000
          </div>

          {/* Prévisualisations des médias */}
          {mediaFiles.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mediaFiles.map((media, index) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-lg overflow-hidden bg-stadium-100 group"
                >
                  {media.type === 'image' && (
                    <img
                      src={media.url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {media.type === 'video' && (
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      onMouseEnter={(e) => e.currentTarget.play().catch(() => {})}
                      onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0 }}
                      onError={(e) => {
                        // Format non supporté par le navigateur → afficher fallback
                        e.currentTarget.style.display = "none"
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement
                        if (fallback) fallback.style.display = "flex"
                      }}
                    />
                  )}
                  {media.type === 'video' && (
                    <div className="w-full h-full flex-col items-center justify-center bg-slate-800" style={{ display: "none" }}>
                      <Video className="h-10 w-10 text-white mb-2" />
                      <p className="text-xs text-white/70 font-medium">{media.file.name}</p>
                    </div>
                  )}
                  {media.type === 'document' && (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2">
                      <FileText className="h-8 w-8 text-stadium-600 mb-2" />
                      <p className="text-xs text-center text-stadium-600 font-medium truncate w-full px-2">
                        {media.file.name}
                      </p>
                      <p className="text-xs text-stadium-500">
                        {formatFileSize(media.file.size)}
                      </p>
                    </div>
                  )}
                  
                  {/* Bouton supprimer */}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Zone drag & drop */}
          {mediaFiles.length < 5 && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-pitch-200 rounded-lg p-6 text-center hover:border-pitch-400 hover:bg-pitch-50/50 transition-all cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2">
                  <ImageIcon className="h-6 w-6 text-pitch-600" />
                  <Video className="h-6 w-6 text-pitch-600" />
                  <FileText className="h-6 w-6 text-pitch-600" />
                </div>
                <p className="text-sm font-semibold text-stadium-900">
                  Cliquez ou glissez des fichiers ici
                </p>
                <p className="text-xs text-stadium-500">
                  Images ou documents (max 10MB), vidéos (max 100MB), 5 fichiers max
                </p>
                <p className="text-[10px] text-stadium-400 mt-0.5">
                  Vidéo : {RECOMMENDED_VIDEO_FORMATS_LABEL}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.avi,.mkv,.flv,.wmv,.mov,.mp4,.webm,.ogv,.3gp,.m4v"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 justify-between items-stretch sm:items-center pt-4 border-t-2 border-stadium-100">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={posting || mediaFiles.length >= 5}
                className="border-2 border-pitch-200 hover:bg-pitch-50"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Medias
              </Button>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset()
                  setMediaFiles([])
                  onOpenChange(false)
                }}
                className="border-2 border-stadium-200 hover:bg-stadium-50 font-semibold"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={posting}
                className="bg-gradient-to-r from-pitch-600 to-pitch-700 hover:from-pitch-700 hover:to-pitch-800 text-white font-bold shadow-lg"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Upload...
                  </>
                ) : posting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publication...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Publier
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
