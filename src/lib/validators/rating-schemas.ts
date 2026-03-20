import { z } from "zod"

const score0to100 = z.number().int().min(0).max(100)

export const evaluateVideoSkillSchema = z.object({
  pac: score0to100,
  fin: score0to100,
  tec: score0to100,
  vis: score0to100,
  phy: score0to100,
  def: score0to100,
  gk: score0to100.optional().default(0),
  subCriteria: z.record(z.string(), z.number().int().min(0).max(20)).optional(),
})

export type EvaluateVideoSkillInput = z.infer<typeof evaluateVideoSkillSchema>
