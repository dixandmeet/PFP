"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Camera,
  Edit,
  Eye,
  MapPin,
  Building2,
  Shield,
  Users,
} from "lucide-react"
import {
  POSITIONS,
  CLUBS,
} from "@/lib/constants/football-data"

const getClubLogo = (clubName?: string): string | undefined => {
  if (!clubName) return undefined
  return CLUBS.find((c) => c.name === clubName)?.logo
}

const getFullPositionName = (abbreviation?: string): string => {
  if (!abbreviation) return ""
  return POSITIONS.find((p) => p.code === abbreviation)?.name || abbreviation
}

interface UserProfile {
  id: string
  email: string
  role: string
  playerProfile?: {
    id: string
    firstName: string
    lastName: string
    displayName?: string
    profilePicture?: string
    coverPhoto?: string
    primaryPosition?: string
    nationality?: string
    bio?: string
    currentClub?: string
    currentLeague?: string
  }
  _count?: {
    followedBy: number
    following: number
    posts: number
  }
}

interface ProfileHeaderProps {
  user: UserProfile
  completionPercentage?: number
  onEditClick?: () => void
  onViewPublicClick?: () => void
  onCoverPhotoChange?: (file: File) => void
}

export function ProfileHeader({
  user,
  completionPercentage = 0,
  onEditClick,
  onViewPublicClick,
  onCoverPhotoChange,
}: ProfileHeaderProps) {
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const p = user.playerProfile
  if (!p) return null

  const displayName = p.displayName || `${p.firstName} ${p.lastName}`
  const position = getFullPositionName(p.primaryPosition)
  const clubLogo = getClubLogo(p.currentClub)
  const stats = user._count || { followedBy: 0, following: 0, posts: 0 }

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onCoverPhotoChange) {
      setIsUploadingCover(true)
      onCoverPhotoChange(file)
      setTimeout(() => setIsUploadingCover(false), 1000)
    }
  }

  const renderImage = (src: string, alt: string, fill?: boolean, w?: number, h?: number) => {
    return fill ? (
      <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" priority />
    ) : (
      <Image src={src} alt={alt} width={w || 96} height={h || 96} className="w-full h-full object-cover" />
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
      {/* Banner */}
      <div className="relative h-[180px] sm:h-[220px] md:h-[260px] bg-gradient-to-br from-slate-800 to-slate-900">
        {p.coverPhoto ? (
          <>
            {renderImage(p.coverPhoto, "Bannière", true)}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        <label className="absolute top-4 right-4 cursor-pointer z-10">
          <div className="p-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 hover:bg-white/25 transition-all">
            <Camera className="h-4 w-4 text-white" />
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverUpload}
            disabled={isUploadingCover}
          />
        </label>
      </div>

      {/* Identity bloc */}
      <div className="relative px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Row 1 : Avatar (overlap sur la couverture) + boutons CTA */}
        <div className="flex items-end justify-between -mt-14">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative flex-shrink-0"
          >
            <div className="w-[96px] h-[96px] rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-100">
              {p.profilePicture ? (
                renderImage(p.profilePicture, displayName, false, 96, 96)
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <Users className="h-10 w-10 text-slate-400" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-pitch-500 border-2 border-white" />
          </motion.div>

          {/* CTA */}
          <div className="flex items-center gap-2 flex-shrink-0 pb-1">
            <Button
              onClick={onEditClick}
              size="sm"
              className="bg-pitch-600 hover:bg-pitch-700 text-white font-semibold shadow-sm"
            >
              <Edit className="mr-1.5 h-3.5 w-3.5" />
              Modifier le profil
            </Button>
            <Button
              onClick={onViewPublicClick}
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Page publique
            </Button>
          </div>
        </div>

        {/* Row 2 : Nom + infos (toujours dans la zone blanche) */}
        <div className="mt-3">
          <h1 className="text-2xl sm:text-[34px] md:text-[38px] font-bold text-slate-900 leading-tight tracking-tight">
            {displayName}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            {position && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {position}
              </span>
            )}
            {p.currentClub && p.currentClub !== "À renseigner" && (
              <span className="flex items-center gap-1.5 text-sm text-slate-500">
                {clubLogo ? (
                  <Image src={clubLogo} alt="" width={16} height={16} className="rounded-full" />
                ) : (
                  <Building2 className="h-3.5 w-3.5" />
                )}
                {p.currentClub}
              </span>
            )}
            {p.nationality && (
              <span className="flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {p.nationality}
              </span>
            )}
          </div>
        </div>

        {/* Stats row + completion */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-5 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-6">
            <StatItem value={stats.posts} label="Posts" />
            <StatItem value={stats.followedBy} label="Abonnés" />
            <StatItem value={stats.following} label="Abonnements" />
          </div>
          {completionPercentage < 100 && (
            <div className="flex items-center gap-3 min-w-[200px]">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    completionPercentage >= 80
                      ? "bg-pitch-500"
                      : completionPercentage >= 50
                        ? "bg-amber-400"
                        : "bg-orange-400"
                  )}
                />
              </div>
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                {completionPercentage}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-lg font-bold text-slate-900">{value}</span>
      <span className="text-xs text-slate-400 font-medium">{label}</span>
    </div>
  )
}
