'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type {User, Session} from '@supabase/supabase-js'
import {createClient} from '@/lib/supabase/client'
import {profileCache} from '@/lib/utils/profileCache'

export interface Profile {
  id: string
  email: string
  phone: string | null
  street_address: string | null
  street_address_2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  // Exchange membership fields
  is_exchange_member: boolean
  exchange_enrolled_at: string | null
  exchange_cancelled_at: string | null
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  isLoading: boolean
  signUp: (email: string, password: string) => Promise<{error: Error | null}>
  signIn: (email: string, password: string) => Promise<{error: Error | null}>
  signOut: () => Promise<void>
  updateProfile: (
    data: Partial<Omit<Profile, 'id' | 'email'>>
  ) => Promise<{error: Error | null}>
  refreshProfile: () => Promise<void>
  // Exchange membership methods
  enrollInExchange: () => Promise<{error: Error | null}>
  cancelExchangeMembership: () => Promise<{error: Error | null}>
  migrationPending: boolean
  migrateLocalMembership: () => Promise<{error: Error | null}>
  dismissMigration: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [migrationPending, setMigrationPending] = useState(false)

  const supabase = createClient()

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    // Check cache first
    const cached = profileCache.get(userId)
    if (cached !== undefined) return cached

    // Check for pending request (deduplication)
    const pending = profileCache.getPending(userId)
    if (pending) return pending

    // Create new request
    const promise = Promise.resolve(
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
        .then(({data, error}) => {
          if (error) {
            console.error('Error fetching profile:', error)
            return null
          }
          const profile = data as Profile
          profileCache.set(userId, profile)
          return profile
        })
    )

