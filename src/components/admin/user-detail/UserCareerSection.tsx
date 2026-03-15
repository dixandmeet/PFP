"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Calendar,
  MapPin,
  Trophy,
  Clock,
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import type { CareerEntry } from "./types"

interface UserCareerSectionProps {
  careerEntries: CareerEntry[]
  isEditing: boolean
  onSave: (entries: CareerEntryForm[]) => void
}

export interface CareerEntryForm {
  id?: string
  _delete?: boolean
  clubName: string
  league: string
  country: string
  season: string
  startDate: string
  endDate: string
  position: string
  appearances: string
  minutesPlayed: string
  goals: string
  assists: string
}

function emptyEntry(): CareerEntryForm {
  return {
    clubName: "",
    league: "",
    country: "",
    season: "",
    startDate: "",
    endDate: "",
    position: "",
    appearances: "",
    minutesPlayed: "",
    goals: "",
    assists: "",
  }
}

function entryToForm(entry: CareerEntry): CareerEntryForm {
  return {
    id: entry.id,
    clubName: entry.clubName,
    league: entry.league || "",
    country: entry.country || "",
    season: entry.season,
    startDate: entry.startDate ? new Date(entry.startDate).toISOString().split("T")[0] : "",
    endDate: entry.endDate ? new Date(entry.endDate).toISOString().split("T")[0] : "",
    position: entry.position || "",
    appearances: entry.appearances?.toString() || "",
    minutesPlayed: entry.minutesPlayed?.toString() || "",
    goals: entry.goals?.toString() || "",
    assists: entry.assists?.toString() || "",
  }
}

