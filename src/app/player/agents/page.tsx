"use client"

import { useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  Search,
  UserPlus,
  Building2,
  Globe,
  CheckCircle,
  Phone,
  Award,
  FileText,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  Users,
  Star,
  TrendingUp,
  MessageSquare,
} from "lucide-react"

import { AgentsPageHeader } from "./components/AgentsPageHeader"
import { AgentsStatsBar } from "./components/AgentsStatsBar"
import { AgentsTabs } from "./components/AgentsTabs"
import { ActiveMandateHero } from "./components/ActiveMandateHero"
import { AgentsSearchBar } from "./components/AgentsSearchBar"
import { AgentCardCompact } from "./components/AgentCardCompact"

interface Agent {
  id: string
  userId: string
  firstName: string
  lastName: string
  agencyName?: string
  licenseNumber?: string
  licenseCountry?: string
  bio?: string
  specialties: string[]
  phoneNumber?: string
  website?: string
  profilePicture?: string
  isVerified: boolean
  activeMandatesCount: number
}

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

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: "En attente", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  ACTIVE: { label: "Actif", color: "bg-pitch-50 text-pitch-700 border-pitch-200", icon: CheckCircle },
  EXPIRED: { label: "Expire", color: "bg-stadium-100 text-stadium-600 border-stadium-200", icon: AlertCircle },
  TERMINATED: { label: "Resilie", color: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
  REJECTED: { label: "Refuse", color: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
}

export default function PlayerAgentsPage() {
  const { toast } = useToast()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [agents, setAgents] = useState<Agent[]>([])
  const [mandates, setMandates] = useState<Mandate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [selectedMandate, setSelectedMandate] = useState<Mandate | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"accept" | "reject" | "terminate" | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeMandate, setActiveMandate] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("agents")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"verified" | "mandates" | "recent">("verified")
  const [filterCountry, setFilterCountry] = useState<string>("all")
  const [filterSpecialty, setFilterSpecialty] = useState<string>("all")

  const { register, handleSubmit, reset } = useForm<{
    startDate: string
    endDate: string
    terms: string
  }>()

  useEffect(() => {
    async function loadData() {
      try {
        const mandatesResponse = await fetch("/api/mandates")
        if (mandatesResponse.ok) {
          const mandatesData = await mandatesResponse.json()
          const allMandates = mandatesData.mandates || []
          setMandates(allMandates)

          const active = allMandates.find(
            (m: any) => m.status === "ACTIVE" || m.status === "PENDING"
          )
          setActiveMandate(active || null)
        }

        const agentsResponse = await fetch("/api/agents")
        if (!agentsResponse.ok) throw new Error("Erreur de chargement")

        const agentsData = await agentsResponse.json()
        setAgents(agentsData.agents || [])
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les donnees",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const handleProposeMandate = (agent: Agent) => {
    if (activeMandate) {
      toast({
        title: "Mandat existant",
        description: "Vous avez deja un mandat actif ou en attente",
      })
      return
    }
    setSelectedAgent(agent)
    setDialogOpen(true)
  }

  const handleViewDetails = (agent: Agent) => {
    setSelectedAgent(agent)
    setDetailDialogOpen(true)
  }

  const onSubmitMandate = async (data: {
    startDate: string
    endDate: string
    terms: string
  }) => {
    if (!selectedAgent) return
    setSaving(true)
    try {
      toast({
        title: "Fonctionnalite a venir",
        description: "L'envoi de demande de mandat sera bientot disponible",
      })
      reset()
      setDialogOpen(false)
      setSelectedAgent(null)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
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

      if (!response.ok) throw new Error("Erreur lors de la mise a jour")

      setMandates(
        mandates.map((m) =>
          m.id === selectedMandate.id ? { ...m, status: newStatus } : m
        )
      )

      if (activeMandate?.id === selectedMandate.id) {
        if (newStatus === "ACTIVE") {
          setActiveMandate({ ...selectedMandate, status: newStatus })
        } else {
          setActiveMandate(null)
        }
      }

      toast({
        title: "Succes",
        description: `Mandat ${actionType === "accept" ? "accepte" : actionType === "reject" ? "refuse" : "resilie"}`,
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

  const allCountries = Array.from(new Set(agents.map(a => a.licenseCountry).filter(Boolean))) as string[]
  const allSpecialties = Array.from(new Set(agents.flatMap(a => a.specialties)))

  let filteredAgents = agents.filter((agent) => {
    const matchesSearch = searchQuery === "" ||
      agent.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.agencyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCountry = filterCountry === "all" || agent.licenseCountry === filterCountry
    const matchesSpecialty = filterSpecialty === "all" || agent.specialties.includes(filterSpecialty)

    return matchesSearch && matchesCountry && matchesSpecialty
  })

  filteredAgents = [...filteredAgents].sort((a, b) => {
    if (sortBy === "verified") {
      if (a.isVerified === b.isVerified) return b.activeMandatesCount - a.activeMandatesCount
      return a.isVerified ? -1 : 1
    } else if (sortBy === "mandates") {
      return b.activeMandatesCount - a.activeMandatesCount
    }
    return 0
  })

  const mandatesByStatus = mandates.reduce((acc, mandate) => {
    if (!acc[mandate.status]) acc[mandate.status] = []
    acc[mandate.status].push(mandate)
    return acc
  }, {} as Record<string, Mandate[]>)

  const statusOrder = ["PENDING", "ACTIVE", "EXPIRED", "TERMINATED", "REJECTED"]

  const handleStatClick = (target: string) => {
    if (target === "agents") {
      setActiveTab("agents")
      searchInputRef.current?.focus()
    } else {
      setActiveTab("mandates")
    }
  }

  const handleResetFilters = () => {
    setFilterCountry("all")
    setFilterSpecialty("all")
    setSearchQuery("")
  }

  const scrollToSearch = () => {
    setActiveTab("agents")
    setTimeout(() => {
      searchInputRef.current?.focus()
      searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-pitch-600" />
          <p className="text-sm text-stadium-500">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <AgentsPageHeader
          activeMandatesCount={mandatesByStatus.ACTIVE?.length || 0}
          pendingCount={mandatesByStatus.PENDING?.length || 0}
          agentsCount={agents.length}
          searchInputRef={searchInputRef}
        />

        <AgentsStatsBar
          agentsCount={agents.length}
          pendingCount={mandatesByStatus.PENDING?.length || 0}
          activeCount={mandatesByStatus.ACTIVE?.length || 0}
          totalMandates={mandates.length}
          onStatClick={handleStatClick}
        />

        <AgentsTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          agentsCount={agents.length}
          mandatesCount={mandates.length}
        />

        {/* Tab panels */}
        {activeTab === "agents" && (
          <div
            role="tabpanel"
            id="tabpanel-agents"
            className="animate-fade-in"
          >
            <ActiveMandateHero
              activeMandate={activeMandate}
              onViewProfile={() => {
                if (activeMandate) {
                  const agent = agents.find(a => a.id === activeMandate.agentProfile.id)
                  if (agent) handleViewDetails(agent)
                }
              }}
              onContact={() => {
                if (activeMandate) {
                  const agent = agents.find(a => a.id === activeMandate.agentProfile.id)
                  if (agent) handleProposeMandate(agent)
                }
              }}
              onFindAgent={scrollToSearch}
            />

            <AgentsSearchBar
              ref={searchInputRef}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterCountry={filterCountry}
              onFilterCountryChange={setFilterCountry}
              filterSpecialty={filterSpecialty}
              onFilterSpecialtyChange={setFilterSpecialty}
              sortBy={sortBy}
              onSortChange={(v) => setSortBy(v as any)}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              allCountries={allCountries}
              allSpecialties={allSpecialties}
              filteredCount={filteredAgents.length}
              onReset={handleResetFilters}
            />

            {filteredAgents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stadium-200 bg-stadium-50/50 px-6 py-16 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stadium-100">
                  <Search className="h-5 w-5 text-stadium-400" />
                </div>
                <p className="text-base font-semibold text-stadium-700 mb-1">Aucun agent trouve</p>
                <p className="text-sm text-stadium-500 mb-4">
                  {searchQuery || filterCountry !== "all" || filterSpecialty !== "all"
                    ? "Essayez d'ajuster vos criteres de recherche"
                    : "Aucun agent disponible pour le moment"}
                </p>
                {(searchQuery || filterCountry !== "all" || filterSpecialty !== "all") && (
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                    className="rounded-xl border-stadium-200 font-medium text-sm"
                    aria-label="Reinitialiser les filtres"
                  >
                    Reinitialiser les filtres
                  </Button>
                )}
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2" : "space-y-3"}>
                {filteredAgents.map((agent) => (
                  <AgentCardCompact
                    key={agent.id}
                    agent={agent}
                    hasActiveMandate={!!activeMandate}
                    onViewDetails={handleViewDetails}
                    onProposeMandate={handleProposeMandate}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "mandates" && (
          <div
            role="tabpanel"
            id="tabpanel-mandates"
            className="animate-fade-in"
          >
            {mandates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stadium-200 bg-stadium-50/50 px-6 py-16 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-stadium-100">
                  <FileText className="h-5 w-5 text-stadium-400" />
                </div>
                <p className="text-base font-semibold text-stadium-700 mb-1">Aucun mandat</p>
                <p className="text-sm text-stadium-500 mb-4">
                  Recherchez un agent pour creer votre premier mandat
                </p>
                <Button
                  onClick={scrollToSearch}
                  className="bg-pitch-600 hover:bg-pitch-700 text-white font-semibold rounded-xl px-5 h-10 shadow-sm transition-all duration-200 active:scale-[0.97]"
                  aria-label="Trouver un agent"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Trouver un agent
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {statusOrder.map((status) => {
                  const mandatesInStatus = mandatesByStatus[status]
                  if (!mandatesInStatus || mandatesInStatus.length === 0) return null
                  const config = statusConfig[status]
                  const Icon = config.icon

                  return (
                    <div key={status}>
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${config.color.split(' ')[0]}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <h2 className="text-lg font-bold text-stadium-900">{config.label}</h2>
                        <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-stadium-100 text-stadium-600 text-xs font-bold">
                          {mandatesInStatus.length}
                        </span>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {mandatesInStatus.map((mandate) => (
                          <div
                            key={mandate.id}
                            className="group bg-white border border-stadium-200/60 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-md hover:border-pitch-200 hover:-translate-y-0.5"
                          >
                            <div className="p-5 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pitch-600 text-white font-bold text-sm shadow-sm">
                                    {mandate.agentProfile.firstName[0]}{mandate.agentProfile.lastName[0]}
                                  </div>
                                  <div className="min-w-0">
                                    <h3 className="font-bold text-stadium-900 truncate">
                                      {mandate.agentProfile.firstName} {mandate.agentProfile.lastName}
                                    </h3>
                                    {mandate.agentProfile.agencyName && (
                                      <p className="text-xs text-stadium-400 flex items-center gap-1 mt-0.5">
                                        <Building2 className="h-3 w-3" />
                                        {mandate.agentProfile.agencyName}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <Badge className={`shrink-0 text-[10px] font-bold rounded-md px-2 py-0.5 ${config.color}`}>
                                  {config.label}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-stadium-400 bg-stadium-50 px-3 py-2 rounded-xl">
                                <Calendar className="h-3 w-3" />
                                Du {new Date(mandate.startDate).toLocaleDateString("fr-FR")} au{" "}
                                {new Date(mandate.endDate).toLocaleDateString("fr-FR")}
                              </div>

                              {mandate.terms && (
                                <p className="text-xs text-stadium-500 line-clamp-2 leading-relaxed">
                                  {mandate.terms}
                                </p>
                              )}

                              {mandate.status === "PENDING" && (
                                <div className="flex gap-2 pt-1">
                                  <Button
                                    size="sm"
                                    className="flex-1 bg-pitch-600 hover:bg-pitch-700 text-white rounded-xl font-medium text-xs h-8 shadow-sm transition-all duration-200 active:scale-[0.97]"
                                    onClick={() => handleMandateAction(mandate, "accept")}
                                    aria-label="Accepter le mandat"
                                  >
                                    <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                    Accepter
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 rounded-xl border-stadium-200 font-medium text-xs h-8 transition-all duration-200 active:scale-[0.97]"
                                    onClick={() => handleMandateAction(mandate, "reject")}
                                    aria-label="Refuser le mandat"
                                  >
                                    <XCircle className="mr-1 h-3.5 w-3.5" />
                                    Refuser
                                  </Button>
                                </div>
                              )}

                              {mandate.status === "ACTIVE" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium text-xs h-8 transition-all duration-200 active:scale-[0.97]"
                                  onClick={() => handleMandateAction(mandate, "terminate")}
                                  aria-label="Resilier le mandat"
                                >
                                  <XCircle className="mr-1 h-3.5 w-3.5" />
                                  Resilier le mandat
                                </Button>
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
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-pitch-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                  {selectedAgent?.firstName[0]}{selectedAgent?.lastName[0]}
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    {selectedAgent?.firstName} {selectedAgent?.lastName}
                    {selectedAgent?.isVerified && (
                      <Badge className="bg-pitch-50 text-pitch-700 border border-pitch-200 text-[10px] px-1.5 py-0 font-semibold rounded-md">
                        <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                        Verifie
                      </Badge>
                    )}
                  </DialogTitle>
                  {selectedAgent?.agencyName && (
                    <DialogDescription className="flex items-center gap-1 mt-0.5 text-sm">
                      <Building2 className="h-3.5 w-3.5" />
                      {selectedAgent.agencyName}
                    </DialogDescription>
                  )}
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 mt-4">
              {selectedAgent?.licenseNumber && (
                <div className="flex items-center gap-3 bg-pitch-50 border border-pitch-200/60 rounded-xl px-4 py-3">
                  <Award className="h-5 w-5 text-pitch-600" />
                  <div>
                    <div className="font-semibold text-stadium-900 text-sm">Licence professionnelle</div>
                    <div className="text-xs text-stadium-500">
                      {selectedAgent.licenseNumber}
                      {selectedAgent.licenseCountry && ` · ${selectedAgent.licenseCountry}`}
                    </div>
                  </div>
                </div>
              )}

              {selectedAgent?.bio && (
                <div>
                  <h3 className="font-semibold text-sm mb-1.5 flex items-center gap-1.5 text-stadium-900">
                    <MessageSquare className="h-4 w-4 text-pitch-600" />
                    A propos
                  </h3>
                  <p className="text-sm text-stadium-500 leading-relaxed">{selectedAgent.bio}</p>
                </div>
              )}

              {selectedAgent?.specialties && selectedAgent.specialties.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5 text-stadium-900">
                    <Star className="h-4 w-4 text-pitch-600" />
                    Specialites
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedAgent.specialties.map((specialty, idx) => (
                      <span key={idx} className="inline-block bg-stadium-50 text-stadium-600 border border-stadium-200/60 rounded-lg px-2.5 py-1 text-xs font-medium">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between bg-pitch-50 border border-pitch-200/60 rounded-xl px-4 py-3">
                <div>
                  <div className="text-2xl font-black text-stadium-900">
                    {selectedAgent?.activeMandatesCount}
                  </div>
                  <div className="text-xs text-stadium-500 font-medium">Mandats actifs</div>
                </div>
                <TrendingUp className="h-8 w-8 text-pitch-400" />
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5 text-stadium-900">
                  <Phone className="h-4 w-4 text-pitch-600" />
                  Contact
                </h3>
                <div className="space-y-2">
                  {selectedAgent?.phoneNumber && (
                    <div className="flex items-center gap-2.5 px-3 py-2 bg-stadium-50 rounded-xl text-sm">
                      <Phone className="h-4 w-4 text-pitch-600" />
                      <span className="font-medium text-stadium-700">{selectedAgent.phoneNumber}</span>
                    </div>
                  )}
                  {selectedAgent?.website && (
                    <div className="flex items-center gap-2.5 px-3 py-2 bg-stadium-50 rounded-xl text-sm">
                      <Globe className="h-4 w-4 text-pitch-600" />
                      <a href={selectedAgent.website} target="_blank" rel="noopener noreferrer" className="text-pitch-600 hover:text-pitch-700 font-medium hover:underline">
                        {selectedAgent.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setDetailDialogOpen(false)}
                className="rounded-xl border-stadium-200 font-medium"
              >
                Fermer
              </Button>
              <Button
                onClick={() => {
                  setDetailDialogOpen(false)
                  if (selectedAgent) handleProposeMandate(selectedAgent)
                }}
                disabled={!!activeMandate}
                className="rounded-xl bg-pitch-600 hover:bg-pitch-700 font-medium shadow-sm transition-all duration-200 active:scale-[0.97]"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Proposer un mandat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Mandate Proposal Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Proposer un mandat</DialogTitle>
              <DialogDescription>
                {selectedAgent?.firstName} {selectedAgent?.lastName}
                {selectedAgent?.agencyName && ` · ${selectedAgent.agencyName}`}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmitMandate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-sm font-medium">Date de debut *</Label>
                  <Input id="startDate" type="date" {...register("startDate", { required: true })} className="mt-1.5 rounded-xl border-stadium-200" />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-sm font-medium">Date de fin *</Label>
                  <Input id="endDate" type="date" {...register("endDate", { required: true })} className="mt-1.5 rounded-xl border-stadium-200" />
                </div>
              </div>

              <div>
                <Label htmlFor="terms" className="text-sm font-medium">Conditions du mandat</Label>
                <Textarea id="terms" {...register("terms")} placeholder="Commission, exclusivite, zone geographique..." rows={4} className="mt-1.5 rounded-xl border-stadium-200" />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                <p className="text-xs text-yellow-700">
                  Cette fonctionnalite permet d'envoyer une demande de mandat a l'agent. L'agent devra accepter la demande pour que le mandat devienne actif.
                </p>
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl border-stadium-200 font-medium">
                  Annuler
                </Button>
                <Button type="submit" disabled={saving} className="rounded-xl bg-pitch-600 hover:bg-pitch-700 font-medium shadow-sm transition-all duration-200 active:scale-[0.97]">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    "Envoyer la demande"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Confirm Action Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">
                {actionType === "accept" && "Accepter le mandat ?"}
                {actionType === "reject" && "Refuser le mandat ?"}
                {actionType === "terminate" && "Resilier le mandat ?"}
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
                  En acceptant ce mandat, vous autorisez l'agent a vous representer aupres des clubs pendant la duree specifiee.
                </p>
              )}
              {actionType === "reject" && (
                <p className="text-sm text-stadium-500">
                  En refusant ce mandat, l'agent ne pourra plus vous representer. Cette action est definitive.
                </p>
              )}
              {actionType === "terminate" && (
                <p className="text-sm text-stadium-500">
                  En resiliant ce mandat, vous mettez fin a la collaboration avec cet agent. Cette action est definitive.
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
