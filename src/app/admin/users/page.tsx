"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { DataTable, Column } from "@/components/admin/DataTable"
import { UserBadge } from "@/components/admin/UserBadge"
import { ActionMenu, commonActions } from "@/components/admin/ActionMenu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface User {
  id: string
  name: string | null
  email: string
  role: "PLAYER" | "AGENT" | "CLUB" | "ADMIN"
  image: string | null
  createdAt: string
  emailVerified: string | null
  playerProfile: {
    id: string
    firstName: string
    lastName: string
    currentClub: string | null
    primaryPosition: string
  } | null
  agentProfile: {
    id: string
    firstName: string
    lastName: string
    agencyName: string | null
    isVerified: boolean
  } | null
  clubProfile: {
    id: string
    clubName: string
    country: string
    league: string | null
    isVerified: boolean
  } | null
  _count: {
    posts: number
  }
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-8 h-8 border-4 border-pitch-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <AdminUsersContent />
    </Suspense>
  )
}

function AdminUsersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })
  const [roleFilter, setRoleFilter] = useState<string>(searchParams.get("role") || "all")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        pageSize: String(pagination.pageSize),
      })
      
      if (roleFilter && roleFilter !== "all") {
        params.set("role", roleFilter)
      }
      
      if (searchQuery) {
        params.set("search", searchQuery)
      }

      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }))
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.pageSize, roleFilter, searchQuery])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchUsers()
  }

  const getDisplayName = (user: User) => {
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

  const getSubInfo = (user: User) => {
    if (user.playerProfile) {
      return user.playerProfile.currentClub || user.playerProfile.primaryPosition
    }
    if (user.agentProfile) {
      return user.agentProfile.agencyName || "Agent indépendant"
    }
    if (user.clubProfile) {
      return `${user.clubProfile.league || ""} - ${user.clubProfile.country}`
    }
    return user.email
  }

  const isVerified = (user: User) => {
    if (user.agentProfile) return user.agentProfile.isVerified
    if (user.clubProfile) return user.clubProfile.isVerified
    return null
  }

  const columns: Column<User>[] = [
    {
      key: "user",
      header: "Utilisateur",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback className="text-xs bg-slate-100">
              {getDisplayName(user).charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-slate-900">{getDisplayName(user)}</p>
            <p className="text-xs text-slate-500">{getSubInfo(user)}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      cell: (user) => (
        <span className="text-sm text-slate-600">{user.email}</span>
      ),
    },
    {
      key: "role",
      header: "Rôle",
      cell: (user) => (
        <div className="flex items-center gap-2">
          <UserBadge role={user.role} />
          {isVerified(user) !== null && (
            <span className={`text-xs ${isVerified(user) ? "text-emerald-600" : "text-amber-600"}`}>
              {isVerified(user) ? "✓ Vérifié" : "Non vérifié"}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "posts",
      header: "Posts",
      cell: (user) => (
        <span className="text-sm text-slate-600">{user._count.posts}</span>
      ),
      className: "text-center",
    },
    {
      key: "createdAt",
      header: "Inscrit le",
      cell: (user) => (
        <span className="text-sm text-slate-600">
          {format(new Date(user.createdAt), "dd MMM yyyy", { locale: fr })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (user) => (
        <ActionMenu
          actions={[
            commonActions.view(() => router.push(`/admin/users/${user.id}`)),
            commonActions.delete(() => handleDeleteUser(user.id)),
          ]}
        />
      ),
      className: "w-12",
    },
  ]

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
      if (res.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  return (
    <div>
      <AdminHeader
        title="Utilisateurs"
        description={`${pagination.total} utilisateurs au total`}
      />

      <div className="p-4 lg:p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Rechercher par nom ou email..."
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
            <Select value={roleFilter} onValueChange={(value) => {
              setRoleFilter(value)
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="Tous les rôles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les roles</SelectItem>
                <SelectItem value="PLAYER,AGENT">Joueurs & Agents</SelectItem>
                <SelectItem value="PLAYER">Joueurs</SelectItem>
                <SelectItem value="AGENT">Agents</SelectItem>
                <SelectItem value="CLUB">Clubs</SelectItem>
                <SelectItem value="ADMIN">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <DataTable
          data={users}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Aucun utilisateur trouvé"
          onRowClick={(user) => router.push(`/admin/users/${user.id}`)}
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
