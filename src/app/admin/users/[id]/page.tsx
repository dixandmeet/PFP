"use client"

import { useEffect, useState, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowLeft,
  Activity,
  FileText,
  User,
  Users,
  Briefcase,
  MessageCircle,
  Handshake,
  Coins,
  FolderOpen,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

import { UserHeader } from "@/components/admin/user-detail/UserHeader"
import { UserStats } from "@/components/admin/user-detail/UserStats"
import { UserProfileSection } from "@/components/admin/user-detail/UserProfileSection"
import { UserCareerSection } from "@/components/admin/user-detail/UserCareerSection"
import type { CareerEntryForm } from "@/components/admin/user-detail/UserCareerSection"
import { UserMessagesSection } from "@/components/admin/user-detail/UserMessagesSection"
import { UserApplicationsSection } from "@/components/admin/user-detail/UserApplicationsSection"
import { UserCreditsSection } from "@/components/admin/user-detail/UserCreditsSection"
import { UserDocumentsSection } from "@/components/admin/user-detail/UserDocumentsSection"
import { PostDetailDialog } from "@/components/admin/user-detail/PostDetailDialog"
import { UserOnboardingSection } from "@/components/admin/user-detail/UserOnboardingSection"
import { UserActivitySection } from "@/components/admin/user-detail/UserActivitySection"
import { UserClubMembersSection } from "@/components/admin/user-detail/UserClubMembersSection"
import { isClubRole } from "@/lib/utils/role-helpers"
import {
  deepClone,
  getChangedFields,
  isDeepEqual,
  isValidEmail,
  isValidDate,
} from "@/lib/utils/admin-helpers"
import type { UserDetail, FormUser, ValidationErrors } from "@/components/admin/user-detail/types"
import { userToFormUser } from "@/components/admin/user-detail/types"
import { useSession } from "next-auth/react"
import { MessagingPanel } from "@/components/messaging/MessagingPanel"
import { AnimatePresence, motion } from "framer-motion"

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()

  const [user, setUser] = useState<UserDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showMessaging, setShowMessaging] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [initialForm, setInitialForm] = useState<FormUser | null>(null)
  const [formUser, setFormUser] = useState<FormUser | null>(null)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [activeTab, setActiveTab] = useState("profile")
  const [pendingCareerEntries, setPendingCareerEntries] = useState<CareerEntryForm[] | null>(null)
  const [selectedPost, setSelectedPost] = useState<{
    id: string
    content: string
    mediaUrls: string[]
    createdAt: string
    _count: { likes: number; comments: number }
  } | null>(null)

  const dirty =
    (initialForm && formUser ? !isDeepEqual(initialForm, formUser) : false) ||
    pendingCareerEntries !== null

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users/${resolvedParams.id}`)
      if (res.ok) {
        const data = await res.json()
        // Map clubOnboardingSessions array to single onboardingSession
        const userData = {
          ...data.user,
          onboardingSession: data.user.clubOnboardingSessions?.[0] || null,
        }
        delete userData.clubOnboardingSessions

        // Pour CLUB_STAFF sans clubProfile direct, résoudre via membership
        if (!userData.clubProfile && userData.clubMemberships?.[0]?.clubProfile) {
          const membership = userData.clubMemberships[0]
          userData.clubProfile = {
            id: membership.clubProfile.id,
            clubName: membership.clubProfile.clubName,
            country: "",
            isVerified: false,
            teams: [],
            listings: [],
          }
        }

        setUser(userData)
        const form = userToFormUser(data.user)
        setInitialForm(deepClone(form))
        setFormUser(deepClone(form))
      } else if (res.status === 404) {
        router.push("/admin/users")
      }
    } catch (error) {
      console.error("Error fetching user:", error)
    } finally {
      setIsLoading(false)
    }
  }, [resolvedParams.id, router])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const getDisplayName = () => {
    if (!user) return ""
    if (user.playerProfile) {
      return `${user.playerProfile.firstName} ${user.playerProfile.lastName}`
    }
    if (user.agentProfile) {
      return `${user.agentProfile.firstName} ${user.agentProfile.lastName}`
    }
    if (user.clubProfile) {
      return user.clubProfile.clubName
    }
    return user.name || user.email
  }

  const validate = useCallback((): boolean => {
    if (!formUser) return false
    const errs: ValidationErrors = {}

    // Le nom User peut être vide si le nom est dans le profil (playerProfile, agentProfile, clubProfile)
    const hasProfileName =
      (formUser.playerProfile?.firstName?.trim() && formUser.playerProfile?.lastName?.trim()) ||
      (formUser.agentProfile?.firstName?.trim() && formUser.agentProfile?.lastName?.trim()) ||
      formUser.clubProfile?.clubName?.trim()

    if (!formUser.name?.trim() && !hasProfileName) {
      errs.name = "Le nom est obligatoire"
    }
    if (!formUser.role) {
      errs.role = "Le role est obligatoire"
    }
    if (formUser.email && !isValidEmail(formUser.email)) {
      errs.email = "Format d'email invalide"
    }
    if (
      formUser.playerProfile?.dateOfBirth &&
      !isValidDate(formUser.playerProfile.dateOfBirth)
    ) {
      errs["playerProfile.dateOfBirth"] = "Date invalide ou dans le futur"
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }, [formUser])

  useEffect(() => {
    if (isEditing && formUser) {
      validate()
    }
  }, [formUser, isEditing, validate])

  const isValid = Object.keys(errors).length === 0

  const handleFieldChange = (path: string, value: string) => {
    setFormUser((prev) => {
      if (!prev) return prev
      const updated = deepClone(prev)
      const parts = path.split(".")
      let obj: any = updated
      for (let i = 0; i < parts.length - 1; i++) {
        if (obj[parts[i]] === null || obj[parts[i]] === undefined) return prev
        obj = obj[parts[i]]
      }
      obj[parts[parts.length - 1]] = value
      return updated
    })
  }

  const handleEdit = () => {
    if (!user) return
    const form = userToFormUser(user)
    setInitialForm(deepClone(form))
    setFormUser(deepClone(form))
    setPendingCareerEntries(null)
    setIsEditing(true)
    setErrors({})
  }

  const handleCancel = () => {
    if (initialForm) {
      setFormUser(deepClone(initialForm))
    }
    setPendingCareerEntries(null)
    setIsEditing(false)
    setErrors({})
  }

  const handleSave = async () => {
    if (!formUser || !initialForm || !user) return
    if (!validate()) return

    setIsSaving(true)
    try {
      const changes = getChangedFields(initialForm, formUser)
      const payload: Record<string, any> = {}

      if (changes.name !== undefined) payload.name = changes.name
      if (changes.role !== undefined) payload.role = changes.role

      if (changes.playerProfile) {
        payload.playerProfile = getChangedFields(
          initialForm.playerProfile || {},
          formUser.playerProfile || {}
        )
      }
      if (changes.agentProfile) {
        payload.agentProfile = getChangedFields(
          initialForm.agentProfile || {},
          formUser.agentProfile || {}
        )
      }
      if (changes.clubProfile) {
        payload.clubProfile = getChangedFields(
          initialForm.clubProfile || {},
          formUser.clubProfile || {}
        )
      }

      // Include career entries changes
      if (pendingCareerEntries) {
        payload.careerEntries = pendingCareerEntries.map((entry) => {
          const result: Record<string, any> = {}
          if (entry.id) result.id = entry.id
          if (entry._delete) result._delete = true
          result.clubName = entry.clubName
          result.league = entry.league || null
          result.country = entry.country || null
          result.season = entry.season
          result.startDate = entry.startDate
          result.endDate = entry.endDate || null
          result.position = entry.position || null
          result.appearances = entry.appearances ? parseInt(entry.appearances) : null
          result.minutesPlayed = entry.minutesPlayed ? parseInt(entry.minutesPlayed) : null
          result.goals = entry.goals ? parseInt(entry.goals) : null
          result.assists = entry.assists ? parseInt(entry.assists) : null
          return result
        })
      }

      const res = await fetch(`/api/admin/users/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        await fetchUser()
        setIsEditing(false)
        setErrors({})
        setPendingCareerEntries(null)
        toast({
          title: "Modifications enregistrees",
          description: "Les informations de l'utilisateur ont ete mises a jour.",
        })
      } else {
        const data = await res.json()
        toast({
          title: "Erreur",
          description: data.error || "Une erreur est survenue.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAction = async (action: string, data?: any) => {
    try {
      const res = await fetch(`/api/admin/users/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...data }),
      })

      if (res.ok) {
        await fetchUser()
        const message =
          action === "verifyEmail"
            ? data?.verified
              ? "L'email du membre a été marqué comme vérifié."
              : "La vérification d'email a été retirée."
            : `L'action a été exécutée avec succès.`
        toast({
          title: "Action effectuée",
          description: message,
        })
      } else {
        const resData = await res.json()
        toast({
          title: "Erreur",
          description: resData.error || "Une erreur est survenue.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer l'action.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/users/${resolvedParams.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast({ title: "Utilisateur supprime" })
        router.push("/admin/users")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur.",
        variant: "destructive",
      })
    }
  }

  const handleStatClick = (tab: string) => {
    setActiveTab(tab)
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Supprimer ce post definitivement ?")) return
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, { method: "DELETE" })
      if (res.ok) {
        await fetchUser()
        toast({ title: "Post supprime" })
      } else {
        toast({ title: "Erreur", description: "Impossible de supprimer le post.", variant: "destructive" })
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer le post.", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600" />
      </div>
    )
  }

  if (!user || !formUser) {
    return null
  }

  return (
    <div>
      <AdminHeader
        title="Detail utilisateur"
        description={getDisplayName()}
      />

      <UserHeader
        user={user}
        displayName={getDisplayName()}
        isEditing={isEditing}
        isSaving={isSaving}
        dirty={dirty}
        isValid={isValid}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onAction={handleAction}
        onDelete={handleDelete}
        onMessage={() => setShowMessaging(true)}
      />

      <div className="p-4 lg:p-6 space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <UserStats counts={user._count} onStatClick={handleStatClick} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="profile" className="gap-1.5">
              <User className="h-3.5 w-3.5" />
              Profil
            </TabsTrigger>
            {user.playerProfile && (
              <TabsTrigger value="career" className="gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                Carriere ({user.playerProfile.careerEntries.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="posts" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Posts ({user._count.posts})
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-1.5">
              <MessageCircle className="h-3.5 w-3.5" />
              Messages ({user._count.conversations})
            </TabsTrigger>
            {user.role !== "ADMIN" && (
              <TabsTrigger value="business" className="gap-1.5">
                <Handshake className="h-3.5 w-3.5" />
                {user.role === "PLAYER" ? "Candidatures" : user.role === "AGENT" ? "Mandats" : isClubRole(user.role) ? "Annonces" : "Business"}
              </TabsTrigger>
            )}
            <TabsTrigger value="documents" className="gap-1.5">
              <FolderOpen className="h-3.5 w-3.5" />
              Documents ({user.kycDocuments?.length || 0})
            </TabsTrigger>
            {isClubRole(user.role) && user.clubProfile && (
              <TabsTrigger value="members" className="gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Membres
              </TabsTrigger>
            )}
            <TabsTrigger value="credits" className="gap-1.5">
              <Coins className="h-3.5 w-3.5" />
              Credits
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              Activite ({user.auditLogs.length + (user.emailLogs?.length || 0) + (user.notifications?.length || 0)})
            </TabsTrigger>
          </TabsList>

          {/* Profil */}
          <TabsContent value="profile">
            <div className="space-y-6">
              {/* Onboarding section for CLUB users */}
              {isClubRole(user.role) && user.onboardingSession && (
                <UserOnboardingSection
                  session={user.onboardingSession}
                  clubStatus={user.onboardingSession.club?.status}
                  clubRejectReason={user.onboardingSession.club?.rejectReason}
                  onAction={handleAction}
                />
              )}
              <UserProfileSection
                formUser={formUser}
                isEditing={isEditing}
                errors={errors}
                onChange={handleFieldChange}
              />
            </div>
          </TabsContent>

          {/* Carriere (Joueur uniquement) */}
          {user.playerProfile && (
            <TabsContent value="career">
              <UserCareerSection
                careerEntries={user.playerProfile.careerEntries}
                isEditing={isEditing}
                onSave={(entries) => setPendingCareerEntries(entries)}
              />
            </TabsContent>
          )}

          {/* Posts */}
          <TabsContent value="posts">
            <Card className="p-6">
              {user.posts.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">
                  Aucun post
                </p>
              ) : (
                <div className="space-y-3">
                  {user.posts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className="p-4 border rounded-lg hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <p className="text-sm text-slate-900 line-clamp-3 group-hover:text-slate-700">
                        {post.content}
                      </p>
                      {post.mediaUrls && post.mediaUrls.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2">
                          {post.mediaUrls.slice(0, 4).map((url, i) => (
                            <div
                              key={i}
                              className="relative h-12 w-12 rounded-md overflow-hidden bg-slate-100 border"
                            >
                              <img
                                src={url}
                                alt=""
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none"
                                }}
                              />
                            </div>
                          ))}
                          {post.mediaUrls.length > 4 && (
                            <div className="h-12 w-12 rounded-md bg-slate-100 border flex items-center justify-center">
                              <span className="text-xs text-slate-500 font-medium">
                                +{post.mediaUrls.length - 4}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>{post._count.likes} likes</span>
                        <span>{post._count.comments} commentaires</span>
                        <span>
                          {formatDistanceToNow(new Date(post.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Post detail popup */}
            <PostDetailDialog
              post={selectedPost}
              open={!!selectedPost}
              onOpenChange={(open) => !open && setSelectedPost(null)}
              userName={getDisplayName()}
              userImage={user.image}
              userRole={user.role}
              onDelete={handleDeletePost}
            />
          </TabsContent>

          {/* Messages */}
          <TabsContent value="messages">
            <UserMessagesSection
              conversations={user.conversations || []}
              currentUserId={user.id}
              messageCount={user._count.sentMessages}
            />
          </TabsContent>

          {/* Candidatures / Mandats / Annonces */}
          {user.role !== "ADMIN" && (
            <TabsContent value="business">
              <UserApplicationsSection
                role={user.role}
                applications={user.playerProfile?.applications}
                mandates={
                  user.playerProfile?.mandates ||
                  user.agentProfile?.mandates
                }
                submissions={user.agentProfile?.submissions}
                listings={user.clubProfile?.listings}
              />
            </TabsContent>
          )}

          {/* Documents KYC */}
          <TabsContent value="documents">
            <UserDocumentsSection
              documents={user.kycDocuments || []}
              userId={user.id}
              onRefresh={fetchUser}
            />
          </TabsContent>

          {/* Membres du club */}
          {isClubRole(user.role) && user.clubProfile && (
            <TabsContent value="members">
              <UserClubMembersSection clubProfileId={user.clubProfile.id} />
            </TabsContent>
          )}

          {/* Credits */}
          <TabsContent value="credits">
            <UserCreditsSection
              wallets={user.wallets || []}
              transactions={user.creditTransactions || []}
              subscription={user.subscription || null}
              stripeConnect={user.stripeConnect || null}
              withdrawals={user.withdrawals || []}
              userId={user.id}
              onAction={handleAction}
            />
          </TabsContent>

          {/* Activite */}
          <TabsContent value="activity">
            <UserActivitySection
              auditLogs={user.auditLogs}
              emailLogs={user.emailLogs || []}
              notifications={user.notifications || []}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Panneau de messagerie flottant */}
      <AnimatePresence>
        {showMessaging && session?.user?.id && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[560px] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden bg-white"
          >
            <MessagingPanel
              currentUserId={session.user.id}
              recipientId={user.id}
              onClose={() => setShowMessaging(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
