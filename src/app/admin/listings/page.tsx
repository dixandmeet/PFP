"use client"

import { useEffect, useState } from "react"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { DataTable, Column } from "@/components/admin/DataTable"
import { StatusBadge } from "@/components/admin/UserBadge"
import { ActionMenu, commonActions } from "@/components/admin/ActionMenu"
import { Card } from "@/components/ui/card"
import { StatsCard } from "@/components/admin/StatsCard"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Briefcase, CheckCircle, XCircle, Clock } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface Listing {
  id: string
  title: string
  position: string
  status: "DRAFT" | "PUBLISHED" | "CLOSED"
  salaryMin: number | null
  salaryMax: number | null
  currency: string | null
  createdAt: string
  publishedAt: string | null
  clubProfile: {
    id: string
    clubName: string
    country: string
    logo: string | null
  }
  _count: {
    applications: number
    submissions: number
  }
}

const statusMap: Record<string, "active" | "pending" | "inactive"> = {
  PUBLISHED: "active",
  DRAFT: "pending",
  CLOSED: "inactive",
}

const statusLabels: Record<string, string> = {
  PUBLISHED: "Publié",
  DRAFT: "Brouillon",
  CLOSED: "Fermé",
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    closed: 0,
  })

  useEffect(() => {
    async function fetchListings() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          page: String(pagination.page),
          pageSize: String(pagination.pageSize),
        })
        
        if (statusFilter && statusFilter !== "all") {
          params.set("status", statusFilter)
        }

        const res = await fetch(`/api/listings?${params}`)
        if (res.ok) {
          const data = await res.json()
          setListings(data.listings || [])
          setPagination((prev) => ({
            ...prev,
            total: data.pagination?.total || 0,
            totalPages: data.pagination?.totalPages || 0,
          }))
        }

        // Fetch stats
        const statsRes = await fetch("/api/admin/stats")
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats({
            total: statsData.listings?.total || 0,
            published: statsData.listings?.active || 0,
            draft: 0,
            closed: statsData.listings?.closed || 0,
          })
        }
      } catch (error) {
        console.error("Error fetching listings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchListings()
  }, [pagination.page, pagination.pageSize, statusFilter])

  const handleStatusChange = async (listingId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/listings/${listingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (res.ok) {
        // Refresh listings
        setListings((prev) =>
          prev.map((l) => (l.id === listingId ? { ...l, status: newStatus as any } : l))
        )
      }
    } catch (error) {
      console.error("Error updating listing status:", error)
    }
  }

  const columns: Column<Listing>[] = [
    {
      key: "listing",
      header: "Annonce",
      cell: (listing) => (
        <div>
          <p className="text-sm font-medium text-slate-900">{listing.title}</p>
          <p className="text-xs text-slate-500">{listing.position}</p>
        </div>
      ),
    },
    {
      key: "club",
      header: "Club",
      cell: (listing) => (
        <div>
          <p className="text-sm font-medium text-slate-900">
            {listing.clubProfile.clubName}
          </p>
          <p className="text-xs text-slate-500">{listing.clubProfile.country}</p>
        </div>
      ),
    },
    {
      key: "salary",
      header: "Salaire",
      cell: (listing) => (
        <span className="text-sm text-slate-600">
          {listing.salaryMin && listing.salaryMax
            ? `${listing.salaryMin.toLocaleString()} - ${listing.salaryMax.toLocaleString()} ${listing.currency || "EUR"}`
            : "-"}
        </span>
      ),
    },
    {
      key: "applications",
      header: "Candidatures",
      cell: (listing) => (
        <div className="text-sm">
          <span className="font-medium">{listing._count.applications}</span>
          <span className="text-slate-500"> direct</span>
          {listing._count.submissions > 0 && (
            <>
              <span className="text-slate-400 mx-1">|</span>
              <span className="font-medium">{listing._count.submissions}</span>
              <span className="text-slate-500"> agents</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut",
      cell: (listing) => (
        <Select
          value={listing.status}
          onValueChange={(value) => handleStatusChange(listing.id, value)}
        >
          <SelectTrigger className="w-28 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Brouillon</SelectItem>
            <SelectItem value="PUBLISHED">Publié</SelectItem>
            <SelectItem value="CLOSED">Fermé</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "createdAt",
      header: "Créé le",
      cell: (listing) => (
        <span className="text-sm text-slate-500">
          {format(new Date(listing.createdAt), "dd MMM yyyy", { locale: fr })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (listing) => (
        <ActionMenu
          actions={[
            commonActions.view(() => window.open(`/listings/${listing.id}`, "_blank")),
          ]}
        />
      ),
      className: "w-12",
    },
  ]

  return (
    <div>
      <AdminHeader
        title="Gestion des annonces"
        description="Gérez les offres d'emploi des clubs"
      />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatsCard
            title="Total annonces"
            value={stats.total}
            icon={Briefcase}
          />
          <StatsCard
            title="Publiées"
            value={stats.published}
            icon={CheckCircle}
            className="border-l-4 border-l-emerald-500"
          />
          <StatsCard
            title="Brouillons"
            value={stats.draft}
            icon={Clock}
            className="border-l-4 border-l-amber-500"
          />
          <StatsCard
            title="Fermées"
            value={stats.closed}
            icon={XCircle}
            className="border-l-4 border-l-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="PUBLISHED">Publiées</SelectItem>
              <SelectItem value="DRAFT">Brouillons</SelectItem>
              <SelectItem value="CLOSED">Fermées</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <DataTable
          data={listings}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Aucune annonce trouvée"
          pagination={{
            page: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onPageChange: (page) => setPagination((prev) => ({ ...prev, page })),
            onPageSizeChange: (pageSize) => setPagination((prev) => ({ ...prev, pageSize, page: 1 })),
          }}
        />
      </div>
    </div>
  )
}
