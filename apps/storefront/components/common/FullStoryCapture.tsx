'use client'

import {init as initFS} from '@fullstory/browser'
import {useEffect} from 'react'

export const FullStoryCapture = () => {
  useEffect(() => {
    initFS({orgId: 'o-248K4E-na1'}, ({sessionUrl}) => console.log(`Started session: ${sessionUrl}`))
  }, [])

  return null
}