    profileCache.setPending(userId, promise)
    return promise
  }

  useEffect(() => {
    // Set isLoading false immediately - don't block UI
    setIsLoading(false)

    // Get initial session (non-blocking - updates in background)
    supabase.auth
      .getSession()
      .then(({data: {session}}) => {
        setSession(session)
        setUser(session?.user ?? null)

        // Profile fetches in background, doesn't block
        if (session?.user) {
          fetchProfile(session.user.id).then((profile) => {
            setProfile(profile)
            // Auth state is now "eventually consistent"
          })
        }
      })
      .catch((error) => {
        console.error('Error getting session:', error)
      })

    // Listen for auth changes
    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const prevUserId = user?.id
      const newUserId = session?.user?.id

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        // Only fetch if user changed or cache invalid
        if (newUserId !== prevUserId || !profileCache.isValid(newUserId!)) {
          // Fire and forget - don't await, profile loads in background
          fetchProfile(session.user.id).then((profileData) => {
            setProfile(profileData)

            // Migration check happens AFTER profile loads
            if (profileData && !profileData.is_exchange_member) {
              const dismissed = sessionStorage.getItem('bt_migration_dismissed')
              if (!dismissed && typeof window !== 'undefined') {
                const stored = localStorage.getItem('bt_membership')
                if (stored) {
                  try {
                    const localMembership = JSON.parse(stored)
                    if (localMembership.isMember) {
                      setMigrationPending(true)
                    }
                  } catch {
                    // Invalid localStorage data, ignore
                  }
                }
              }
            }
          })
        } else {
          // Use cached profile
          const cachedProfile = profileCache.get(newUserId!)
          if (cachedProfile) setProfile(cachedProfile)
        }
      } else {
        setProfile(null)
        if (prevUserId) {
          profileCache.invalidate(prevUserId)
        }
        setMigrationPending(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (
    email: string,
    password: string
  ): Promise<{error: Error | null}> => {
    const {error} = await supabase.auth.signUp({
      email,
      password,
    })
    return {error}
  }

  const signIn = async (
    email: string,
    password: string
  ): Promise<{error: Error | null}> => {
    const {error} = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return {error}
  }

  const signOut = async (): Promise<void> => {
    if (user?.id) {
      profileCache.invalidate(user.id)
    }
    await supabase.auth.signOut()
    setProfile(null)
  }

  const updateProfile = async (
    data: Partial<Omit<Profile, 'id' | 'email'>>
  ): Promise<{error: Error | null}> => {
    if (!user || !profile) {
      return {error: new Error('Not authenticated')}
    }

    // Optimistic update
    const optimisticProfile = {...profile, ...data}
    setProfile(optimisticProfile)

    const {error} = await supabase.from('profiles').update(data).eq('id', user.id)

    if (error) {
      // Revert optimistic update on error
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
      profileCache.invalidate(user.id)
    } else {
      // Update cache with optimistic data
      profileCache.set(user.id, optimisticProfile)
    }

    return {error}
  }

  const refreshProfile = async (): Promise<void> => {
    if (user) {
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
    }
  }

  const enrollInExchange = async (): Promise<{error: Error | null}> => {
    if (!user || !profile) {
      return {error: new Error('Not authenticated')}
    }

    // Optimistic update
    const optimisticProfile = {
      ...profile,
      is_exchange_member: true,
      exchange_enrolled_at: new Date().toISOString(),
      exchange_cancelled_at: null,
    }
    setProfile(optimisticProfile)

    const {error} = await supabase
      .from('profiles')
      .update({
        is_exchange_member: true,
        exchange_enrolled_at: new Date().toISOString(),
        exchange_cancelled_at: null,
      })
      .eq('id', user.id)

    if (error) {
      // Revert optimistic update on error
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
      profileCache.invalidate(user.id)
    } else {
      // Update cache with optimistic data
      profileCache.set(user.id, optimisticProfile)
    }

    return {error}
  }

  const cancelExchangeMembership = async (): Promise<{error: Error | null}> => {
    if (!user || !profile) {
      return {error: new Error('Not authenticated')}
    }

    // Optimistic update
    const optimisticProfile = {
      ...profile,
      is_exchange_member: false,
      exchange_cancelled_at: new Date().toISOString(),
      // Note: exchange_enrolled_at is preserved for history
    }
    setProfile(optimisticProfile)

    const {error} = await supabase
      .from('profiles')
      .update({
        is_exchange_member: false,
        exchange_cancelled_at: new Date().toISOString(),
        // Note: exchange_enrolled_at is preserved for history
      })
      .eq('id', user.id)

    if (error) {
      // Revert optimistic update on error
      const profileData = await fetchProfile(user.id)
      setProfile(profileData)
      profileCache.invalidate(user.id)
    } else {
      // Update cache with optimistic data
      profileCache.set(user.id, optimisticProfile)
    }

    return {error}
  }

  const migrateLocalMembership = async (): Promise<{error: Error | null}> => {
    if (!user || !profile) {
      return {error: new Error('Not authenticated')}
    }

    if (typeof window === 'undefined') {
      return {error: new Error('Not in browser')}
    }

    const stored = localStorage.getItem('bt_membership')
    if (!stored) {
      return {error: new Error('No local membership found')}
    }

    try {
      const localMembership = JSON.parse(stored)
      const enrolledAt = localMembership.enrolledAt || new Date().toISOString()

      // Optimistic update
      const optimisticProfile = {
        ...profile,
        is_exchange_member: true,
        exchange_enrolled_at: enrolledAt,
        exchange_cancelled_at: null,
      }
      setProfile(optimisticProfile)
      setMigrationPending(false)

      const {error} = await supabase
        .from('profiles')
        .update({
          is_exchange_member: true,
          exchange_enrolled_at: enrolledAt,
          exchange_cancelled_at: null,
        })
        .eq('id', user.id)

      if (error) {
        // Revert optimistic update on error
        const profileData = await fetchProfile(user.id)
        setProfile(profileData)
        profileCache.invalidate(user.id)
        setMigrationPending(true)
      } else {
        // Success - remove from localStorage and update cache
        localStorage.removeItem('bt_membership')
        profileCache.set(user.id, optimisticProfile)
      }

      return {error}
    } catch (e) {
      return {error: e as Error}
    }
  }

  const dismissMigration = (): void => {
    setMigrationPending(false)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('bt_migration_dismissed', 'true')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProfile,
        enrollInExchange,
        cancelExchangeMembership,
        migrationPending,
        migrateLocalMembership,
        dismissMigration,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Default values for SSR or when used outside AuthProvider
const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  signUp: async () => ({error: new Error('Auth not available')}),
  signIn: async () => ({error: new Error('Auth not available')}),
  signOut: async () => {},
  updateProfile: async () => ({error: new Error('Auth not available')}),
  refreshProfile: async () => {},
  enrollInExchange: async () => ({error: new Error('Auth not available')}),
  cancelExchangeMembership: async () => ({error: new Error('Auth not available')}),
  migrationPending: false,
  migrateLocalMembership: async () => ({error: new Error('Auth not available')}),
  dismissMigration: () => {},
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  // Return default context for SSR or when outside AuthProvider
  if (context === undefined) {
    return defaultAuthContext
  }
  return context
}
