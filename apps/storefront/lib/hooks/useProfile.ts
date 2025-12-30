'use client'

import {useUser} from '@clerk/nextjs'
import {useQuery, useQueryClient} from '@tanstack/react-query'

import type {ProfileResponse} from '@/app/api/profile/route'

async function fetchProfile(): Promise<ProfileResponse> {
  const response = await fetch('/api/profile')
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

  const {data: profile, isLoading, error, refetch} = useQuery({
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
