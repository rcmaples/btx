'use client'

import {useState, useEffect, useCallback} from 'react'
import {useAuth} from '@/lib/providers/AuthProvider'
import {membershipService} from '@/lib/services/membership/membership-service'
import type {Membership} from '@/lib/types'

export function useMembership() {
  const {user, profile, enrollInExchange, isLoading: authLoading} = useAuth()
  const [localMembership, setLocalMembership] = useState<Membership>({
    isMember: false,
  })
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize local membership from localStorage after mount (for non-logged-in users)
  useEffect(() => {
    setMounted(true)
    if (!user) {
      setLocalMembership(membershipService.getMembership())
    }
  }, [user])

  // Sync with localStorage changes (e.g., from other tabs) for non-logged-in users
  useEffect(() => {
    if (user) return // Skip for logged-in users

    const handleStorageChange = () => {
      setLocalMembership(membershipService.getMembership())
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [user])

  // Compute current membership status based on auth state
  const membership: Membership = user
    ? {
        isMember: profile?.is_exchange_member ?? false,
        enrolledAt: profile?.exchange_enrolled_at
          ? new Date(profile.exchange_enrolled_at)
          : undefined,
        cancelledAt: profile?.exchange_cancelled_at
          ? new Date(profile.exchange_cancelled_at)
          : undefined,
      }
    : localMembership

  const enrollMembership = useCallback(async () => {
    setIsEnrolling(true)

    try {
      if (user) {
        // Logged in: save to database
        const {error} = await enrollInExchange()
        if (error) throw error
        // Clear localStorage since we're now using DB
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bt_membership')
        }
      } else {
        // Not logged in: use localStorage (legacy behavior)
        await new Promise((resolve) => setTimeout(resolve, 500))
        const newMembership = membershipService.enrollMembership()
        setLocalMembership(newMembership)
      }
    } catch (error) {
      console.error('Failed to enroll in membership:', error)
      throw error
    } finally {
      setIsEnrolling(false)
    }
  }, [user, enrollInExchange])

  return {
    membership,
    isMember: mounted ? membership.isMember : false,
    isEnrolling,
    enrollMembership,
    mounted: mounted && !authLoading,
    // Additional helpers
    enrolledAt: membership.enrolledAt,
    cancelledAt: membership.cancelledAt,
    isLoggedIn: !!user,
  }
}
