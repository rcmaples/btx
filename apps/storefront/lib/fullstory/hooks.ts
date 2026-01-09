import {FullStory as FS} from '@fullstory/browser'
import {useEffect, useRef} from 'react'

/**
 * Simple page name hook - use when only setting pageName
 */
export function usePageName(pageName: string, dynamicSuffix?: string): void {
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

/**
 * Page properties type for context that applies to the entire page view
 * Use for: search terms, cart context, product context on PDP, filter state
 */
export interface PageProperties {
  pageName: string
  [key: string]: string | number | boolean | undefined
}

/**
 * Set page-level properties that provide context for the entire page view.
 * Use this for data that describes the page context (not discrete actions).
 *
 * Examples:
 * - PDP: productId, productName, roastLevel, price
 * - Checkout: cartValue, itemCount, hasPromotion
 * - Search: searchTerm, resultsCount
 */
export function usePageProperties(properties: PageProperties): void {
  // Use ref to track if we've set properties for this exact object
  const prevPropsRef = useRef<string>('')

  useEffect(() => {
    if (typeof window === 'undefined' || !FS) return

    // Serialize properties to detect changes
    const propsString = JSON.stringify(properties)
    if (propsString === prevPropsRef.current) return
    prevPropsRef.current = propsString

    try {
      // Filter out undefined values
      const cleanProperties = Object.fromEntries(
        Object.entries(properties).filter(([, v]) => v !== undefined),
      )

      FS('setProperties', {
        type: 'page',
        properties: cleanProperties,
      })
    } catch (error) {
      console.warn('FullStory setPageProperties error:', error)
    }
  }, [properties])
}
