"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Edit,
  Eye,
  Camera,
  Shield,
  Users,
  Briefcase,
  Globe,
  FileText,
  Award,
  Phone,
  Mail,
  ExternalLink,
  Verified,
  MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AgentProfile {
  id: string
  firstName: string
  lastName: string
  profilePicture?: string
  coverPhoto?: string
  agencyName?: string
  bio?: string
  specialties?: string[]
  isVerified?: boolean
  licenseNumber?: string
  licenseCountry?: string
  phoneNumber?: string
  website?: string
}

interface UserProfile {
  id: string
  email: string
  role: string
  agentProfile?: AgentProfile
  _count?: {
    followedBy: number
    following: number
    posts: number
  }
}

interface AgentProfileCardProps {
  user: UserProfile
  isOwner?: boolean
  onEditClick?: () => void
  onViewPublicClick?: () => void
  onCoverPhotoChange?: (file: File) => void
}

export function AgentProfileCard({
  user,
  isOwner = false,
  onEditClick,
  onViewPublicClick,
  onCoverPhotoChange,
}: AgentProfileCardProps) {
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [showFullBio, setShowFullBio] = useState(false)

  const profile = user.agentProfile
  const stats = user._count || { followedBy: 0, following: 0, posts: 0 }

  if (!profile) return null

  const fullName = `${profile.firstName} ${profile.lastName}`
  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`

  const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onCoverPhotoChange) {
      setIsUploadingCover(true)
      onCoverPhotoChange(file)
      setTimeout(() => setIsUploadingCover(false), 1000)
    }
  }

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Cover Photo */}
        <div className="relative h-48 md:h-56 lg:h-64 rounded-t-2xl overflow-hidden">
          {profile.coverPhoto ? (
            profile.coverPhoto.startsWith('/uploads') ? (
              <img
                src={profile.coverPhoto}
                alt="Couverture"
                className="w-full h-full object-cover"
              />
            ) : (
              <Image
                src={profile.coverPhoto}
                alt="Couverture"
                fill
                className="object-cover"
                priority
              />
            )
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-pitch-600 via-pitch-700 to-pitch-800">
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-pitch-400/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          {/* Upload button */}
          {isOwner && (
            <label className="absolute top-4 right-4 cursor-pointer z-10">
              <div className="p-2.5 rounded-full bg-black/25 backdrop-blur-md text-white hover:bg-black/40 transition-all border border-white/10">
                <Camera className="h-4 w-4" />
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverPhotoUpload}
                disabled={isUploadingCover}
              />
            </label>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-b-2xl shadow-lg border border-stadium-100/80 border-t-0">
          <div className="px-5 pt-5 pb-5 md:px-8 md:pt-6 md:pb-6">
            {/* Avatar + Info */}
            <div className="flex items-start gap-4 md:gap-6">
              {/* Avatar */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative flex-shrink-0 -mt-14 md:-mt-16"
              >
                <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden shadow-xl ring-4 ring-white bg-gradient-to-br from-pitch-100 to-pitch-200">
                  {profile.profilePicture ? (
                    profile.profilePicture.startsWith('/uploads') ? (
                      <img
                        src={profile.profilePicture}
                        alt={fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={profile.profilePicture}
                        alt={fullName}
                        fill
                        className="object-cover"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl md:text-3xl font-bold text-pitch-600">{initials}</span>
                    </div>
                  )}
                </div>
                {profile.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-pitch-600 rounded-full p-1 shadow-lg ring-2 ring-white">
                    <Shield className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </motion.div>

              {/* Info */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-stadium-900 tracking-tight truncate">
                      {fullName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mt-1 md:mt-2">
                      {profile.agencyName && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 md:py-1 bg-pitch-50 text-pitch-700 rounded-lg text-xs font-semibold border border-pitch-100">
                          <Briefcase className="h-3 w-3" />
                          {profile.agencyName}
                        </span>
                      )}
                      {profile.isVerified && (
                        <span className="inline-flex items-center gap-1.5 text-sm text-pitch-600">
                          <Verified className="h-3.5 w-3.5" />
                          Certifié FIFA
                        </span>
                      )}
                      {profile.licenseCountry && (
                        <span className="inline-flex items-center gap-1.5 text-sm text-stadium-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {profile.licenseCountry}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  {isOwner && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        onClick={onEditClick}
                        size="sm"
                        className="rounded-xl font-semibold bg-pitch-600 hover:bg-pitch-700 text-white shadow-md shadow-pitch-200/50 transition-all"
                      >
                        <Edit className="mr-1.5 h-4 w-4" />
                        Modifier
                      </Button>
                      <Button
                        onClick={onViewPublicClick}
                        size="sm"
                        variant="outline"
                        className="rounded-xl font-semibold border-stadium-200 text-stadium-700 hover:bg-stadium-50 transition-all"
                      >
                        <Eye className="mr-1.5 h-4 w-4" />
                        <span className="hidden sm:inline">Aperçu</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-4"
              >
                <p className={cn(
                  "text-sm text-stadium-600 leading-relaxed",
                  !showFullBio && "line-clamp-3"
                )}>
                  {profile.bio}
                </p>
                {profile.bio.length > 150 && (
                  <button
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="mt-1 text-xs font-semibold text-pitch-600 hover:text-pitch-700"
                  >
                    {showFullBio ? "Voir moins" : "Lire la suite"}
                  </button>
                )}
              </motion.div>
            )}

            {/* Specialties */}
            {profile.specialties && profile.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="px-2.5 py-1 rounded-lg bg-stadium-50 text-stadium-700 text-xs font-medium border border-stadium-100"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            )}

            {/* Stats row */}
            <div className="flex items-center gap-5 sm:gap-8 mt-5 pt-5 border-t border-stadium-100">
              <div className="group text-center">
                <p className="text-xl font-bold text-stadium-900">{stats.posts}</p>
                <p className="text-[11px] text-stadium-400 font-medium uppercase tracking-wider">Publications</p>
              </div>
              <div className="h-8 w-px bg-stadium-100" />
              <div className="group text-center">
                <p className="text-xl font-bold text-stadium-900">{stats.followedBy}</p>
                <p className="text-[11px] text-stadium-400 font-medium uppercase tracking-wider">Abonnés</p>
              </div>
              <div className="h-8 w-px bg-stadium-100" />
              <div className="group text-center">
                <p className="text-xl font-bold text-stadium-900">{stats.following}</p>
                <p className="text-[11px] text-stadium-400 font-medium uppercase tracking-wider">Abonnements</p>
              </div>
            </div>
          </div>

          {/* Contact & License info */}
          {(profile.licenseNumber || profile.phoneNumber || profile.website) && (
            <div className="px-5 pb-5 md:px-8 md:pb-6">
              <div className="grid sm:grid-cols-2 gap-3">
                {profile.licenseNumber && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-stadium-50 border border-stadium-100">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <Award className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-stadium-400 font-medium uppercase tracking-wider">Licence FIFA</p>
                      <p className="text-sm font-semibold text-stadium-800 truncate">{profile.licenseNumber}</p>
                    </div>
                  </div>
                )}
                {profile.phoneNumber && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-stadium-50 border border-stadium-100">
                    <div className="w-9 h-9 rounded-lg bg-pitch-50 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-pitch-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-stadium-400 font-medium uppercase tracking-wider">Téléphone</p>
                      <p className="text-sm font-semibold text-stadium-800 truncate">{profile.phoneNumber}</p>
                    </div>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-stadium-50 border border-stadium-100">
                    <div className="w-9 h-9 rounded-lg bg-pitch-50 flex items-center justify-center flex-shrink-0">
                      <Globe className="h-4 w-4 text-pitch-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-stadium-400 font-medium uppercase tracking-wider">Site web</p>
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-pitch-600 hover:text-pitch-700 flex items-center gap-1"
                      >
                        Visiter <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-stadium-50 border border-stadium-100">
                  <div className="w-9 h-9 rounded-lg bg-stadium-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-stadium-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-stadium-400 font-medium uppercase tracking-wider">Email</p>
                    <p className="text-sm font-semibold text-stadium-800 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
