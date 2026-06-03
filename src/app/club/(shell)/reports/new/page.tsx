"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2, User, Trophy } from "lucide-react"
import { CLUB_REPORTS_BASE } from "@/lib/reports/club-report-display"
import { getReportTemplates, getReportTemplateById } from "@/lib/reports/templates"
import type { Match } from "@/lib/services/thesportsdb"

type RosterPlayer = {
  id: string
  firstName: string
  lastName: string
  primaryPosition: string
}

function NewClubReportContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const kindParam = searchParams.get("kind") === "match" ? "match" : "player"
  const templateParam = searchParams.get("template")
  const submissionId = searchParams.get("submissionId")
  const prefillFirst = searchParams.get("firstName")
  const prefillLast = searchParams.get("lastName")
  const prefillPosition = searchParams.get("position")
  const prefillNationality = searchParams.get("nationality")
  const prefillPlayerId = searchParams.get("playerId")

  const [kind, setKind] = useState<"player" | "match">(kindParam)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [authorType, setAuthorType] = useState<"SCOUT" | "COACH">("SCOUT")
  const [templateId, setTemplateId] = useState("")

  const availableTemplates = getReportTemplates(
    "CLUB",
    kind === "match" ? "MATCH" : "PLAYER"
  )

  const [subjectId, setSubjectId] = useState(prefillPlayerId || "")
  const [rosterPlayers, setRosterPlayers] = useState<RosterPlayer[]>([])
  const [useExternal, setUseExternal] = useState(!!submissionId && !prefillPlayerId)
  const [extFirst, setExtFirst] = useState(prefillFirst || "")
  const [extLast, setExtLast] = useState(prefillLast || "")
  const [extPosition, setExtPosition] = useState(prefillPosition || "")
  const [extNationality, setExtNationality] = useState(prefillNationality || "")

  const [matchSource, setMatchSource] = useState<"calendar" | "manual">("calendar")
  const [calendarMatches, setCalendarMatches] = useState<Match[]>([])
  const [selectedMatchKey, setSelectedMatchKey] = useState("")
  const [manualOpponent, setManualOpponent] = useState("")
  const [manualDate, setManualDate] = useState("")
  const [manualCompetition, setManualCompetition] = useState("")
  const [manualVenue, setManualVenue] = useState("")

  useEffect(() => {
    if (!templateParam) return
    const template = getReportTemplateById(templateParam)
    if (template && template.audience.includes("CLUB")) {
      setTemplateId(template.id)
      if (template.suggestedTitle) {
        setTitle(template.suggestedTitle)
      }
    }
  }, [templateParam])

  useEffect(() => {
    if (prefillFirst && prefillLast && !title) {
      setTitle(
        kind === "match"
          ? `Rapport match`
          : `${prefillFirst} ${prefillLast} — Rapport scout`
      )
    }
  }, [prefillFirst, prefillLast, kind, title])

  useEffect(() => {
    async function loadRoster() {
      try {
        const meRes = await fetch("/api/users/me")
        if (!meRes.ok) return
        const me = await meRes.json()
        if (!me.clubProfile?.id) return
        const teamsRes = await fetch(`/api/clubs/${me.clubProfile.id}/teams`)
        if (!teamsRes.ok) return
        const { teams } = await teamsRes.json()
        const players: RosterPlayer[] = []
        for (const team of teams || []) {
          for (const tp of team.teamPlayers || []) {
            if (tp.playerProfile && !players.some((p) => p.id === tp.playerProfile.id)) {
              players.push({
                id: tp.playerProfile.id,
                firstName: tp.playerProfile.firstName,
                lastName: tp.playerProfile.lastName,
                primaryPosition: tp.playerProfile.primaryPosition,
              })
            }
          }
        }
        setRosterPlayers(players)
      } catch {
        /* ignore */
      }
    }
    if (kind === "player") loadRoster()
  }, [kind])

  useEffect(() => {
    if (kind !== "match") return
    async function loadMatches() {
      try {
        const res = await fetch("/api/club/reports/matches")
        if (!res.ok) return
        const data = await res.json()
        const all = [
          ...(data.upcomingMatches || []),
          ...(data.lastResults || []),
        ] as Match[]
        setCalendarMatches(all)
      } catch {
        /* ignore */
      }
    }
    loadMatches()
  }, [kind])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast({ title: "Titre requis", variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      let body: Record<string, unknown>

      if (kind === "player") {
        if (!useExternal && !subjectId) {
          toast({ title: "Sélectionnez un joueur", variant: "destructive" })
          setSaving(false)
          return
        }
        if (useExternal && (!extFirst.trim() || !extLast.trim())) {
          toast({ title: "Nom du joueur requis", variant: "destructive" })
          setSaving(false)
          return
        }
        body = {
          reportKind: "PLAYER",
          title: title.trim(),
          authorType,
          ...(useExternal
            ? {
                externalPlayer: {
                  firstName: extFirst.trim(),
                  lastName: extLast.trim(),
                  primaryPosition: extPosition || undefined,
                  nationality: extNationality || undefined,
                  submissionId: submissionId || undefined,
                  id: prefillPlayerId || undefined,
                },
              }
            : { subjectId }),
        }
      } else {
        if (matchSource === "calendar" && selectedMatchKey) {
          const m = calendarMatches.find((x) => String(x.id) === selectedMatchKey)
          if (m) {
            body = {
              reportKind: "MATCH",
              title: title.trim(),
              authorType,
              matchManual: {
                opponent: `${m.awayTeam.shortName} (ext.)`,
                date: m.date,
                competition: m.competition,
                homeTeam: m.homeTeam.name,
                awayTeam: m.awayTeam.name,
                sportsDbEventId: String(m.id),
              },
            }
          } else {
            throw new Error("Match introuvable")
          }
        } else if (
          matchSource === "manual" &&
          manualOpponent &&
          manualDate &&
          manualCompetition
        ) {
          body = {
            reportKind: "MATCH",
            title: title.trim(),
            authorType,
            matchManual: {
              opponent: manualOpponent,
              date: manualDate,
              competition: manualCompetition,
              venue: manualVenue || undefined,
            },
          }
        } else {
          toast({ title: "Renseignez le match", variant: "destructive" })
          setSaving(false)
          return
        }
      }

      const chosenTemplate = availableTemplates.find((t) => t.id === templateId)
      if (chosenTemplate) {
        body.sections = chosenTemplate.sections.map((s, i) => ({
          title: s.title,
          content: s.content,
          order: i,
        }))
      }

      const res = await fetch("/api/club/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Erreur")
      }
      const report = await res.json()
      toast({ title: "Rapport créé" })
      router.push(`${CLUB_REPORTS_BASE}/${report.id}/edit`)
    } catch (err: unknown) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Création impossible",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 sm:py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href={CLUB_REPORTS_BASE}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Link>
      </Button>

      <h1 className="mb-6 text-2xl font-bold text-stadium-900">Nouveau rapport</h1>

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => {
            setKind("player")
            setTemplateId("")
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
            kind === "player"
              ? "border-pitch-500 bg-pitch-50 text-pitch-800"
              : "border-stadium-200 bg-white"
          }`}
        >
          <User className="h-4 w-4" />
          Joueur
        </button>
        <button
          type="button"
          onClick={() => {
            setKind("match")
            setTemplateId("")
          }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
            kind === "match"
              ? "border-pitch-500 bg-pitch-50 text-pitch-800"
              : "border-stadium-200 bg-white"
          }`}
        >
          <Trophy className="h-4 w-4" />
          Match
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border border-stadium-200 bg-white p-6">
        <div className="space-y-2">
          <Label>Titre</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label>Rôle rédacteur</Label>
          <Select
            value={authorType}
            onValueChange={(v) => setAuthorType(v as "SCOUT" | "COACH")}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SCOUT">Recruteur</SelectItem>
              <SelectItem value="COACH">Entraîneur</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {availableTemplates.length > 0 && (
          <div className="space-y-2">
            <Label>Modèle (optionnel)</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Partir d'un rapport vierge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Rapport vierge</SelectItem>
                {availableTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({t.sections.length} sections)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableTemplates.find((t) => t.id === templateId) && (
              <p className="text-xs text-stadium-500">
                {availableTemplates.find((t) => t.id === templateId)?.description}
              </p>
            )}
          </div>
        )}

        {kind === "player" ? (
          <>
            {submissionId && (
              <div className="rounded-lg bg-violet-50 px-3 py-2 text-sm text-violet-800">
                Prérempli depuis une proposition Mercato
              </div>
            )}
            {!submissionId && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={!useExternal ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseExternal(false)}
                >
                  Effectif club
                </Button>
                <Button
                  type="button"
                  variant={useExternal ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseExternal(true)}
                >
                  Joueur externe
                </Button>
              </div>
            )}
            {useExternal ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input value={extFirst} onChange={(e) => setExtFirst(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input value={extLast} onChange={(e) => setExtLast(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Poste</Label>
                  <Input value={extPosition} onChange={(e) => setExtPosition(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Nationalité</Label>
                  <Input value={extNationality} onChange={(e) => setExtNationality(e.target.value)} />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Joueur</Label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un joueur" />
                  </SelectTrigger>
                  <SelectContent>
                    {rosterPlayers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} ({p.primaryPosition})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={matchSource === "calendar" ? "default" : "outline"}
                size="sm"
                onClick={() => setMatchSource("calendar")}
              >
                Calendrier
              </Button>
              <Button
                type="button"
                variant={matchSource === "manual" ? "default" : "outline"}
                size="sm"
                onClick={() => setMatchSource("manual")}
              >
                Saisie manuelle
              </Button>
            </div>
            {matchSource === "calendar" ? (
              <div className="space-y-2">
                <Label>Match</Label>
                <Select value={selectedMatchKey} onValueChange={setSelectedMatchKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un match" />
                  </SelectTrigger>
                  <SelectContent>
                    {calendarMatches.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.competition} — {m.homeTeam.shortName} vs {m.awayTeam.shortName} (
                        {new Date(m.date).toLocaleDateString("fr-FR")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Adversaire / contexte</Label>
                  <Input value={manualOpponent} onChange={(e) => setManualOpponent(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Compétition</Label>
                  <Input value={manualCompetition} onChange={(e) => setManualCompetition(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Lieu (optionnel)</Label>
                  <Input value={manualVenue} onChange={(e) => setManualVenue(e.target.value)} />
                </div>
              </div>
            )}
          </>
        )}

        <Button type="submit" disabled={saving} className="w-full bg-pitch-600 hover:bg-pitch-700">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Créer et éditer le contenu
        </Button>
      </form>
    </div>
  )
}

export default function NewClubReportPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-pitch-500" />
        </div>
      }
    >
      <NewClubReportContent />
    </Suspense>
  )
}
