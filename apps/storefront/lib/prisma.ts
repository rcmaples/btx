import {PrismaClient} from '../generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Use Prisma Accelerate connection string
    accelerateUrl: process.env.DATABASE_URL!,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper functions for profile operations

/**
 * Check if a user has a profile in the database
 */
export async function hasProfile(clerkUserId: string): Promise<boolean> {
  const profile = await prisma.profile.findUnique({
    where: {clerkUserId},
    select: {id: true},
  })
  return profile !== null
}

/**
 * Get a profile by Clerk user ID
 */
export async function getProfile(clerkUserId: string) {
  return prisma.profile.findUnique({
    where: {clerkUserId},
  })
}

/**
 * Get a profile by Clerk user ID, throwing if not found
 */
export async function getProfileOrThrow(clerkUserId: string) {
  const profile = await prisma.profile.findUnique({
    where: {clerkUserId},
  })
  if (!profile) {
    throw new Error(`Profile not found for user ${clerkUserId}`)
  }
  return profile
}
