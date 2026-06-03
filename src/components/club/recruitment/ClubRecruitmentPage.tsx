"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { KPIStatCard } from "@/components/club/teams/KPIStatCard"
import { EmptyState } from "@/components/club/teams/EmptyState"
import { ApplicationDetailsDialog } from "@/components/club/ApplicationDetailsDialog"
import { SubmissionDetailsDialog } from "@/components/club/recruitment/SubmissionDetailsDialog"
import { RecruitmentCard } from "@/components/club/recruitment/RecruitmentCard"
import { FilterChip } from "@/components/club/recruitment/FilterChip"
import {
  STATUS_CONFIG,
  PIPELINE_STATUSES,
  normalizeRecruitmentItems,
  groupByStatus,
  countActive,
  filterRecruitmentItems,
  getVisiblePipelineStatuses,
  getStatusPatchUrl,
  toDialogApplication,
  type ClubRecruitmentItem,
  type ApiApplication,
  type ApiSubmission,
  type RecruitmentStatusFilter,
  type RecruitmentSourceFilter,
} from "@/lib/club/recruitment"
import { cn } from "@/lib/utils"
import {
  Loader2,
  ClipboardList,
  Eye,
  Inbox,
  ListChecks,
  FileSignature,
  User,
  ArrowLeftRight,
} from "lucide-react"

