"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Edit, 
  Eye, 
  Camera,
  Shield,
  Users,
  Briefcase,
  Star,
  Globe,
  CheckCircle2,
  FileText,
  Award,
  Phone,
  Mail,
  ExternalLink,
  Verified,
} from "lucide-react"

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

// Mapping des spécialités avec couleurs
const SPECIALTY_CONFIG: Record<string, { gradient: string; icon: string }> = {
  "Forwards": { gradient: "from-red-500 to-orange-500", icon: "⚽" },
  "French Players": { gradient: "from-blue-500 to-indigo-500", icon: "🇫🇷" },
  "Youth Development": { gradient: "from-emerald-500 to-teal-500", icon: "🌱" },
  "Transferts internationaux": { gradient: "from-purple-500 to-pink-500", icon: "🌍" },
  "Négociation de contrats": { gradient: "from-amber-500 to-yellow-500", icon: "📝" },
  "default": { gradient: "from-gray-500 to-gray-600", icon: "✨" },
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
  const [imageLoaded, setImageLoaded] = useState(false)

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

  const getSpecialtyConfig = (specialty: string) => {
    return SPECIALTY_CONFIG[specialty] || SPECIALTY_CONFIG["default"]
  }

  return (
    <div className="relative">
      {/* Carte principale avec effet de profondeur */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[2rem] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)]"
      >
        {/* Hero Section avec photo de couverture */}
        <div className="relative h-56 sm:h-72 lg:h-80 overflow-hidden">
          {/* Background Image ou Gradient */}
          {profile.coverPhoto ? (
            <>
              <motion.div
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute inset-0"
              >
                {profile.coverPhoto.startsWith('/uploads') ? (
                  <img
                    src={profile.coverPhoto}
                    alt="Couverture"
                    className="w-full h-full object-cover"
                    onLoad={() => setImageLoaded(true)}
                  />
                ) : (
                  <Image
                    src={profile.coverPhoto}
                    alt="Couverture"
                    fill
                    className="object-cover"
                    priority
                    onLoad={() => setImageLoaded(true)}
                  />
                )}
              </motion.div>
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </>
          ) : (
            // Gradient par défaut élégant
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTItNC0yLTItNCAyLTQgNC0yIDQtMiAyLTQtMi00LTQtMi00LTItMi00IDItNCA0LTIgNCAyIDIgNC0yIDQtNCAyLTQgMi0yIDQgMiA0IDQgMiA0IDIgMiA0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}

          {/* Badge vérifié en haut à gauche */}
          {profile.isVerified && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute top-6 left-6 z-10"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg">
                <Verified className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-semibold text-gray-900">Agent Certifié FIFA</span>
              </div>
            </motion.div>
          )}

          {/* Bouton upload en haut à droite */}
          {isOwner && (
            <motion.label
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute top-6 right-6 cursor-pointer z-10"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:bg-white transition-colors group">
                <Camera className="h-4 w-4 text-gray-600 group-hover:text-emerald-600 transition-colors" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition-colors">Modifier</span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverPhotoUpload}
                disabled={isUploadingCover}
              />
            </motion.label>
          )}

          {/* Infos sur le hero */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6">
              {/* Avatar */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative"
              >
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500">
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
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">{initials}</span>
                    </div>
                  )}
                </div>
                {/* Badge agent doré */}
                <div className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </motion.div>

              {/* Nom et agence */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1"
              >
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1 drop-shadow-lg">
                  {fullName}
                </h1>
                {profile.agencyName && (
                  <p className="text-lg text-white/90 font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    {profile.agencyName}
                  </p>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Section Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-3 gap-4"
          >
            {[
              { label: "Publications", value: stats.posts, icon: FileText },
              { label: "Abonnés", value: stats.followedBy, icon: Users },
              { label: "Abonnements", value: stats.following, icon: Star },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="relative group cursor-default"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-5 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                  <stat.icon className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Section Spécialités */}
          {profile.specialties && profile.specialties.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-gray-900">Spécialités</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {profile.specialties.map((specialty, index) => {
                  const config = getSpecialtyConfig(specialty)
                  return (
                    <motion.div
                      key={specialty}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className={`px-4 py-2 rounded-full bg-gradient-to-r ${config.gradient} text-white font-medium text-sm shadow-lg cursor-default`}
                    >
                      <span className="mr-2">{config.icon}</span>
                      {specialty}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Section Bio */}
          {profile.bio && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative"
            >
              <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-emerald-50/30 border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-white shadow-sm">
                    <FileText className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">À propos</h3>
                    <p className={`text-gray-600 leading-relaxed whitespace-pre-line ${!showFullBio ? 'line-clamp-3' : ''}`}>
                      {profile.bio}
                    </p>
                    {profile.bio.length > 150 && (
                      <button
                        onClick={() => setShowFullBio(!showFullBio)}
                        className="mt-3 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        {showFullBio ? "Voir moins" : "Lire la suite"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Section Informations de contact et licence */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {/* Licence */}
            {profile.licenseNumber && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
                <div className="p-2.5 rounded-lg bg-amber-100">
                  <Award className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider">Licence FIFA</p>
                  <p className="text-sm font-bold text-gray-900">{profile.licenseNumber}</p>
                  {profile.licenseCountry && (
                    <p className="text-xs text-gray-500">{profile.licenseCountry}</p>
                  )}
                </div>
              </div>
            )}

            {/* Contact */}
            {profile.phoneNumber && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="p-2.5 rounded-lg bg-gray-100">
                  <Phone className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Téléphone</p>
                  <p className="text-sm font-bold text-gray-900">{profile.phoneNumber}</p>
                </div>
              </div>
            )}

            {/* Site web */}
            {profile.website && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="p-2.5 rounded-lg bg-gray-100">
                  <Globe className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Site web</p>
                  <a 
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    Visiter <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div className="p-2.5 rounded-lg bg-gray-100">
                <Mail className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Email</p>
                <p className="text-sm font-bold text-gray-900">{user.email}</p>
              </div>
            </div>
          </motion.div>

          {/* Boutons d'action */}
          {isOwner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-3 pt-4"
            >
              <Button
                onClick={onEditClick}
                size="lg"
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
              >
                <Edit className="mr-2 h-5 w-5" />
                Modifier le profil
              </Button>
              <Button
                onClick={onViewPublicClick}
                variant="outline"
                size="lg"
                className="flex-1 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition-all"
              >
                <Eye className="mr-2 h-5 w-5" />
                Aperçu public
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
