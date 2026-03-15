"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Camera,
  MapPin,
  Trophy,
  Shield,
  Edit,
  ImageIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ClubProfileHeroProps {
  clubName: string
  shortName?: string
  logo?: string
  coverPhoto?: string
  city?: string
  country?: string
  league?: string
  bio?: string
  isVerified?: boolean
  onEditCover?: (file: File) => void
  onEditProfile?: () => void
}

export function ClubProfileHero({
  clubName,
  shortName,
  logo,
  coverPhoto,
  city,
  country,
  league,
  bio,
  isVerified,
  onEditCover,
  onEditProfile,
}: ClubProfileHeroProps) {
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const initials = clubName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase()

  const location = [city, country].filter(Boolean).join(", ")

  const handleCoverClick = () => {
    coverInputRef.current?.click()
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onEditCover) {
      setIsUploadingCover(true)
      onEditCover(file)
      setTimeout(() => setIsUploadingCover(false), 2000)
    }
  }

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-stadium-100 bg-white">
      <div
        role="button"
        tabIndex={0}
        aria-label="Modifier la photo de couverture"
        onClick={handleCoverClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handleCoverClick()
          }
        }}
        className={cn(
          "relative w-full cursor-pointer group",
          "aspect-[16/5] md:aspect-[16/5] aspect-[16/7]"
        )}
      >
        {coverPhoto ? (
          coverPhoto.startsWith("/uploads") ? (
            <img
              src={coverPhoto}
              alt="Photo de couverture"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <Image
              src={coverPhoto}
              alt="Photo de couverture"
              fill
              className="object-cover"
              priority
            />
          )
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-pitch-100 via-pitch-50 to-stadium-100">
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23166534' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-stadium-400 gap-2">
              <div className="p-4 bg-white/60 rounded-2xl backdrop-blur-sm">
                <ImageIcon className="h-8 w-8" />
              </div>
              <p className="text-sm font-medium">Aucune photo de couverture</p>
              <p className="text-xs text-stadium-300">
                Cliquez pour ajouter une image qui represente votre club
              </p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 group-focus-visible:bg-black/10 transition-colors duration-200" />

        <button
          type="button"
          aria-label="Ajouter ou changer la couverture"
          title="Ajouter / changer la couverture"
          onClick={(e) => {
            e.stopPropagation()
            handleCoverClick()
          }}
          className={cn(
            "absolute top-4 right-4 p-3 rounded-full shadow-lg",
            "bg-white/90 hover:bg-white text-stadium-700 hover:text-pitch-700",
            "transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-500 focus-visible:ring-offset-2",
            isUploadingCover && "animate-pulse"
          )}
        >
          <Camera className="h-5 w-5" />
        </button>

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverChange}
          disabled={isUploadingCover}
          aria-label="Uploader une photo de couverture"
        />
      </div>

      <div className="relative px-6 pb-6 pt-0">
        <div className="flex flex-col sm:flex-row items-start gap-4 -mt-12 sm:-mt-14">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative flex-shrink-0"
          >
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-stadium-100">
              {logo ? (
                logo.startsWith("/uploads") ? (
                  <img
                    src={logo}
                    alt={`Logo ${clubName}`}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Image
                    src={logo}
                    alt={`Logo ${clubName}`}
                    width={112}
                    height={112}
                    className="object-cover w-full h-full"
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pitch-400 to-pitch-600">
                  <span className="text-white font-bold text-xl">
                    {initials}
                  </span>
                </div>
              )}
            </div>
            {isVerified && (
              <div
                className="absolute bottom-1 right-1 bg-pitch-600 rounded-full p-1.5 shadow-lg"
                title="Club verifie"
              >
                <Shield className="h-4 w-4 text-white" />
              </div>
            )}
          </motion.div>

          <div className="flex-1 pt-2 sm:pt-6 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-stadium-900 leading-tight mt-[35px]">
              {clubName}
              {shortName && (
                <span className="text-stadium-400 font-normal text-lg ml-2">
                  ({shortName})
                </span>
              )}
            </h1>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              {league && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pitch-50 text-pitch-700 rounded-full text-sm font-medium">
                  <Trophy className="h-3.5 w-3.5" />
                  {league}
                </span>
              )}
              {location && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stadium-50 text-stadium-600 rounded-full text-sm font-medium">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                </span>
              )}
              {isVerified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-pitch-50 text-pitch-700 rounded-full text-sm font-medium">
                  <Shield className="h-3.5 w-3.5" />
                  Verifie
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-stadium-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-semibold text-stadium-400 uppercase tracking-wider mb-1">
                Presentation
              </h3>
              {bio ? (
                <p className="text-sm text-stadium-700 leading-relaxed line-clamp-2">
                  {bio}
                </p>
              ) : (
                <p className="text-sm text-stadium-400 italic">
                  Ajoutez une presentation pour inspirer confiance aux joueurs
                  et agents.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onEditProfile}
              aria-label="Modifier la presentation"
              className={cn(
                "flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5",
                "text-sm font-medium text-pitch-600 hover:text-pitch-700",
                "bg-pitch-50 hover:bg-pitch-100 rounded-lg",
                "transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch-500"
              )}
            >
              <Edit className="h-3.5 w-3.5" />
              Modifier
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
