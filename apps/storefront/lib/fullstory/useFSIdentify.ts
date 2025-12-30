'use client'

import {useUser} from '@clerk/nextjs'
import {useEffect, useRef} from 'react'

import {useProfile} from '@/lib/hooks/useProfile'

import {anonymizeUser, identifyUser} from './utils'

/**
 * Hook to automatically identify/anonymize users in FullStory based on Clerk auth state
 *
 * This hook monitors Clerk authentication state and:
 * - Identifies the user to FullStory when they log in
 * - Anonymizes the session when they log out
 * - Prevents duplicate identification calls
 * - Handles edge cases gracefully (missing email, FS not loaded, etc.)
 * - Includes Exchange membership status in user properties
 */
export function useFSIdentify(): void {
  const {user, isLoaded} = useUser()
  const {profile, isLoading: isProfileLoading} = useProfile()
  const lastIdentifiedState = useRef<{userId: string; isMember: boolean} | null>(null)

  useEffect(() => {
    // Wait for Clerk to finish loading auth state
    if (!isLoaded) return

    if (user) {
      // User is logged in - identify them to FullStory
      const email = user.primaryEmailAddress?.emailAddress

      if (!email) {
        console.warn('FullStory: Cannot identify user without email')
        return
      }

      // Wait for profile to load before identifying (to include membership status)
      // For new users without profiles, isProfileLoading will be false and profile will be null
      if (isProfileLoading) return

      const isExchangeMember = profile?.isExchangeMember ?? false

      // Only identify if user or membership status changed
      const hasChanged =
        !lastIdentifiedState.current ||
        lastIdentifiedState.current.userId !== user.id ||
        lastIdentifiedState.current.isMember !== isExchangeMember

      if (hasChanged) {
        // Use real name if available, otherwise use email
        const displayName =
          user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : email

        identifyUser(user.id, email, displayName, isExchangeMember)
        lastIdentifiedState.current = {userId: user.id, isMember: isExchangeMember}
      }
    } else {
      // User is logged out - anonymize the session
      // Only anonymize if we previously identified someone
      if (lastIdentifiedState.current !== null) {
        anonymizeUser()
        lastIdentifiedState.current = null
      }
    }
  }, [user, isLoaded, profile, isProfileLoading])
}
