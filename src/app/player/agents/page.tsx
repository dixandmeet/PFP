"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  Search,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  FileText,
  Eye,
  MessageSquare,
  Users,
  UserPlus,
  Mail,
  Send,
} from "lucide-react"

interface Mandate {
  id: string
  status: string
  startDate: string
  endDate: string
  terms?: string
  createdAt: string
  acceptedAt?: string
  agentProfile: {
    id: string
    firstName: string
    lastName: string
    agencyName?: string
    licenseNumber?: string
    phoneNumber?: string
    profilePicture?: string
  }
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  ACTIVE: { label: "Actif", color: "bg-pitch-50 text-pitch-700 border-pitch-200", icon: CheckCircle },
  EXPIRED: { label: "Expiré", color: "bg-stadium-100 text-stadium-600 border-stadium-200", icon: AlertCircle },
  TERMINATED: { label: "Résilié", color: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
  REJECTED: { label: "Refusé", color: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
}

export default function PlayerAgentsPage() {
  const { toast } = useToast()
  const router = useRouter()

  const [mandates, setMandates] = useState<Mandate[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedMandate, setSelectedMandate] = useState<Mandate | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"accept" | "reject" | "terminate" | null>(null)

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    agentEmail: "",
    agentFirstName: "",
    agentLastName: "",
    agentPhone: "",
    message: "",
  })
  const [invitations, setInvitations] = useState<Array<{
    id: string
    agentEmail: string
    agentFirstName: string | null
    agentLastName: string | null
    status: string
    expiresAt: string
    createdAt: string
  }>>([])

  const pendingInvitations = invitations.filter((i) => i.status === "PENDING" && new Date(i.expiresAt) > new Date())

