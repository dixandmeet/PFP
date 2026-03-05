"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  User,
  Building2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface RecoveryRequest {
  id: string
  requesterEmail: string
  requesterName: string
  requesterUserId: string | null
  entityType: "PLAYER" | "AGENT" | "CLUB"
  entityName: string
  entityId: string | null
  message: string
  proofDocuments: string[]
  status: "PENDING" | "APPROVED" | "REJECTED"
  adminNote: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
}

const entityTypeConfig = {
  PLAYER: {
    label: "Joueur",
    icon: User,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  AGENT: {
    label: "Agent",
    icon: Briefcase,
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  CLUB: {
    label: "Club",
    icon: Building2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
}

const statusConfig = {
  PENDING: {
    label: "En attente",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  APPROVED: {
    label: "Approuvée",
    icon: CheckCircle,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "Rejetée",
    icon: XCircle,
    className: "bg-red-50 text-red-700 border-red-200",
  },
}

export default function AdminRecoveriesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-pitch-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminRecoveriesContent />
    </Suspense>
  )
}

function AdminRecoveriesContent() {
  const [requests, setRequests] = useState<RecoveryRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [entityTypeFilter, setEntityTypeFilter] = useState("all")
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })

  const [selectedRequest, setSelectedRequest] = useState<RecoveryRequest | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [adminNote, setAdminNote] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const fetchRequests = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        pageSize: String(pagination.pageSize),
      })
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (entityTypeFilter !== "all") params.set("entityType", entityTypeFilter)
      if (searchQuery) params.set("search", searchQuery)

      const res = await fetch(`/api/admin/recoveries?${params}`)
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests)
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }))
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.pageSize, statusFilter, entityTypeFilter, searchQuery])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleViewRequest = (request: RecoveryRequest) => {
    setSelectedRequest(request)
    setAdminNote(request.adminNote || "")
    setIsDetailOpen(true)
  }

  const handleUpdateStatus = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedRequest) return
    setIsProcessing(true)
    try {
      const res = await fetch("/api/admin/recoveries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedRequest.id,
          status,
          adminNote,
        }),
      })
      if (res.ok) {
        setIsDetailOpen(false)
        fetchRequests()
      }
    } catch (error) {
      console.error("Error updating request:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const pendingCount = requests.filter((r) => r.status === "PENDING").length

  return (
    <div>
      <AdminHeader
        title="Récupérations de profils"
        description={`${pagination.total} demandes au total${pendingCount > 0 ? ` · ${pendingCount} en attente` : ""}`}
      />

      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Rechercher par nom, email ou entité..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Button type="submit" variant="outline" size="sm" className="h-9">
              Rechercher
            </Button>
          </form>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
            >
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="APPROVED">Approuvées</SelectItem>
                <SelectItem value="REJECTED">Rejetées</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={entityTypeFilter}
              onValueChange={(value) => {
                setEntityTypeFilter(value)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
            >
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="PLAYER">Joueur</SelectItem>
                <SelectItem value="AGENT">Agent</SelectItem>
                <SelectItem value="CLUB">Club</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Demandeur
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Profil demandé
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Type
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Statut
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Date
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-600 uppercase tracking-wider w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-slate-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Chargement...
                    </div>
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-slate-500"
                  >
                    Aucune demande trouvée
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => {
                  const entityConf = entityTypeConfig[request.entityType]
                  const statusConf = statusConfig[request.status]
                  const StatusIcon = statusConf.icon

                  return (
                    <TableRow
                      key={request.id}
                      className="hover:bg-slate-50/50"
                    >
                      <TableCell className="py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {request.requesterName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {request.requesterEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <p className="text-sm font-medium text-slate-900">
                          {request.entityName}
                        </p>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={`text-xs ${entityConf.className}`}
                        >
                          {entityConf.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={`text-xs gap-1 ${statusConf.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConf.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-sm text-slate-600">
                          {format(
                            new Date(request.createdAt),
                            "dd MMM yyyy",
                            { locale: fr }
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewRequest(request)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-end gap-1">
            <span className="text-sm text-slate-500 mr-2">
              Page {pagination.page} sur {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page === pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails de la demande</DialogTitle>
            <DialogDescription>
              Demande de récupération de profil
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">
                    Demandeur
                  </label>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {selectedRequest.requesterName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedRequest.requesterEmail}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">
                    Profil demandé
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className={`text-xs ${entityTypeConfig[selectedRequest.entityType].className}`}
                    >
                      {entityTypeConfig[selectedRequest.entityType].label}
                    </Badge>
                    <span className="text-sm font-medium text-slate-900">
                      {selectedRequest.entityName}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">
                  Message
                </label>
                <div className="mt-1 p-3 bg-slate-50 rounded-md text-sm text-slate-700 whitespace-pre-wrap">
                  {selectedRequest.message}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">
                  Date de la demande
                </label>
                <p className="text-sm text-slate-700 mt-1">
                  {format(
                    new Date(selectedRequest.createdAt),
                    "dd MMMM yyyy 'à' HH:mm",
                    { locale: fr }
                  )}
                </p>
              </div>

              {selectedRequest.status === "PENDING" ? (
                <>
                  <div>
                    <label className="text-xs font-medium text-slate-700">
                      Note admin (optionnel)
                    </label>
                    <Textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Ajouter une note..."
                      className="mt-1 text-sm"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleUpdateStatus("REJECTED")}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-1" />
                      )}
                      Rejeter
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleUpdateStatus("APPROVED")}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      )}
                      Approuver
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">
                      Statut
                    </label>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={`text-xs gap-1 ${statusConfig[selectedRequest.status].className}`}
                      >
                        {statusConfig[selectedRequest.status].label}
                      </Badge>
                    </div>
                  </div>
                  {selectedRequest.adminNote && (
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase">
                        Note admin
                      </label>
                      <p className="text-sm text-slate-700 mt-1">
                        {selectedRequest.adminNote}
                      </p>
                    </div>
                  )}
                  {selectedRequest.reviewedAt && (
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase">
                        Traitée le
                      </label>
                      <p className="text-sm text-slate-700 mt-1">
                        {format(
                          new Date(selectedRequest.reviewedAt),
                          "dd MMMM yyyy 'à' HH:mm",
                          { locale: fr }
                        )}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
