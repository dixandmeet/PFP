"use client"

import { useState, useMemo, useCallback } from "react"
import type { CriterionScores, PositionGroup, EvaluationResult, PlayerEvaluationData } from "@/lib/evaluation/types"
import { getDefaultScores, computeFullResult, resolvePositionGroup } from "@/lib/evaluation/engine"

interface UsePlayerEvaluationOptions {
  playerId: string
  initialPosition?: string | null
}

export function usePlayerEvaluation({ playerId, initialPosition }: UsePlayerEvaluationOptions) {
  const [scores, setScores] = useState<CriterionScores>(getDefaultScores)
  const [positionGroup, setPositionGroup] = useState<PositionGroup>(
    resolvePositionGroup(initialPosition),
  )
  const [notes, setNotes] = useState("")

  const result: EvaluationResult = useMemo(
    () => computeFullResult(scores, positionGroup),
    [scores, positionGroup],
  )

  const setScore = useCallback((key: string, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }))
  }, [])

  const reset = useCallback(() => {
    setScores(getDefaultScores())
    setNotes("")
  }, [])

  const toData = useCallback((): PlayerEvaluationData => ({
    playerId,
    positionGroup,
    scores,
    notes,
    result,
    evaluatedAt: new Date().toISOString(),
  }), [playerId, positionGroup, scores, notes, result])

  return {
    scores,
    positionGroup,
    setPositionGroup,
    notes,
    setNotes,
    result,
    setScore,
    reset,
    toData,
  }
}
