'use client'

import {useQuery} from '@tanstack/react-query'
import {bundleService} from '@/lib/services/bundle/bundle-service'
import type {SanityBundle} from '@/lib/types'

const bundleKeys = {
  all: ['bundles'] as const,
  lists: () => [...bundleKeys.all, 'list'] as const,
  list: (isMember?: boolean) => [...bundleKeys.lists(), {isMember}] as const,
  details: () => [...bundleKeys.all, 'detail'] as const,
  detail: (slug: string) => [...bundleKeys.details(), slug] as const,
}

export function useBundles(isMember?: boolean) {
  return useQuery({
    queryKey: bundleKeys.list(isMember),
    queryFn: () => bundleService.getBundlesClient({isMember}),
  })
}

export function useBundleBySlug(slug: string) {
  return useQuery({
    queryKey: bundleKeys.detail(slug),
    queryFn: () => bundleService.getBundleBySlugClient(slug),
    enabled: !!slug,
  })
}
