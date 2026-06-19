"use client"

import { useCallback, useEffect, useState } from "react"
import {
  ListingFormDialog,
  type ListingFormData,
} from "@/components/club/listings/ListingFormDialog"
import { useToast } from "@/components/ui/use-toast"

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
  teamOptional?: boolean
}

export function AdminCreateListingDialog({
  open,
  onOpenChange,
  onCreated,
  clubProfileId: fixedClubProfileId,
  teamOptional = true,
}: AdminCreateListingDialogProps) {
  const { toast } = useToast()
  const [clubs, setClubs] = useState<ClubOption[]>([])
  const [selectedClubId, setSelectedClubId] = useState("")
  const [teams, setTeams] = useState<ClubTeam[]>([])
  const [loadingClubs, setLoadingClubs] = useState(false)
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [saving, setSaving] = useState(false)

  const activeClubId = fixedClubProfileId || selectedClubId

  const resetState = useCallback(() => {
    if (!fixedClubProfileId) {
      setSelectedClubId("")
    }
    setTeams([])
  }, [fixedClubProfileId])

  useEffect(() => {
    if (!open) {
      resetState()
      return
    }

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
  }, [open, fixedClubProfileId, resetState, toast])

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
        toast({
          title: "Erreur",
          description:
            error instanceof Error ? error.message : "Impossible de charger les équipes",
          variant: "destructive",
        })
      } finally {
        setLoadingTeams(false)
      }
    }

    fetchTeams()
  }, [activeClubId, toast])

  const handleSubmit = async (data: ListingFormData) => {
    if (!activeClubId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un club",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const payload = {
        clubProfileId: activeClubId,
        ...data,
        minAge: data.minAge ? parseInt(data.minAge) : null,
        maxAge: data.maxAge ? parseInt(data.maxAge) : null,
        salaryMin: data.salaryMin ? parseInt(data.salaryMin) : null,
        salaryMax: data.salaryMax ? parseInt(data.salaryMax) : null,
        nationality: data.nationality || [],
        teamId: data.teamId || null,
      }

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
        description: "Annonce créée avec succès",
      })
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
      clubs={fixedClubProfileId ? undefined : clubs}
      clubProfileId={activeClubId}
      onClubChange={fixedClubProfileId ? undefined : setSelectedClubId}
      loadingClubs={loadingClubs}
      loadingTeams={loadingTeams}
      teamOptional={teamOptional}
      editingListing={null}
      saving={saving}
      onSubmit={handleSubmit}
    />
  )
}
