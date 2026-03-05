"use client"

import { useEffect, useState, useCallback } from "react"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { DataTable, Column } from "@/components/admin/DataTable"
import { UserBadge } from "@/components/admin/UserBadge"
import { StatsCard } from "@/components/admin/StatsCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Activity, Search, Bot, Filter } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { fr } from "date-fns/locale"

interface AuditLog {
  id: string
  action: string
  targetType: string | null
  targetId: string | null
  metadata: any
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
    role: "PLAYER" | "AGENT" | "CLUB" | "ADMIN"
    image: string | null
  }
}

interface ActionType {
  action: string
  count: number
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [actionTypes, setActionTypes] = useState<ActionType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [aiOnly, setAiOnly] = useState(false)
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0,
  })

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        pageSize: String(pagination.pageSize),
      })
      
      if (aiOnly) {
        params.set("aiOnly", "true")
      }
      
      if (actionFilter && actionFilter !== "all") {
        params.set("action", actionFilter)
      }

      const res = await fetch(`/api/admin/audit?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs)
        setActionTypes(data.actionTypes)
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
        }))
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error)
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.pageSize, aiOnly, actionFilter])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const isAIAction = (action: string) => action.startsWith("AI_")

  const formatAction = (action: string) => {
    return action
      .replace("AI_", "")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const columns: Column<AuditLog>[] = [
    {
      key: "user",
      header: "Utilisateur",
      cell: (log) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={log.user.image || ""} />
            <AvatarFallback className="text-xs bg-slate-100">
              {(log.user.name || log.user.email).charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-slate-900">
              {log.user.name || log.user.email}
            </p>
            <UserBadge role={log.user.role} className="mt-0.5" />
          </div>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      cell: (log) => (
        <div className="flex items-center gap-2">
          {isAIAction(log.action) && (
            <Bot className="h-4 w-4 text-blue-500" />
          )}
          <span className="text-sm font-medium text-slate-900">
            {formatAction(log.action)}
          </span>
        </div>
      ),
    },
    {
      key: "target",
      header: "Cible",
      cell: (log) => (
        <div className="text-sm">
          {log.targetType ? (
            <>
              <span className="text-slate-600">{log.targetType}</span>
              {log.targetId && (
                <span className="text-slate-400 ml-1">
                  #{log.targetId.slice(0, 8)}
                </span>
              )}
            </>
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      cell: (log) => (
        <div className="text-sm">
          <p className="text-slate-900">
            {format(new Date(log.createdAt), "dd MMM yyyy", { locale: fr })}
          </p>
          <p className="text-xs text-slate-500">
            {format(new Date(log.createdAt), "HH:mm:ss")}
          </p>
        </div>
      ),
    },
    {
      key: "details",
      header: "",
      cell: (log) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedLog(log)}
        >
          Détails
        </Button>
      ),
      className: "w-24",
    },
  ]

  // Count AI actions
  const aiActionsCount = actionTypes
    .filter((a) => a.action.startsWith("AI_"))
    .reduce((sum, a) => sum + a.count, 0)

  return (
    <div>
      <AdminHeader
        title="Audit & Logs"
        description="Historique des actions sur la plateforme"
      />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Total actions"
            value={pagination.total}
            icon={Activity}
          />
          <StatsCard
            title="Actions AI"
            value={aiActionsCount}
            icon={Bot}
            className="border-l-4 border-l-blue-500"
          />
          <StatsCard
            title="Types d'actions"
            value={actionTypes.length}
            description="Différents types enregistrés"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant={aiOnly ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setAiOnly(!aiOnly)
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
            className="h-9"
          >
            <Bot className="h-4 w-4 mr-2" />
            Actions AI uniquement
          </Button>

          <Select
            value={actionFilter}
            onValueChange={(value) => {
              setActionFilter(value)
              setPagination((prev) => ({ ...prev, page: 1 }))
            }}
          >
            <SelectTrigger className="w-60 h-9">
              <SelectValue placeholder="Filtrer par action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les actions</SelectItem>
              {actionTypes.slice(0, 15).map((type) => (
                <SelectItem key={type.action} value={type.action}>
                  {formatAction(type.action)} ({type.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <DataTable
          data={logs}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Aucun log trouvé"
          pagination={{
            page: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onPageChange: (page) => setPagination((prev) => ({ ...prev, page })),
            onPageSizeChange: (pageSize) => setPagination((prev) => ({ ...prev, pageSize, page: 1 })),
          }}
        />

        {/* Detail Dialog */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedLog && isAIAction(selectedLog.action) && (
                  <Bot className="h-5 w-5 text-blue-500" />
                )}
                {selectedLog && formatAction(selectedLog.action)}
              </DialogTitle>
              <DialogDescription>
                {selectedLog && format(new Date(selectedLog.createdAt), "dd MMMM yyyy à HH:mm:ss", { locale: fr })}
              </DialogDescription>
            </DialogHeader>

            {selectedLog && (
              <div className="space-y-4 mt-4">
                {/* User info */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedLog.user.image || ""} />
                    <AvatarFallback>
                      {(selectedLog.user.name || selectedLog.user.email).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-900">
                      {selectedLog.user.name || selectedLog.user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <UserBadge role={selectedLog.user.role} />
                      <span className="text-xs text-slate-500">
                        {selectedLog.user.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target */}
                {selectedLog.targetType && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Cible</p>
                    <p className="text-sm text-slate-600">
                      {selectedLog.targetType}
                      {selectedLog.targetId && ` - ${selectedLog.targetId}`}
                    </p>
                  </div>
                )}

                {/* Metadata */}
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Données</p>
                    <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs overflow-auto max-h-64">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Technical info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  {selectedLog.ipAddress && (
                    <div>
                      <p className="text-xs text-slate-500">Adresse IP</p>
                      <p className="text-sm text-slate-700">{selectedLog.ipAddress}</p>
                    </div>
                  )}
                  {selectedLog.userAgent && (
                    <div>
                      <p className="text-xs text-slate-500">User Agent</p>
                      <p className="text-sm text-slate-700 truncate" title={selectedLog.userAgent}>
                        {selectedLog.userAgent}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
