'use client'

import {useFSIdentify} from '@/lib/fullstory/useFSIdentify'

/**
 * Client component that monitors Clerk authentication state and
 * automatically identifies/anonymizes users in FullStory
 */
export const FullStoryAuth = () => {
  useFSIdentify()
  return null
}
