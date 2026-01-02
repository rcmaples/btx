'use client'

import {init as initFS} from '@fullstory/browser'
import {useEffect} from 'react'

export const FullStoryCapture = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
      return
    }
    initFS({orgId: 'o-248K4E-na1'}, ({sessionUrl}) => console.log(`Started session: ${sessionUrl}`))
  }, [])

  return null
}
