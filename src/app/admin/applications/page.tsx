"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { DataTable, Column } from "@/components/admin/DataTable"
import { UserBadge } from "@/components/admin/UserBadge"
import { ActionMenu, commonActions } from "@/components/admin/ActionMenu"
import { Card } from "@/components/ui/card"
import { StatsCard } from "@/components/admin/StatsCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ClipboardList, Send, Clock, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Application {
  id: string
  status: string
  coverLetter: string | null
  createdAt: string
  playerProfile: {
    id: string
    firstName: string
    lastName: string
    primaryPosition: string
    user: {
      email: string
    }
  }
  listing: {
    id: string
    title: string
    position: string
  }
  clubProfile: {
    id: string
    clubName: string
  }
}

interface Submission {
  id: string
  status: string
  message: string | null
  createdAt: string
  agentProfile: {
    id: string
    firstName: string
    lastName: string
    user: {
      email: string
    }
  }
  listing: {
    id: string
    title: string
    position: string
  } | null
  clubProfile: {
    id: string
    clubName: string
  }
  playerData: {
    firstName?: string
    lastName?: string
    position?: string
  }
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  SHORTLISTED: "bg-purple-100 text-purple-700",
  TRIAL: "bg-cyan-100 text-cyan-700",
  REJECTED: "bg-red-100 text-red-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  SIGNED: "bg-green-100 text-green-700",
}

const statusLabels: Record<string, string> = {
  DRAFT: "Brouillon",
  SUBMITTED: "Soumise",
  UNDER_REVIEW: "En cours",
  SHORTLISTED: "Présélection",
  TRIAL: "Essai",
  REJECTED: "Rejetée",
  ACCEPTED: "Acceptée",
  SIGNED: "Signée",
}

export default function AdminApplicationsPage() {
  const [activeTab, setActiveTab] = useState<"applications" | "submissions">("applications")
  const [applications, setApplications] = useState<Application[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const endpoint = activeTab === "applications" ? "/api/applications" : "/api/submissions"
        const params = new URLSearchParams({
          page: String(pagination.page),
          pageSize: String(pagination.pageSize),
        })
        
        if (statusFilter && statusFilter !== "all") {
          params.set("status", statusFilter)
        }

        const res = await fetch(`${endpoint}?${params}`)
        if (res.ok) {
          const data = await res.json()
          if (activeTab === "applications") {
            setApplications(data.applications || [])
          } else {
            setSubmissions(data.submissions || [])
          }
          setPagination((prev) => ({
            ...prev,
            total: data.pagination?.total || 0,
            totalPages: data.pagination?.totalPages || 0,
          }))
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [activeTab, pagination.page, pagination.pageSize, statusFilter])

  const handleStatusChange = async (id: string, newStatus: string) => {
    const endpoint = activeTab === "applications" 
      ? `/api/applications/${id}/status`
      : `/api/submissions/${id}/status`
    
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (res.ok) {
        if (activeTab === "applications") {
          setApplications((prev) =>
            prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
          )
        } else {
          setSubmissions((prev) =>
            prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
          )
        }
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const applicationColumns: Column<Application>[] = [
    {
      key: "player",
      header: "Joueur",
      cell: (app) => (
        <div>
          <p className="text-sm font-medium text-slate-900">
            {app.playerProfile.firstName} {app.playerProfile.lastName}
          </p>
          <p className="text-xs text-slate-500">{app.playerProfile.primaryPosition}</p>
        </div>
      ),
    },
    {
      key: "listing",
      header: "Annonce",
      cell: (app) => (
        <div>
          <p className="text-sm font-medium text-slate-900">{app.listing.title}</p>
          <p className="text-xs text-slate-500">{app.clubProfile.clubName}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut",
      cell: (app) => (
        <Select
          value={app.status}
          onValueChange={(value) => handleStatusChange(app.id, value)}
        >
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      cell: (app) => (
        <span className="text-sm text-slate-500">
          {format(new Date(app.createdAt), "dd MMM yyyy", { locale: fr })}
        </span>
      ),
    },
  ]

  const submissionColumns: Column<Submission>[] = [
    {
      key: "agent",
      header: "Agent",
      cell: (sub) => (
        <div>
          <p className="text-sm font-medium text-slate-900">
            {sub.agentProfile.firstName} {sub.agentProfile.lastName}
          </p>
          <p className="text-xs text-slate-500">{sub.agentProfile.user.email}</p>
        </div>
      ),
    },
    {
      key: "player",
      header: "Joueur proposé",
      cell: (sub) => (
        <div>
          <p className="text-sm font-medium text-slate-900">
            {sub.playerData?.firstName} {sub.playerData?.lastName}
          </p>
          <p className="text-xs text-slate-500">{sub.playerData?.position || "-"}</p>
        </div>
      ),
    },
    {
      key: "club",
      header: "Club destinataire",
      cell: (sub) => (
        <div>
          <p className="text-sm font-medium text-slate-900">{sub.clubProfile.clubName}</p>
          {sub.listing && (
            <p className="text-xs text-slate-500">{sub.listing.title}</p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut",
      cell: (sub) => (
        <Select
          value={sub.status}
          onValueChange={(value) => handleStatusChange(sub.id, value)}
        >
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      cell: (sub) => (
        <span className="text-sm text-slate-500">
          {format(new Date(sub.createdAt), "dd MMM yyyy", { locale: fr })}
        </span>
      ),
    },
  ]

  return (
    <div>
      <AdminHeader
        title="Candidatures & Soumissions"
        description="Suivez les candidatures des joueurs et les soumissions des agents"
      />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatsCard
            title="Candidatures directes"
            value={applications.length > 0 ? pagination.total : "-"}
            icon={ClipboardList}
            description="Joueurs vers clubs"
          />
          <StatsCard
            title="Soumissions agents"
            value={submissions.length > 0 ? pagination.total : "-"}
            icon={Send}
            description="Agents vers clubs"
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => {
            setActiveTab(v as "applications" | "submissions")
            setPagination((prev) => ({ ...prev, page: 1 }))
            setStatusFilter("all")
          }}
        >
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList>
              <TabsTrigger value="applications">Candidatures</TabsTrigger>
              <TabsTrigger value="submissions">Soumissions agents</TabsTrigger>
            </TabsList>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="applications" className="mt-4">
            <DataTable
              data={applications}
              columns={applicationColumns}
              isLoading={isLoading}
              emptyMessage="Aucune candidature trouvée"
              pagination={{
                page: pagination.page,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onPageChange: (page) => setPagination((prev) => ({ ...prev, page })),
                onPageSizeChange: (pageSize) => setPagination((prev) => ({ ...prev, pageSize, page: 1 })),
              }}
            />
          </TabsContent>

          <TabsContent value="submissions" className="mt-4">
            <DataTable
              data={submissions}
              columns={submissionColumns}
              isLoading={isLoading}
              emptyMessage="Aucune soumission trouvée"
              pagination={{
                page: pagination.page,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onPageChange: (page) => setPagination((prev) => ({ ...prev, page })),
                onPageSizeChange: (pageSize) => setPagination((prev) => ({ ...prev, pageSize, page: 1 })),
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
