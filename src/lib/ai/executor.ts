// AI Action Executor (two-step confirmation)
import { prisma } from "../prisma"
import { getToolByName } from "./tools/registry"
import { Role } from "@prisma/client"

export interface PendingAction {
  id: string
  userId: string
  role: Role
  toolName: string
  params: any
  preview: string
  createdAt: number
  expiresAt: number
}

// Store temporaire (en production: utiliser Redis)
const pendingActions = new Map<string, PendingAction>()

export function createPendingAction(
  userId: string,
  role: Role,
  toolName: string,
  params: any,
  preview: string
): string {
  const id = `action_${Date.now()}_${Math.random().toString(36).substring(7)}`
  const now = Date.now()
  
  const action: PendingAction = {
    id,
    userId,
    role,
    toolName,
    params,
    preview,
    createdAt: now,
    expiresAt: now + 5 * 60 * 1000, // 5 minutes
  }

  pendingActions.set(id, action)

  // Cleanup après expiration
  setTimeout(() => {
    pendingActions.delete(id)
  }, 5 * 60 * 1000)

  return id
}

export function getPendingAction(actionId: string): PendingAction | undefined {
  const action = pendingActions.get(actionId)
  
  if (action && action.expiresAt < Date.now()) {
    pendingActions.delete(actionId)
    return undefined
  }

  return action
}

export async function executeAIAction(
  actionId: string,
  userId: string
): Promise<any> {
  // 1. Récupérer l'action
  const action = getPendingAction(actionId)
  
  if (!action) {
    throw new Error("Action expirée ou introuvable")
  }

  // 2. Vérifier ownership
  if (action.userId !== userId) {
    throw new Error("Non autorisé")
  }

  // 3. Vérifier expiration
  if (action.expiresAt < Date.now()) {
    pendingActions.delete(actionId)
    throw new Error("Action expirée")
  }

  // 4. Récupérer le tool
  const tool = getToolByName(action.toolName, action.role)
  
  if (!tool) {
    throw new Error(`Tool non trouvé: ${action.toolName}`)
  }

  // 5. Valider les paramètres
  const validatedParams = tool.parameters.parse(action.params)

  // 6. Exécuter l'action
  const result = await tool.execute(validatedParams, {
    userId,
    role: action.role as string,
    prisma,
  })

  // 7. Audit log
  await prisma.auditLog.create({
    data: {
      userId,
      action: `AI_${action.toolName.toUpperCase()}`,
      targetType: result.targetType || "UNKNOWN",
      targetId: result.targetId || null,
      metadata: {
        tool: action.toolName,
        params: action.params,
        result,
        confirmedAt: new Date().toISOString(),
      },
    }
  })

  // 8. Notification optionnelle
  if (result.success) {
    await prisma.notification.create({
      data: {
        userId,
        type: "AI_ACTION_COMPLETED",
        title: "Action IA exécutée",
        message: result.message || `${action.toolName} terminé`,
        link: result.link || null,
      }
    })
  }

  // 9. Supprimer l'action pendante
  pendingActions.delete(actionId)

  return result
}