export function UserCareerSection({
  careerEntries,
  isEditing,
  onSave,
}: UserCareerSectionProps) {
  const [editingEntries, setEditingEntries] = useState<CareerEntryForm[]>(
    careerEntries.map(entryToForm)
  )
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEntry, setNewEntry] = useState<CareerEntryForm>(emptyEntry())
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const handleAddEntry = () => {
    if (!newEntry.clubName || !newEntry.season || !newEntry.startDate) return
    const updated = [...editingEntries, newEntry]
    setEditingEntries(updated)
    onSave(updated)
    setNewEntry(emptyEntry())
    setShowAddForm(false)
  }

  const handleUpdateEntry = (index: number) => {
    onSave(editingEntries)
    setEditingIndex(null)
  }

  const handleDeleteEntry = (index: number) => {
    const entry = editingEntries[index]
    let updated: CareerEntryForm[]
    if (entry.id) {
      // Mark for deletion
      updated = editingEntries.map((e, i) =>
        i === index ? { ...e, _delete: true } : e
      )
    } else {
      // Remove from list
      updated = editingEntries.filter((_, i) => i !== index)
    }
    setEditingEntries(updated)
    onSave(updated)
    setDeleteConfirm(null)
  }

  const handleFieldChange = (index: number, field: string, value: string) => {
    setEditingEntries((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    )
  }

  const visibleEntries = isEditing
    ? editingEntries.filter((e) => !e._delete)
    : careerEntries

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-slate-500" />
          <h3 className="text-lg font-semibold text-slate-900">
            Carriere ({visibleEntries.length})
          </h3>
        </div>
        {isEditing && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Ajouter
          </Button>
        )}
      </div>

      {/* Add form */}
      {isEditing && showAddForm && (
        <Card className="p-4 border-dashed border-2 border-emerald-200 bg-emerald-50/30">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-slate-700">Nouvelle entree</h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowAddForm(false)
                setNewEntry(emptyEntry())
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Club *</Label>
              <Input
                value={newEntry.clubName}
                onChange={(e) => setNewEntry({ ...newEntry, clubName: e.target.value })}
                placeholder="FC Paris"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Ligue</Label>
              <Input
                value={newEntry.league}
                onChange={(e) => setNewEntry({ ...newEntry, league: e.target.value })}
                placeholder="Ligue 1"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Pays</Label>
              <Input
                value={newEntry.country}
                onChange={(e) => setNewEntry({ ...newEntry, country: e.target.value })}
                placeholder="France"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Saison *</Label>
              <Input
                value={newEntry.season}
                onChange={(e) => setNewEntry({ ...newEntry, season: e.target.value })}
                placeholder="2024/25"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Date debut *</Label>
              <Input
                type="date"
                value={newEntry.startDate}
                onChange={(e) => setNewEntry({ ...newEntry, startDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Date fin</Label>
              <Input
                type="date"
                value={newEntry.endDate}
                onChange={(e) => setNewEntry({ ...newEntry, endDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Poste</Label>
              <Input
                value={newEntry.position}
                onChange={(e) => setNewEntry({ ...newEntry, position: e.target.value })}
                placeholder="Milieu"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Matchs</Label>
              <Input
                type="number"
                value={newEntry.appearances}
                onChange={(e) => setNewEntry({ ...newEntry, appearances: e.target.value })}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Buts</Label>
              <Input
                type="number"
                value={newEntry.goals}
                onChange={(e) => setNewEntry({ ...newEntry, goals: e.target.value })}
                placeholder="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Passes D.</Label>
              <Input
                type="number"
                value={newEntry.assists}
                onChange={(e) => setNewEntry({ ...newEntry, assists: e.target.value })}
                placeholder="0"
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setShowAddForm(false)
                setNewEntry(emptyEntry())
              }}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={handleAddEntry}
              disabled={!newEntry.clubName || !newEntry.season || !newEntry.startDate}
            >
              <Save className="h-4 w-4 mr-1.5" />
              Ajouter
            </Button>
          </div>
        </Card>
      )}

      {/* Career entries list */}
      {visibleEntries.length === 0 ? (
        <Card className="p-8 text-center">
          <Briefcase className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Aucune entree de carriere</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {(isEditing ? editingEntries : careerEntries).map((entry, index) => {
            if (isEditing && (entry as CareerEntryForm)._delete) return null
            const isEditingThis = isEditing && editingIndex === index
            const formEntry = isEditing ? (entry as CareerEntryForm) : entryToForm(entry as CareerEntry)
            const displayEntry = entry as CareerEntry

            return (
              <Card key={formEntry.id || index} className="overflow-hidden">
                {isEditingThis ? (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Club</Label>
                        <Input
                          value={formEntry.clubName}
                          onChange={(e) => handleFieldChange(index, "clubName", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Ligue</Label>
                        <Input
                          value={formEntry.league}
                          onChange={(e) => handleFieldChange(index, "league", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Pays</Label>
                        <Input
                          value={formEntry.country}
                          onChange={(e) => handleFieldChange(index, "country", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Saison</Label>
                        <Input
                          value={formEntry.season}
                          onChange={(e) => handleFieldChange(index, "season", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Date debut</Label>
                        <Input
                          type="date"
                          value={formEntry.startDate}
                          onChange={(e) => handleFieldChange(index, "startDate", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Date fin</Label>
                        <Input
                          type="date"
                          value={formEntry.endDate}
                          onChange={(e) => handleFieldChange(index, "endDate", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Matchs</Label>
                        <Input
                          type="number"
                          value={formEntry.appearances}
                          onChange={(e) => handleFieldChange(index, "appearances", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Buts</Label>
                        <Input
                          type="number"
                          value={formEntry.goals}
                          onChange={(e) => handleFieldChange(index, "goals", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Passes D.</Label>
                        <Input
                          type="number"
                          value={formEntry.assists}
                          onChange={(e) => handleFieldChange(index, "assists", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      <Button size="sm" variant="outline" onClick={() => setEditingIndex(null)}>
                        <X className="h-4 w-4 mr-1" />
                        Annuler
                      </Button>
                      <Button size="sm" onClick={() => handleUpdateEntry(index)}>
                        <Save className="h-4 w-4 mr-1" />
                        Valider
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-slate-900">
                          {isEditing ? formEntry.clubName : displayEntry.clubName}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {isEditing ? formEntry.season : displayEntry.season}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        {(isEditing ? formEntry.league : displayEntry.league) && (
                          <span className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {isEditing ? formEntry.league : displayEntry.league}
                          </span>
                        )}
                        {(isEditing ? formEntry.country : displayEntry.country) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {isEditing ? formEntry.country : displayEntry.country}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {isEditing
                            ? `${formEntry.startDate} - ${formEntry.endDate || "Present"}`
                            : `${format(new Date(displayEntry.startDate), "MMM yyyy", { locale: fr })} - ${displayEntry.endDate ? format(new Date(displayEntry.endDate), "MMM yyyy", { locale: fr }) : "Present"}`
                          }
                        </span>
                      </div>
                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-2">
                        {(isEditing ? formEntry.appearances : displayEntry.appearances) && (
                          <span className="text-xs text-slate-600">
                            <strong>{isEditing ? formEntry.appearances : displayEntry.appearances}</strong> matchs
                          </span>
                        )}
                        {(isEditing ? formEntry.goals : displayEntry.goals) != null && Number(isEditing ? formEntry.goals : displayEntry.goals) > 0 && (
                          <span className="text-xs text-slate-600">
                            <strong>{isEditing ? formEntry.goals : displayEntry.goals}</strong> buts
                          </span>
                        )}
                        {(isEditing ? formEntry.assists : displayEntry.assists) != null && Number(isEditing ? formEntry.assists : displayEntry.assists) > 0 && (
                          <span className="text-xs text-slate-600">
                            <strong>{isEditing ? formEntry.assists : displayEntry.assists}</strong> passes D.
                          </span>
                        )}
                      </div>
                    </div>
                    {isEditing && (
                      <div className="flex items-center gap-1 ml-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingIndex(index)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteConfirm(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette entree ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera definitivement cette entree de carriere.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteConfirm !== null && handleDeleteEntry(deleteConfirm)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
