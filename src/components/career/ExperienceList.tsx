"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ExperienceCard, type CareerEntry } from "./ExperienceCard"
import { SkeletonExperienceCard } from "./SkeletonExperienceCard"

interface ExperienceListProps {
  entries: CareerEntry[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  formatDate: (dateStr: string) => string
  isLoading?: boolean
}

export function ExperienceList({
  entries,
  selectedId,
  onSelect,
  onDelete,
  formatDate,
  isLoading,
}: ExperienceListProps) {
  if (isLoading) {
    return (
      <div className="relative">
        <div className="absolute left-[5px] top-4 bottom-4 w-px bg-slate-200" />
        <div className="space-y-4">
          <SkeletonExperienceCard />
          <SkeletonExperienceCard />
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {entries.length > 1 && (
        <div className="absolute left-[5px] top-6 bottom-6 w-px bg-slate-200" />
      )}
      <div className="space-y-4">
        <AnimatePresence>
          {entries.map((entry, index) => {
            const year = entry.season.split("/")[0]
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-14"
              >
                <div className="absolute left-0 top-5 flex flex-col items-center">
                  <div
                    className={`w-[11px] h-[11px] rounded-full border-2 transition-colors ${
                      selectedId === entry.id
                        ? "bg-green-600 border-green-600"
                        : "bg-white border-slate-300"
                    }`}
                  />
                </div>
                <div className="absolute left-5 top-4">
                  <span className="text-[10px] font-semibold text-slate-400">{year}</span>
                </div>
                <ExperienceCard
                  entry={entry}
                  isSelected={selectedId === entry.id}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  formatDate={formatDate}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
