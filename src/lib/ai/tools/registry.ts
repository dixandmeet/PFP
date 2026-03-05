// AI Tools Registry
import { Role } from "@prisma/client"
import { AITool } from "./player-tools"
import { playerTools } from "./player-tools"
import { agentTools } from "./agent-tools"
import { clubTools } from "./club-tools"

export function getToolsForRole(role: Role): AITool[] {
  switch (role) {
    case "PLAYER":
      return playerTools
    case "AGENT":
      return agentTools
    case "CLUB":
      return clubTools
    default:
      return []
  }
}

export function getToolByName(toolName: string, role: Role): AITool | undefined {
  const tools = getToolsForRole(role)
  return tools.find(t => t.name === toolName)
}

// Convertir les tools Zod vers le format OpenAI
export function convertToolsToOpenAI(tools: AITool[]) {
  return tools.map(tool => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: zodToJsonSchema(tool.parameters),
    }
  }))
}

// Helper pour convertir Zod schema vers JSON Schema (simplifié)
function zodToJsonSchema(schema: any): any {
  // Pour une vraie implémentation, utiliser une lib comme zod-to-json-schema
  // Ici version simplifiée
  return {
    type: "object",
    properties: schema._def.shape ? Object.keys(schema._def.shape()).reduce((acc: any, key) => {
      acc[key] = { type: "string" } // Simplification
      return acc
    }, {}) : {},
    required: schema._def.unknownKeys === "strict" ? Object.keys(schema._def.shape?.() || {}) : [],
  }
}
