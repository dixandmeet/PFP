import { Role, SubscriptionPlan } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { PLAN_CONFIG } from "@/lib/services/credits/types"
import { SubscriptionService } from "@/lib/services/credits/subscription.service"

export function effectiveStorageQuotaBytes(
  plan: SubscriptionPlan,
  bonusBytes: bigint
): bigint {
  return BigInt(PLAN_CONFIG[plan].storageQuotaBytes) + bonusBytes
}

/**
 * Vérifie quota avant upload vidéo joueur. Ne fait rien pour les autres rôles / types.
 */
export async function assertPlayerVideoStorageAllows(
  userId: string,
  role: Role,
  fileType: string,
  newFileBytes: number
): Promise<void> {
  if (role !== "PLAYER" || fileType !== "VIDEO") return

  const subscription = await SubscriptionService.getSubscription(userId)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { gamificationStorageBonusBytes: true },
  })
  const bonus = user?.gamificationStorageBonusBytes ?? BigInt(0)
  const quota = effectiveStorageQuotaBytes(subscription.plan, bonus)

  const usage = await prisma.userStorageUsage.findUnique({
    where: { userId },
    select: { bytesUsed: true },
  })
  const used = usage?.bytesUsed ?? BigInt(0)
  const next = used + BigInt(newFileBytes)

  if (next > quota) {
    throw new StorageQuotaExceededError(Number(used), Number(quota), newFileBytes)
  }
}

export class StorageQuotaExceededError extends Error {
  constructor(
    public readonly usedBytes: number,
    public readonly quotaBytes: number,
    public readonly attemptedBytes: number
  ) {
    super("Quota de stockage dépassé pour votre formule")
    this.name = "StorageQuotaExceededError"
  }
}

export async function recordPlayerVideoStorageBytes(
  userId: string,
  role: Role,
  fileType: string,
  bytes: number
): Promise<void> {
  if (role !== "PLAYER" || fileType !== "VIDEO" || bytes <= 0) return

  await prisma.userStorageUsage.upsert({
    where: { userId },
    create: { userId, bytesUsed: BigInt(bytes) },
    update: { bytesUsed: { increment: BigInt(bytes) } },
  })
}

export async function releasePlayerVideoStorageBytes(
  userId: string,
  role: Role,
  fileType: string,
  bytes: number
): Promise<void> {
  if (role !== "PLAYER" || fileType !== "VIDEO" || bytes <= 0) return

  const usage = await prisma.userStorageUsage.findUnique({
    where: { userId },
    select: { bytesUsed: true },
  })
  if (!usage) return

  const remaining = usage.bytesUsed - BigInt(bytes)
  await prisma.userStorageUsage.update({
    where: { userId },
    data: { bytesUsed: remaining > BigInt(0) ? remaining : BigInt(0) },
  })
}
