import type {Profile} from '@/lib/providers/AuthProvider'

interface CachedProfile {
  data: Profile | null
  timestamp: number
  pending: Promise<Profile | null> | null
}

class ProfileCache {
  private cache = new Map<string, CachedProfile>()
  private TTL = 5 * 60 * 1000 // 5 minutes

  get(userId: string): Profile | null | undefined {
    const cached = this.cache.get(userId)
    if (!cached) return undefined

    // Check TTL
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(userId)
      return undefined
    }

    return cached.data
  }

  set(userId: string, profile: Profile | null): void {
    this.cache.set(userId, {
      data: profile,
      timestamp: Date.now(),
      pending: null,
    })
  }

  getPending(userId: string): Promise<Profile | null> | null {
    return this.cache.get(userId)?.pending ?? null
  }

  setPending(userId: string, promise: Promise<Profile | null>): void {
    const existing = this.cache.get(userId)
    this.cache.set(userId, {
      data: existing?.data ?? null,
      timestamp: existing?.timestamp ?? Date.now(),
      pending: promise,
    })
  }

  invalidate(userId: string): void {
    this.cache.delete(userId)
  }

  isValid(userId: string): boolean {
    const cached = this.cache.get(userId)
    if (!cached) return false
    return Date.now() - cached.timestamp <= this.TTL
  }
}

export const profileCache = new ProfileCache()
