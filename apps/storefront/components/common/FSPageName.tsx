'use client'

import {usePageName} from '@/lib/fullstory/hooks'

type Props = {
  pageName: string
  dynamicSuffix?: string
}

/**
 * Client component wrapper for setting FullStory page names
 *
 * Use this in Server Components (async pages) where you can't call hooks directly.
 * Renders nothing - just sets the page name in FullStory.
 *
 * @example
 * ```tsx
 * // In a Server Component
 * export default async function MyPage() {
 *   return (
 *     <div>
 *       <FSPageName pageName="My Page" />
 *       // ... rest of content
 *     </div>
 *   )
 * }
 * ```
 */
export function FSPageName({pageName, dynamicSuffix}: Props) {
  usePageName(pageName, dynamicSuffix)
  return null
}
