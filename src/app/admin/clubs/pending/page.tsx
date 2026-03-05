"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Building2,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
} from "lucide-react"

interface ClubListItem {
  id: string
  clubName: string
  country: string
  city: string | null
  clubType: string | null
  status: string
  kycStatus: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
  _count: {
    kycDocuments: number
  }
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT: { label: "Brouillon", variant: "secondary" },
  PENDING_REVIEW: { label: "En attente", variant: "default" },
  ACTIVE: { label: "Actif", variant: "default" },
  REJECTED: { label: "Refusé", variant: "destructive" },
}

export default function AdminClubsPendingPage() {
  const [clubs, setClubs] = useState<ClubListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("PENDING_REVIEW")
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  })

  const loadClubs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        page: pagination.page.toString(),
        limit: "20",
      })
      const res = await fetch(`/api/admin/clubs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setClubs(data.clubs)
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }))
      }
    } catch (err) {
      console.error("Error loading clubs:", err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, pagination.page])

  useEffect(() => {
    loadClubs()
  }, [loadClubs])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des clubs
          </h1>
          <p className="text-gray-500 mt-1">
            Examinez et validez les demandes d&apos;enregistrement des clubs.
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6">
        <Filter className="w-5 h-5 text-gray-400 mt-2" />
        {["PENDING_REVIEW", "ACTIVE", "REJECTED", "DRAFT"].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setStatusFilter(status)
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
          >
            {status === "PENDING_REVIEW" && <Clock className="w-4 h-4 mr-1" />}
            {status === "ACTIVE" && <CheckCircle2 className="w-4 h-4 mr-1" />}
            {status === "REJECTED" && <XCircle className="w-4 h-4 mr-1" />}
            {STATUS_LABELS[status]?.label || status}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      ) : clubs.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            Aucun club avec le statut &quot;{STATUS_LABELS[statusFilter]?.label}&quot;
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {clubs.map((club) => (
            <div
              key={club.id}
              className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-pitch-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-pitch-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {club.clubName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {club.country}
                      {club.city ? ` - ${club.city}` : ""} | {club.clubType || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-sm">
                    <p className="text-gray-500">
                      {club.user.name || club.user.email}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {club._count.kycDocuments} doc(s) | Mis à jour{" "}
                      {new Date(club.updatedAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <Badge variant={STATUS_LABELS[club.status]?.variant || "secondary"}>
                    {STATUS_LABELS[club.status]?.label || club.status}
                  </Badge>
                  <Link href={`/admin/clubs/${club.id}/review`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Examiner
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                Précédent
              </Button>
              <span className="text-sm text-gray-500">
                Page {pagination.page} / {pagination.totalPages} ({pagination.total}{" "}
                résultats)
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
