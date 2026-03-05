"use client"

import { useState, useCallback, useMemo } from "react"
import type { InterestItem, ProfileStats } from "@/types/interests"
import { mockInterests, mockProfileStats } from "@/lib/mocks/interests-mock"

export function useProfileInsights() {
  const [interests, setInterests] = useState<InterestItem[]>(mockInterests)
  const [stats, setStats] = useState<ProfileStats>(mockProfileStats)

  const unreadInterests = useMemo(
    () => interests.filter((i) => !i.isRead),
    [interests]
  )

  const markInterestAsRead = useCallback((interestId: string) => {
    setInterests((prev) =>
      prev.map((i) => (i.id === interestId ? { ...i, isRead: true } : i))
    )
  }, [])

  const addInterest = useCallback((interest: InterestItem) => {
    setInterests((prev) => [interest, ...prev])
    setStats((prev) => ({
      ...prev,
      receivedInterestsCount: prev.receivedInterestsCount + 1,
    }))
  }, [])

  const incrementViews = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      viewsThisMonth: prev.viewsThisMonth + 1,
    }))
  }, [])

  return {
    interests,
    stats,
    unreadInterests,
    markInterestAsRead,
    addInterest,
    incrementViews,
    setStats,
  }
}
