import {FullStory as FS} from '@fullstory/browser'
import {useEffect} from 'react'

export function usePageTracking(pageName: string, dynamicSuffix?: string): void {
  useEffect(() => {
    if (typeof window !== 'undefined' && FS) {
      const fullPageName = dynamicSuffix ? `${pageName}: ${dynamicSuffix}` : pageName

      try {
        FS('setProperties', {
          type: 'page',
          properties: {
            pageName: fullPageName,
          },
        })
      } catch (error) {
        console.warn('FullStory setPageName error:', error)
      }
    }
  }, [pageName, dynamicSuffix])
}
