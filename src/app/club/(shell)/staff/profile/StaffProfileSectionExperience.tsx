"use client"

import { useEffect, useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  Plus,
  Briefcase,
  AlertCircle,
  RefreshCw,
  Trash2,
  Pencil,
  Building2,
  Calendar,
  MapPin,
} from "lucide-react"

const experienceFormSchema = z.object({
  club: z.string().min(1, "Nom du club requis").max(200),
  role: z.string().min(1, "Rôle requis").max(200),
  startDate: z.string().min(1, "Date de début requise"),
  endDate: z.string().optional(),
  description: z.string().max(1000).optional(),
})

type ExperienceFormData = z.infer<typeof experienceFormSchema>

export interface ExperienceEntry {
  club: string
  role: string
  startDate: string
  endDate?: string | null
  description?: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })
}

function sortByDate(entries: ExperienceEntry[]): ExperienceEntry[] {
  return [...entries].sort((a, b) => {
    const da = new Date(a.startDate).getTime()
    const db = new Date(b.startDate).getTime()
    return db - da
  })
}

export function StaffProfileSectionExperience() {
  const { toast } = useToast()
  const [entries, setEntries] = useState<ExperienceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      club: "",
      role: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  })

  const loadData = useCallback(async () => {
    setError(false)
    setLoading(true)
    try {
      const res = await fetch("/api/club/staff/profile")
      if (!res.ok) throw new Error()
      const data = await res.json()
      const experience: ExperienceEntry[] = Array.isArray(data.experience) ? data.experience : []
      setEntries(sortByDate(experience))
    } catch {
      setError(true)
      toast({
        title: "Erreur",
        description: "Impossible de charger les expériences",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const saveEntries = useCallback(async (updated: ExperienceEntry[]) => {
    const res = await fetch("/api/club/staff/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ experience: updated }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || "Erreur lors de la sauvegarde")
    }
  }, [])

  const openAdd = useCallback(() => {
    setEditIndex(null)
    form.reset({ club: "", role: "", startDate: "", endDate: "", description: "" })
    setDialogOpen(true)
  }, [form])

  const openEdit = useCallback(
    (index: number) => {
      const entry = entries[index]
      setEditIndex(index)
      form.reset({
        club: entry.club,
        role: entry.role,
        startDate: entry.startDate,
        endDate: entry.endDate || "",
        description: entry.description || "",
      })
      setDialogOpen(true)
    },
    [entries, form]
  )

  const onSubmit = useCallback(
    async (data: ExperienceFormData) => {
      setSaving(true)
      try {
        const entry: ExperienceEntry = {
          club: data.club,
          role: data.role,
          startDate: data.startDate,
          endDate: data.endDate || null,
          description: data.description || undefined,
        }
        let updated: ExperienceEntry[]
        if (editIndex !== null) {
          updated = [...entries]
          updated[editIndex] = entry
        } else {
          updated = [...entries, entry]
        }
        updated = sortByDate(updated)
        await saveEntries(updated)
        setEntries(updated)
        setDialogOpen(false)
        form.reset()
        toast({
          title: editIndex !== null ? "Modifié" : "Ajouté",
          description:
            editIndex !== null ? "Expérience modifiée avec succès" : "Expérience ajoutée avec succès",
        })
      } catch (err: unknown) {
        toast({
          title: "Erreur",
          description: err instanceof Error ? err.message : "Impossible de sauvegarder",
          variant: "destructive",
        })
      } finally {
        setSaving(false)
      }
    },
    [entries, editIndex, saveEntries, form, toast]
  )

  const handleDelete = useCallback(async () => {
    if (deleteIndex === null) return
    setDeleting(true)
    try {
      const updated = entries.filter((_, i) => i !== deleteIndex)
      await saveEntries(updated)
      setEntries(updated)
      setDeleteIndex(null)
      toast({ title: "Supprimé", description: "Expérience supprimée" })
    } catch (err: unknown) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de supprimer",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }, [deleteIndex, entries, saveEntries, toast])

  if (error && !loading && entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-stadium-200 bg-stadium-50/50 py-12">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <h2 className="mb-1 text-base font-semibold text-stadium-900">Erreur de chargement</h2>
        <p className="mb-6 text-sm text-stadium-500">
          Impossible de charger vos expériences. Veuillez réessayer.
        </p>
        <Button onClick={loadData} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!loading && entries.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={openAdd} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </div>
      )}

      {loading ? (
        <div className="relative space-y-0 pl-6">
          <div className="absolute bottom-2 left-[11px] top-2 w-px bg-stadium-200" />
          {[1, 2].map((i) => (
            <div key={i} className="relative pb-6 animate-pulse">
              <div className="absolute -left-6 top-1 h-[22px] w-[22px] rounded-full border-2 border-white bg-stadium-100 ring-1 ring-stadium-200" />
              <div className="rounded-xl border border-stadium-200 bg-stadium-50/50 p-4">
                <div className="h-4 w-1/3 rounded bg-stadium-100" />
                <div className="mt-2 h-3 w-1/4 rounded bg-stadium-100" />
              </div>
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-stadium-200 bg-stadium-50/50 py-12">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pitch-50">
            <Briefcase className="h-7 w-7 text-pitch-600" />
          </div>
          <h3 className="text-base font-semibold text-stadium-800">Aucune expérience ajoutée</h3>
          <p className="mt-1 max-w-sm text-center text-sm text-stadium-400">
            Ajoutez vos expériences professionnelles pour enrichir votre profil.
          </p>
          <Button onClick={openAdd} className="mt-5 gap-2">
            <Plus className="h-4 w-4" />
            Ajouter une expérience
          </Button>
        </div>
      ) : (
        <div className="relative pl-6">
          <div className="absolute bottom-2 left-[11px] top-2 w-px bg-stadium-200" />
          <div className="space-y-0">
            {entries.map((entry, index) => (
              <div key={index} className="group relative pb-6 last:pb-0">
                <div className="absolute -left-6 top-1 z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-white bg-pitch-100 ring-1 ring-pitch-200">
                  <Building2 className="h-3 w-3 text-pitch-600" />
                </div>
                <div className="rounded-xl border border-stadium-200 bg-stadium-50/30 p-4 transition-all hover:border-stadium-300 hover:bg-white hover:shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-stadium-900">{entry.role}</h3>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-stadium-600">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-stadium-400" />
                        {entry.club}
                      </p>
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-stadium-400">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(entry.startDate)} —{" "}
                        {entry.endDate ? formatDate(entry.endDate) : "Présent"}
                      </p>
                      {entry.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-stadium-500">{entry.description}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => openEdit(index)}
                        className="rounded-lg p-1.5 text-stadium-400 hover:bg-stadium-100 hover:text-stadium-700"
                        title="Modifier"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteIndex(index)}
                        className="rounded-lg p-1.5 text-stadium-400 hover:bg-red-50 hover:text-red-500"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editIndex !== null ? "Modifier l'expérience" : "Ajouter une expérience"}
            </DialogTitle>
            <DialogDescription>Renseignez les informations de votre poste.</DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="club">Club / Organisation *</Label>
              <Input id="club" placeholder="Ex: Olympique de Marseille" {...form.register("club")} />
              {form.formState.errors.club && (
                <p className="text-sm text-red-500">{form.formState.errors.club.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle / Fonction *</Label>
              <Input id="role" placeholder="Ex: Entraîneur adjoint, Directeur sportif..." {...form.register("role")} />
              {form.formState.errors.role && (
                <p className="text-sm text-red-500">{form.formState.errors.role.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="startDate">Début *</Label>
                <Input id="startDate" type="date" {...form.register("startDate")} />
                {form.formState.errors.startDate && (
                  <p className="text-sm text-red-500">{form.formState.errors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Fin</Label>
                <Input id="endDate" type="date" {...form.register("endDate")} />
                <p className="text-xs text-gray-400">Laisser vide si poste actuel</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={3}
                placeholder="Décrivez vos responsabilités et réalisations..."
                {...form.register("description")}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
              <p className="text-xs text-gray-400">
                {(form.watch("description") || "").length}/1000 caractères
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={saving} className="gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editIndex !== null ? "Enregistrer" : "Ajouter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteIndex !== null} onOpenChange={() => setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette expérience ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'entrée sera définitivement supprimée de votre parcours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
