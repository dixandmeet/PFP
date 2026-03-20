"use client"

import * as React from "react"
import {
  Briefcase,
  MessageCircle,
  Shield,
  UserPlus,
  UserRound,
} from "lucide-react"
import { cn } from "@/lib/utils"

const TAG_EMOJI = ["⚽", "🇫🇷", "🎯"] as const

export interface ScoutingAgentProfileCardData {
  name: string
  company: string
  /** Max 3 items (position, nationality scope, specialty) */
  tags: string[]
  bio: string
  stats: {
    players: number
    reports: number
    placements: number
    views: number
  }
  isVerified: boolean
  isActive: boolean
  isTopRecruiter: boolean
  /** Optional photo; otherwise initials from name */
  avatarUrl?: string | null
}

export const MOCK_SCOUTING_AGENT: ScoutingAgentProfileCardData = {
  name: "Sophie Martin",
  company: "SM Sports Management",
  tags: ["Forwards", "French Players", "Youth Development"],
  bio: "+30 players supported • U16–U21 specialist • Network Ligue 1 & Ligue 2",
  stats: {
    players: 12,
    reports: 34,
    placements: 5,
    views: 1200,
  },
  isVerified: true,
  isActive: true,
  isTopRecruiter: true,
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase()
}

function formatStatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`
  if (n >= 10_000) return `${Math.round(n / 1000)}k`
  if (n >= 1000) return n.toLocaleString("fr-FR")
  return String(n)
}

export interface ScoutingAgentProfileCardProps {
  agent: ScoutingAgentProfileCardData
  className?: string
  onContact?: () => void
  onMessage?: () => void
  onFollow?: () => void
  onViewProfile?: () => void
}

export function ScoutingAgentProfileCard({
  agent,
  className,
  onContact,
  onMessage,
  onFollow,
  onViewProfile,
}: ScoutingAgentProfileCardProps) {
  const tags = agent.tags.slice(0, 3)
  const initials = initialsFromName(agent.name)

  return (
    <article
      className={cn(
        "relative w-full max-w-lg overflow-hidden rounded-2xl bg-white",
        "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.06),0_20px_50px_-12px_rgba(15,81,50,0.18)]",
        "ring-1 ring-stadium-100/80",
        className
      )}
    >
      {/* Header strip — gradient */}
      <div
        className={cn(
          "relative h-28 sm:h-32",
          "bg-gradient-to-br from-pitch-600 via-pitch-700 to-pitch-900",
          "rounded-b-[1.25rem]"
        )}
        aria-hidden
      >
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.07]" />
        <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-pitch-400/25 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-40 w-40 rounded-full bg-emerald-900/30 blur-3xl" />
      </div>

      <div className="relative px-6 pb-6 pt-0 sm:px-7 sm:pb-7">
        {/* Avatar overlap */}
        <div className="relative -mt-14 mb-4 flex sm:-mt-16 sm:mb-5">
          <div className="relative">
            <div
              className={cn(
                "flex h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center overflow-hidden rounded-full",
                "bg-gradient-to-br from-pitch-100 to-pitch-200",
                "text-xl font-bold tracking-tight text-pitch-900",
                "shadow-[0_8px_30px_-6px_rgba(15,81,50,0.35)] ring-4 ring-white sm:h-24 sm:w-24 sm:text-2xl"
              )}
            >
              {agent.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={agent.avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            {agent.isVerified && (
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 flex h-8 w-8 items-center justify-center rounded-full",
                  "bg-pitch-600 text-white shadow-md ring-[3px] ring-white",
                  "transition-transform duration-200 hover:scale-105"
                )}
                title="Profil vérifié"
              >
                <Shield className="h-4 w-4" strokeWidth={2.2} aria-hidden />
                <span className="sr-only">Profil vérifié</span>
              </span>
            )}
          </div>
        </div>

        {/* Identity */}
        <div className="space-y-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-stadium-900 sm:text-[1.65rem]">
              {agent.name}
            </h2>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-pitch-200/80 bg-pitch-50/95 px-3 py-1 text-xs font-semibold text-pitch-950 shadow-sm sm:text-sm">
              <Briefcase className="h-3.5 w-3.5 shrink-0 text-pitch-700" aria-hidden />
              {agent.company}
            </div>
          </div>

          <div className="flex flex-wrap gap-2" aria-label="Spécialités">
            {tags.map((tag, i) => (
              <span
                key={`${tag}-${i}`}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg border border-stadium-200/90",
                  "bg-stadium-50/90 px-2.5 py-1 text-xs font-medium text-stadium-800",
                  "transition-colors duration-200 hover:border-pitch-200 hover:bg-pitch-50/50 sm:text-[13px]"
                )}
              >
                <span className="select-none" aria-hidden>
                  {TAG_EMOJI[i] ?? "•"}
                </span>
                {tag}
              </span>
            ))}
          </div>

          <p className="text-sm leading-relaxed text-stadium-600 sm:text-[15px]">{agent.bio}</p>
        </div>

        {/* CTAs */}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={onContact}
            className={cn(
              "flex w-full items-center justify-center rounded-xl px-4 py-3.5",
              "bg-gradient-to-r from-pitch-600 to-pitch-700 text-base font-semibold text-white",
              "shadow-lg shadow-pitch-700/25 transition-all duration-200",
              "hover:from-pitch-700 hover:to-pitch-800 hover:shadow-xl hover:shadow-pitch-700/30",
              "active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-600"
            )}
          >
            Contact
          </button>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <SecondaryAction icon={MessageCircle} label="Message" onClick={onMessage} />
            <SecondaryAction icon={UserPlus} label="Follow" onClick={onFollow} />
            <SecondaryAction icon={UserRound} label="View Profile" onClick={onViewProfile} />
          </div>
        </div>

        {/* Stats */}
        <div
          className={cn(
            "mt-7 grid grid-cols-2 gap-3 rounded-2xl border border-stadium-100 bg-gradient-to-b from-stadium-50/80 to-white p-4 sm:grid-cols-4 sm:gap-2 sm:p-5"
          )}
        >
          <StatCell label="Players Managed" value={agent.stats.players} />
          <StatCell label="Reports Created" value={agent.stats.reports} />
          <StatCell label="Players Placed" value={agent.stats.placements} />
          <StatCell label="Profile Views" value={formatStatNumber(agent.stats.views)} />
        </div>

        {/* Gamification */}
        {(agent.isActive || agent.isTopRecruiter) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {agent.isActive && (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border border-amber-200/90",
                  "bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1 text-xs font-semibold text-amber-950",
                  "shadow-sm transition-transform duration-200 hover:scale-[1.02]"
                )}
              >
                <span aria-hidden>🔥</span>
                Active this week
              </span>
            )}
            {agent.isTopRecruiter && (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border border-pitch-200/90",
                  "bg-gradient-to-r from-pitch-50 to-emerald-50/80 px-3 py-1 text-xs font-semibold text-pitch-950",
                  "shadow-sm transition-transform duration-200 hover:scale-[1.02]"
                )}
              >
                <span aria-hidden>🏆</span>
                Top Recruiter
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function StatCell({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-center sm:py-1">
      <p className="text-2xl font-bold tabular-nums tracking-tight text-stadium-900 sm:text-[1.35rem]">
        {value}
      </p>
      <p className="max-w-[7.5rem] text-[10px] font-semibold uppercase leading-tight tracking-wide text-stadium-500 sm:max-w-none sm:text-[11px]">
        {label}
      </p>
    </div>
  )
}

function SecondaryAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[4.25rem] flex-col items-center justify-center gap-1 rounded-xl border border-stadium-200/90 bg-white px-1.5 py-2",
        "text-center text-[10px] font-semibold leading-tight text-stadium-800 shadow-sm transition-all duration-200",
        "hover:border-pitch-200 hover:bg-pitch-50/40 hover:text-pitch-900",
        "active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pitch-500",
        "sm:min-h-0 sm:flex-row sm:gap-1.5 sm:px-2 sm:py-3 sm:text-xs"
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-stadium-500" aria-hidden />
      <span className="max-w-[4.5rem] sm:max-w-none">{label}</span>
    </button>
  )
}
