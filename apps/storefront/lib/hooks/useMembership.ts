'use client'

import {useCallback, useEffect, useState} from 'react'

import {membershipService} from '@/lib/services/membership/membership-service'
import type {Membership} from '@/lib/types'

// Auth stubbed during migration - will use Clerk in Phase 2
export function useMembership() {
  // Auth stubbed - always returns not logged in
  const isLoggedIn = false

  const [localMembership, setLocalMembership] = useState<Membership>({
    isMember: false,
  })
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize local membership from localStorage after mount
  useEffect(() => {
    setMounted(true)
    setLocalMembership(membershipService.getMembership())
  }, [])

  // Sync with localStorage changes (e.g., from other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      setLocalMembership(membershipService.getMembership())
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Use localStorage membership (DB membership stubbed during migration)
  const membership: Membership = localMembership

  const enrollMembership = useCallback(async () => {
    setIsEnrolling(true)

    try {
      // Use localStorage for membership (legacy behavior preserved)
      await new Promise((resolve) => setTimeout(resolve, 500))
      const newMembership = membershipService.enrollMembership()
      setLocalMembership(newMembership)
    } catch (error) {
      console.error('Failed to enroll in membership:', error)
      throw error
    } finally {
      setIsEnrolling(false)
    }
  }, [])

  return {
    membership,
    isMember: mounted ? membership.isMember : false,
    isEnrolling,
    enrollMembership,
    mounted,
    // Additional helpers
    enrolledAt: membership.enrolledAt,
    cancelledAt: membership.cancelledAt,
    isLoggedIn,
  }
}
