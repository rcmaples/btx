'use client'

import {useUser} from '@clerk/nextjs'
import {useQuery, useQueryClient} from '@tanstack/react-query'

import type {ProfileResponse} from '@/app/api/profile/route'

async function fetchProfile(): Promise<ProfileResponse> {
  const response = await fetch('/api/profile')

  // 404 means profile doesn't exist yet - return null (valid state for new users)
  if (response.status === 404) {
    return null
  }

  // 401 shouldn't happen since we gate on isSignedIn, but handle it gracefully
  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error('Failed to fetch profile')
  }

  return response.json()
}

/**
 * Hook to get the current user's profile from Prisma
 * Uses TanStack Query for caching and automatic refetching
 */
export function useProfile() {
  const {isSignedIn, isLoaded} = useUser()
  const queryClient = useQueryClient()

  const {
    data: profile,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    // Only fetch if user is signed in
    enabled: isLoaded && isSignedIn,
    // Keep profile fresh for 2 minutes
    staleTime: 2 * 60 * 1000,
    // Cache for 5 minutes
    gcTime: 5 * 60 * 1000,
  })

  /**
   * Invalidate and refetch profile data
   * Call this after profile mutations (update, enroll, cancel)
   */
  const invalidateProfile = () => {
    queryClient.invalidateQueries({queryKey: ['profile']})
  }

  return {
    profile,
    isLoading: !isLoaded || (isSignedIn && isLoading),
    error,
    refetch,
    invalidateProfile,
    // Convenience accessors
    isExchangeMember: profile?.isExchangeMember ?? false,
    hasProfile: !!profile,
  }
}
