"use client"

import { useRef, useState, useCallback } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Upload,
  Loader2,
  Trash2,
  RefreshCw,
  ImageIcon,
  AlertCircle,
} from "lucide-react"
import {
  ACCEPTED_IMAGE_EXTENSIONS,
  ACCEPTED_IMAGE_TYPES,
  LOGO_RECOMMENDED,
  COVER_RECOMMENDED,
  formatMaxSize,
  MAX_IMAGE_FILE_SIZE,
  validateImageFile,
} from "@/lib/constants/upload"

// ─── Dropzone interne ─────────────────────────────────────────────────────────

interface ImageDropzoneProps {
  label: string
  value: string | undefined
  recommended: typeof LOGO_RECOMMENDED | typeof COVER_RECOMMENDED
  uploading: boolean
  onUpload: (file: File) => void
  onRemove: () => void
  id: string
  children: (props: {
    hasImage: boolean
    uploading: boolean
    dragOver: boolean
    openFilePicker: () => void
    onRemove: () => void
  }) => React.ReactNode
}

function ImageDropzone({
  label,
  value,
  uploading,
  onUpload,
  onRemove,
  id,
  children,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback(
    (file: File) => {
      setError(null)
      const validationError = validateImageFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
      onUpload(file)
    },
    [onUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
      if (inputRef.current) inputRef.current.value = ""
    },
    [handleFile]
  )

  const hasImage = Boolean(value && value !== "")
  const openFilePicker = useCallback(() => inputRef.current?.click(), [])

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {children({ hasImage, uploading, dragOver, openFilePicker, onRemove })}

      {/* Erreur de validation */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 mt-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input file caché */}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        onChange={handleChange}
        className="hidden"
        disabled={uploading}
        aria-label={label}
      />
    </div>
  )
}

// ─── Props du composant principal ─────────────────────────────────────────────

interface ClubImagesSectionProps {
  logoUrl: string | undefined
  coverPhotoUrl: string | undefined
  uploadingLogo: boolean
  uploadingCover: boolean
  onUploadLogo: (file: File) => void
  onUploadCover: (file: File) => void
  onRemoveLogo: () => void
  onRemoveCover: () => void
}

