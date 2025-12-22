import {createClient} from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01'
const useCdn = process.env.NEXT_PUBLIC_SANITY_USE_CDN === 'true'

if (!projectId) {
  throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is required')
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
})

// Type-safe query helper with Next.js cache options (server components only)
export async function sanityFetch<T = unknown>(
  query: string,
  params?: Record<string, unknown>,
  options?: {revalidate?: number; tags?: string[]},
): Promise<T> {
  return client.fetch<T>(query, params ?? {}, {
    next: {
      revalidate: options?.revalidate ?? 600, // Default 10 minute cache
      tags: options?.tags,
    },
  })
}

// Client-safe fetch without Next.js cache options (for use in client components/hooks)
export async function clientFetch<T = unknown>(
  query: string,
  params?: Record<string, unknown>,
): Promise<T> {
  return client.fetch<T>(query, params ?? {})
}
