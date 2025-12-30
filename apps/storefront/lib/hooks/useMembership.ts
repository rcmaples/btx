'use client'

import {useUser} from '@clerk/nextjs'
import {useCallback, useState} from 'react'

import {cancelExchangeMembership, enrollInExchange} from '@/lib/actions/profile'
import {useProfile} from '@/lib/hooks/useProfile'

/**
 * Hook for Exchange membership status and actions
 * Uses Clerk for auth and Prisma for membership data
 */
export function useMembership() {
  const {isSignedIn, isLoaded: isUserLoaded} = useUser()
  const {profile, isLoading: isProfileLoading, invalidateProfile, isExchangeMember} = useProfile()

  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const enrollMembership = useCallback(async () => {
    if (!isSignedIn) {
      throw new Error('Must be signed in to enroll')
    }

    setIsEnrolling(true)

    try {
      const result = await enrollInExchange()
      if (!result.success) {
        throw new Error(result.error || 'Failed to enroll')
      }
      // Invalidate profile cache to refetch with new membership status
      invalidateProfile()
    } finally {
      setIsEnrolling(false)
    }
  }, [isSignedIn, invalidateProfile])

  const cancelMembership = useCallback(async () => {
    if (!isSignedIn) {
      throw new Error('Must be signed in to cancel')
    }

    setIsCancelling(true)

    try {
      const result = await cancelExchangeMembership()
      if (!result.success) {
        throw new Error(result.error || 'Failed to cancel')
      }
      // Invalidate profile cache to refetch with new membership status
      invalidateProfile()
    } finally {
      setIsCancelling(false)
    }
  }, [isSignedIn, invalidateProfile])

  // Mounted state - true when both user and profile data are loaded
  const mounted = isUserLoaded && !isProfileLoading

  return {
    // Membership state
    isMember: isExchangeMember,
    isEnrolling,
    isCancelling,
    mounted,

    // Actions
    enrollMembership,
    cancelMembership,

    // Profile details
    enrolledAt: profile?.exchangeEnrolledAt ? new Date(profile.exchangeEnrolledAt) : undefined,
    cancelledAt: profile?.exchangeCancelledAt ? new Date(profile.exchangeCancelledAt) : undefined,

    // Auth state
    isLoggedIn: isSignedIn ?? false,
    hasProfile: !!profile,
  }
}
