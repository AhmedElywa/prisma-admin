import { prisma } from './prisma'
import { PrismaModelDelegate } from './prisma-types'

// Type-safe way to access Prisma models dynamically
export function getPrismaModel(modelName: string): PrismaModelDelegate {
  const model = (prisma as any)[modelName]
  if (!model) {
    throw new Error(`Model ${modelName} not found in Prisma client`)
  }
  return model as PrismaModelDelegate
}

// Helper to safely get model name in correct case
export function normalizeModelName(modelName: string): string {
  // Convert to lowercase first letter for Prisma client access
  return modelName.charAt(0).toLowerCase() + modelName.slice(1)
}