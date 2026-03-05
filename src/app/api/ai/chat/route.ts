// API: AI Chat endpoint
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError, parseBody } from "@/lib/utils/api-helpers"
import { getAssistantForRole } from "@/lib/ai/assistants"
import { getToolsForRole, convertToolsToOpenAI } from "@/lib/ai/tools/registry"
import { createPendingAction } from "@/lib/ai/executor"
import OpenAI from "openai"
import { z } from "zod"

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured")
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
  })),
})

export async function POST(request: Request) {
  try {
    const user = await requireAuth()

    const body = await parseBody(request)
    const { messages } = chatRequestSchema.parse(body)

    // Récupérer l'assistant pour le rôle
    const assistant = getAssistantForRole(user.role)
    const tools = getToolsForRole(user.role)
    const openaiTools = convertToolsToOpenAI(tools)

    // Ajouter le system prompt
    const fullMessages = [
      { role: "system", content: assistant.systemPrompt },
      ...messages,
    ]

    // Appel OpenAI
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4",
      messages: fullMessages as any,
      tools: openaiTools.length > 0 ? openaiTools as any : undefined,
      tool_choice: "auto",
      temperature: assistant.temperature,
      max_tokens: assistant.maxTokens,
    })

    const responseMessage = completion.choices[0].message

    // Si l'IA veut utiliser un tool
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const toolCall = responseMessage.tool_calls[0]
      const toolName = toolCall.function.name
      const toolParams = JSON.parse(toolCall.function.arguments)

      // Créer une pending action (two-step)
      const preview = `Je vais exécuter: ${toolName} avec les paramètres: ${JSON.stringify(toolParams, null, 2)}`
      
      const pendingActionId = createPendingAction(
        user.id,
        user.role,
        toolName,
        toolParams,
        preview
      )

      return NextResponse.json({
        type: "tool_call_proposal",
        tool: toolName,
        params: toolParams,
        preview,
        pendingActionId,
        message: responseMessage.content || "Voulez-vous que j'exécute cette action ?",
      })
    }

    // Réponse textuelle simple
    return NextResponse.json({
      type: "text_response",
      message: responseMessage.content,
    })

  } catch (error) {
    return handleApiError(error)
  }
}
