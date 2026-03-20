// Singleton Prisma client pour Next.js (prod uniquement).
// En dev, ne pas attacher à globalThis : après `prisma generate`, une instance
// cachée garde l’ancienne DMMF → erreurs du type « Unknown field '…' for select ».

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })
}

export const prisma =
  process.env.NODE_ENV === 'production'
    ? (globalForPrisma.prisma ??= createPrismaClient())
    : createPrismaClient()