export function ClubRecruitmentPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<ClubRecruitmentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<ClubRecruitmentItem | null>(null)
  const [appDialogOpen, setAppDialogOpen] = useState(false)
  const [subDialogOpen, setSubDialogOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [filterStatus, setFilterStatus] = useState<RecruitmentStatusFilter>("ALL")
  const [filterSource, setFilterSource] = useState<RecruitmentSourceFilter>("ALL")

  useEffect(() => {
    async function load() {
      try {
        const [appRes, subRes] = await Promise.all([
          fetch("/api/applications"),
          fetch("/api/submissions"),
        ])

        if (!appRes.ok || !subRes.ok) throw new Error("Erreur")

        const appData = await appRes.json()
        const subData = await subRes.json()

        setItems(
          normalizeRecruitmentItems(
            appData.applications || [],
            subData.submissions || []
          )
        )
      } catch {
        toast({
          title: "Erreur",
          description: "Impossible de charger le recrutement",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [toast])

  const sourceFilteredItems = useMemo(
    () => filterRecruitmentItems(items, filterSource, "ALL"),
    [items, filterSource]
  )

  const filteredItems = useMemo(
    () => filterRecruitmentItems(items, filterSource, filterStatus),
    [items, filterSource, filterStatus]
  )

  const itemsByStatus = useMemo(() => groupByStatus(filteredItems), [filteredItems])

  const allByStatus = useMemo(() => groupByStatus(items), [items])

  const sourceByStatus = useMemo(
    () => groupByStatus(sourceFilteredItems),
    [sourceFilteredItems]
  )

  const activeCount = useMemo(() => countActive(items), [items])

  const applicationCount = useMemo(
    () => items.filter((i) => i.source === "application").length,
    [items]
  )

  const submissionCount = useMemo(
    () => items.filter((i) => i.source === "submission").length,
    [items]
  )

  const visiblePipelineStatuses = useMemo(
    () => getVisiblePipelineStatuses(filterStatus),
    [filterStatus]
  )

  const handleViewDetails = (item: ClubRecruitmentItem) => {
    setSelectedItem(item)
    if (item.source === "application") {
      setAppDialogOpen(true)
    } else {
      setSubDialogOpen(true)
    }
  }

  const handleStatusUpdate = async (item: ClubRecruitmentItem, newStatus: string) => {
    setUpdatingStatus(true)
    try {
      const response = await fetch(getStatusPatchUrl(item), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Erreur")

      const updatedAt = new Date().toISOString()

      const patchItem = (i: ClubRecruitmentItem): ClubRecruitmentItem => {
        if (i.id !== item.id || i.source !== item.source) return i
        return {
          ...i,
          status: newStatus,
          updatedAt,
          application: i.application
            ? { ...i.application, status: newStatus, updatedAt }
            : undefined,
          submission: i.submission
            ? { ...i.submission, status: newStatus }
            : undefined,
        }
      }

      setItems((prev) => prev.map(patchItem))

      if (selectedItem?.id === item.id && selectedItem.source === item.source) {
        setSelectedItem((prev) => (prev ? patchItem(prev) : prev))
      }

      const label = STATUS_CONFIG[newStatus]?.label || newStatus
      toast({
        title: "Statut mis à jour",
        description: `Dossier passé en « ${label} »`,
      })
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleApplicationStatusUpdate = async (applicationId: string, newStatus: string) => {
    const item = items.find(
      (i) => i.source === "application" && i.id === applicationId
    )
    if (!item) return
    await handleStatusUpdate(item, newStatus)
  }

  const handleSubmissionStatusUpdate = async (submissionId: string, newStatus: string) => {
    const item = items.find(
      (i) => i.source === "submission" && i.id === submissionId
    )
    if (!item) return
    await handleStatusUpdate(item, newStatus)
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pitch-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pitch-500 to-pitch-600 text-white shadow-sm">
          <ClipboardList className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stadium-900 sm:text-3xl">
            Recrutement
          </h1>
          <p className="mt-1 text-sm text-stadium-500">
            Candidatures joueurs et propositions agents — {items.length} dossier
            {items.length !== 1 ? "s" : ""}
            {applicationCount > 0 && submissionCount > 0 && (
              <span className="text-stadium-400">
                {" "}
                ({applicationCount} joueur{applicationCount !== 1 ? "s" : ""},{" "}
                {submissionCount} agent{submissionCount !== 1 ? "s" : ""})
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPIStatCard
          label="Nouvelles"
          value={allByStatus.SUBMITTED?.length || 0}
          icon={Inbox}
          iconClassName="bg-blue-50 text-blue-600"
        />
        <KPIStatCard
          label="En cours"
          value={activeCount}
          icon={Eye}
          iconClassName="bg-sky-50 text-sky-600"
        />
        <KPIStatCard
          label="Shortlistés"
          value={allByStatus.SHORTLISTED?.length || 0}
          icon={ListChecks}
          iconClassName="bg-violet-50 text-violet-600"
        />
        <KPIStatCard
          label="Signés"
          value={allByStatus.SIGNED?.length || 0}
          icon={FileSignature}
          iconClassName="bg-emerald-50 text-emerald-600"
        />
      </div>

      {items.length > 0 && (
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <FilterChip
              active={filterSource === "ALL"}
              onClick={() => setFilterSource("ALL")}
            >
              Toutes sources ({items.length})
            </FilterChip>
            {applicationCount > 0 && (
              <FilterChip
                active={filterSource === "application"}
                onClick={() => setFilterSource("application")}
              >
                <User className="mr-1 inline h-3 w-3" />
                Candidatures joueur ({applicationCount})
              </FilterChip>
            )}
            {submissionCount > 0 && (
              <FilterChip
                active={filterSource === "submission"}
                onClick={() => setFilterSource("submission")}
              >
                <ArrowLeftRight className="mr-1 inline h-3 w-3" />
                Propositions agent ({submissionCount})
              </FilterChip>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <FilterChip
              active={filterStatus === "ALL"}
              onClick={() => setFilterStatus("ALL")}
            >
              Tous statuts ({sourceFilteredItems.length})
            </FilterChip>
            {PIPELINE_STATUSES.map((status) => {
              const count = sourceByStatus[status]?.length
              if (!count) return null
              const config = STATUS_CONFIG[status]
              return (
                <FilterChip
                  key={status}
                  active={filterStatus === status}
                  onClick={() => setFilterStatus(status)}
                >
                  {config.label} ({count})
                </FilterChip>
              )
            })}
            {(sourceByStatus.REJECTED?.length || 0) > 0 && (
              <FilterChip
                active={filterStatus === "REJECTED"}
                onClick={() => setFilterStatus("REJECTED")}
              >
                Refusées ({sourceByStatus.REJECTED!.length})
              </FilterChip>
            )}
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-stadium-200 bg-white shadow-sm">
          <EmptyState
            icon={ClipboardList}
            title="Aucun dossier de recrutement"
            description="Recevez des candidatures de joueurs sur vos annonces ou des propositions d'agents."
          />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-stadium-200 bg-white shadow-sm">
          <EmptyState
            icon={Inbox}
            title="Aucun dossier dans ce filtre"
            description="Essayez un autre filtre ou affichez tous les dossiers."
            actionLabel="Réinitialiser les filtres"
            onAction={() => {
              setFilterSource("ALL")
              setFilterStatus("ALL")
            }}
            compact
          />
        </div>
      ) : (
        <div className="space-y-8">
          {visiblePipelineStatuses.map((status) => {
            const sectionItems = itemsByStatus[status]
            if (!sectionItems?.length) return null

            const statusInfo = STATUS_CONFIG[status]

            return (
              <section key={status}>
                <div
                  className={cn(
                    "mb-4 flex items-center gap-3 border-l-4 pl-3",
                    statusInfo.accent
                  )}
                >
                  <h2 className="text-lg font-semibold text-stadium-900">
                    {statusInfo.label}
                  </h2>
                  <Badge
                    variant="outline"
                    className="border-stadium-200 text-stadium-600"
                  >
                    {sectionItems.length}
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {sectionItems.map((item) => (
                    <RecruitmentCard
                      key={`${item.source}-${item.id}`}
                      item={item}
                      statusInfo={statusInfo}
                      onViewDetails={() => handleViewDetails(item)}
                    />
                  ))}
                </div>
              </section>
            )
          })}

          {(filterStatus === "ALL" || filterStatus === "REJECTED") &&
            itemsByStatus.REJECTED &&
            itemsByStatus.REJECTED.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-3 border-l-4 border-red-400 pl-3">
                  <h2 className="text-lg font-semibold text-stadium-900">
                    Refusées
                  </h2>
                  <Badge
                    variant="outline"
                    className="border-stadium-200 text-stadium-600"
                  >
                    {itemsByStatus.REJECTED.length}
                  </Badge>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {itemsByStatus.REJECTED.map((item) => (
                    <RecruitmentCard
                      key={`${item.source}-${item.id}`}
                      item={item}
                      statusInfo={STATUS_CONFIG.REJECTED}
                      onViewDetails={() => handleViewDetails(item)}
                      muted
                    />
                  ))}
                </div>
              </section>
            )}
        </div>
      )}

      <ApplicationDetailsDialog
        application={toDialogApplication(selectedItem)}
        open={appDialogOpen}
        onOpenChange={(open) => {
          setAppDialogOpen(open)
          if (!open) setSelectedItem(null)
        }}
        onStatusUpdate={handleApplicationStatusUpdate}
        updatingStatus={updatingStatus}
      />

      <SubmissionDetailsDialog
        submission={selectedItem?.submission ?? null}
        open={subDialogOpen}
        onOpenChange={(open) => {
          setSubDialogOpen(open)
          if (!open) setSelectedItem(null)
        }}
        onStatusUpdate={handleSubmissionStatusUpdate}
        updatingStatus={updatingStatus}
      />
    </div>
  )
}