export function ClubImagesSection({
  logoUrl,
  coverPhotoUrl,
  uploadingLogo,
  uploadingCover,
  onUploadLogo,
  onUploadCover,
  onRemoveLogo,
  onRemoveCover,
}: ClubImagesSectionProps) {
  return (
    <Card hover={false}>
      <CardHeader>
        <CardTitle>Images</CardTitle>
        <CardDescription>
          Logo et photo de couverture de votre club
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ── Photo de couverture (pleine largeur, ratio 4:1) ── */}
        <div className="space-y-2">
          <Label>Photo de couverture</Label>
          <ImageDropzone
            id="cover-upload"
            label="Photo de couverture"
            value={coverPhotoUrl}
            recommended={COVER_RECOMMENDED}
            uploading={uploadingCover}
            onUpload={onUploadCover}
            onRemove={onRemoveCover}
          >
            {({ hasImage, uploading, dragOver, openFilePicker, onRemove }) => (
              <div
                className={`
                  relative w-full rounded-xl border-2 border-dashed overflow-hidden transition-all duration-200
                  ${dragOver ? "border-pitch-500 bg-pitch-50" : "border-stadium-200 hover:border-pitch-300"}
                `}
                style={{ aspectRatio: "4 / 1", minHeight: 120 }}
              >
                {/* Uploading */}
                {uploading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                    <Loader2 className="h-6 w-6 animate-spin text-pitch-600 mb-1.5" />
                    <p className="text-xs font-medium text-pitch-700">Téléchargement…</p>
                  </div>
                )}

                {/* Image existante */}
                {hasImage && !uploading ? (
                  <div className="relative w-full h-full group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverPhotoUrl!}
                      alt="Photo de couverture"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 group-hover:bg-black/40 transition-colors duration-200">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        animated={false}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-xs h-8"
                        onClick={openFilePicker}
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1" />
                        Remplacer
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        animated={false}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs h-8"
                        onClick={onRemove}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ) : !uploading ? (
                  <button
                    type="button"
                    onClick={openFilePicker}
                    className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                  >
                    <Upload className="h-5 w-5 text-stadium-400 mb-1.5" />
                    <p className="text-sm font-medium text-stadium-600">
                      Cliquez ou glissez-déposez
                    </p>
                    <p className="text-xs text-stadium-400 mt-0.5">
                      {ACCEPTED_IMAGE_EXTENSIONS} — max {formatMaxSize(MAX_IMAGE_FILE_SIZE)}
                    </p>
                  </button>
                ) : null}
              </div>
            )}
          </ImageDropzone>
          <div className="flex items-center gap-1.5 text-xs text-stadium-400">
            <ImageIcon className="h-3 w-3" />
            <span>Recommandé : {COVER_RECOMMENDED.label} ({COVER_RECOMMENDED.ratio})</span>
          </div>
        </div>

        {/* ── Logo (petit, carré, aligné à gauche) ── */}
        <div className="space-y-2">
          <Label>Logo du club</Label>
          <ImageDropzone
            id="logo-upload"
            label="Logo du club"
            value={logoUrl}
            recommended={LOGO_RECOMMENDED}
            uploading={uploadingLogo}
            onUpload={onUploadLogo}
            onRemove={onRemoveLogo}
          >
            {({ hasImage, uploading, dragOver, openFilePicker, onRemove }) => (
              <div className="flex items-start gap-4">
                {/* Carré logo */}
                <div
                  className={`
                    relative shrink-0 w-28 h-28 rounded-xl border-2 border-dashed overflow-hidden transition-all duration-200
                    ${dragOver ? "border-pitch-500 bg-pitch-50" : "border-stadium-200 hover:border-pitch-300"}
                  `}
                >
                  {/* Uploading */}
                  {uploading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                      <Loader2 className="h-5 w-5 animate-spin text-pitch-600" />
                    </div>
                  )}

                  {/* Image existante */}
                  {hasImage && !uploading ? (
                    <div className="relative w-full h-full group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={logoUrl!}
                        alt="Logo du club"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-200">
                        <button
                          type="button"
                          onClick={openFilePicker}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-white/90 hover:bg-white"
                          aria-label="Remplacer le logo"
                        >
                          <RefreshCw className="h-3.5 w-3.5 text-stadium-700" />
                        </button>
                      </div>
                    </div>
                  ) : !uploading ? (
                    <button
                      type="button"
                      onClick={openFilePicker}
                      className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                    >
                      <Upload className="h-5 w-5 text-stadium-400 mb-1" />
                      <p className="text-[10px] text-stadium-400 leading-tight text-center px-1">
                        Logo
                      </p>
                    </button>
                  ) : null}
                </div>

                {/* Infos + actions à droite du carré */}
                <div className="flex flex-col gap-2 pt-1">
                  <div className="space-y-1">
                    <p className="text-xs text-stadium-500">
                      {ACCEPTED_IMAGE_EXTENSIONS} — max {formatMaxSize(MAX_IMAGE_FILE_SIZE)}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-stadium-400">
                      <ImageIcon className="h-3 w-3" />
                      <span>Recommandé : {LOGO_RECOMMENDED.label} ({LOGO_RECOMMENDED.ratio})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      animated={false}
                      className="text-xs h-8"
                      onClick={openFilePicker}
                      disabled={uploading}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1" />
                      {hasImage ? "Remplacer" : "Télécharger"}
                    </Button>
                    {hasImage && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        animated={false}
                        className="text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={onRemove}
                        disabled={uploading}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Supprimer
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </ImageDropzone>
        </div>
      </CardContent>
    </Card>
  )
}
