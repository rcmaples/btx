'use client'

import {init as initFS} from '@fullstory/browser'
import {useEffect} from 'react'

export const FullStoryCapture = () => {
  useEffect(() => {
    // Skip in test environment
    if (process.env.NODE_ENV === 'test') {
      return
    }

    const orgId = process.env.NEXT_PUBLIC_FULLSTORY_ORG_ID

    if (!orgId) {
      console.warn('FullStory: Missing NEXT_PUBLIC_FULLSTORY_ORG_ID environment variable')
      return
    }

    const isDev = process.env.NODE_ENV === 'development'

    initFS(
      {
        orgId,
        devMode: isDev, // Captures locally, doesn't send to FS servers in dev
        debug: isDev, // Logs API calls to console in dev
      },
      ({sessionUrl}) => {
        if (isDev) {
          console.log(`[FS Dev] Session: ${sessionUrl}`)
        } else {
          console.log(`Started session: ${sessionUrl}`)
        }
      },
    )
  }, [])

  return null
}