  useEffect(() => {
    async function loadData() {
      try {
        const [mandatesRes, invitesRes] = await Promise.all([
          fetch("/api/mandates"),
          fetch("/api/invitations/agent"),
        ])
        if (mandatesRes.ok) {
          const data = await mandatesRes.json()
          setMandates(data.mandates || [])
        }
        if (invitesRes.ok) {
          const data = await invitesRes.json()
          setInvitations(data.invitations || [])
        }
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [toast])

  const handleSendInvite = async () => {
    if (!inviteForm.agentEmail || !inviteForm.agentFirstName || !inviteForm.agentLastName) {
      toast({ title: "Erreur", description: "Veuillez remplir les champs obligatoires", variant: "destructive" })
      return
    }
    setInviteSending(true)
    try {
      const res = await fetch("/api/invitations/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Erreur", description: data.error, variant: "destructive" })
        return
      }
      toast({ title: "Invitation envoyée", description: `Un email a été envoyé à ${inviteForm.agentEmail}` })
      setInvitations((prev) => [data.invitation, ...prev])
      setInviteForm({ agentEmail: "", agentFirstName: "", agentLastName: "", agentPhone: "", message: "" })
      setInviteDialogOpen(false)
    } catch {
      toast({ title: "Erreur", description: "Impossible d'envoyer l'invitation", variant: "destructive" })
    } finally {
      setInviteSending(false)
    }
  }

  const handleMandateAction = (mandate: Mandate, action: "accept" | "reject" | "terminate") => {
    setSelectedMandate(mandate)
    setActionType(action)
    setConfirmDialogOpen(true)
  }

  const confirmMandateAction = async () => {
    if (!selectedMandate || !actionType) return
    setActionLoading(true)
    try {
      const newStatus =
        actionType === "accept" ? "ACTIVE" :
        actionType === "reject" ? "REJECTED" :
        "TERMINATED"

      const response = await fetch(`/api/mandates/${selectedMandate.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Erreur lors de la mise à jour")

      setMandates(
        mandates.map((m) =>
          m.id === selectedMandate.id ? { ...m, status: newStatus } : m
        )
      )

      toast({
        title: "Succès",
        description: `Mandat ${actionType === "accept" ? "accepté" : actionType === "reject" ? "refusé" : "résilié"}`,
      })

      setConfirmDialogOpen(false)
      setSelectedMandate(null)
      setActionType(null)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const mandatesByStatus = mandates.reduce((acc, mandate) => {
    if (!acc[mandate.status]) acc[mandate.status] = []
    acc[mandate.status].push(mandate)
    return acc
  }, {} as Record<string, Mandate[]>)

  const statusOrder = ["ACTIVE", "PENDING", "EXPIRED", "TERMINATED", "REJECTED"]
  const activeCount = mandatesByStatus.ACTIVE?.length || 0
  const pendingCount = mandatesByStatus.PENDING?.length || 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" suppressHydrationWarning>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-pitch-600" />
          <p className="text-sm text-stadium-500" suppressHydrationWarning>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-stadium-900 tracking-tight leading-none">
              Mes Agents
            </h1>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={() => setInviteDialogOpen(true)}
                variant="outline"
                className="border-pitch-200 text-pitch-700 hover:bg-pitch-50 font-semibold rounded-xl h-10 shadow-sm transition-all duration-200 active:scale-[0.97] px-3 sm:px-5"
                aria-label="Inviter mon agent"
              >
                <UserPlus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Inviter mon agent</span>
              </Button>
              <Button
                onClick={() => router.push("/search?type=agents")}
                className="bg-pitch-600 hover:bg-pitch-700 text-white font-semibold rounded-xl h-10 shadow-sm transition-all duration-200 active:scale-[0.97] px-3 sm:px-5"
                aria-label="Rechercher un agent"
              >
                <Search className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Rechercher</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-stadium-500 font-medium mt-1.5">
            {activeCount} mandat{activeCount !== 1 ? "s" : ""} actif{activeCount !== 1 ? "s" : ""}
            {pendingCount > 0 && (
              <>
                <span className="mx-1.5 text-stadium-300">·</span>
                {pendingCount} en attente
              </>
            )}
          </p>
        </div>

        {/* Contenu */}
        {mandates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stadium-200 bg-stadium-50/50 px-6 py-16 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-stadium-100">
              <Users className="h-6 w-6 text-stadium-400" />
            </div>
            <p className="text-base font-semibold text-stadium-700 mb-1">
              Aucun mandat
            </p>
            <p className="text-sm text-stadium-500 mb-5 max-w-xs mx-auto">
              Recherchez un agent depuis le moteur de recherche pour commencer une collaboration
            </p>
            <Button
              onClick={() => router.push("/search?type=agents")}
              className="bg-pitch-600 hover:bg-pitch-700 text-white font-semibold rounded-xl px-5 h-10 shadow-sm transition-all duration-200 active:scale-[0.97]"
            >
              <Search className="mr-2 h-4 w-4" />
              Rechercher un agent
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {statusOrder.map((status) => {
              const mandatesInStatus = mandatesByStatus[status]
              if (!mandatesInStatus || mandatesInStatus.length === 0) return null
              const config = statusConfig[status]
              const Icon = config.icon

              return (
                <div key={status}>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${config.color.split(' ')[0]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <h2 className="text-lg font-bold text-stadium-900">{config.label}</h2>
                    <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-stadium-100 text-stadium-600 text-xs font-bold">
                      {mandatesInStatus.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {mandatesInStatus.map((mandate) => (
                      <div
                        key={mandate.id}
                        className="bg-white border border-stadium-200/60 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md hover:border-pitch-200"
                      >
                        <div className="p-4 sm:p-5 space-y-3">
                          {/* Agent info */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-pitch-600 text-white font-bold text-sm shadow-sm">
                                {mandate.agentProfile.firstName[0]}{mandate.agentProfile.lastName[0]}
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-bold text-stadium-900 text-sm sm:text-base truncate">
                                  {mandate.agentProfile.firstName} {mandate.agentProfile.lastName}
                                </h3>
                                {mandate.agentProfile.agencyName && (
                                  <p className="text-xs text-stadium-400 flex items-center gap-1 mt-0.5">
                                    <Building2 className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{mandate.agentProfile.agencyName}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge className={`shrink-0 text-[10px] font-bold rounded-md px-2 py-0.5 ${config.color}`}>
                              {config.label}
                            </Badge>
                          </div>

                          {/* Date */}
                          <div className="flex items-center gap-2 text-xs text-stadium-400 bg-stadium-50 px-3 py-2 rounded-xl">
                            <Calendar className="h-3 w-3 shrink-0" />
                            Du {new Date(mandate.startDate).toLocaleDateString("fr-FR")} au{" "}
                            {new Date(mandate.endDate).toLocaleDateString("fr-FR")}
                          </div>

                          {/* Terms */}
                          {mandate.terms && (
                            <p className="text-xs text-stadium-500 line-clamp-2 leading-relaxed">
                              {mandate.terms}
                            </p>
                          )}

                          {/* Actions */}
                          {mandate.status === "PENDING" && (
                            <div className="flex gap-2 pt-1">
                              <Button
                                size="sm"
                                className="flex-1 bg-pitch-600 hover:bg-pitch-700 text-white rounded-xl font-medium text-xs h-9 shadow-sm transition-all duration-200 active:scale-[0.97]"
                                onClick={() => handleMandateAction(mandate, "accept")}
                              >
                                <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                                Accepter
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 rounded-xl border-stadium-200 font-medium text-xs h-9 transition-all duration-200 active:scale-[0.97]"
                                onClick={() => handleMandateAction(mandate, "reject")}
                              >
                                <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                Refuser
                              </Button>
                            </div>
                          )}

                          {mandate.status === "ACTIVE" && (
                            <div className="flex gap-2 pt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 rounded-xl border-stadium-200 text-stadium-600 hover:border-pitch-300 hover:text-pitch-700 font-medium text-xs h-9 transition-all duration-200 active:scale-[0.97]"
                                onClick={() => router.push(`/player/messages`)}
                              >
                                <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                                Contacter
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium text-xs h-9 transition-all duration-200 active:scale-[0.97]"
                                onClick={() => handleMandateAction(mandate, "terminate")}
                              >
                                <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                Résilier
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Invitations en attente */}
        {pendingInvitations.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-stadium-900">Invitations envoyées</h2>
              <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                {pendingInvitations.length}
              </span>
            </div>
            <div className="space-y-3">
              {pendingInvitations.map((inv) => (
                <div key={inv.id} className="bg-white border border-blue-100 rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                      {(inv.agentFirstName?.[0] || "?")}{(inv.agentLastName?.[0] || "")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-stadium-900 text-sm truncate">
                        {inv.agentFirstName} {inv.agentLastName}
                      </h3>
                      <p className="text-xs text-stadium-400 truncate">{inv.agentEmail}</p>
                    </div>
                    <Badge className="shrink-0 text-[10px] font-bold rounded-md px-2 py-0.5 bg-blue-50 text-blue-600 border-blue-200">
                      En attente
                    </Badge>
                  </div>
                  <p className="text-[11px] text-stadium-400 mt-2">
                    Envoyée le {new Date(inv.createdAt).toLocaleDateString("fr-FR")} · Expire le {new Date(inv.expiresAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invite Agent Dialog */}
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-pitch-600" />
                Inviter mon agent
              </DialogTitle>
              <DialogDescription>
                Envoyez une invitation par email à votre agent pour qu&apos;il vous rejoigne sur Profoot Profile.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="inv-firstName" className="text-sm font-medium">Prénom *</Label>
                  <Input
                    id="inv-firstName"
                    value={inviteForm.agentFirstName}
                    onChange={(e) => setInviteForm((p) => ({ ...p, agentFirstName: e.target.value }))}
                    className="mt-1 rounded-xl"
                    placeholder="Prénom de l'agent"
                  />
                </div>
                <div>
                  <Label htmlFor="inv-lastName" className="text-sm font-medium">Nom *</Label>
                  <Input
                    id="inv-lastName"
                    value={inviteForm.agentLastName}
                    onChange={(e) => setInviteForm((p) => ({ ...p, agentLastName: e.target.value }))}
                    className="mt-1 rounded-xl"
                    placeholder="Nom de l'agent"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="inv-email" className="text-sm font-medium">Email *</Label>
                <Input
                  id="inv-email"
                  type="email"
                  value={inviteForm.agentEmail}
                  onChange={(e) => setInviteForm((p) => ({ ...p, agentEmail: e.target.value }))}
                  className="mt-1 rounded-xl"
                  placeholder="agent@example.com"
                />
              </div>

              <div>
                <Label htmlFor="inv-phone" className="text-sm font-medium">Téléphone</Label>
                <Input
                  id="inv-phone"
                  value={inviteForm.agentPhone}
                  onChange={(e) => setInviteForm((p) => ({ ...p, agentPhone: e.target.value }))}
                  className="mt-1 rounded-xl"
                  placeholder="+33 6 XX XX XX XX"
                />
              </div>

              <div>
                <Label htmlFor="inv-message" className="text-sm font-medium">Message personnalisé</Label>
                <Textarea
                  id="inv-message"
                  value={inviteForm.message}
                  onChange={(e) => setInviteForm((p) => ({ ...p, message: e.target.value }))}
                  className="mt-1 rounded-xl"
                  rows={3}
                  placeholder="Un message personnel pour votre agent..."
                  maxLength={500}
                />
                <p className="text-[11px] text-stadium-400 mt-1 text-right">{inviteForm.message.length}/500</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)} className="rounded-xl border-stadium-200 font-medium">
                Annuler
              </Button>
              <Button
                onClick={handleSendInvite}
                disabled={inviteSending || !inviteForm.agentEmail || !inviteForm.agentFirstName || !inviteForm.agentLastName}
                className="bg-pitch-600 hover:bg-pitch-700 rounded-xl font-medium shadow-sm transition-all duration-200 active:scale-[0.97]"
              >
                {inviteSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Envoyer l&apos;invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Action Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                {actionType === "accept" && "Accepter le mandat ?"}
                {actionType === "reject" && "Refuser le mandat ?"}
                {actionType === "terminate" && "Résilier le mandat ?"}
              </DialogTitle>
              <DialogDescription>
                {selectedMandate && (
                  <>
                    Mandat avec {selectedMandate.agentProfile.firstName}{" "}
                    {selectedMandate.agentProfile.lastName}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              {actionType === "accept" && (
                <p className="text-sm text-stadium-500">
                  En acceptant ce mandat, vous autorisez l&apos;agent à vous représenter auprès des clubs pendant la durée spécifiée.
                </p>
              )}
              {actionType === "reject" && (
                <p className="text-sm text-stadium-500">
                  En refusant ce mandat, l&apos;agent ne pourra plus vous représenter. Cette action est définitive.
                </p>
              )}
              {actionType === "terminate" && (
                <p className="text-sm text-stadium-500">
                  En résiliant ce mandat, vous mettez fin à la collaboration avec cet agent. Cette action est définitive.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} className="rounded-xl border-stadium-200 font-medium">
                Annuler
              </Button>
              <Button
                onClick={confirmMandateAction}
                disabled={actionLoading}
                variant={actionType === "accept" ? "default" : "destructive"}
                className={`rounded-xl font-medium transition-all duration-200 active:scale-[0.97] ${
                  actionType === "accept" ? "bg-pitch-600 hover:bg-pitch-700 shadow-sm" : ""
                }`}
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    En cours...
                  </>
                ) : (
                  "Confirmer"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
