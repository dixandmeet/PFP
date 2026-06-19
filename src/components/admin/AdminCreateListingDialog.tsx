"use client"

import { useCallback, useEffect, useState } from "react"
import {
  ListingFormDialog,
  type ListingFormData,
} from "@/components/club/listings/ListingFormDialog"
import { useToast } from "@/components/ui/use-toast"
import type { ClubListing } from "@/lib/club/listings"

interface ClubOption {
  id: string
  clubName: string
  country: string
}

interface ClubTeam {
  id: string
  name: string
  level: string
}

interface AdminCreateListingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
  clubProfileId?: string
  listingId?: string | null
  teamOptional?: boolean
}

function buildPayload(data: ListingFormData, activeClubId: string) {
  return {
    clubProfileId: activeClubId,
    title: data.title,
    description: data.description,
    position: data.position,
    minAge: data.minAge ? parseInt(data.minAge) : null,
    maxAge: data.maxAge ? parseInt(data.maxAge) : null,
    salaryMin: data.salaryMin ? parseInt(data.salaryMin) : null,
    salaryMax: data.salaryMax ? parseInt(data.salaryMax) : null,
    nationality: data.nationality || [],
    currency: data.currency || "EUR",
    contractType: data.contractType || undefined,
    startDate: data.startDate || undefined,
    teamId: data.teamId || null,
    status: data.status || "DRAFT",
  }
}

export function AdminCreateListingDialog({
  open,
  onOpenChange,
  onCreated,
  clubProfileId: fixedClubProfileId,
  listingId = null,
  teamOptional = true,
}: AdminCreateListingDialogProps) {
  const { toast } = useToast()
  const [clubs, setClubs] = useState<ClubOption[]>([])
  const [selectedClubId, setSelectedClubId] = useState("")
  const [teams, setTeams] = useState<ClubTeam[]>([])
  const [editingListing, setEditingListing] = useState<ClubListing | null>(null)
  const [loadingClubs, setLoadingClubs] = useState(false)
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [loadingListing, setLoadingListing] = useState(false)
  const [saving, setSaving] = useState(false)

  const isEditing = Boolean(listingId)
  const activeClubId = fixedClubProfileId || selectedClubId

  const resetState = useCallback(() => {
    if (!fixedClubProfileId) {
      setSelectedClubId("")
    }
    setTeams([])
    setEditingListing(null)
  }, [fixedClubProfileId])

  useEffect(() => {
    if (!open) {
      resetState()
      return
    }

    if (listingId) {
      async function fetchListing() {
        setLoadingListing(true)
        try {
          const res = await fetch(`/api/listings/${listingId}`)
          if (!res.ok) throw new Error("Impossible de charger l'annonce")
          const data = await res.json()
          setEditingListing(data)
          if (!fixedClubProfileId && data.clubProfile?.id) {
            setSelectedClubId(data.clubProfile.id)
          }
        } catch (error) {
          toast({
            title: "Erreur",
            description:
              error instanceof Error ? error.message : "Impossible de charger l'annonce",
            variant: "destructive",
          })
          onOpenChange(false)
        } finally {
          setLoadingListing(false)
        }
      }
      fetchListing()
      return
    }

    setEditingListing(null)

    if (fixedClubProfileId) {
      setSelectedClubId(fixedClubProfileId)
      return
    }

    async function fetchClubs() {
      setLoadingClubs(true)
      try {
        const res = await fetch("/api/admin/clubs?limit=200")
        if (!res.ok) throw new Error("Impossible de charger les clubs")

        const data = await res.json()
        setClubs(
          (data.clubs || []).map((club: ClubOption) => ({
            id: club.id,
            clubName: club.clubName,
            country: club.country,
          }))
        )
      } catch (error) {
        toast({
          title: "Erreur",
          description:
            error instanceof Error ? error.message : "Impossible de charger les clubs",
          variant: "destructive",
        })
      } finally {
        setLoadingClubs(false)
      }
    }

    fetchClubs()
  }, [open, fixedClubProfileId, listingId, resetState, toast, onOpenChange])

  useEffect(() => {
    if (!activeClubId) {
      setTeams([])
      return
    }

    async function fetchTeams() {
      setLoadingTeams(true)
      try {
        const res = await fetch(`/api/clubs/${activeClubId}/teams`)
        if (!res.ok) throw new Error("Impossible de charger les équipes")

        const data = await res.json()
        setTeams(data.teams || [])
      } catch (error) {
        setTeams([])
        if (!isEditing) {
          toast({
            title: "Erreur",
            description:
              error instanceof Error ? error.message : "Impossible de charger les équipes",
            variant: "destructive",
          })
        }
      } finally {
        setLoadingTeams(false)
      }
    }

    fetchTeams()
  }, [activeClubId, isEditing, toast])

  const handleSubmit = async (data: ListingFormData) => {
    if (!activeClubId && !listingId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un club",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      if (listingId && editingListing) {
        const payload = buildPayload(data, activeClubId)
        const { status, clubProfileId: _clubId, ...updateFields } = payload

        const response = await fetch(`/api/listings/${listingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateFields),
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || "Erreur lors de la mise à jour")
        }

        if (status !== editingListing.status) {
          const statusRes = await fetch(`/api/listings/${listingId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          })
          if (!statusRes.ok) {
            const err = await statusRes.json()
            throw new Error(err.error || "Erreur lors du changement de statut")
          }
        }

        toast({
          title: "Succès",
          description: "Annonce mise à jour avec succès",
        })
      } else {
        const payload = buildPayload(data, activeClubId)
        const response = await fetch("/api/admin/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          const err = await response.json()
          const message =
            err.details?.length > 0
              ? `${err.error}: ${err.details.map((d: { path: string[]; message: string }) => `${d.path.join(".")} ${d.message}`).join("; ")}`
              : err.error || "Erreur lors de la création"
          throw new Error(message)
        }

        toast({
          title: "Succès",
          description:
            data.status === "PUBLISHED"
              ? "Annonce publiée avec succès"
              : "Annonce créée avec succès",
        })
      }

      onOpenChange(false)
      onCreated?.()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDialogChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      resetState()
    }
  }

  return (
    <ListingFormDialog
      open={open}
      onOpenChange={handleDialogChange}
      teams={teams}
      clubs={fixedClubProfileId || isEditing ? undefined : clubs}
      clubProfileId={activeClubId}
      onClubChange={fixedClubProfileId || isEditing ? undefined : setSelectedClubId}
      loadingClubs={loadingClubs || loadingListing}
      loadingTeams={loadingTeams}
      teamOptional={teamOptional}
      showStatus
      editingListing={isEditing ? editingListing : null}
      saving={saving || loadingListing}
      onSubmit={handleSubmit}
    />
  )
}
